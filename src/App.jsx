import { useState, useEffect, useMemo } from "react";

const CUENTAS = ["CHIVASTV", "Estadio AKRON", "Chivas Femenil", "Tapatío", "Chivas en Inglés", "Rebaño Chivas", "Chivas Esports"];
const CMS = ["Rodrigo (Yo)", "Romo", "Axel", "Alondra", "Santiago", "Damián"];
const CM_INFO = {
  "Rodrigo (Yo)": { cuentas: "CHIVASTV · Estadio AKRON", rol: "CM" },
  "Romo":         { cuentas: "Varonil", rol: "CM" },
  "Axel":         { cuentas: "Femenil", rol: "CM" },
  "Alondra":      { cuentas: "Comunidades (WA · TG · Discord)", rol: "CM" },
  "Santiago":     { cuentas: "Chivas Esports", rol: "CM" },
  "Damián":       { cuentas: "Chivas en Inglés · Tapatío", rol: "CM" },
};
const TIPOS = ["Post estático", "Story", "Reel", "Video", "Hilo en X", "Carrusel", "Live", "Post + Story"];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const ESTATUS = ["⏳ Pendiente", "✅ Publicado", "❌ Sin material", "🔄 En proceso"];
const ESTATUS_PROD = ["⏳ Por grabar/producir", "🎬 En producción", "🔍 En revisión/autorización", "✅ Autorizado", "❌ Rechazado"];

const COLORES_CUENTA = {
  "CHIVASTV":        { bg: "#1a0a0a", accent: "#BD0000", light: "#2d0f0f" },
  "Estadio AKRON":   { bg: "#0a0f1a", accent: "#0056A6", light: "#0f1a2d" },
  "Chivas Femenil":  { bg: "#1a0a14", accent: "#C41E8A", light: "#2d0f20" },
  "Tapatío":         { bg: "#0d0a1a", accent: "#6B21A8", light: "#1a0f2d" },
  "Chivas en Inglés":{ bg: "#0a1a12", accent: "#047857", light: "#0f2d1a" },
  "Rebaño Chivas":   { bg: "#1a150a", accent: "#B45309", light: "#2d200f" },
  "Chivas Esports":  { bg: "#0a0d1a", accent: "#4F46E5", light: "#0f122d" },
};

const STORAGE_KEY = "chivas-compromisos-v3";
const RECURRENCIAS = ["Una vez", "Semanal", "Diario", "Personalizado"];
const DIAS_CORTO = { "Lunes": "L", "Martes": "Ma", "Miércoles": "Mi", "Jueves": "J", "Viernes": "V", "Sábado": "S", "Domingo": "D" };
function recurrenciaLabel(c) {
  if (!c.recurrencia || c.recurrencia === "Una vez") return null;
  if (c.recurrencia === "Diario") return "🔁 Diario";
  if (c.recurrencia === "Semanal") return `🔁 Cada ${c.dia}`;
  if (c.recurrencia === "Personalizado" && c.diasPersonalizados?.length)
    return `🔁 ${c.diasPersonalizados.map(d => DIAS_CORTO[d] || d).join(" · ")}`;
  return null;
}

const emptyForm = {
  cuenta: "", dia: "", hora: "10:00", tipo: "", patrocinador: "",
  cm: "", link: "", notas: "", estatus: "⏳ Pendiente",
  recurrencia: "Una vez", diasPersonalizados: [],
  // Producción previa
  requiereProduccion: false,
  cmProduccion: "",
  fechaEntregaProduccion: "",
  clienteAutoriza: "",
  fechaPublicacion: "",
  estatusProduccion: "⏳ Por grabar/producir",
  notasProduccion: "",
};

function getWeekLabel() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  return `Semana ${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

// ─── CAMBIA ESTA CONTRASEÑA ANTES DE SUBIR A GITHUB ───────────────────────
const PASSWORD = "C0m3rC1alChiIIvas.2026";
// ──────────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (input === PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      setInput("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ width: 340, animation: shake ? "shake 0.4s ease" : "none" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#BD0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>⚽</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.3px" }}>Compromisos Comerciales</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Acceso restringido al equipo de CMs</div>
        </div>
        <div style={{ background: "#111", border: `1px solid ${error ? "#7f1d1d" : "#1e1e1e"}`, borderRadius: 14, padding: 24, transition: "border 0.2s" }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Contraseña</div>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="••••••••••••"
            autoFocus
            style={{ width: "100%", background: "#0a0a0a", border: `1px solid ${error ? "#BD0000" : "#2a2a2a"}`, color: "#fff", borderRadius: 8, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", marginBottom: 12, outline: "none" }}
          />
          {error && <div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 12, textAlign: "center" }}>Contraseña incorrecta</div>}
          <button onClick={attempt} style={{ width: "100%", background: "#BD0000", border: "none", color: "#fff", borderRadius: 8, padding: "13px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.2px" }}>
            Entrar
          </button>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("cc-auth") === "1");
  const [compromisos, setCompromisos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState("tabla"); // tabla | form | resumen
  const [filtros, setFiltros] = useState({ cuenta: "", cm: "", estatus: "" });
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [telegramInfo, setTelegramInfo] = useState({ token: "", chatId: "", threadId: "" });
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompromisos(JSON.parse(saved));
      const tg = localStorage.getItem("chivas-telegram");
      if (tg) setTelegramInfo(JSON.parse(tg));
    } catch {}
  }, []);

  const save = (data) => {
    setCompromisos(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sendTelegram = async (msg) => {
    if (!telegramInfo.token || !telegramInfo.chatId) return;
    try {
      const payload = { chat_id: telegramInfo.chatId, text: msg, parse_mode: "HTML" };
      if (telegramInfo.threadId) payload.message_thread_id = parseInt(telegramInfo.threadId);
      await fetch(`https://api.telegram.org/bot${telegramInfo.token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  const handleSubmit = () => {
    if (!form.cuenta || !form.dia || !form.tipo || !form.cm) {
      showToast("Completa los campos obligatorios", "error");
      return;
    }
    let newData;
    if (editId !== null) {
      newData = compromisos.map(c => c.id === editId ? { ...form, id: editId } : c);
      showToast("Compromiso actualizado ✓");
    } else {
      const nuevo = { ...form, id: Date.now() };
      newData = [...compromisos, nuevo];
      const prodLine = form.requiereProduccion
        ? `\n\n🎬 <b>Producción previa requerida</b>\n👷 CM produce: ${form.cmProduccion}\n📦 Entregar antes de: ${form.fechaEntregaProduccion}\n✍️ Autoriza: ${form.clienteAutoriza}\n📅 Publicación: ${form.fechaPublicacion}`
        : "";
      const msg = `🔴 <b>Nuevo compromiso comercial</b>\n\n📱 <b>Cuenta:</b> ${form.cuenta}\n📅 <b>Día:</b> ${form.dia} ${form.hora}\n🎯 <b>Tipo:</b> ${form.tipo}\n🏢 <b>Patrocinador:</b> ${form.patrocinador || "—"}\n👤 <b>CM publica:</b> ${form.cm}${prodLine}\n${form.link ? `🔗 Link: ${form.link}\n` : ""}${form.notas ? `📝 Notas: ${form.notas}` : ""}`;
      sendTelegram(msg);
      showToast("Compromiso agregado ✓");
    }
    save(newData);
    setForm(emptyForm);
    setEditId(null);
    setView("tabla");
  };

  const handleEdit = (c) => {
    setForm({ ...c });
    setEditId(c.id);
    setView("form");
  };

  const handleDelete = (id) => {
    save(compromisos.filter(c => c.id !== id));
    setConfirmDelete(null);
    showToast("Eliminado");
  };

  const updateEstatus = (id, estatus) => {
    const newData = compromisos.map(c => c.id === id ? { ...c, estatus } : c);
    save(newData);
    if (estatus === "✅ Publicado") showToast("¡Marcado como publicado!");
  };

  const filtered = useMemo(() => compromisos.filter(c =>
    (!filtros.cuenta || c.cuenta === filtros.cuenta) &&
    (!filtros.cm || c.cm === filtros.cm) &&
    (!filtros.estatus || c.estatus === filtros.estatus)
  ), [compromisos, filtros]);

  const pendientes = compromisos.filter(c => c.estatus === "⏳ Pendiente");

  const exportCSV = () => {
    const header = ["Cuenta","Día","Hora","Tipo","Patrocinador","CM","Link","Notas","Estatus"];
    const rows = compromisos.map(c =>
      [c.cuenta,c.dia,c.hora,c.tipo,c.patrocinador,c.cm,c.link,c.notas,c.estatus]
        .map(v => `"${(v||"").replace(/"/g,'""')}"`).join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    navigator.clipboard.writeText(csv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("CSV copiado — pégalo en Google Sheets ✓");
    });
  };

  const sendWeeklyReminder = () => {
    const lines = compromisos.map(c =>
      `• [${c.dia} ${c.hora}] ${c.cuenta} — ${c.tipo} (${c.cm}) ${c.estatus}`
    ).join("\n");
    const msg = `📋 <b>Compromisos comerciales de la semana</b>\n<i>${getWeekLabel()}</i>\n\n${lines || "Sin compromisos registrados."}`;
    sendTelegram(msg);
    showToast("Resumen enviado a Telegram ✓");
  };

  const resumenCM = useMemo(() => {
    const map = {};
    CMS.forEach(cm => {
      const mine = compromisos.filter(c => c.cm === cm);
      if (mine.length === 0) return;
      map[cm] = {
        total: mine.length,
        publicados: mine.filter(c => c.estatus === "✅ Publicado").length,
        pendientes: mine.filter(c => c.estatus === "⏳ Pendiente").length,
        sinMaterial: mine.filter(c => c.estatus === "❌ Sin material").length,
      };
    });
    return map;
  }, [compromisos]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (!authed) return <LoginScreen onLogin={() => { sessionStorage.setItem("cc-auth", "1"); setAuthed(true); }} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#f0f0f0",
    }}>
      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: toast.type === "error" ? "#7f1d1d" : "#14532d",
          color: "#fff", padding: "10px 18px", borderRadius: 10,
          fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          animation: "fadeIn 0.2s ease",
        }}>{toast.msg}</div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998,
        }}>
          <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 32, maxWidth: 360, textAlign: "center", border: "1px solid #333" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>¿Eliminar compromiso?</div>
            <div style={{ color: "#999", fontSize: 14, marginBottom: 24 }}>Esta acción no se puede deshacer.</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #444", background: "transparent", color: "#ccc", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#BD0000", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM MODAL */}
      {showTelegramModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%", border: "1px solid #333" }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>⚙️ Configurar Telegram</div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Configura el bot para que envíe mensajes a un tema específico de tu grupo de CMs.
            </div>
            {[
              ["Bot Token", "token", "1234567890:AAF..."],
              ["Chat ID del grupo", "chatId", "-100123456789"],
              ["Thread ID del tema (opcional)", "threadId", "Ej. 5 — solo si usas Temas en el grupo"],
            ].map(([label, key, ph]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6 }}>{label}</div>
                <input value={telegramInfo[key] || ""} onChange={e => setTelegramInfo(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={ph} style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ background: "#0f1a0f", border: "1px solid #166534", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#86efac", lineHeight: 1.6 }}>
              💡 Para obtener el Thread ID: crea el tema "Compromisos Comerciales" en tu grupo, manda un mensaje ahí, y revisa <code style={{background:"#0a0a0a", padding:"1px 5px", borderRadius:4}}>api.telegram.org/botTU_TOKEN/getUpdates</code> — busca <code style={{background:"#0a0a0a", padding:"1px 5px", borderRadius:4}}>message_thread_id</code>.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowTelegramModal(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #444", background: "transparent", color: "#ccc", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button onClick={() => { localStorage.setItem("chivas-telegram", JSON.stringify(telegramInfo)); setShowTelegramModal(false); showToast("Telegram configurado ✓"); }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#BD0000", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#BD0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚽</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>Compromisos Comerciales</div>
              <div style={{ fontSize: 11, color: "#666" }}>{getWeekLabel()}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {pendientes.length > 0 && (
              <div style={{ background: "#7f1d1d", color: "#fca5a5", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                {pendientes.length} pendiente{pendientes.length > 1 ? "s" : ""}
              </div>
            )}
            <button onClick={() => setShowTelegramModal(true)} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
              📨 Telegram
            </button>
            <button onClick={sendWeeklyReminder} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
              📢 Enviar resumen
            </button>
            <button onClick={exportCSV} style={{ background: copied ? "#14532d" : "#1a1a1a", border: `1px solid ${copied ? "#166534" : "#333"}`, color: copied ? "#86efac" : "#888", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
              {copied ? "✓ Copiado" : "📋 Copiar CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {[["tabla", "📋 Compromisos"], ["form", editId ? "✏️ Editar" : "➕ Agregar"], ["resumen", "📊 Resumen"]].map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); if (v !== "form") { setForm(emptyForm); setEditId(null); } }}
              style={{ padding: "14px 20px", background: "transparent", border: "none", color: view === v ? "#fff" : "#555", fontWeight: view === v ? 700 : 500, fontSize: 14, cursor: "pointer", borderBottom: view === v ? "2px solid #BD0000" : "2px solid transparent", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>

        {/* TABLA */}
        {view === "tabla" && (
          <div>
            {/* Filtros */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[["cuenta", "Cuenta", ["", ...CUENTAS]], ["cm", "CM", ["", ...CMS]], ["estatus", "Estatus", ["", ...ESTATUS]]].map(([k, label, opts]) => (
                <select key={k} value={filtros[k]} onChange={e => setFiltros(p => ({ ...p, [k]: e.target.value }))}
                  style={{ background: "#111", border: "1px solid #2a2a2a", color: filtros[k] ? "#fff" : "#555", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>
                  <option value="">Filtrar por {label}</option>
                  {opts.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              {(filtros.cuenta || filtros.cm || filtros.estatus) && (
                <button onClick={() => setFiltros({ cuenta: "", cm: "", estatus: "" })}
                  style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>
                  ✕ Limpiar
                </button>
              )}
              <button onClick={() => setView("form")} style={{ marginLeft: "auto", background: "#BD0000", border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Agregar compromiso
              </button>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Sin compromisos registrados</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Agrega el primero con el botón de arriba</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DIAS.map(dia => {
                  const diaCompromisos = filtered.filter(c =>
                    c.dia === dia ||
                    c.recurrencia === "Diario" ||
                    (c.recurrencia === "Personalizado" && c.diasPersonalizados?.includes(dia))
                  );
                  if (diaCompromisos.length === 0) return null;
                  return (
                    <div key={dia}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>{dia}</div>
                      {diaCompromisos.map(c => {
                        const col = COLORES_CUENTA[c.cuenta] || { bg: "#111", accent: "#666", light: "#1a1a1a" };
                        return (
                          <div key={c.id} style={{ background: col.light, border: `1px solid ${col.accent}33`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}>
                            <div style={{ width: 4, height: 48, borderRadius: 4, background: col.accent, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px 16px", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>CUENTA</div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: col.accent }}>{c.cuenta}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>HORA · TIPO</div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.hora} · {c.tipo}</div>
                                {recurrenciaLabel(c) && (
                                  <div style={{ marginTop: 4, fontSize: 11, color: "#93c5fd", fontWeight: 600 }}>{recurrenciaLabel(c)}</div>
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>PATROCINADOR</div>
                                <div style={{ fontSize: 13 }}>{c.patrocinador || <span style={{ color: "#444" }}>—</span>}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>CM</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.cm}</div>
                              </div>
                              {c.notas && (
                                <div style={{ gridColumn: "1/-1" }}>
                                  <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>NOTAS</div>
                                  <div style={{ fontSize: 12, color: "#999" }}>{c.notas}</div>
                                </div>
                              )}
                              {c.link && (
                                <div style={{ gridColumn: "1/-1" }}>
                                  <a href={c.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: col.accent, textDecoration: "none" }}>🔗 Ver recursos</a>
                                </div>
                              )}
                              {c.requiereProduccion && (
                                <div style={{ gridColumn: "1/-1", background: "#1a1200", border: "1px solid #B4530944", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#B45309" }}>🎬 PRODUCCIÓN PREVIA</span>
                                  {c.cmProduccion && <span style={{ fontSize: 11, color: "#999" }}>👷 {c.cmProduccion}</span>}
                                  {c.fechaEntregaProduccion && <span style={{ fontSize: 11, color: "#999" }}>📦 Entrega: {c.fechaEntregaProduccion}</span>}
                                  {c.clienteAutoriza && <span style={{ fontSize: 11, color: "#999" }}>✍️ Autoriza: {c.clienteAutoriza}</span>}
                                  {c.fechaPublicacion && <span style={{ fontSize: 11, color: "#999" }}>📅 Publica: {c.fechaPublicacion}</span>}
                                  {c.estatusProduccion && <span style={{ fontSize: 11, fontWeight: 600, color: "#fcd34d" }}>{c.estatusProduccion}</span>}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                              <select value={c.estatus} onChange={e => updateEstatus(c.id, e.target.value)}
                                style={{ background: "#0a0a0a", border: "1px solid #333", color: c.estatus === "✅ Publicado" ? "#86efac" : c.estatus === "❌ Sin material" ? "#fca5a5" : c.estatus === "🔄 En proceso" ? "#93c5fd" : "#fcd34d", borderRadius: 6, padding: "5px 8px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                                {ESTATUS.map(e => <option key={e} value={e}>{e}</option>)}
                              </select>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => handleEdit(c)} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#aaa", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>✏️</button>
                                <button onClick={() => setConfirmDelete(c.id)} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#aaa", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>🗑️</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FORM */}
        {view === "form" && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>{editId ? "Editar compromiso" : "Nuevo compromiso"}</div>
            <div style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Los campos marcados con * son obligatorios</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["cuenta", "Cuenta *", "select", CUENTAS],
                ["hora", "Hora *", "time"],
                ["tipo", "Tipo de contenido *", "select", TIPOS],
                ["patrocinador", "Patrocinador / Marca", "text", null, "Ej. Telmex, Heineken..."],
                ["cm", "CM Responsable *", "select", CMS],
              ].map(([key, label, type, opts, ph]) => (
                <div key={key}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={form[key]} onChange={e => f(key, e.target.value)}
                      style={{ width: "100%", background: "#111", border: `1px solid ${form[key] ? "#333" : "#222"}`, color: form[key] ? "#fff" : "#444", borderRadius: 8, padding: "11px 12px", fontSize: 14, cursor: "pointer", boxSizing: "border-box" }}>
                      <option value="">Selecciona...</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={form[key]} onChange={e => f(key, e.target.value)} placeholder={ph}
                      style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box" }} />
                  )}
                </div>
              ))}

              {/* RECURRENCIA */}
              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Frecuencia de publicación *</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {RECURRENCIAS.map(r => (
                    <button key={r} onClick={() => f("recurrencia", r)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${form.recurrencia === r ? "#BD0000" : "#222"}`, background: form.recurrencia === r ? "#2d0000" : "#111", color: form.recurrencia === r ? "#fff" : "#666", fontSize: 13, cursor: "pointer", fontWeight: form.recurrencia === r ? 700 : 400, transition: "all 0.15s" }}>
                      {r === "Una vez" ? "1️⃣ Una vez" : r === "Semanal" ? "📅 Semanal" : r === "Diario" ? "🔁 Diario" : "⚙️ Personalizado"}
                    </button>
                  ))}
                </div>

                {/* Una vez o Semanal → selector de día */}
                {(form.recurrencia === "Una vez" || form.recurrencia === "Semanal") && (
                  <div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{form.recurrencia === "Semanal" ? "¿Qué día de la semana?" : "¿Qué día?"}</div>
                    <select value={form.dia} onChange={e => f("dia", e.target.value)}
                      style={{ width: "100%", background: "#111", border: `1px solid ${form.dia ? "#333" : "#222"}`, color: form.dia ? "#fff" : "#444", borderRadius: 8, padding: "11px 12px", fontSize: 14, cursor: "pointer", boxSizing: "border-box" }}>
                      <option value="">Selecciona día...</option>
                      {DIAS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* Personalizado → multi-select de días */}
                {form.recurrencia === "Personalizado" && (
                  <div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Selecciona los días</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {DIAS.map(d => {
                        const sel = form.diasPersonalizados?.includes(d);
                        return (
                          <button key={d} onClick={() => {
                            const curr = form.diasPersonalizados || [];
                            f("diasPersonalizados", sel ? curr.filter(x => x !== d) : [...curr, d]);
                          }}
                            style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${sel ? "#0056A6" : "#222"}`, background: sel ? "#0f1a2d" : "#111", color: sel ? "#93c5fd" : "#666", fontSize: 13, cursor: "pointer", fontWeight: sel ? 700 : 400, transition: "all 0.15s" }}>
                            {DIAS_CORTO[d]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Diario: info */}
                {form.recurrencia === "Diario" && (
                  <div style={{ fontSize: 12, color: "#555", background: "#111", borderRadius: 8, padding: "10px 14px" }}>
                    Se publicará todos los días de la semana (Lunes a Domingo) a las {form.hora}.
                  </div>
                )}
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Link de recursos</div>
                <input value={form.link} onChange={e => f("link", e.target.value)} placeholder="https://drive.google.com/..."
                  style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box" }} />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Notas e instrucciones</div>
                <textarea value={form.notas} onChange={e => f("notas", e.target.value)} placeholder="Instrucciones especiales para el CM..." rows={3}
                  style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Estatus inicial</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ESTATUS.map(e => (
                    <button key={e} onClick={() => f("estatus", e)}
                      style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${form.estatus === e ? "#BD0000" : "#222"}`, background: form.estatus === e ? "#2d0000" : "#111", color: form.estatus === e ? "#fff" : "#666", fontSize: 13, cursor: "pointer", fontWeight: form.estatus === e ? 700 : 400, transition: "all 0.15s" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRODUCCIÓN PREVIA */}
              <div style={{ gridColumn: "1/-1", marginTop: 8 }}>
                <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 20, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>🎬 ¿Requiere producción previa?</div>
                    <button onClick={() => f("requiereProduccion", !form.requiereProduccion)}
                      style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: form.requiereProduccion ? "#BD0000" : "#222", color: form.requiereProduccion ? "#fff" : "#888", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                      {form.requiereProduccion ? "Sí ✓" : "No"}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>Activa esto si se necesita grabar o producir algo antes de poder publicar (ej. saludo de jugador para patrocinador).</div>
                </div>

                {form.requiereProduccion && (
                  <div style={{ background: "#111", border: "1px solid #2a1a00", borderRadius: 12, padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#B45309", fontWeight: 700, marginBottom: -4 }}>⚙️ FLUJO DE PRODUCCIÓN</div>

                    <div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>CM que produce</div>
                      <select value={form.cmProduccion} onChange={e => f("cmProduccion", e.target.value)}
                        style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: form.cmProduccion ? "#fff" : "#444", borderRadius: 8, padding: "11px 12px", fontSize: 14, cursor: "pointer", boxSizing: "border-box" }}>
                        <option value="">Selecciona CM...</option>
                        {CMS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Fecha límite de entrega</div>
                      <input type="date" value={form.fechaEntregaProduccion} onChange={e => f("fechaEntregaProduccion", e.target.value)}
                        style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>¿Quién autoriza? (cliente/marca)</div>
                      <input type="text" value={form.clienteAutoriza} onChange={e => f("clienteAutoriza", e.target.value)} placeholder="Ej. Caliente, Heineken..."
                        style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box" }} />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Fecha de publicación (tras autorización)</div>
                      <input type="date" value={form.fechaPublicacion} onChange={e => f("fechaPublicacion", e.target.value)}
                        style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>

                    <div style={{ gridColumn: "1/-1" }}>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Estatus de producción</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ESTATUS_PROD.map(e => (
                          <button key={e} onClick={() => f("estatusProduccion", e)}
                            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${form.estatusProduccion === e ? "#B45309" : "#222"}`, background: form.estatusProduccion === e ? "#2d1f00" : "#0a0a0a", color: form.estatusProduccion === e ? "#fcd34d" : "#666", fontSize: 12, cursor: "pointer", fontWeight: form.estatusProduccion === e ? 700 : 400, transition: "all 0.15s" }}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ gridColumn: "1/-1" }}>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Notas de producción</div>
                      <textarea value={form.notasProduccion} onChange={e => f("notasProduccion", e.target.value)} placeholder="Detalles del contenido a producir, referencias, etc." rows={2}
                        style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "11px 12px", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button onClick={() => { setView("tabla"); setForm(emptyForm); setEditId(null); }}
                style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: "1px solid #333", background: "transparent", color: "#888", fontSize: 15, cursor: "pointer", fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={handleSubmit}
                style={{ flex: 2, padding: "13px 0", borderRadius: 10, border: "none", background: "#BD0000", color: "#fff", fontSize: 15, cursor: "pointer", fontWeight: 800, letterSpacing: "-0.2px" }}>
                {editId ? "Guardar cambios" : "➕ Agregar compromiso"}
              </button>
            </div>
          </div>
        )}

        {/* RESUMEN */}
        {view === "resumen" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                ["Total", compromisos.length, "#333", "#fff"],
                ["✅ Publicados", compromisos.filter(c => c.estatus === "✅ Publicado").length, "#14532d", "#86efac"],
                ["⏳ Pendientes", pendientes.length, "#713f12", "#fcd34d"],
                ["❌ Sin material", compromisos.filter(c => c.estatus === "❌ Sin material").length, "#7f1d1d", "#fca5a5"],
              ].map(([label, val, bg, color]) => (
                <div key={label} style={{ background: bg, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color }}>{val}</div>
                  <div style={{ fontSize: 12, color, opacity: 0.8, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Por CM */}
              <div style={{ background: "#111", borderRadius: 12, padding: 20, border: "1px solid #1a1a1a" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Por CM</div>
                {Object.entries(resumenCM).length === 0 ? <div style={{ color: "#444", fontSize: 13 }}>Sin datos</div> :
                  Object.entries(resumenCM).map(([cm, d]) => (
                    <div key={cm} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{cm}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{d.publicados}/{d.total}</div>
                      </div>
                      <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${d.total ? (d.publicados / d.total) * 100 : 0}%`, background: "#BD0000", borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#555" }}>
                        <span style={{ color: "#86efac" }}>✅ {d.publicados}</span>
                        <span style={{ color: "#fcd34d" }}>⏳ {d.pendientes}</span>
                        <span style={{ color: "#fca5a5" }}>❌ {d.sinMaterial}</span>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Por Cuenta */}
              <div style={{ background: "#111", borderRadius: 12, padding: 20, border: "1px solid #1a1a1a" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Por Cuenta</div>
                {CUENTAS.map(cuenta => {
                  const mine = compromisos.filter(c => c.cuenta === cuenta);
                  if (mine.length === 0) return null;
                  const col = COLORES_CUENTA[cuenta] || { accent: "#666" };
                  return (
                    <div key={cuenta} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: col.accent }}>{cuenta}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{mine.length} compromisos</div>
                      </div>
                      <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(mine.length / compromisos.length) * 100}%`, background: col.accent, borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pendientes destacados */}
            {pendientes.length > 0 && (
              <div style={{ background: "#1a0f00", border: "1px solid #713f12", borderRadius: 12, padding: 20, marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fcd34d", marginBottom: 12 }}>⚠️ Pendientes esta semana</div>
                {pendientes.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2a1f00" }}>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: COLORES_CUENTA[c.cuenta]?.accent || "#fff" }}>{c.cuenta}</span>
                      <span style={{ color: "#888", margin: "0 8px" }}>·</span>
                      <span>{c.dia} {c.hora}</span>
                      <span style={{ color: "#888", margin: "0 8px" }}>·</span>
                      <span>{c.tipo}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>{c.cm}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        select option { background: #1a1a1a; color: #fff; }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.4; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        button:hover { opacity: 0.85; } select:focus, input:focus, textarea:focus { outline: 1px solid #BD0000; }
      `}</style>
    </div>
  );
}
