'use client';

import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Vista = 'propietari' | 'formulari-inici' | 'enllaç' | 'formulari-hoste' | 'descarrega';
type TipusDoc = 'DNI' | 'NIE' | 'Passaport';

interface Hoste {
  nomCognoms: string;
  esMenor: boolean;
  dataNaixement: string;
  tipusDocument?: TipusDoc;
  numDocument?: string;
  nacionalitat?: string;
  telefon?: string;
  email?: string;
}

interface Reserva {
  codi: string;
  dataEntrada: string;
  dataSortida: string;
  adults: number;
  menors: number;
  hostes: Hoste[];
}

// ─── Shared styles ───────────────────────────────────────────────────────────

const C = {
  bg: '#0f0f0f',
  surface: '#171717',
  border: '#2a2a2a',
  accent: '#1D9E75',
  accentBg: '#1D9E7518',
  accentBorder: '#1D9E7535',
  text: '#f0f0f0',
  muted: '#888888',
};

const inputStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: `1px solid ${C.border}`,
  color: C.text,
  borderRadius: '8px',
  padding: '11px 14px',
  width: '100%',
  fontSize: '15px',
  fontFamily: 'var(--font-body, DM Sans, sans-serif)',
  outline: 'none',
  boxSizing: 'border-box',
  appearance: 'none',
};

const btnPrimary: React.CSSProperties = {
  backgroundColor: C.accent,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '13px 20px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  fontFamily: 'var(--font-body, DM Sans, sans-serif)',
  letterSpacing: '-0.01em',
};

const btnSecondary: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: '8px',
  padding: '13px 20px',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  width: '100%',
  fontFamily: 'var(--font-body, DM Sans, sans-serif)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: C.muted,
  marginBottom: '6px',
  fontWeight: 500,
  fontFamily: 'var(--font-body, DM Sans, sans-serif)',
};

const displayFont: React.CSSProperties = {
  fontFamily: 'var(--font-display, Syne, sans-serif)',
};

const bodyFont: React.CSSProperties = {
  fontFamily: 'var(--font-body, DM Sans, sans-serif)',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = 'checkin.garciaguilar.com/esclopets';

function descarregarFitxer(reserva: Reserva) {
  const lines: string[] = [
    `REGISTRE CHECK-IN — Els Esclopets`,
    `${'─'.repeat(40)}`,
    `Reserva: ${reserva.codi}`,
    `Entrada: ${reserva.dataEntrada}  |  Sortida: ${reserva.dataSortida}`,
    `Adults: ${reserva.adults}  |  Menors: ${reserva.menors}`,
    `Hostes registrats: ${reserva.hostes.length} / ${reserva.adults + reserva.menors}`,
    '',
    `${'─'.repeat(40)}`,
    '',
  ];
  reserva.hostes.forEach((h, i) => {
    lines.push(`Hoste ${i + 1}: ${h.nomCognoms}`);
    if (h.esMenor) {
      lines.push(`  Menor d'edat`);
      lines.push(`  Data de naixement: ${h.dataNaixement}`);
    } else {
      lines.push(`  ${h.tipusDocument}: ${h.numDocument}`);
      lines.push(`  Nacionalitat: ${h.nacionalitat}`);
      lines.push(`  Data de naixement: ${h.dataNaixement}`);
      lines.push(`  Telèfon: ${h.telefon}`);
      lines.push(`  Email: ${h.email}`);
    }
    lines.push('');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `checkin-${reserva.codi}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ height: '4px', backgroundColor: C.border, borderRadius: '2px' }}>
      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: C.accent, borderRadius: '2px', transition: 'width 0.3s ease' }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const emptyFormInici = { codi: '', dataEntrada: '', dataSortida: '', adults: 1, menors: 0 };
const emptyFormHoste = {
  nomCognoms: '', esMenor: false, tipusDocument: 'DNI' as TipusDoc,
  numDocument: '', nacionalitat: '', dataNaixement: '', telefon: '', email: '',
};

export default function EsclopetsPage() {
  const [vista, setVista] = useState<Vista>('propietari');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservaActual, setReservaActual] = useState<Reserva | null>(null);
  const [hostIndex, setHostIndex] = useState(0);
  const [copiat, setCopiat] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formInici, setFormInici] = useState(emptyFormInici);
  const [formHoste, setFormHoste] = useState(emptyFormHoste);

  const totalHostes = reservaActual ? reservaActual.adults + reservaActual.menors : 0;
  const urlReserva = reservaActual ? `${BASE_URL}#${reservaActual.codi}` : '';

  function copiar(url: string) {
    navigator.clipboard.writeText(`https://${url}`).then(() => {
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2200);
    });
  }

  function crearReserva() {
    const errs: Record<string, string> = {};
    if (!formInici.codi.trim()) errs.codi = 'Camp obligatori';
    if (!formInici.dataEntrada) errs.dataEntrada = 'Camp obligatori';
    if (!formInici.dataSortida) errs.dataSortida = 'Camp obligatori';
    if (formInici.adults < 1) errs.adults = 'Mínim 1 adult';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const nova: Reserva = { ...formInici, hostes: [] };
    setReservaActual(nova);
    setHostIndex(0);
    setFormHoste(emptyFormHoste);
    setVista('enllaç');
  }

  function guardarHoste() {
    const errs: Record<string, string> = {};
    if (!formHoste.nomCognoms.trim()) errs.nomCognoms = 'Camp obligatori';
    if (!formHoste.dataNaixement) errs.dataNaixement = 'Camp obligatori';
    if (!formHoste.esMenor) {
      if (!formHoste.numDocument.trim()) errs.numDocument = 'Camp obligatori';
      if (!formHoste.nacionalitat.trim()) errs.nacionalitat = 'Camp obligatori';
      if (!formHoste.telefon.trim()) errs.telefon = 'Camp obligatori';
      if (!formHoste.email.trim()) errs.email = 'Camp obligatori';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    if (!reservaActual) return;
    const nouHoste: Hoste = {
      nomCognoms: formHoste.nomCognoms,
      esMenor: formHoste.esMenor,
      dataNaixement: formHoste.dataNaixement,
      ...(formHoste.esMenor ? {} : {
        tipusDocument: formHoste.tipusDocument,
        numDocument: formHoste.numDocument,
        nacionalitat: formHoste.nacionalitat,
        telefon: formHoste.telefon,
        email: formHoste.email,
      }),
    };

    const updated: Reserva = { ...reservaActual, hostes: [...reservaActual.hostes, nouHoste] };
    const nextIdx = hostIndex + 1;

    if (nextIdx >= totalHostes) {
      setReservaActual(updated);
      setReservas(prev => {
        const idx = prev.findIndex(r => r.codi === updated.codi);
        if (idx >= 0) { const c = [...prev]; c[idx] = updated; return c; }
        return [...prev, updated];
      });
      setVista('descarrega');
    } else {
      setReservaActual(updated);
      setHostIndex(nextIdx);
      setFormHoste(emptyFormHoste);
    }
  }

  const page: React.CSSProperties = {
    ...bodyFont,
    backgroundColor: C.bg,
    color: C.text,
    minHeight: '100vh',
    padding: '20px',
    maxWidth: '480px',
    margin: '0 auto',
    boxSizing: 'border-box',
  };

  // ── Vista: Propietari ──────────────────────────────────────────────────────

  if (vista === 'propietari') {
    return (
      <div style={page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h1 style={{ ...displayFont, fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em' }}>
            Els Esclopets
          </h1>
          <button
            onClick={() => copiar(BASE_URL)}
            style={{
              backgroundColor: copiat ? C.accentBg : '#1a1a1a',
              border: `1px solid ${copiat ? C.accentBorder : C.border}`,
              color: copiat ? C.accent : C.muted,
              borderRadius: '6px', padding: '7px 11px', fontSize: '12px',
              cursor: 'pointer', transition: 'all 0.2s', ...bodyFont,
              whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {copiat ? '✓ Copiat' : `⎘ ${BASE_URL}`}
          </button>
        </div>

        <p style={{ color: C.muted, fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
          Reservas actives
        </p>

        {reservas.length === 0 ? (
          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🏡</div>
            <p style={{ fontWeight: 500, fontSize: '16px', marginBottom: '8px' }}>Cap reserva activa.</p>
            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.65 }}>
              Envia l&apos;enllaç al teu proper client<br />per començar.
            </p>
            <button
              style={{ ...btnPrimary, width: 'auto', padding: '10px 22px', marginTop: '24px', fontSize: '14px' }}
              onClick={() => { setFormInici(emptyFormInici); setErrors({}); setVista('formulari-inici'); }}
            >
              + Nova reserva
            </button>
          </div>
        ) : (
          <>
            {reservas.map(r => {
              const tot = r.adults + r.menors;
              const complet = r.hostes.length >= tot;
              return (
                <div key={r.codi} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px', ...displayFont }}>{r.codi}</p>
                      <p style={{ color: C.muted, fontSize: '13px' }}>{r.dataEntrada} → {r.dataSortida}</p>
                    </div>
                    <span style={{
                      backgroundColor: complet ? C.accentBg : '#ff990018',
                      color: complet ? C.accent : '#ff9900',
                      border: `1px solid ${complet ? C.accentBorder : '#ff990035'}`,
                      borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      {complet ? 'Complet' : 'Pendent'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                      <span>{r.hostes.length}/{tot} persones</span>
                      <span>{Math.round((r.hostes.length / tot) * 100)}%</span>
                    </div>
                    <ProgressBar value={r.hostes.length} total={tot} />
                  </div>
                  <button
                    onClick={() => descarregarFitxer(r)}
                    style={{ ...btnSecondary, padding: '9px 14px', fontSize: '13px', width: 'auto' }}
                  >
                    ↓ Descarregar fitxer
                  </button>
                </div>
              );
            })}
            <button
              style={{ ...btnPrimary, marginTop: '6px' }}
              onClick={() => { setFormInici(emptyFormInici); setErrors({}); setVista('formulari-inici'); }}
            >
              + Nova reserva
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Vista: Formulari d'inici ───────────────────────────────────────────────

  if (vista === 'formulari-inici') {
    return (
      <div style={page}>
        <button onClick={() => setVista('propietari')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0, ...bodyFont }}>
          ← Tornar
        </button>
        <h2 style={{ ...displayFont, fontWeight: 700, fontSize: '24px', marginBottom: '6px', letterSpacing: '-0.03em' }}>
          Nova reserva
        </h2>
        <p style={{ color: C.muted, fontSize: '14px', marginBottom: '28px' }}>
          Introdueix les dades de la reserva d&apos;Airbnb.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Codi de reserva Airbnb" error={errors.codi}>
            <input
              style={{ ...inputStyle, borderColor: errors.codi ? '#e05' : C.border }}
              placeholder="HM3XXXXXXXX"
              value={formInici.codi}
              onChange={e => setFormInici(f => ({ ...f, codi: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Data d'entrada" error={errors.dataEntrada}>
            <input
              type="date"
              style={{ ...inputStyle, borderColor: errors.dataEntrada ? '#e05' : C.border, colorScheme: 'dark' }}
              value={formInici.dataEntrada}
              onChange={e => setFormInici(f => ({ ...f, dataEntrada: e.target.value }))}
            />
          </Field>

          <Field label="Data de sortida" error={errors.dataSortida}>
            <input
              type="date"
              style={{ ...inputStyle, borderColor: errors.dataSortida ? '#e05' : C.border, colorScheme: 'dark' }}
              value={formInici.dataSortida}
              onChange={e => setFormInici(f => ({ ...f, dataSortida: e.target.value }))}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Adults (+18)" error={errors.adults}>
              <input
                type="number" min={1}
                style={{ ...inputStyle, borderColor: errors.adults ? '#e05' : C.border }}
                value={formInici.adults}
                onChange={e => setFormInici(f => ({ ...f, adults: Math.max(1, parseInt(e.target.value) || 1) }))}
              />
            </Field>
            <Field label="Menors (-18)">
              <input
                type="number" min={0}
                style={inputStyle}
                value={formInici.menors}
                onChange={e => setFormInici(f => ({ ...f, menors: Math.max(0, parseInt(e.target.value) || 0) }))}
              />
            </Field>
          </div>

          <button style={{ ...btnPrimary, marginTop: '8px' }} onClick={crearReserva}>
            Crear reserva i obtenir enllaç →
          </button>
        </div>
      </div>
    );
  }

  // ── Vista: Enllaç per compartir ───────────────────────────────────────────

  if (vista === 'enllaç') {
    return (
      <div style={{ ...page, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', backgroundColor: C.accentBg,
            border: `1px solid ${C.accentBorder}`, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: '26px',
          }}>✓</div>
          <h2 style={{ ...displayFont, fontWeight: 700, fontSize: '24px', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Reserva creada
          </h2>
          <p style={{ color: C.muted, fontSize: '14px' }}>
            Comparteix aquest enllaç amb els hostes.
          </p>
        </div>

        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <p style={{ color: C.muted, fontSize: '12px', marginBottom: '8px', fontWeight: 500 }}>Enllaç de check-in</p>
          <p style={{ fontSize: '14px', wordBreak: 'break-all', marginBottom: '14px', color: C.accent, lineHeight: 1.5 }}>
            https://{urlReserva}
          </p>
          <button onClick={() => copiar(urlReserva)} style={{ ...btnSecondary, fontSize: '14px', padding: '10px' }}>
            {copiat ? '✓ Copiat!' : '⎘ Copiar enllaç'}
          </button>
        </div>

        <button
          style={btnPrimary}
          onClick={() => { setHostIndex(0); setFormHoste(emptyFormHoste); setErrors({}); setVista('formulari-hoste'); }}
        >
          Continuar al formulari →
        </button>
      </div>
    );
  }

  // ── Vista: Formulari d'hoste ───────────────────────────────────────────────

  if (vista === 'formulari-hoste') {
    const hostNum = hostIndex + 1;
    const completats = reservaActual?.hostes.length ?? 0;

    return (
      <div style={page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ ...displayFont, fontWeight: 700, fontSize: '15px' }}>
            Hoste {hostNum} de {totalHostes}
          </span>
          <span style={{ color: C.accent, fontSize: '13px', fontWeight: 600 }}>
            {completats}/{totalHostes} completats
          </span>
        </div>
        <div style={{ marginBottom: '28px' }}>
          <ProgressBar value={completats} total={totalHostes} />
        </div>

        <h2 style={{ ...displayFont, fontWeight: 700, fontSize: '22px', marginBottom: '24px', letterSpacing: '-0.03em' }}>
          Dades de l&apos;hoste
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Nom i cognoms" error={errors.nomCognoms}>
            <input
              style={{ ...inputStyle, borderColor: errors.nomCognoms ? '#e05' : C.border }}
              placeholder="Maria García Puig"
              value={formHoste.nomCognoms}
              onChange={e => setFormHoste(f => ({ ...f, nomCognoms: e.target.value }))}
            />
          </Field>

          <Field label="És menor de 18 anys?">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={formHoste.esMenor ? 'si' : 'no'}
              onChange={e => setFormHoste(f => ({ ...f, esMenor: e.target.value === 'si' }))}
            >
              <option value="no">No (adult)</option>
              <option value="si">Sí (menor d&apos;edat)</option>
            </select>
          </Field>

          {formHoste.esMenor && (
            <div style={{ backgroundColor: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ color: C.accent, fontSize: '13px', lineHeight: 1.5 }}>
                ℹ Els menors no necessiten documentació.
              </p>
            </div>
          )}

          <Field label="Data de naixement" error={errors.dataNaixement}>
            <input
              type="date"
              style={{ ...inputStyle, borderColor: errors.dataNaixement ? '#e05' : C.border, colorScheme: 'dark' }}
              value={formHoste.dataNaixement}
              onChange={e => setFormHoste(f => ({ ...f, dataNaixement: e.target.value }))}
            />
          </Field>

          {!formHoste.esMenor && (
            <>
              <Field label="Tipus de document">
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={formHoste.tipusDocument}
                  onChange={e => setFormHoste(f => ({ ...f, tipusDocument: e.target.value as TipusDoc }))}
                >
                  <option value="DNI">DNI</option>
                  <option value="NIE">NIE</option>
                  <option value="Passaport">Passaport</option>
                </select>
              </Field>

              <Field label="Número de document" error={errors.numDocument}>
                <input
                  style={{ ...inputStyle, borderColor: errors.numDocument ? '#e05' : C.border }}
                  placeholder="12345678A"
                  value={formHoste.numDocument}
                  onChange={e => setFormHoste(f => ({ ...f, numDocument: e.target.value.toUpperCase() }))}
                />
              </Field>

              <Field label="Nacionalitat" error={errors.nacionalitat}>
                <input
                  style={{ ...inputStyle, borderColor: errors.nacionalitat ? '#e05' : C.border }}
                  placeholder="Espanyola"
                  value={formHoste.nacionalitat}
                  onChange={e => setFormHoste(f => ({ ...f, nacionalitat: e.target.value }))}
                />
              </Field>

              <Field label="Telèfon" error={errors.telefon}>
                <input
                  type="tel"
                  style={{ ...inputStyle, borderColor: errors.telefon ? '#e05' : C.border }}
                  placeholder="+34 612 345 678"
                  value={formHoste.telefon}
                  onChange={e => setFormHoste(f => ({ ...f, telefon: e.target.value }))}
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  style={{ ...inputStyle, borderColor: errors.email ? '#e05' : C.border }}
                  placeholder="maria@exemple.com"
                  value={formHoste.email}
                  onChange={e => setFormHoste(f => ({ ...f, email: e.target.value }))}
                />
              </Field>
            </>
          )}

          <button style={{ ...btnPrimary, marginTop: '8px' }} onClick={guardarHoste}>
            {hostIndex + 1 < totalHostes
              ? `Desar i continuar amb l'hoste ${hostIndex + 2} →`
              : 'Finalitzar check-in →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Vista: Descàrrega ─────────────────────────────────────────────────────

  if (!reservaActual) return null;
  const totFinal = reservaActual.adults + reservaActual.menors;
  const complet = reservaActual.hostes.length >= totFinal;

  return (
    <div style={page}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '60px', height: '60px',
          backgroundColor: complet ? C.accentBg : '#ff990018',
          border: `1px solid ${complet ? C.accentBorder : '#ff990035'}`,
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 18px', fontSize: '26px',
        }}>
          {complet ? '✓' : '⏳'}
        </div>
        <h2 style={{ ...displayFont, fontWeight: 700, fontSize: '24px', marginBottom: '8px', letterSpacing: '-0.03em' }}>
          {complet ? 'Check-in complet!' : `Check-in en progrés`}
        </h2>
        <p style={{ color: complet ? C.accent : C.muted, fontSize: '14px' }}>
          {complet
            ? 'Tots els hostes han completat el registre.'
            : `${reservaActual.hostes.length} de ${totFinal} hostes registrats.`}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {reservaActual.hostes.map((h, i) => (
          <div key={i} style={{
            backgroundColor: C.surface, border: `1px solid ${C.border}`,
            borderRadius: '10px', padding: '14px 16px', marginBottom: '8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: '15px', marginBottom: '3px' }}>{h.nomCognoms}</p>
              <p style={{ color: C.muted, fontSize: '12px' }}>
                {h.esMenor ? "Menor d'edat" : `${h.tipusDocument} · ${h.numDocument}`}
              </p>
            </div>
            <span style={{ color: C.accent, fontSize: '20px', marginLeft: '12px' }}>✓</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button style={btnPrimary} onClick={() => descarregarFitxer(reservaActual)}>
          ↓ Descarregar fitxer
        </button>
        <button
          style={btnSecondary}
          onClick={() => window.open('https://registreviatgers.mossos.gencat.cat', '_blank', 'noopener,noreferrer')}
        >
          ⎘ Obrir portal dels Mossos d&apos;Esquadra
        </button>
        <button style={{ ...btnSecondary, marginTop: '4px', color: C.muted, borderColor: 'transparent' }} onClick={() => setVista('propietari')}>
          ← Tornar al panel
        </button>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ color: '#ff4466', fontSize: '12px', marginTop: '5px' }}>{error}</p>}
    </div>
  );
}
