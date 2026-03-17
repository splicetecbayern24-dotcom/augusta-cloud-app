"use client";

import { useEffect, useState } from "react";
import type { Customer } from "@/types/customer";
import { supabase } from "@/lib/supabase/client";

export function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    const res = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (res.error) {
      setError(res.error.message);
      setLoading(false);
      return;
    }

    setCustomers((res.data || []) as Customer[]);
    setLoading(false);
  }

  async function saveCustomer() {
    setSaving(true);
    setError("");
    setSuccess("");

    if (!companyName.trim()) {
      setError("Bitte Firmenname eingeben.");
      setSaving(false);
      return;
    }

    const insert = await supabase
      .from("customers")
      .insert({
        company_name: companyName,
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        city: city || null,
        address: address || null,
      })
      .select("*")
      .single();

    if (insert.error || !insert.data) {
      setError(insert.error?.message || "Kunde konnte nicht gespeichert werden.");
      setSaving(false);
      return;
    }

    setCustomers((prev) => [insert.data as Customer, ...prev]);
    setSuccess("Kunde gespeichert.");

    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setCity("");
    setAddress("");
    setSaving(false);
  }

  return (
    <section style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Kunden</div>
          <div style={styles.sub}>Kunden anlegen und verwalten</div>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {success ? <div style={styles.successBox}>{success}</div> : null}

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Neuen Kunden anlegen</div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Firmenname</label>
              <input style={styles.input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <div>
              <label style={styles.label}>Ansprechpartner</label>
              <input style={styles.input} value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>

            <div>
              <label style={styles.label}>E-Mail</label>
              <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label style={styles.label}>Telefon</label>
              <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
              <label style={styles.label}>Ort</label>
              <input style={styles.input} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <div>
              <label style={styles.label}>Adresse</label>
              <input style={styles.input} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <button style={styles.primaryBtn} onClick={saveCustomer} disabled={saving}>
              {saving ? "Speichert…" : "Kunde speichern"}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Kundenliste</div>

          {loading ? (
            <div style={styles.empty}>Lade Kunden…</div>
          ) : customers.length === 0 ? (
            <div style={styles.empty}>Noch keine Kunden vorhanden.</div>
          ) : (
            <div style={styles.list}>
              {customers.map((customer) => (
                <div key={customer.id} style={styles.customerRow}>
                  <div>
                    <div style={styles.customerName}>{customer.company_name}</div>
                    <div style={styles.customerMeta}>
                      {customer.contact_name || "-"} · {customer.email || "-"}
                    </div>
                  </div>
                  <div style={styles.customerMeta}>
                    {customer.city || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { color: "#fff" },
  header: { marginBottom: 16 },
  title: { fontSize: 34, fontWeight: 900 },
  sub: { color: "#93a6c5", marginTop: 6 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: {
    borderRadius: 24,
    padding: 20,
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(255,255,255,.03)",
  },
  cardTitle: { fontSize: 22, fontWeight: 900, marginBottom: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "block", marginBottom: 8, color: "#9aaecd", fontSize: 14 },
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
    boxSizing: "border-box",
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
  list: { display: "grid", gap: 10 },
  customerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.06)",
  },
  customerName: { fontWeight: 800, fontSize: 16 },
  customerMeta: { color: "#9aaecd", fontSize: 14, marginTop: 4 },
  empty: { color: "#9aaecd", padding: "12px 0" },
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
