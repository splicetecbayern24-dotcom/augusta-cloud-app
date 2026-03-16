"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Customer = {
  id: string;
  company_name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
};

type InvoiceItem = {
  id: string;
  invoice_id: string;
  position_no: number;
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
  line_total: number;
};

type Invoice = {
  id: string;
  invoice_no: string;
  customer_id: string | null;
  project_name?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status: string;
  vat_rate: number;
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  recipient_email?: string | null;
  pdf_path?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

const [newCustomerId, setNewCustomerId] = useState("");
const [newProject, setNewProject] = useState("");
const [newEmail, setNewEmail] = useState("");
const [newVatRate, setNewVatRate] = useState(19);

const [newItems, setNewItems] = useState([
  { description: "", qty: 1, unit: "pauschal", unit_price: 0 }
]);

const [newCustomerCompany, setNewCustomerCompany] = useState("");
const [newCustomerContact, setNewCustomerContact] = useState("");
const [newCustomerEmail, setNewCustomerEmail] = useState("");
const [newCustomerPhone, setNewCustomerPhone] = useState("");
const [newCustomerCity, setNewCustomerCity] = useState("");
const [newCustomerAddress, setNewCustomerAddress] = useState("");
    

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const [customersRes, invoicesRes, itemsRes] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("invoice_items").select("*").order("position_no", { ascending: true }),
    ]);

    if (customersRes.error) {
      setError(customersRes.error.message);
      setLoading(false);
      return;
    }

    if (invoicesRes.error) {
      setError(invoicesRes.error.message);
      setLoading(false);
      return;
    }

    if (itemsRes.error) {
      setError(itemsRes.error.message);
      setLoading(false);
      return;
    }

    const loadedCustomers = (customersRes.data || []) as Customer[];
    const loadedInvoices = (invoicesRes.data || []) as Invoice[];
    const loadedItems = (itemsRes.data || []) as InvoiceItem[];

    setCustomers(loadedCustomers);
    setInvoices(loadedInvoices);
    setItems(loadedItems);

    if (loadedInvoices.length > 0) {
      setSelectedId(loadedInvoices[0].id);
    }

    if (loadedCustomers.length > 0 && !newCustomerId) {
      setNewCustomerId(loadedCustomers[0].id);
      setNewEmail(loadedCustomers[0].email || "");
    }

    setLoading(false);
  }

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter((inv) => {
      const customer = customers.find((c) => c.id === inv.customer_id);
      return [
        inv.invoice_no || "",
        inv.project_name || "",
        inv.status || "",
        customer?.company_name || "",
      ].some((v) => v.toLowerCase().includes(term));
    });
  }, [search, invoices, customers]);

  const selectedInvoice =
    invoices.find((inv) => inv.id === selectedId) || filteredInvoices[0] || null;

  const selectedCustomer = selectedInvoice
    ? customers.find((c) => c.id === selectedInvoice.customer_id) || null
    : null;

  const selectedItems = selectedInvoice
    ? items.filter((item) => item.invoice_id === selectedInvoice.id)
    : [];

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + Number(inv.gross_amount || 0),
    0
  );

  const totalOpen = invoices
    .filter((inv) => String(inv.status).toLowerCase() === "offen")
    .reduce((sum, inv) => sum + Number(inv.gross_amount || 0), 0);

  function newNet() {
    return newItems.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.unit_price || 0),
      0
    );
  }

  function newVatAmount() {
    return newNet() * (Number(newVatRate || 0) / 100);
  }

  function newGross() {
    return newNet() + newVatAmount();
  }

  function updateNewItem(index: number, patch: Partial<(typeof newItems)[0]>) {
    setNewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addNewItem() {
    setNewItems((prev) => [
      ...prev,
      { description: "", qty: 1, unit: "pauschal", unit_price: 0 },
    ]);
  }

  function removeNewItem(index: number) {
    if (newItems.length === 1) return;
    setNewItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveNewInvoice() 
  {
    async function saveCustomer() {
  setError("");
  setSuccess("");

  if (!newCustomerCompany.trim()) {
    setError("Bitte Firmenname für den Kunden eingeben.");
    return;
  }

  const insert = await supabase
    .from("customers")
    .insert({
      company_name: newCustomerCompany,
      contact_name: newCustomerContact || null,
      email: newCustomerEmail || null,
      phone: newCustomerPhone || null,
      city: newCustomerCity || null,
      address: newCustomerAddress || null,
    })
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    setError(insert.error?.message || "Kunde konnte nicht gespeichert werden.");
    return;
  }

  setSuccess("Kunde gespeichert.");
  setCustomers((prev) => [insert.data as Customer, ...prev]);
  setNewCustomerId(insert.data.id);
  setNewEmail(insert.data.email || "");

  setNewCustomerCompany("");
  setNewCustomerContact("");
  setNewCustomerEmail("");
  setNewCustomerPhone("");
  setNewCustomerCity("");
  setNewCustomerAddress("");
}
    async function saveCustomer() {
  setError("");
  setSuccess("");

  if (!newCustomerCompany.trim()) {
    setError("Bitte Firmenname für den Kunden eingeben.");
    return;
  }

  const insert = await supabase
    .from("customers")
    .insert({
      company_name: newCustomerCompany,
      contact_name: newCustomerContact || null,
      email: newCustomerEmail || null,
      phone: newCustomerPhone || null,
      city: newCustomerCity || null,
      address: newCustomerAddress || null,
    })
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    setError(insert.error?.message || "Kunde konnte nicht gespeichert werden.");
    return;
  }

  setSuccess("Kunde gespeichert.");
  setCustomers((prev) => [insert.data as Customer, ...prev]);
  setNewCustomerId(insert.data.id);
  setNewEmail(insert.data.email || "");

  setNewCustomerCompany("");
  setNewCustomerContact("");
  setNewCustomerEmail("");
  setNewCustomerPhone("");
  setNewCustomerCity("");
  setNewCustomerAddress("");
}
    setSaving(true);
    setError("");
    setSuccess("");

    if (!newCustomerId) {
      setError("Bitte Kunde auswählen.");
      setSaving(false);
      return;
    }

    if (!newProject.trim()) {
      setError("Bitte Projekt eingeben.");
      setSaving(false);
      return;
    }

    const validItems = newItems.filter((x) => x.description.trim());
    if (validItems.length === 0) {
      setError("Bitte mindestens eine Position eingeben.");
      setSaving(false);
      return;
    }

    const invoiceNo = `RE-${Date.now()}`;
    const invoiceDate = new Date().toISOString().slice(0, 10);
    const dueDate = invoiceDate;

    const invoiceInsert = await supabase
      .from("invoices")
      .insert({
        invoice_no: invoiceNo,
        customer_id: newCustomerId,
        project_name: newProject,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status: "offen",
        vat_rate: newVatRate,
        net_amount: newNet(),
        vat_amount: newVatAmount(),
        gross_amount: newGross(),
        recipient_email: newEmail || null,
      })
      .select("id")
      .single();

    if (invoiceInsert.error || !invoiceInsert.data) {
      setError(invoiceInsert.error?.message || "Rechnung konnte nicht gespeichert werden.");
      setSaving(false);
      return;
    }

    const invoiceId = invoiceInsert.data.id;

    const itemRows = validItems.map((item, index) => ({
      invoice_id: invoiceId,
      position_no: index + 1,
      description: item.description,
      qty: Number(item.qty || 0),
      unit: item.unit,
      unit_price: Number(item.unit_price || 0),
      line_total: Number(item.qty || 0) * Number(item.unit_price || 0),
    }));

    const itemInsert = await supabase.from("invoice_items").insert(itemRows);

    if (itemInsert.error) {
      setError(itemInsert.error.message);
      setSaving(false);
      return;
    }

    setSuccess("Rechnung gespeichert.");
    setNewProject("");
    setNewEmail("");
    setNewVatRate(19);
    setNewItems([{ description: "", qty: 1, unit: "pauschal", unit_price: 0 }]);

    await loadData();
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>Lade Daten aus Supabase…</div>
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />

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

        <div style={styles.sideCard}>
          <div style={styles.sideLabel}>Kunden</div>
          <div style={styles.sideValue}>{customers.length}</div>
        </div>

        <div style={styles.sideCard}>
          <div style={styles.sideLabel}>Rechnungen</div>
          <div style={styles.sideValue}>{invoices.length}</div>
        </div>

        <div style={styles.sideCard}>
          <div style={styles.sideLabel}>Offen</div>
          <div style={styles.sideValue}>{money(totalOpen)}</div>
        </div>

        <div style={styles.sideCard}>
          <div style={styles.sideLabel}>Umsatz</div>
          <div style={styles.sideValue}>{money(totalRevenue)}</div>
        </div>
      </aside>

      <section style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.title}>Rechnungen</div>
            <div style={styles.sub}>Supabase laden + speichern</div>
          </div>

          <input
            style={styles.search}
            placeholder="Rechnung suchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}
        {success ? <div style={styles.successBox}>{success}</div> : null}

       <div style={styles.grid}>

  <div style={styles.panel}>
  <div style={styles.panelTitle}>Neuen Kunden anlegen</div>

  <div style={styles.formGrid}>
    <div>
      <label style={styles.label}>Firmenname</label>
      <input
        value={newCustomerCompany}
        onChange={(e) => setNewCustomerCompany(e.target.value)}
        style={styles.input}
      />
    </div>

    <div>
      <label style={styles.label}>Ansprechpartner</label>
      <input
        value={newCustomerContact}
        onChange={(e) => setNewCustomerContact(e.target.value)}
        style={styles.input}
      />
    </div>

    <div>
      <label style={styles.label}>E-Mail</label>
      <input
        value={newCustomerEmail}
        onChange={(e) => setNewCustomerEmail(e.target.value)}
        style={styles.input}
      />
    </div>

    <div>
      <label style={styles.label}>Telefon</label>
      <input
        value={newCustomerPhone}
        onChange={(e) => setNewCustomerPhone(e.target.value)}
        style={styles.input}
      />
    </div>

    <div>
      <label style={styles.label}>Ort</label>
      <input
        value={newCustomerCity}
        onChange={(e) => setNewCustomerCity(e.target.value)}
        style={styles.input}
      />
    </div>

    <div>
      <label style={styles.label}>Adresse</label>
      <input
        value={newCustomerAddress}
        onChange={(e) => setNewCustomerAddress(e.target.value)}
        style={styles.input}
      />
    </div>
  </div>

  <div style={{ marginTop: 12 }}>
    <button onClick={saveCustomer} style={styles.primaryBtn}>
      Kunde speichern
    </button>
  </div>
</div>

  <div style={styles.panel}>
    <div style={styles.panelTitle}>Neue Rechnung</div>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Kunde</label>
                <select
                  value={newCustomerId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setNewCustomerId(nextId);
                    const c = customers.find((x) => x.id === nextId);
                    setNewEmail(c?.email || "");
                  }}
                  style={styles.input}
                >
                  <option value="">Kunde wählen</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Projekt</label>
                <input
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Kunden-E-Mail</label>
                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>MwSt. %</label>
                <input
                  value={newVatRate}
                  onChange={(e) => setNewVatRate(Number(e.target.value || 0))}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: 16, fontWeight: 800, fontSize: 18 }}>
              Positionen
            </div>

            {newItems.map((item, index) => (
              <div key={index} style={styles.newItemGrid}>
                <input
                  placeholder="Beschreibung"
                  value={item.description}
                  onChange={(e) =>
                    updateNewItem(index, { description: e.target.value })
                  }
                  style={styles.input}
                />
                <input
                  placeholder="Menge"
                  value={item.qty}
                  onChange={(e) =>
                    updateNewItem(index, { qty: Number(e.target.value || 0) })
                  }
                  style={styles.input}
                />
                <input
                  placeholder="Einheit"
                  value={item.unit}
                  onChange={(e) =>
                    updateNewItem(index, { unit: e.target.value })
                  }
                  style={styles.input}
                />
                <input
                  placeholder="Preis"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateNewItem(index, {
                      unit_price: Number(e.target.value || 0),
                    })
                  }
                  style={styles.input}
                />
                <button
                  onClick={() => removeNewItem(index)}
                  style={styles.removeBtn}
                >
                  Entfernen
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button onClick={addNewItem} style={styles.secondaryBtn}>
                Position hinzufügen
              </button>
              <button onClick={saveNewInvoice} style={styles.primaryBtn} disabled={saving}>
                {saving ? "Speichert…" : "Rechnung speichern"}
              </button>
            </div>

            <div style={styles.totalRow}>
              <div style={styles.totalCard}>
                <div style={styles.totalLabel}>Netto</div>
                <div style={styles.totalValue}>{money(newNet())}</div>
              </div>

              <div style={styles.totalCard}>
                <div style={styles.totalLabel}>MwSt.</div>
                <div style={styles.totalValue}>{money(newVatAmount())}</div>
              </div>

              <div style={styles.totalCardHighlight}>
                <div style={styles.totalLabel}>Brutto</div>
                <div style={styles.totalValue}>{money(newGross())}</div>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Rechnungen aus Supabase</div>

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
                  {filteredInvoices.map((inv) => {
                    const customer = customers.find((c) => c.id === inv.customer_id);

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedId(inv.id)}
                        style={{
                          ...styles.row,
                          ...(selectedId === inv.id ? styles.rowActive : {}),
                        }}
                      >
                        <td style={styles.td}>{inv.invoice_no}</td>
                        <td style={styles.td}>{customer?.company_name || "-"}</td>
                        <td style={styles.td}>{inv.project_name || "-"}</td>
                        <td style={styles.td}>{money(inv.gross_amount)}</td>
                        <td style={styles.td}>{inv.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedInvoice ? (
              <>
                <div style={{ marginTop: 18, fontWeight: 800, fontSize: 18 }}>
                  Details
                </div>

                <div style={styles.detailBox}>
                  <div><b>Rechnungsnummer:</b> {selectedInvoice.invoice_no}</div>
                  <div><b>Kunde:</b> {selectedCustomer?.company_name || "-"}</div>
                  <div><b>Projekt:</b> {selectedInvoice.project_name || "-"}</div>
                  <div><b>E-Mail:</b> {selectedInvoice.recipient_email || "-"}</div>
                </div>

                <div style={{ marginTop: 14 }}>
                  {selectedItems.map((item) => (
                    <div key={item.id} style={styles.itemLine}>
                      <span>{item.description}</span>
                      <span>{money(item.line_total)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#050b14,#081222 45%,#0a1527)",
    color: "#f7fbff",
    padding: 16,
    position: "relative",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 16,
  },
  glowA: {
    position: "absolute",
    width: 420,
    height: 420,
    right: -120,
    top: -120,
    background: "radial-gradient(circle, rgba(255,191,0,.14), transparent 60%)",
    pointerEvents: "none",
  },
  glowB: {
    position: "absolute",
    width: 600,
    height: 500,
    left: 260,
    bottom: -160,
    background: "radial-gradient(circle, rgba(19,73,170,.2), transparent 65%)",
    pointerEvents: "none",
  },
  sidebar: {
    position: "relative",
    zIndex: 2,
    borderRadius: 30,
    padding: 16,
    border: "1px solid rgba(255,255,255,.08)",
    background: "linear-gradient(180deg, rgba(8,17,34,.95), rgba(6,12,24,.98))",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    background: "linear-gradient(135deg,#ffcf3c,#f3b300)",
    color: "#111",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 28,
  },
  logoTop: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: ".18em",
  },
  logoBottom: {
    color: "#94a8c9",
    letterSpacing: ".22em",
    fontSize: 14,
  },
  profileCard: {
    borderRadius: 22,
    padding: 16,
    background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))",
    border: "1px solid rgba(255,255,255,.07)",
    marginBottom: 18,
  },
  profileSmall: { color: "#94a8c9", fontSize: 13, marginBottom: 8 },
  profileName: { fontSize: 30, fontWeight: 900, lineHeight: 1.05 },
  profileRole: { color: "#9db0cf", marginTop: 6, fontSize: 15 },
  sideCard: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.07)",
    marginBottom: 12,
  },
  sideLabel: { color: "#98a9c7", fontSize: 13 },
  sideValue: { fontSize: 24, fontWeight: 900, marginTop: 8 },
  main: {
    position: "relative",
    zIndex: 2,
    borderRadius: 30,
    padding: 16,
    border: "1px solid rgba(255,255,255,.08)",
    background: "linear-gradient(180deg, rgba(9,19,37,.95), rgba(7,13,25,.98))",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  title: { fontSize: 34, fontWeight: 900 },
  sub: { color: "#93a6c5", fontSize: 14, marginTop: 6 },
  search: {
    width: 320,
    height: 50,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(3,10,21,.64)",
    color: "#f2f7ff",
    padding: "0 16px",
    fontSize: 16,
    outline: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  panel: {
    borderRadius: 24,
    padding: 16,
    border: "1px solid rgba(255,255,255,.07)",
    background: "rgba(255,255,255,.03)",
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 16,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#9aaecd",
    fontSize: 14,
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.07)",
    background: "rgba(5,14,28,.7)",
    color: "#f4f8ff",
    padding: "0 14px",
    fontSize: 15,
    outline: "none",
  },
  newItemGrid: {
    display: "grid",
    gridTemplateColumns: "2fr .7fr .9fr .9fr auto",
    gap: 10,
    marginTop: 12,
    alignItems: "center",
  },
  primaryBtn: {
    height: 48,
    border: "none",
    borderRadius: 16,
    padding: "0 18px",
    background: "linear-gradient(135deg,#ffcf3c,#f3b300)",
    color: "#151515",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.06)",
    background: "rgba(255,255,255,.04)",
    color: "#eef5ff",
    padding: "0 16px",
    cursor: "pointer",
    fontSize: 15,
  },
  removeBtn: {
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(255,130,130,.18)",
    background: "rgba(114,39,55,.46)",
    color: "#ffc9c9",
    padding: "0 14px",
    cursor: "pointer",
    fontSize: 14,
  },
  tableWrap: {
    overflow: "hidden",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.07)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "14px",
    color: "#93a6c5",
    fontSize: 14,
    borderBottom: "1px solid rgba(255,255,255,.06)",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid rgba(255,255,255,.05)",
    fontSize: 15,
  },
  row: { cursor: "pointer" },
  rowActive: { background: "rgba(255,255,255,.03)" },
  detailBox: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.07)",
    display: "grid",
    gap: 10,
    marginTop: 12,
  },
  itemLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  },
  totalRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginTop: 16,
  },
  totalCard: {
    borderRadius: 20,
    padding: 16,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.07)",
  },
  totalCardHighlight: {
    borderRadius: 20,
    padding: 16,
    background: "linear-gradient(135deg,#ffcf3c22,#f3b30033)",
    border: "1px solid rgba(255,207,60,.2)",
  },
  totalLabel: { color: "#9aaecd", fontSize: 14, marginBottom: 10 },
  totalValue: { fontSize: 24, fontWeight: 900 },
  errorBox: {
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,80,80,.12)",
    border: "1px solid rgba(255,80,80,.2)",
    color: "#ffb4b4",
  },
  successBox: {
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
    background: "rgba(58,214,151,.14)",
    border: "1px solid rgba(58,214,151,.2)",
    color: "#91f0cb",
  },
};
