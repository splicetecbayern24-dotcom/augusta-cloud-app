import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  header: { fontSize: 20, marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
});

export const InvoicePDF = ({ invoice }: any) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Rechnung</Text>

      <View style={styles.row}>
        <Text>Rechnungsnummer:</Text>
        <Text>{invoice.number}</Text>
      </View>

      <View style={styles.row}>
        <Text>Kunde:</Text>
        <Text>{invoice.customer}</Text>
      </View>

      <View style={styles.row}>
        <Text>Projekt:</Text>
        <Text>{invoice.project}</Text>
      </View>

      <View style={styles.row}>
        <Text>Brutto:</Text>
        <Text>{invoice.total} €</Text>
      </View>
    </Page>
  </Document>
);
