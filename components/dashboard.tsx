"use client";

import { useMemo, useState } from "react";

type Item = {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
};

export function Dashboard() {
  const [customer, setCustomer] = useState("");
  const [project, setProject] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [vatRate, setVatRate] = useState(19);
  const [invoiceId, setInvoiceId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([
    { description: "", qty: 1, unit: "pauschal", unitPrice: 0 },
  ]);

  const net = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
    [items]
  );
  const vat = useMemo(() => net * (vatRate / 100), [net, vatRate]);
  const gross = useMemo(() => net + vat, [net, vat]);

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", qty: 1, unit: "pauschal", unitPrice: 0 }]);
  }

  async function saveInvoice() {
    const response = await fetch("/api/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, project, recipientEmail, vatRate, net, vat, gross, items }),
    });
    const json = await response.json();
    setResult(json);
    if (json.invoiceId) setInvoiceId(json.invoiceId);
  }

  async function sendInvoice() {
    if (!invoiceId) return;
    const response = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    const json = await response.json();
    setResult((prev: any) => ({ ...prev, sendResult: json }));
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 18 }}>
        <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "rgba(243,179,0,.14)", color: "#ffd66d", fontWeight: 700, fontSize: 12 }}>
          AUGUSTA Cloud V4
        </div>
        <h1 style={{ margin: "14px 0 8px 0", fontSize: 38 }}>AUGUSTA Gerüstbau UG</h1>
        <p style={{ margin: 0, color: "#97a6bb" }}>
          Dashboard, Rechnungserstellung, PDF-Upload und Mailversand.
        </p>
      </header>

      <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
        <StatCard title="Status" value="Backend bereit" hint="Next.js + Supabase" />
        <StatCard title="PDF" value="Aktiv" hint="Server erzeugt PDF" />
        <StatCard title="Mail" value="Aktiv" hint="Resend Versand" />
        <StatCard title="Version" value="V4" hint="Firmen-Basis" />
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Neue Rechnung</h2>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Kunde" style={field} />
          <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Projekt" style={field} />
          <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Kunden-E-Mail" style={field} />
          <input type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value || 0))} placeholder="MwSt." style={field} />
        </div>

        <div style={{ height: 16 }} />

        {items.map((item, index) => (
          <div key={index} style={{ display: "grid", gap: 12, gridTemplateColumns: "1.6fr .5fr .6fr .7fr", marginBottom: 12 }}>
            <input value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} placeholder="Beschreibung" style={field} />
            <input type="number" value={item.qty} onChange={(e) => updateItem(index, { qty: Number(e.target.value || 0) })} placeholder="Menge" style={field} />
            <input value={item.unit} onChange={(e) => updateItem(index, { unit: e.target.value })} placeholder="Einheit" style={field} />
            <input type="number" value={item.unitPrice} onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value || 0) })} placeholder="Preis" style={field} />
          </div>
        ))}

        <button onClick={addItem} style={btnSecondary}>Position hinzufügen</button>

        <div style={{ height: 16 }} />
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Box label="Netto" value={`${net.toFixed(2)} €`} />
          <Box label="MwSt." value={`${vat.toFixed(2)} €`} />
          <Box label="Brutto" value={`${gross.toFixed(2)} €`} />
        </div>

        <div style={{ height: 16 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={saveInvoice} style={btnPrimary}>Rechnung speichern</button>
          <button onClick={sendInvoice} style={btnSecondary}>Rechnung versenden</button>
        </div>

        {result && (
          <pre style={{ marginTop: 18, whiteSpace: "pre-wrap", background: "#111827", padding: 16, borderRadius: 16, overflow: "auto" }}>
{JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={{ color: "#97a6bb", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
      <div style={{ color: "#97a6bb", fontSize: 12, marginTop: 4 }}>{hint}</div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div style={box}>
      <div style={{ color: "#97a6bb", fontSize: 13 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 22, marginTop: 6 }}>{value}</div>
    </div>
  );
}

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.08)",
  background: "#111827",
  color: "#fff",
};

const card: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 24,
  padding: 20,
  background: "linear-gradient(180deg, rgba(18,26,43,.96), rgba(14,21,35,.96))",
};

const box: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 16,
  padding: 14,
  background: "rgba(255,255,255,.03)",
};

const btnPrimary: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "#f3b300",
  color: "#111",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.08)",
  background: "#111827",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
