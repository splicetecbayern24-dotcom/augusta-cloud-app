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
  status: "offen" | "bezahlt" | string;
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
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");

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

    const customerData = (customersRes.data || []) as Customer[];
    const invoiceData = (invoicesRes.data || []) as Invoice[];
    const itemData = (itemsRes.data || []) as InvoiceItem[];

    setCustomers(customerData);
    setInvoices(invoiceData);
    setItems(itemData);

    if (invoiceData.length > 0) {
      setSelectedId(invoiceData[0].id);
    }

    setLoading(false);
  }

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter((inv) => {
      const customer = customers.find((c) => c.id === inv.customer_id);
      return [
        inv.invoice_no,
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

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.gross_amount || 0), 0);
  const totalOpen = invoices
    .filter((inv) => String(inv.status).toLowerCase() === "offen")
    .reduce((sum, inv) => sum + Number(inv.gross_amount || 0), 0);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>Lade Daten aus Supabase…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Fehler</div>
          <div style={{ color: "#ffb4b4" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>AUGUSTA Gerüstbau UG</div>
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
      </div>

      <div style={styles.content}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.title}>Rechnungen</div>
            <div style={styles.sub}>Echte Daten aus Supabase</div>
          </div>
          <input
            style={styles.search}
            placeholder="Rechnung suchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Rechnungsliste</div>
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
                          ...styles.tr,
                          ...(selectedId === inv.id ? styles.trActive : {}),
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
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Rechnungsdetails</div>

            {selectedInvoice ? (
              <>
                <div style={styles.detailBox}>
                  <div><b>Rechnungsnummer:</b> {selectedInvoice.invoice_no}</div>
                  <div><b>Kunde:</b> {selectedCustomer?.company_name || "-"}</div>
                  <div><b>Projekt:</b> {selectedInvoice.project_name || "-"}</div>
                  <div><b>E-Mail:</b> {selectedInvoice.recipient_email || "-"}</div>
                  <div><b>Status:</b> {selectedInvoice.status}</div>
                  <div><b>Datum:</b> {selectedInvoice.invoice_date || "-"}</div>
                </div>

                <div style={{ marginTop: 16, fontWeight: 800, fontSize: 18 }}>Positionen</div>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Beschreibung</th>
                        <th style={styles.th}>Menge</th>
                        <th style={styles.th}>Einheit</th>
                        <th style={styles.th}>Preis</th>
                        <th style={styles.th}>Gesamt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item) => (
                        <tr key={item.id}>
                          <td style={styles.td}>{item.description}</td>
                          <td style={styles.td}>{item.qty}</td>
                          <td style={styles.td}>{item.unit}</td>
                          <td style={styles.td}>{money(item.unit_price)}</td>
                          <td style={styles.td}>{money(item.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={styles.totalRow}>
                  <div style={styles.totalCard}>
                    <div style={styles.totalLabel}>Netto</div>
                    <div style={styles.totalValue}>{money(selectedInvoice.net_amount)}</div>
                  </div>
                  <div style={styles.totalCard}>
                    <div style={styles.totalLabel}>MwSt.</div>
                    <div style={styles.totalValue}>{money(selectedInvoice.vat_amount)}</div>
                  </div>
                  <div style={styles.totalCardHighlight}>
                    <div style={styles.totalLabel}>Brutto</div>
                    <div style={styles.totalValue}>{money(selectedInvoice.gross_amount)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.detailBox}>Keine Rechnung gefunden.</div>
            )}
          </div>
        </div>
      </div>
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
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 16,
  },
  centerBox: {
    margin: "120px auto",
    maxWidth: 700,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 24,
    padding: 24,
  },
  sidebar: {
    borderRadius: 30,
    padding: 16,
    border: "1px solid rgba(255,255,255,.08)",
    background: "linear-gradient(180deg, rgba(8,17,34,.95), rgba(6,12,24,.98))",
  },
  logo: {
    fontSize: 26,
    fontWeight: 900,
    marginBottom: 20,
  },
  sideCard: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.07)",
    marginBottom: 12,
  },
  sideLabel: { color: "#98a9c7", fontSize: 13 },
  sideValue: { fontSize: 24, fontWeight: 900, marginTop: 8 },
  content: {
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
  tr: { cursor: "pointer" },
  trActive: { background: "rgba(255,255,255,.03)" },
  detailBox: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.07)",
    display: "grid",
    gap: 10,
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
};
'''

page = r'''
import { Dashboard } from "../components/dashboard";

export default function Page() {
  return <Dashboard />;
}
'''

(proj / "dashboard.tsx").write_text(textwrap.dedent(dashboard).lstrip(), encoding="utf-8")
(proj / "page.tsx").write_text(textwrap.dedent(page).lstrip(), encoding="utf-8")
(proj / "README.txt").write_text("Phase A: laedt echte Daten aus Supabase.", encoding="utf-8")

zip_path = base / "AUGUSTA_PhaseA_Supabase_Load.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for p in proj.iterdir():
        zf.write(p, arcname=p.name)

print(zip_path)
