import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Plus, Trash2, Wallet, Heart, Sparkles,
  X, Check, Settings, ChevronLeft, ArrowRight,
  Edit3
} from 'lucide-react';

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const C = {
  bg: '#FBF7F0',
  card: '#FFFFFF',
  ink: '#1A1A1A',
  inkSoft: '#5C5C5C',
  inkSubtle: '#9B9B9B',
  line: '#E8E4DC',
  coral: '#E5644E',
  coralSoft: '#FDEBE4',
  emerald: '#2D6A4F',
  emeraldSoft: '#D4E9DD',
  amber: '#C28F1E',
  amberSoft: '#FCE9C2',
  rose: '#B83B5E',
  roseSoft: '#FCE4E8',
};

const FONT_DISPLAY = "'Fraunces', 'Georgia', serif";
const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif";

/* ============================================================
   CATEGORIES
   ============================================================ */
const CATS = [
  { id: 'alimentacion',    label: 'Alimentación',    color: '#E5644E' },
  { id: 'transporte',      label: 'Transporte',      color: '#C28F1E' },
  { id: 'vivienda',        label: 'Vivienda',        color: '#2D6A4F' },
  { id: 'servicios',       label: 'Servicios',       color: '#5B7C8D' },
  { id: 'salud',           label: 'Salud',           color: '#B83B5E' },
  { id: 'educacion',       label: 'Educación',       color: '#7B4FAA' },
  { id: 'entretenimiento', label: 'Entretenimiento', color: '#1B7B8A' },
  { id: 'ropa',            label: 'Ropa',            color: '#9B5B7E' },
  { id: 'deudas',          label: 'Deudas',          color: '#8B2B2B' },
  { id: 'otros',           label: 'Otros',           color: '#6B7280' },
];
const catById = (id) => CATS.find(c => c.id === id) || CATS[CATS.length - 1];

/* ============================================================
   STORAGE (localStorage, persists in the browser)
   ============================================================ */
const store = {
  get(key, fallback) {
    try {
      const v = window.localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
};

/* ============================================================
   HELPERS
   ============================================================ */
const fmt = (n, cur = '$') => {
  const v = Math.round(Number(n) || 0);
  return `${cur}${v.toLocaleString('es-AR')}`;
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const monthOf = (iso) => iso.slice(0, 7);
const thisMonth = () => todayISO().slice(0, 7);
const niceDate = (iso) => {
  const [, m, d] = iso.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
};
const uid = () => Math.random().toString(36).slice(2, 10);

/* ============================================================
   FONT LOADER
   ============================================================ */
function useFonts() {
  useEffect(() => {
    if (document.getElementById('budget-fonts')) return;
    const link = document.createElement('link');
    link.id = 'budget-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

/* ============================================================
   PRIMITIVES
   ============================================================ */
function Btn({ children, onClick, variant = 'primary', type = 'button', disabled, style, full }) {
  const base = {
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: 15,
    padding: '12px 20px', borderRadius: 12, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform 0.08s ease, opacity 0.15s',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: full ? '100%' : 'auto',
  };
  const variants = {
    primary: { background: C.ink, color: '#fff' },
    coral:   { background: C.coral, color: '#fff' },
    soft:    { background: C.coralSoft, color: C.coral },
    ghost:   { background: 'transparent', color: C.ink, border: `1px solid ${C.line}` },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </button>
  );
}

function Card({ children, style, pad = 24 }) {
  return (
    <div style={{
      background: C.card, borderRadius: 18, padding: pad,
      border: `1px solid ${C.line}`, ...style,
    }}>{children}</div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.inkSoft, marginBottom: 6, fontFamily: FONT_BODY }}>
        {label}
      </div>
      {children}
      {hint && <div style={{ fontSize: 12, color: C.inkSubtle, marginTop: 6, fontFamily: FONT_BODY }}>{hint}</div>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = 'text', prefix, autoFocus }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: C.bg, borderRadius: 10, padding: '0 14px',
      border: `1px solid ${C.line}`,
    }}>
      {prefix && <span style={{ color: C.inkSubtle, marginRight: 6, fontFamily: FONT_BODY, fontWeight: 500 }}>{prefix}</span>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        inputMode={type === 'number' ? 'decimal' : undefined}
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: FONT_BODY, fontSize: 16, color: C.ink,
          padding: '14px 0', width: '100%',
        }}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 12,
        background: checked ? C.coralSoft : C.bg,
        border: `1px solid ${checked ? C.coral : C.line}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 40, height: 24, borderRadius: 12,
        background: checked ? C.coral : '#D4D0C8',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.15s',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: checked ? 19 : 3,
          transition: 'left 0.15s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: C.ink }}>{label}</div>
        {hint && <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{hint}</div>}
      </div>
      <Heart size={18} color={checked ? C.coral : '#D4D0C8'} fill={checked ? C.coral : 'transparent'} />
    </div>
  );
}

/* ============================================================
   SETUP WIZARD
   ============================================================ */
function Setup({ initial, onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name || '');
  const [currency, setCurrency] = useState(initial?.currency || '$');
  const [income, setIncome] = useState(initial?.income ? String(initial.income) : '');
  const [fixed, setFixed] = useState(initial?.fixed || []);
  const [debts, setDebts] = useState(initial?.debts || []);

  const steps = ['Bienvenida', 'Ingreso', 'Gastos fijos', 'Deudas', 'Listo'];

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = () => {
    onComplete({
      name: name.trim(),
      currency,
      income: Number(income) || 0,
      fixed, debts,
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  };

  const addFixed = () => setFixed([...fixed, { id: uid(), name: '', amount: '', category: 'servicios', protected: false }]);
  const updFixed = (id, patch) => setFixed(fixed.map(f => f.id === id ? { ...f, ...patch } : f));
  const delFixed = (id) => setFixed(fixed.filter(f => f.id !== id));

  const addDebt = () => setDebts([...debts, { id: uid(), name: '', total: '', monthly: '' }]);
  const updDebt = (id, patch) => setDebts(debts.map(d => d.id === id ? { ...d, ...patch } : d));
  const delDebt = (id) => setDebts(debts.filter(d => d.id !== id));

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '32px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? C.ink : C.line,
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <div style={{ fontSize: 14, color: C.inkSubtle, fontFamily: FONT_BODY, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
              Bienvenida
            </div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 44, lineHeight: 1.05, color: C.ink, fontWeight: 500, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Hola. Vamos a entender, juntos, tu plata.
            </h1>
            <p style={{ fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.5, color: C.inkSoft, margin: '0 0 28px' }}>
              No es una app de banco. Es una libreta clara: cuánto entra, cuánto sale, qué cuidás y qué te queda.
              Tus datos quedan guardados en este navegador — nadie más los ve.
            </p>
            <Card pad={20} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Field label="¿Cómo te llamás?" hint="Es solo para saludarte cuando abras la app.">
                  <Input value={name} onChange={setName} placeholder="Tu nombre o como te quieras llamar" autoFocus />
                </Field>
                <Field label="¿Con qué símbolo manejás tu plata?">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['$', 'ARS$', 'CLP$', 'MXN$', 'COP$', 'PEN S/', 'UYU $', '€'].map(s => (
                      <button key={s} onClick={() => setCurrency(s)} style={{
                        padding: '8px 14px', borderRadius: 8, border: `1px solid ${currency === s ? C.ink : C.line}`,
                        background: currency === s ? C.ink : C.card,
                        color: currency === s ? '#fff' : C.ink,
                        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      }}>{s}</button>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>
            <Btn variant="coral" onClick={next} full>Empezar <ArrowRight size={18} /></Btn>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize: 14, color: C.inkSubtle, fontFamily: FONT_BODY, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Paso 1 de 3</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, lineHeight: 1.1, color: C.ink, fontWeight: 500, margin: '0 0 12px' }}>
              ¿Cuánto entra en tu hogar cada mes?
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, color: C.inkSoft, margin: '0 0 24px' }}>
              Poné el total después de descuentos, lo que efectivamente llega a tu bolsillo. Si tenés varios ingresos, sumalos.
            </p>
            <Card pad={20}>
              <Field label="Ingreso mensual">
                <Input type="number" value={income} onChange={setIncome} placeholder="0" prefix={currency} autoFocus />
              </Field>
            </Card>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Btn variant="ghost" onClick={back}><ChevronLeft size={18} /> Atrás</Btn>
              <Btn variant="coral" onClick={next} disabled={!income || Number(income) <= 0} style={{ flex: 1 }}>
                Continuar <ArrowRight size={18} />
              </Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 14, color: C.inkSubtle, fontFamily: FONT_BODY, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Paso 2 de 3</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, lineHeight: 1.1, color: C.ink, fontWeight: 500, margin: '0 0 12px' }}>
              ¿Qué pagás todos los meses?
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, color: C.inkSoft, margin: '0 0 8px' }}>
              Alquiler, luz, internet, celular, lo que sea fijo. Marcá con el corazón <Heart size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> aquello que no querés resignar — eso es <em>lo que cuidás</em>.
            </p>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fixed.map(f => (
                <Card key={f.id} pad={16}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 2 }}>
                      <Input value={f.name} onChange={(v) => updFixed(f.id, { name: v })} placeholder="Ej: Alquiler" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input type="number" value={f.amount} onChange={(v) => updFixed(f.id, { amount: v })} placeholder="0" prefix={currency} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={f.category} onChange={(e) => updFixed(f.id, { category: e.target.value })} style={{
                      background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8,
                      padding: '8px 10px', fontFamily: FONT_BODY, fontSize: 13, color: C.ink,
                    }}>
                      {CATS.filter(c => c.id !== 'deudas').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <button onClick={() => updFixed(f.id, { protected: !f.protected })} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8,
                      background: f.protected ? C.coralSoft : C.bg,
                      border: `1px solid ${f.protected ? C.coral : C.line}`,
                      color: f.protected ? C.coral : C.inkSoft,
                      fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}>
                      <Heart size={14} fill={f.protected ? C.coral : 'transparent'} /> Lo cuido
                    </button>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => delFixed(f.id)} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer', color: C.inkSubtle, padding: 6,
                    }}><Trash2 size={16} /></button>
                  </div>
                </Card>
              ))}
              <Btn variant="ghost" onClick={addFixed} full><Plus size={18} /> Agregar gasto fijo</Btn>
              {fixed.length === 0 && (
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, textAlign: 'center', margin: '4px 0 0' }}>
                  Si no tenés gastos fijos, podés saltar este paso.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Btn variant="ghost" onClick={back}><ChevronLeft size={18} /> Atrás</Btn>
              <Btn variant="coral" onClick={next} style={{ flex: 1 }}>Continuar <ArrowRight size={18} /></Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 14, color: C.inkSubtle, fontFamily: FONT_BODY, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Paso 3 de 3</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, lineHeight: 1.1, color: C.ink, fontWeight: 500, margin: '0 0 12px' }}>
              ¿Estás pagando alguna deuda?
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, color: C.inkSoft, margin: '0 0 8px' }}>
              Préstamos, cuotas, tarjeta. Anotá lo que pagás por mes y, si sabés, el total que falta.
            </p>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {debts.map(d => (
                <Card key={d.id} pad={16}>
                  <div style={{ marginBottom: 10 }}>
                    <Input value={d.name} onChange={(v) => updDebt(d.id, { name: v })} placeholder="Ej: Préstamo del banco" />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Field label="Cuota mensual">
                        <Input type="number" value={d.monthly} onChange={(v) => updDebt(d.id, { monthly: v })} placeholder="0" prefix={currency} />
                      </Field>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field label="Total restante (opcional)">
                        <Input type="number" value={d.total} onChange={(v) => updDebt(d.id, { total: v })} placeholder="0" prefix={currency} />
                      </Field>
                    </div>
                  </div>
                  <button onClick={() => delDebt(d.id)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', color: C.inkSubtle,
                    padding: 6, marginTop: 8, fontFamily: FONT_BODY, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Trash2 size={14} /> Quitar
                  </button>
                </Card>
              ))}
              <Btn variant="ghost" onClick={addDebt} full><Plus size={18} /> Agregar deuda</Btn>
              {debts.length === 0 && (
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, textAlign: 'center', margin: '4px 0 0' }}>
                  Si no tenés deudas, dejalo así. Mejor.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Btn variant="ghost" onClick={back}><ChevronLeft size={18} /> Atrás</Btn>
              <Btn variant="coral" onClick={next} style={{ flex: 1 }}>Continuar <ArrowRight size={18} /></Btn>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: C.coralSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Check size={36} color={C.coral} />
            </div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: C.ink, fontWeight: 500, margin: '0 0 12px', lineHeight: 1.1 }}>
              Listo. Esta es tu libreta.
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: C.inkSoft, margin: '0 0 32px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Desde acá vas a poder anotar lo que gastás cada día y ver cómo se mueve tu plata.
            </p>
            <Btn variant="coral" onClick={finish}>Entrar <ArrowRight size={18} /></Btn>
            {onCancel && (
              <div style={{ marginTop: 16 }}>
                <button onClick={onCancel} style={{
                  background: 'transparent', border: 'none', color: C.inkSoft,
                  fontFamily: FONT_BODY, fontSize: 14, cursor: 'pointer',
                }}>Cancelar cambios</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ADD EXPENSE MODAL
   ============================================================ */
function AddExpenseModal({ currency, onClose, onSave, defaultDate }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('alimentacion');
  const [date, setDate] = useState(defaultDate || todayISO());
  const [protectedFlag, setProtectedFlag] = useState(false);

  const save = () => {
    const a = Number(amount);
    if (!a || a <= 0) return;
    onSave({
      id: uid(), amount: a,
      description: description.trim() || 'Gasto sin descripción',
      category, date, protected: protectedFlag,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20, 18, 14, 0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 100, padding: 0,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        width: '100%', maxWidth: 520, padding: 28, paddingBottom: 32,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.ink, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
            Anotar un gasto
          </h3>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
            <X size={18} color={C.inkSoft} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="¿Cuánto gastaste?">
            <Input type="number" value={amount} onChange={setAmount} placeholder="0" prefix={currency} autoFocus />
          </Field>
          <Field label="¿En qué?">
            <Input value={description} onChange={setDescription} placeholder="Pan, taxi, remedios..." />
          </Field>
          <Field label="Categoría">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATS.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  padding: '8px 12px', borderRadius: 999,
                  border: `1px solid ${category === c.id ? c.color : C.line}`,
                  background: category === c.id ? c.color : C.card,
                  color: category === c.id ? '#fff' : C.inkSoft,
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>{c.label}</button>
              ))}
            </div>
          </Field>
          <Field label="Fecha">
            <Input type="date" value={date} onChange={setDate} />
          </Field>
          <Toggle
            checked={protectedFlag} onChange={setProtectedFlag}
            label="Esto es algo que cuido"
            hint="Marcalo si no querés resignar este tipo de gasto."
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="coral" onClick={save} disabled={!amount || Number(amount) <= 0} style={{ flex: 1 }}>
            <Check size={18} /> Anotar
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function AllocationBar({ income, fixed, debts, variable, remaining }) {
  const total = Math.max(income, fixed + debts + variable + remaining, 1);
  const seg = (v, color) => ({ width: `${(v / total) * 100}%`, background: color });
  return (
    <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: C.line }}>
      <div style={seg(fixed, C.amber)} />
      <div style={seg(debts, C.rose)} />
      <div style={seg(variable, C.coral)} />
      <div style={seg(remaining, C.emerald)} />
    </div>
  );
}

function Dashboard({ profile, transactions, onAdd, onDelete, onEdit, onReset }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const month = thisMonth();
  const txMonth = useMemo(
    () => transactions.filter(t => monthOf(t.date) === month).sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, month]
  );

  const fixedTotal = (profile.fixed || []).reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const fixedProtected = (profile.fixed || []).filter(f => f.protected).reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const debtsTotal = (profile.debts || []).reduce((a, b) => a + (Number(b.monthly) || 0), 0);
  const variableSpent = txMonth.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const variableProtected = txMonth.filter(t => t.protected).reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const income = Number(profile.income) || 0;
  const totalSpent = fixedTotal + debtsTotal + variableSpent;
  const remaining = income - totalSpent;
  const protectedTotal = fixedProtected + variableProtected;

  const availableVariable = income - fixedTotal - debtsTotal;
  const variablePctUsed = availableVariable > 0 ? (variableSpent / availableVariable) * 100 : 0;

  const catData = useMemo(() => {
    const map = {};
    (profile.fixed || []).forEach(f => {
      const cid = f.category || 'otros';
      map[cid] = (map[cid] || 0) + (Number(f.amount) || 0);
    });
    txMonth.forEach(t => {
      const cid = t.category || 'otros';
      map[cid] = (map[cid] || 0) + (Number(t.amount) || 0);
    });
    if (debtsTotal > 0) map['deudas'] = (map['deudas'] || 0) + debtsTotal;
    return Object.entries(map)
      .map(([id, value]) => ({ id, label: catById(id).label, color: catById(id).color, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [profile, txMonth, debtsTotal]);

  const dailyData = useMemo(() => {
    const map = {};
    txMonth.forEach(t => {
      const day = t.date.slice(8);
      map[day] = (map[day] || 0) + Number(t.amount);
    });
    const today = new Date();
    const days = [];
    const isThisMonth = month === thisMonth();
    const maxDay = isThisMonth ? today.getDate() : new Date(parseInt(month.slice(0,4)), parseInt(month.slice(5,7)), 0).getDate();
    for (let d = 1; d <= maxDay; d++) {
      const key = String(d).padStart(2, '0');
      days.push({ day: d, gasto: map[key] || 0 });
    }
    return days;
  }, [txMonth, month]);

  const recs = useMemo(() => generateRecs({
    income, fixedTotal, debtsTotal, variableSpent, variableProtected, fixedProtected,
    availableVariable, remaining, catData, txCount: txMonth.length, currency: profile.currency
  }), [income, fixedTotal, debtsTotal, variableSpent, variableProtected, fixedProtected, availableVariable, remaining, catData, txMonth.length, profile.currency]);

  const filteredTx = txMonth.filter(t => {
    if (filter === 'protected') return t.protected;
    if (filter === 'unprotected') return !t.protected;
    return true;
  });

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-');
    const names = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${names[parseInt(m) - 1]} ${y}`;
  }, [month]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buen día';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100 }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '28px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase' }}>
            {profile.name ? greeting : 'Tu libreta'}
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: C.ink, fontWeight: 500, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
            {profile.name ? `Hola, ${profile.name}` : monthLabel}
          </h1>
          {profile.name && (
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
              {monthLabel}
            </div>
          )}
        </div>
        <button onClick={() => setShowSettings(true)} style={{
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
          padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          color: C.ink, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 500,
        }}>
          <Settings size={16} /> Ajustes
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card pad={28} style={{ gridColumn: '1 / -1', position: 'relative', overflow: 'visible' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              {remaining >= 0 ? 'Lo que te queda este mes' : 'Te pasaste por'}
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(36px, 8vw, 64px)',
              lineHeight: 1.1,
              fontWeight: 500,
              color: remaining >= 0 ? C.ink : C.rose,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}>
              {fmt(Math.abs(remaining), profile.currency)}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, marginTop: 12 }}>
              {remaining >= 0
                ? `De ${fmt(income, profile.currency)} que entraron, ya destinaste ${fmt(totalSpent, profile.currency)}.`
                : `Gastaste ${fmt(totalSpent, profile.currency)} de los ${fmt(income, profile.currency)} que entraron.`}
            </div>

            <div style={{ marginTop: 24 }}>
              <AllocationBar
                income={income} fixed={fixedTotal} debts={debtsTotal}
                variable={variableSpent} remaining={Math.max(0, remaining)}
              />
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontFamily: FONT_BODY, fontSize: 12, color: C.inkSoft }}>
                <LegendDot color={C.amber} label={`Fijos ${fmt(fixedTotal, profile.currency)}`} />
                <LegendDot color={C.rose} label={`Deudas ${fmt(debtsTotal, profile.currency)}`} />
                <LegendDot color={C.coral} label={`Variables ${fmt(variableSpent, profile.currency)}`} />
                <LegendDot color={C.emerald} label={`Libre ${fmt(Math.max(0, remaining), profile.currency)}`} />
              </div>
            </div>
          </div>
        </Card>

        <Card pad={24} style={{ gridColumn: '1 / -1', background: C.ink, color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 500, marginBottom: 4 }}>¿Gastaste algo hoy?</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, opacity: 0.75 }}>Anotalo ahora, mientras te acordás.</div>
            </div>
            <button onClick={() => setShowAdd(true)} style={{
              background: C.coral, color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px 22px', fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Plus size={18} /> Anotar gasto
            </button>
          </div>
        </Card>

        <Card pad={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Heart size={18} color={C.coral} fill={C.coral} />
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase' }}>Lo que cuidás</div>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: C.ink, fontWeight: 500, letterSpacing: '-0.02em' }}>
            {fmt(protectedTotal, profile.currency)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, marginTop: 4 }}>
            {income > 0 ? `${((protectedTotal / income) * 100).toFixed(0)}% de tu ingreso` : 'Sin ingreso registrado'}
          </div>
          <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: C.coralSoft, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: income > 0 ? `${Math.min(100, (protectedTotal / income) * 100)}%` : '0%',
              background: C.coral, transition: 'width 0.4s',
            }} />
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSoft, marginTop: 14, lineHeight: 1.5 }}>
            {protectedTotal === 0
              ? 'Todavía no marcaste nada. Si hay algo que no querés resignar, ponele un corazón al agregarlo.'
              : 'Estos son los gastos que te negás a soltar. Verlos juntos te ayuda a decidir con qué te quedás y qué soltás.'}
          </p>
        </Card>

        <Card pad={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Wallet size={18} color={C.emerald} />
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase' }}>Plata para el día a día</div>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: C.ink, fontWeight: 500, letterSpacing: '-0.02em' }}>
            {fmt(Math.max(0, availableVariable - variableSpent), profile.currency)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, marginTop: 4 }}>
            de {fmt(Math.max(0, availableVariable), profile.currency)} disponibles
          </div>
          <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: C.emeraldSoft, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.min(100, variablePctUsed)}%`,
              background: variablePctUsed > 90 ? C.rose : variablePctUsed > 70 ? C.amber : C.emerald,
              transition: 'width 0.4s, background 0.3s',
            }} />
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSoft, marginTop: 14, lineHeight: 1.5 }}>
            Es lo que te queda después de pagar lo fijo y las deudas. Esta es la plata que se gasta en el día a día.
          </p>
        </Card>

        <Card pad={24}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>En qué se va tu plata</div>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.ink, fontWeight: 500, margin: '0 0 16px' }}>Por categoría</h3>
          {catData.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkSubtle, fontFamily: FONT_BODY, fontSize: 14, textAlign: 'center', padding: 20 }}>
              Cuando empieces a anotar gastos, vas a ver el reparto acá.
            </div>
          ) : (
            <>
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={catData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
                      {catData.map((d) => <Cell key={d.id} fill={d.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => fmt(v, profile.currency)}
                      contentStyle={{ background: C.ink, border: 'none', borderRadius: 8, color: '#fff', fontFamily: FONT_BODY, fontSize: 13 }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {catData.slice(0, 6).map(d => {
                  const pct = (d.value / catData.reduce((a, b) => a + b.value, 0)) * 100;
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_BODY, fontSize: 13 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ color: C.ink, flex: 1 }}>{d.label}</span>
                      <span style={{ color: C.inkSoft }}>{fmt(d.value, profile.currency)}</span>
                      <span style={{ color: C.inkSubtle, fontSize: 12, minWidth: 38, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        <Card pad={24}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Tu mes, día a día</div>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.ink, fontWeight: 500, margin: '0 0 16px' }}>Gasto diario</h3>
          {variableSpent === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkSubtle, fontFamily: FONT_BODY, fontSize: 14, textAlign: 'center', padding: 20 }}>
              Empezá a anotar y vas a ver el ritmo de tus gastos.
            </div>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.inkSubtle, fontFamily: FONT_BODY }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.inkSubtle, fontFamily: FONT_BODY }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    formatter={(v) => fmt(v, profile.currency)}
                    labelFormatter={(l) => `Día ${l}`}
                    contentStyle={{ background: C.ink, border: 'none', borderRadius: 8, color: '#fff', fontFamily: FONT_BODY, fontSize: 13 }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: C.coralSoft }}
                  />
                  <Bar dataKey="gasto" fill={C.coral} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {recs.length > 0 && (
          <Card pad={24} style={{ gridColumn: '1 / -1', background: C.coralSoft, border: `1px solid ${C.coral}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color={C.coral} />
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.coral, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                Lo que veo en tus números
              </div>
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {recs.map((r, i) => (
                <div key={i} style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.line}` }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500, color: C.ink, marginBottom: 6, letterSpacing: '-0.01em' }}>
                    {r.title}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, lineHeight: 1.5 }}>
                    {r.body}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card pad={24} style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase' }}>Lo anotado este mes</div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.ink, fontWeight: 500, margin: '4px 0 0' }}>
                {txMonth.length} {txMonth.length === 1 ? 'gasto' : 'gastos'}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { v: 'all', l: 'Todos' },
                { v: 'protected', l: 'Lo que cuido' },
                { v: 'unprotected', l: 'Lo demás' },
              ].map(o => (
                <button key={o.v} onClick={() => setFilter(o.v)} style={{
                  padding: '8px 12px', borderRadius: 999,
                  background: filter === o.v ? C.ink : 'transparent',
                  color: filter === o.v ? '#fff' : C.inkSoft,
                  border: `1px solid ${filter === o.v ? C.ink : C.line}`,
                  fontFamily: FONT_BODY, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>{o.l}</button>
              ))}
            </div>
          </div>

          {filteredTx.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.inkSubtle, fontFamily: FONT_BODY, fontSize: 14 }}>
              {txMonth.length === 0
                ? 'Todavía no anotaste nada este mes. Tocá "Anotar gasto" para empezar.'
                : 'No hay gastos en este filtro.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredTx.map((t, i) => {
                const cat = catById(t.category);
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
                    borderBottom: i < filteredTx.length - 1 ? `1px solid ${C.line}` : 'none',
                  }}>
                    <div style={{ width: 8, height: 40, borderRadius: 4, background: cat.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.ink, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</span>
                        {t.protected && <Heart size={13} color={C.coral} fill={C.coral} style={{ flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.inkSubtle, marginTop: 2 }}>
                        {cat.label} · {niceDate(t.date)}
                      </div>
                    </div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: C.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      −{fmt(t.amount, profile.currency)}
                    </div>
                    <button onClick={() => onDelete(t.id)} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer', color: C.inkSubtle, padding: 6, borderRadius: 6,
                    }}><Trash2 size={15} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card pad={24} style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, letterSpacing: 1, textTransform: 'uppercase' }}>Tu base mensual</div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.ink, fontWeight: 500, margin: '4px 0 0' }}>Fijos y deudas</h3>
            </div>
            <button onClick={() => setShowSettings(true)} style={{
              background: 'transparent', border: `1px solid ${C.line}`, borderRadius: 10,
              padding: '8px 12px', cursor: 'pointer', color: C.inkSoft,
              fontFamily: FONT_BODY, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Edit3 size={14} /> Editar
            </button>
          </div>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.inkSubtle, marginBottom: 8, fontWeight: 600 }}>GASTOS FIJOS</div>
              {(profile.fixed || []).length === 0 ? (
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, padding: 12, background: C.bg, borderRadius: 8 }}>
                  Sin gastos fijos cargados.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {profile.fixed.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
                      <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: C.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {f.name || 'Sin nombre'}
                        {f.protected && <Heart size={12} color={C.coral} fill={C.coral} />}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(Number(f.amount) || 0, profile.currency)}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: `1px solid ${C.line}` }}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, fontWeight: 600 }}>Total</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(fixedTotal, profile.currency)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.inkSubtle, marginBottom: 8, fontWeight: 600 }}>DEUDAS</div>
              {(profile.debts || []).length === 0 ? (
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, padding: 12, background: C.bg, borderRadius: 8 }}>
                  Sin deudas. Bien ahí.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {profile.debts.map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
                      <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: C.ink }}>
                        {d.name || 'Sin nombre'}
                        {d.total ? <div style={{ fontSize: 11, color: C.inkSubtle, marginTop: 2 }}>Resta {fmt(Number(d.total), profile.currency)}</div> : null}
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(Number(d.monthly) || 0, profile.currency)}/mes
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: `1px solid ${C.line}` }}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSubtle, fontWeight: 600 }}>Total mensual</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(debtsTotal, profile.currency)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          background: C.coral, color: '#fff', border: 'none',
          borderRadius: '50%', width: 60, height: 60, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(229, 100, 78, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Anotar gasto"
      >
        <Plus size={26} />
      </button>

      {showAdd && (
        <AddExpenseModal
          currency={profile.currency}
          onClose={() => setShowAdd(false)}
          onSave={(t) => { onAdd(t); setShowAdd(false); }}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(20, 18, 14, 0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            width: '100%', maxWidth: 520, padding: 28, paddingBottom: 36,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.ink, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
                Ajustes
              </h3>
              <button onClick={() => setShowSettings(false)} style={{ background: C.bg, border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
                <X size={18} color={C.inkSoft} />
              </button>
            </div>

            {/* Opción: editar perfil */}
            <button onClick={() => { setShowSettings(false); onEdit(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', borderRadius: 14,
              background: C.bg, border: `1px solid ${C.line}`,
              cursor: 'pointer', marginBottom: 10, textAlign: 'left',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: C.emeraldSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Edit3 size={18} color={C.emerald} />
              </div>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: C.ink }}>
                  Editar mi perfil
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
                  Cambiá tu nombre, ingreso, gastos fijos o deudas
                </div>
              </div>
            </button>

            {/* Separador */}
            <div style={{ height: 1, background: C.line, margin: '20px 0' }} />

            {/* Zona de peligro — reset */}
            <div style={{ padding: '16px 18px', borderRadius: 14, background: C.roseSoft, border: `1px solid ${C.rose}22` }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, color: C.rose, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Zona de peligro
              </div>
              <button onClick={() => { setShowSettings(false); setShowResetConfirm(true); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: C.card, border: `1px solid ${C.rose}44`,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: C.roseSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Trash2 size={18} color={C.rose} />
                </div>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: C.rose }}>
                    Borrar todo y empezar de cero
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
                    Elimina tu perfil, gastos y todo el historial
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(20, 18, 14, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 110, padding: 24,
        }} onClick={() => setShowResetConfirm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.card, borderRadius: 20,
            width: '100%', maxWidth: 420, padding: 32,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: C.roseSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Trash2 size={26} color={C.rose} />
            </div>
            <h3 style={{
              fontFamily: FONT_DISPLAY, fontSize: 26, color: C.ink, fontWeight: 500,
              margin: '0 0 10px', textAlign: 'center', letterSpacing: '-0.01em',
            }}>
              ¿Borrás todo?
            </h3>
            <p style={{
              fontFamily: FONT_BODY, fontSize: 15, color: C.inkSoft,
              margin: '0 0 28px', textAlign: 'center', lineHeight: 1.5,
            }}>
              Se van a eliminar tu perfil, todos tus gastos y el historial completo.
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{
                flex: 1, padding: '14px', borderRadius: 12,
                background: C.bg, border: `1px solid ${C.line}`,
                fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600,
                color: C.ink, cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button onClick={() => { setShowResetConfirm(false); onReset(); }} style={{
                flex: 1, padding: '14px', borderRadius: 12,
                background: C.rose, border: 'none',
                fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600,
                color: '#fff', cursor: 'pointer',
              }}>
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RECOMMENDATIONS
   ============================================================ */
function generateRecs({ income, fixedTotal, debtsTotal, variableSpent, variableProtected, fixedProtected, availableVariable, remaining, catData, txCount, currency }) {
  const recs = [];
  if (income === 0) return recs;

  const fixedPct = (fixedTotal / income) * 100;
  const debtsPct = (debtsTotal / income) * 100;
  const protectedPct = ((fixedProtected + variableProtected) / income) * 100;

  if (remaining < 0) {
    recs.push({
      title: 'Te estás pasando',
      body: `Llevás ${fmt(Math.abs(remaining), currency)} por encima de lo que entra. Vale la pena mirar qué de lo variable se puede ajustar antes de fin de mes.`
    });
  } else if (remaining > 0 && remaining / income > 0.15 && txCount > 5) {
    recs.push({
      title: 'Te está sobrando',
      body: `Hasta ahora te quedan ${fmt(remaining, currency)} libres. Si seguís así, considerá guardar una parte para los meses que vienen.`
    });
  }

  if (fixedPct > 60) {
    recs.push({
      title: 'Tus fijos pesan',
      body: `Los gastos fijos ya se llevan ${fixedPct.toFixed(0)}% de lo que entra. Es difícil moverlos rápido, pero tenerlo presente ayuda a tomar decisiones.`
    });
  }

  if (debtsPct > 30) {
    recs.push({
      title: 'Las deudas están pesando',
      body: `Pagás ${debtsPct.toFixed(0)}% de tu ingreso en cuotas. Si podés, priorizá pagar la deuda con la cuota más chica primero — sacarla del medio te da aire.`
    });
  }

  if (protectedPct > 40) {
    recs.push({
      title: 'Lo que cuidás pesa fuerte',
      body: `Las cosas que decidiste no resignar son ${protectedPct.toFixed(0)}% de tu ingreso. Está bien quererlas — pero saberlo te ayuda a elegir con los ojos abiertos.`
    });
  }

  if (catData.length > 0) {
    const top = catData[0];
    const totalCat = catData.reduce((a, b) => a + b.value, 0);
    const topPct = (top.value / totalCat) * 100;
    if (topPct > 40 && top.id !== 'vivienda') {
      recs.push({
        title: `${top.label} se lleva mucho`,
        body: `El ${topPct.toFixed(0)}% de lo que gastás está yendo a ${top.label.toLowerCase()}. ¿Se puede ajustar algo ahí, o es una decisión consciente?`
      });
    }
  }

  if (txCount === 0 && fixedTotal > 0) {
    recs.push({
      title: 'Empezá a anotar',
      body: 'Tus fijos ya están cargados. Ahora la magia es anotar los gastos del día — incluso los chiquitos. Es ahí donde aparece la verdad.'
    });
  }

  if (availableVariable > 0 && variableSpent / availableVariable > 0.8) {
    recs.push({
      title: 'Estás cerca del límite del día a día',
      body: `Ya usaste ${((variableSpent / availableVariable) * 100).toFixed(0)}% de la plata libre del mes. Quedan días — ojo con los próximos gastos.`
    });
  }

  return recs.slice(0, 4);
}

/* ============================================================
   APP (root)
   ============================================================ */
export default function App() {
  useFonts();
  const [view, setView] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const p = store.get('profile', null);
    const t = store.get('transactions', []);
    setProfile(p);
    setTransactions(t);
    setView(p ? 'dashboard' : 'setup');
  }, []);

  const saveProfile = (p) => {
    setProfile(p);
    store.set('profile', p);
    setView('dashboard');
  };

  const addTx = (tx) => {
    const next = [tx, ...transactions];
    setTransactions(next);
    store.set('transactions', next);
  };

  const delTx = (id) => {
    const next = transactions.filter(t => t.id !== id);
    setTransactions(next);
    store.set('transactions', next);
  };

  const resetApp = () => {
    store.set('profile', null);
    store.set('transactions', []);
    setProfile(null);
    setTransactions([]);
    setView('setup');
  };

  if (view === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_BODY, color: C.inkSoft,
      }}>
        Abriendo tu libreta...
      </div>
    );
  }

  if (view === 'setup' || !profile) {
    return <Setup onComplete={saveProfile} />;
  }

  if (view === 'edit') {
    return <Setup initial={profile} onComplete={saveProfile} onCancel={() => setView('dashboard')} />;
  }

  return (
    <Dashboard
      profile={profile}
      transactions={transactions}
      onAdd={addTx}
      onDelete={delTx}
      onEdit={() => setView('edit')}
      onReset={resetApp}
    />
  );
}
