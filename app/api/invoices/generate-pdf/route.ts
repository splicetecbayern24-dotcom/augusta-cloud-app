import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { invoice, customer, items } = await req.json();

    if (!invoice) {
      return new Response("Keine Rechnungsdaten", { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const width = page.getWidth();
    const height = page.getHeight();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dark = rgb(0.07, 0.1, 0.16);
    const gold = rgb(0.95, 0.72, 0.12);
    const light = rgb(0.96, 0.97, 0.99);
    const muted = rgb(0.4, 0.45, 0.52);
    const line = rgb(0.86, 0.88, 0.91);

    // Hintergrund
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

    // Header dunkel
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: dark,
    });

    // Logo-Monogramm
    const logoX = 40;
    const logoY = height - 82;
    const logoSize = 46;

    page.drawRoundedRectangle({
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      borderRadius: 12,
      color: gold,
    });

    // Gerüst-Look im Logo
    page.drawRectangle({ x: logoX + 11, y: logoY + 9, width: 4, height: 28, color: dark });
    page.drawRectangle({ x: logoX + 21, y: logoY + 9, width: 4, height: 28, color: dark });
    page.drawRectangle({ x: logoX + 31, y: logoY + 9, width: 4, height: 28, color: dark });
    page.drawRectangle({ x: logoX + 11, y: logoY + 14, width: 24, height: 4, color: dark });
    page.drawRectangle({ x: logoX + 11, y: logoY + 25, width: 24, height: 4, color: dark });

    // Firmenname
    page.drawText("AUGUSTA", {
      x: 98,
      y: height - 58,
      size: 22,
      font: bold,
      color: light,
    });

    page.drawText("GERÜSTBAU UG", {
      x: 98,
      y: height - 80,
      size: 11,
      font: bold,
      color: rgb(0.82, 0.85, 0.9),
    });

    page.drawText("Rechnung", {
      x: width - 145,
      y: height - 62,
      size: 20,
      font: bold,
      color: light,
    });

    // Firmenblock links
    let y = height - 165;

    page.drawText("AUGUSTA Gerüstbau UG", {
      x: 40,
      y,
      size: 11,
      font: bold,
      color: dark,
    });

    y -= 16;
    page.drawText("Musterstraße 1", {
      x: 40,
      y,
      size: 10,
      font,
      color: muted,
    });

    y -= 14;
    page.drawText("86150 Augsburg", {
      x: 40,
      y,
      size: 10,
      font,
      color: muted,
    });

    y -= 14;
    page.drawText("E-Mail: info@augusta-geruestbau.de", {
      x: 40,
      y,
      size: 10,
      font,
      color: muted,
    });

    y -= 14;
    page.drawText("Tel: 0000 / 000000", {
      x: 40,
      y,
      size: 10,
      font,
      color: muted,
    });

    // Kundenblock rechts
    let cy = height - 165;

    page.drawText("Rechnung an", {
      x: 340,
      y: cy,
      size: 11,
      font: bold,
      color: dark,
    });

    cy -= 16;
    page.drawText(customer?.company_name || "-", {
      x: 340,
      y: cy,
      size: 10,
      font,
      color: dark,
    });

    cy -= 14;
    page.drawText(customer?.contact_name || "", {
      x: 340,
      y: cy,
      size: 10,
      font,
      color: muted,
    });

    cy -= 14;
    page.drawText(customer?.address || "", {
      x: 340,
      y: cy,
      size: 10,
      font,
      color: muted,
    });

    cy -= 14;
    page.drawText(customer?.city || "", {
      x: 340,
      y: cy,
      size: 10,
      font,
      color: muted,
    });

    cy -= 14;
    page.drawText(invoice?.recipient_email || customer?.email || "", {
      x: 340,
      y: cy,
      size: 10,
      font,
      color: muted,
    });

    // Infobox Rechnung
    const infoTop = height - 285;

    page.drawRoundedRectangle({
      x: 40,
      y: infoTop - 58,
      width: 515,
      height: 58,
      borderRadius: 10,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: line,
      borderWidth: 1,
    });

    const info = [
      ["Rechnungsnr.", invoice?.invoice_no || "-"],
      ["Datum", invoice?.invoice_date || "-"],
      ["Fällig", invoice?.due_date || "-"],
      ["Projekt", invoice?.project_name || "-"],
    ];

    let ix = 55;
    for (const [label, value] of info) {
      page.drawText(label, {
        x: ix,
        y: infoTop - 18,
        size: 9,
        font: bold,
        color: muted,
      });

      page.drawText(String(value), {
        x: ix,
        y: infoTop - 35,
        size: 10,
        font,
        color: dark,
      });

      ix += 125;
    }

    // Tabellenkopf
    let tableY = height - 380;

    page.drawRoundedRectangle({
      x: 40,
      y: tableY,
      width: 515,
      height: 26,
      borderRadius: 8,
      color: dark,
    });

    page.drawText("Beschreibung", { x: 50, y: tableY + 8, size: 10, font: bold, color: light });
    page.drawText("Menge", { x: 320, y: tableY + 8, size: 10, font: bold, color: light });
    page.drawText("Preis", { x: 390, y: tableY + 8, size: 10, font: bold, color: light });
    page.drawText("Gesamt", { x: 470, y: tableY + 8, size: 10, font: bold, color: light });

    let rowY = tableY - 28;

    const safeItems = Array.isArray(items) ? items : [];

    for (const item of safeItems) {
      page.drawLine({
        start: { x: 40, y: rowY - 4 },
        end: { x: 555, y: rowY - 4 },
        thickness: 1,
        color: line,
      });

      page.drawText(String(item.description || "-"), {
        x: 50,
        y: rowY + 6,
        size: 10,
        font,
        color: dark,
      });

      page.drawText(String(item.qty ?? "-"), {
        x: 325,
        y: rowY + 6,
        size: 10,
        font,
        color: dark,
      });

      page.drawText(`${Number(item.unit_price || 0).toFixed(2)} €`, {
        x: 390,
        y: rowY + 6,
        size: 10,
        font,
        color: dark,
      });

      page.drawText(`${Number(item.line_total || 0).toFixed(2)} €`, {
        x: 470,
        y: rowY + 6,
        size: 10,
        font: bold,
        color: dark,
      });

      rowY -= 28;
    }

    // Summenbox
    const sumBoxY = rowY - 80;

    page.drawRoundedRectangle({
      x: 325,
      y: sumBoxY,
      width: 230,
      height: 88,
      borderRadius: 12,
      color: rgb(0.985, 0.985, 0.99),
      borderColor: line,
      borderWidth: 1,
    });

    page.drawText("Netto", {
      x: 345,
      y: sumBoxY + 60,
      size: 10,
      font: bold,
      color: muted,
    });

    page.drawText(`${Number(invoice?.net_amount || 0).toFixed(2)} €`, {
      x: 470,
      y: sumBoxY + 60,
      size: 10,
      font,
      color: dark,
    });

    page.drawText("MwSt.", {
      x: 345,
      y: sumBoxY + 38,
      size: 10,
      font: bold,
      color: muted,
    });

    page.drawText(`${Number(invoice?.vat_amount || 0).toFixed(2)} €`, {
      x: 470,
      y: sumBoxY + 38,
      size: 10,
      font,
      color: dark,
    });

    page.drawLine({
      start: { x: 345, y: sumBoxY + 28 },
      end: { x: 535, y: sumBoxY + 28 },
      thickness: 1,
      color: line,
    });

    page.drawText("Brutto", {
      x: 345,
      y: sumBoxY + 10,
      size: 12,
      font: bold,
      color: dark,
    });

    page.drawText(`${Number(invoice?.gross_amount || 0).toFixed(2)} €`, {
      x: 460,
      y: sumBoxY + 10,
      size: 12,
      font: bold,
      color: gold,
    });

    // Footer
    page.drawLine({
      start: { x: 40, y: 80 },
      end: { x: 555, y: 80 },
      thickness: 1,
      color: line,
    });

    page.drawText(
      "Vielen Dank für Ihren Auftrag. Bitte überweisen Sie den Rechnungsbetrag fristgerecht.",
      {
        x: 40,
        y: 58,
        size: 9,
        font,
        color: muted,
      }
    );

    page.drawText("AUGUSTA Gerüstbau UG · Bankdaten / IBAN folgen", {
      x: 40,
      y: 42,
      size: 9,
      font,
      color: muted,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = new Uint8Array(pdfBytes);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="rechnung-${invoice?.invoice_no || "augusta"}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("PDF Fehler", { status: 500 });
  }
}
