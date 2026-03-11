import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  title: { fontSize: 22, marginBottom: 12 },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  tableHead: { flexDirection: "row", borderBottom: 1, paddingBottom: 6, marginBottom: 6 },
  cellWide: { width: "46%" },
  cell: { width: "18%" },
});

export async function renderInvoicePdf(input: {
  invoiceNo: string;
  customerName: string;
  project: string;
  invoiceDate: string;
  items: Array<{ description: string; qty: number; unit: string; unitPrice: number; lineTotal: number }>;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
}) {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>AUGUSTA Gerüstbau UG – Rechnung</Text>
        <View style={styles.section}>
          <Text>Rechnungsnummer: {input.invoiceNo}</Text>
          <Text>Datum: {input.invoiceDate}</Text>
          <Text>Kunde: {input.customerName}</Text>
          <Text>Projekt: {input.project}</Text>
        </View>
        <View style={styles.tableHead}>
          <Text style={styles.cellWide}>Beschreibung</Text>
          <Text style={styles.cell}>Menge</Text>
          <Text style={styles.cell}>Einheit</Text>
          <Text style={styles.cell}>Preis</Text>
        </View>
        {input.items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cellWide}>{item.description}</Text>
            <Text style={styles.cell}>{item.qty}</Text>
            <Text style={styles.cell}>{item.unit}</Text>
            <Text style={styles.cell}>{item.lineTotal.toFixed(2)} €</Text>
          </View>
        ))}
        <View style={{ marginTop: 20 }}>
          <Text>Netto: {input.netAmount.toFixed(2)} €</Text>
          <Text>MwSt. {input.vatRate}%: {input.vatAmount.toFixed(2)} €</Text>
          <Text>Brutto: {input.grossAmount.toFixed(2)} €</Text>
        </View>
      </Page>
    </Document>
  );

  return pdf(doc).toBuffer();
}
