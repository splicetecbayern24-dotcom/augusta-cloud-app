"use client";

import { useMemo, useState } from "react";

type InvoiceItem = {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
};

type Invoice = {
  id: string;
  customer: string;
  project: string;
  recipientEmail: string;
  vatRate: number;
  note: string;
  status: "Offen" | "Bereit" | "Bezahlt";
  items: InvoiceItem[];
};

const seedInvoices: Invoice[] = [
  {
    id: "2026-002",
    customer: "Musterbau GmbH",
    project: "Gerüstbau Einfamilienhaus",
    recipientEmail: "kunde@musterbau.de",
    vatRate: 19,
    note: "Zufahrt ab 7:00 Uhr frei halten.",
    status: "Offen",
    items: [{ description: "Gerüstaufbau", qty: 1, unit: "pauschal", unitPrice: 1200 }],
  },
  {
    id: "2026-001",
    customer: "Wohnbau Augsburg",
    project: "Neubau Augsburg",
    recipientEmail: "info@wohnbau.de",
    vatRate: 19,
    note: "",
    status: "Bereit",
    items: [{ description: "Gerüstaufbau", qty: 1, unit: "pauschal", unitPrice: 1295 }],
  },
];

const customers = [
  { company: "Musterbau GmbH", contact: "Max Muster", city: "Augsburg" },
  { company: "Wohnbau Augsburg", contact: "Büro", city: "Augsburg" },
  { company: "Schmid Immobilien", contact: "Herr Schmid", city: "München" },
];

export function Dashboard() {
  const [section, setSection] = useState("Rechnungen");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [selectedId, setSelectedId] = useState(seedInvoices[0].id);

  const selected = invoices.find((x) => x.id === selectedId) || invoices[0];

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return invoices;
    return invoices.filter((x) =>
      [x.id, x.customer, x.project, x.status].some((v) => v.toLowerCase().includes(t))
    );
  }, [search, invoices]);

  function net(inv: Invoice) {
    return inv.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  }

  function vat(inv: Invoice) {
    return net(inv) * (inv.vatRate / 100);
  }

  function gross(inv: Invoice) {
    return net(inv) + vat(inv);
  }

  const totals = useMemo(() => {
    const revenue = invoices.reduce((sum, inv) => sum + gross(inv), 0);
    const open = invoices.filter((inv) => inv.status === "Offen").reduce((sum, inv) => sum + gross(inv), 0);
    return {
      revenue,
      open,
      customers: customers.length,
      invoices: invoices.length,
    };
  }, [invoices]);

  function updateInvoice(patch: Partial<Invoice>) {
    setInvoices((prev) => prev.map((inv) => (inv.id === selectedId ? { ...inv, ...patch } : inv)));
  }

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id !== selectedId
          ? inv
          : { ...inv, items: inv.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) }
      )
    );
  }

  function addPosition() {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id !== selectedId
          ? inv
          : { ...inv, items: [...inv.items, { description: "", qty: 1, unit: "pauschal", unitPrice: 0 }] }
      )
    );
  }

  function removePosition(index: number) {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id !== selectedId
          ? inv
          : { ...inv, items: inv.items.length === 1 ? inv.items : inv.items.filter((_, i) => i !== index) }
      )
    );
  }

  function createInvoice() {
    const id = `2026-${String(invoices.length + 1).padStart(3, "0")}`;
    const fresh: Invoice = {
      id,
      customer: "Neuer Kunde",
      project: "",
      recipientEmail: "",
      vatRate: 19,
      note: "",
      status: "Offen",
      items: [{ description: "", qty: 1, unit: "pauschal", unitPrice: 0 }],
    };
    setInvoices((prev) => [fresh, ...prev]);
    setSelectedId(id);
  }

  const menu = ["Dashboard", "Rechnungen", "Kunden", "Leistungen", "Projekte", "Mitarbeiter", "Einstellungen"];

  return (
    <main style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />
      <div style={styles.app}>
        <aside style={styles.sidebar}>
          <div style={styles.logoWrap}>
            <div style={styles.logoMark}>A</div>
            <div>
              <div style={styles.logoTop}>AUGUSTA</div>
              <div style={styles.logoBottom}>GERÜSTBAU UG</div>
            </div>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.profileSmall}>Eingeloggt als</div>
            <div style={styles.profileName}>Kürşat Turaner</div>
            <div style={styles.profileRole}>Geschäftsführung</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {menu.map((item) => (
              <button
                key={item}
                onClick={() => setSection(item)}
                style={{ ...styles.navButton, ...(section === item ? styles.navButtonActive : {}) }}
              >
                {item}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
            <button style={styles.navButton}>Demo zurücksetzen</button>
            <button style={styles.navButton}>Logout</button>
          </div>
        </aside>

        <section style={styles.main}>
          <div style={styles.topStats}>
            <StatCard title="Umsatz" value={money(totals.revenue)} hint="Gesamt" />
            <StatCard title="Offen" value={money(totals.open)} hint="Nicht bezahlt" />
            <StatCard title="Rechnungen" value={String(totals.invoices)} hint="Im System" />
            <StatCard title="Kunden" value={String(totals.customers)} hint="Aktiv" />
          </div>

          <div style={styles.workspace}>
            <section style={styles.listPanel}>
              <div style={styles.panelHeader}>
                <div>
                  <h1 style={styles.h1}>Rechnungen</h1>
                  <div style={styles.sub}>Suchen, anlegen und bearbeiten</div>
                </div>

                <div style={styles.panelActions}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechnung suchen"
                    style={styles.search}
                  />
                  <button onClick={createInvoice} style={styles.primaryBtn}>
                    Neue Rechnung
                  </button>
                </div>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nr.</th>
                      <th style={styles.th}>Kunde</th>
                      <th style={styles.th}>Projekt</th>
                      <th style={styles.th}>Brutto</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => (
                      <tr key={inv.id} onClick={() => setSelectedId(inv.id)} style={{ ...styles.row, ...(selectedId === inv.id ? styles.rowActive : {}) }}>
                        <td style={styles.td}>{inv.id}</td>
                        <td style={styles.td}>{inv.customer}</td>
                        <td style={styles.td}>{inv.project}</td>
                        <td style={styles.td}>{money(gross(inv))}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={badgeStyle(inv.status)}>{inv.status}</span>
                            <span style={styles.badgeSoft}>{inv.status === "Bereit" ? "Workflow aktiv" : "Bearbeitbar"}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={styles.editPanel}>
              <div style={styles.editHeader}>
                <div>
                  <h2 style={styles.h2}>Rechnung {selected.id}</h2>
                  <div style={styles.sub}>Direkt in der App bearbeitbar</div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={styles.primaryBtnSmall}>Bearbeiten</button>
                  <button style={styles.secondaryBtn}>Workflow</button>
                  <button style={styles.secondaryBtn}>Vorschau</button>
                </div>
              </div>

              <div style={styles.formGrid}>
                <Field label="Kunde" value={selected.customer} onChange={(v) => updateInvoice({ customer: v })} />
                <Field label="Projekt" value={selected.project} onChange={(v) => updateInvoice({ project: v })} />
                <Field label="Kunden-E-Mail" value={selected.recipientEmail} onChange={(v) => updateInvoice({ recipientEmail: v })} />
                <Field label="MwSt. %" value={String(selected.vatRate)} onChange={(v) => updateInvoice({ vatRate: Number(v || 0) })} />
              </div>

              <div style={styles.positionsHead}>
                <div>
                  <div style={styles.positionsTitle}>Positionen</div>
                  <div style={styles.sub}>Beschreibung, Menge, Einheit und Preis</div>
                </div>
                <button style={styles.secondaryBtn} onClick={addPosition}>Position hinzufügen</button>
              </div>

              <div style={styles.positionBox}>
                {selected.items.map((item, index) => (
                  <div key={index} style={styles.positionGrid}>
                    <Field label="Beschreibung" value={item.description} onChange={(v) => updateItem(index, { description: v })} />
                    <Field label="Menge" value={String(item.qty)} onChange={(v) => updateItem(index, { qty: Number(v || 0) })} />
                    <Field label="Einheit" value={item.unit} onChange={(v) => updateItem(index, { unit: v })} />
                    <Field label="Preis" value={String(item.unitPrice)} onChange={(v) => updateItem(index, { unitPrice: Number(v || 0) })} />
                    <div>
                      <label style={styles.label}>Zeile</label>
                      <div style={styles.lineValue}>{money(item.qty * item.unitPrice)}</div>
                    </div>
                    <div style={{ alignSelf: "end" }}>
                      <button style={styles.removeBtn} onClick={() => removePosition(index)}>Entfernen</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={styles.label}>Notiz</label>
                <textarea value={selected.note} onChange={(e) => updateInvoice({ note: e.target.value })} style={styles.textarea} />
              </div>

              <div style={styles.totalGrid}>
                <TotalBox label="Netto" value={money(net(selected))} />
                <TotalBox label="MwSt." value={money(vat(selected))} />
                <TotalBox label="Brutto" value={money(gross(selected))} highlight />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} />
    </div>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statHint}>{hint}</div>
    </div>
  );
}

function TotalBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ ...styles.totalBox, ...(highlight ? styles.totalHighlight : {}) }}>
      <div style={styles.totalLabel}>{label}</div>
      <div style={styles.totalValue}>{value}</div>
    </div>
  );
}

function money(v: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);
}

function badgeStyle(status: string): React.CSSProperties {
  if (status === "Offen") return styles.badgeWarn;
  if (status === "Bereit") return styles.badgeGreen;
  return styles.badgeBlue;
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg,#050b14,#081222 45%,#0a1527)", color: "#f7fbff", padding: 16, position: "relative", overflow: "hidden" },
  glowA: { position: "absolute", width: 420, height: 420, right: -120, top: -120, background: "radial-gradient(circle, rgba(255,191,0,.14), transparent 60%)", pointerEvents: "none" },
  glowB: { position: "absolute", width: 600, height: 500, left: 260, bottom: -160, background: "radial-gradient(circle, rgba(19,73,170,.2), transparent 65%)", pointerEvents: "none" },
  app: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, minHeight: "calc(100vh - 32px)" },
  sidebar: { borderRadius: 30, padding: 16, display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg, rgba(8,17,34,.95), rgba(6,12,24,.98))", boxShadow: "0 25px 70px rgba(0,0,0,.35)" },
  logoWrap: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  logoMark: { width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg,#ffcf3c,#f3b300)", color: "#111", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 28 },
  logoTop: { fontSize: 22, fontWeight: 900, letterSpacing: ".18em" },
  logoBottom: { color: "#94a8c9", letterSpacing: ".22em", fontSize: 14 },
  profileCard: { borderRadius: 22, padding: 16, background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.07)", marginBottom: 18 },
  profileSmall: { color: "#94a8c9", fontSize: 13, marginBottom: 8 },
  profileName: { fontSize: 30, fontWeight: 900, lineHeight: 1.05 },
  profileRole: { color: "#9db0cf", marginTop: 6, fontSize: 15 },
  navButton: { width: "100%", border: "none", borderRadius: 18, textAlign: "left", padding: "15px 18px", background: "linear-gradient(90deg, rgba(255,255,255,.045), rgba(255,255,255,.02))", color: "#eef5ff", cursor: "pointer", fontSize: 16 },
  navButtonActive: { background: "linear-gradient(90deg,#ffcf3c,#f3b300)", color: "#111", fontWeight: 800 },
  main: { borderRadius: 30, padding: 16, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg, rgba(9,19,37,.95), rgba(7,13,25,.98))", boxShadow: "0 25px 70px rgba(0,0,0,.35)" },
  topStats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 },
  statCard: { borderRadius: 20, padding: 16, border: "1px solid rgba(255,255,255,.06)", background: "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))" },
  statTitle: { color: "#98a9c7", fontSize: 13 }, statValue: { fontSize: 28, fontWeight: 900, marginTop: 8 }, statHint: { color: "#8799b5", fontSize: 12, marginTop: 4 },
  workspace: { display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 16 },
  listPanel: { borderRadius: 28, padding: 18, border: "1px solid rgba(255,255,255,.06)", background: "linear-gradient(180deg, rgba(10,24,48,.72), rgba(5,14,30,.5))" },
  editPanel: { borderRadius: 28, padding: 18, border: "1px solid rgba(255,255,255,.06)", background: "linear-gradient(180deg, rgba(10,24,48,.78), rgba(5,14,30,.56))" },
  panelHeader: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 },
  panelActions: { display: "flex", gap: 12, minWidth: 390 },
  h1: { margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }, h2: { margin: 0, fontSize: 30, fontWeight: 900 }, sub: { color: "#93a6c5", fontSize: 14, marginTop: 6 },
  search: { flex: 1, height: 50, borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "rgba(3,10,21,.64)", color: "#f2f7ff", padding: "0 16px", fontSize: 16, outline: "none" },
  primaryBtn: { height: 50, border: "none", borderRadius: 18, padding: "0 20px", background: "linear-gradient(135deg,#ffcf3c,#f3b300)", color: "#151515", fontWeight: 800, cursor: "pointer", fontSize: 16 },
  primaryBtnSmall: { height: 46, border: "none", borderRadius: 16, padding: "0 18px", background: "linear-gradient(135deg,#ffcf3c,#f3b300)", color: "#151515", fontWeight: 800, cursor: "pointer", fontSize: 15 },
  secondaryBtn: { height: 46, borderRadius: 16, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.04)", color: "#eef5ff", padding: "0 16px", cursor: "pointer", fontSize: 15 },
  tableWrap: { overflow: "hidden", borderRadius: 24, border: "1px solid rgba(255,255,255,.07)", background: "rgba(10,18,36,.55)" },
  table: { width: "100%", borderCollapse: "collapse" }, th: { textAlign: "left", padding: "16px 14px", color: "#93a6c5", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,.06)" },
  td: { padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 15 }, row: { cursor: "pointer" }, rowActive: { background: "rgba(255,255,255,.03)" },
  editHeader: { display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, alignItems: "flex-start" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 },
  label: { display: "block", marginBottom: 8, color: "#9aaecd", fontSize: 14 },
  input: { width: "100%", height: 52, borderRadius: 18, border: "1px solid rgba(255,255,255,.07)", background: "rgba(5,14,28,.7)", color: "#f4f8ff", padding: "0 16px", fontSize: 16, outline: "none" },
  positionsHead: { display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 14, alignItems: "center" }, positionsTitle: { fontSize: 24, fontWeight: 900 },
  positionBox: { borderRadius: 22, padding: 16, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.03)" },
  positionGrid: { display: "grid", gridTemplateColumns: "2fr .7fr .8fr .9fr 1fr auto", gap: 12, alignItems: "end" },
  lineValue: { height: 52, display: "flex", alignItems: "center", fontWeight: 900, fontSize: 22 },
  removeBtn: { height: 52, borderRadius: 16, border: "1px solid rgba(255,130,130,.18)", background: "rgba(114,39,55,.46)", color: "#ffc9c9", padding: "0 16px", cursor: "pointer", fontSize: 15 },
  textarea: { width: "100%", minHeight: 96, borderRadius: 20, border: "1px solid rgba(255,255,255,.07)", background: "rgba(5,14,28,.7)", color: "#f4f8ff", padding: 16, outline: "none", resize: "vertical", fontSize: 16 },
  totalGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 },
  totalBox: { borderRadius: 24, padding: 18, border: "1px solid rgba(255,255,255,.06)", background: "rgba(5,14,28,.72)" },
  totalHighlight: { background: "linear-gradient(135deg, rgba(255,195,35,.09), rgba(255,195,35,.15))" },
  totalLabel: { color: "#9aaecd", fontSize: 14, marginBottom: 10 }, totalValue: { fontSize: 28, fontWeight: 900 },
  badgeWarn: { display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "rgba(255,194,87,.15)", color: "#ffd881", fontWeight: 800, fontSize: 13 },
  badgeGreen: { display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "rgba(58,214,151,.14)", color: "#91f0cb", fontWeight: 800, fontSize: 13 },
  badgeBlue: { display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "rgba(105,164,255,.14)", color: "#b5d3ff", fontWeight: 800, fontSize: 13 },
  badgeSoft: { display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,.06)", color: "#b3c2db", fontWeight: 800, fontSize: 13 },
};
