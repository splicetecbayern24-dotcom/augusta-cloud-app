import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { invoice, customer, items } = await req.json();

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

    // HEADER
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: dark,
    });

    // LOGO BLOCK
    const logoX = 40;
    const logoY = height - 82;
    const logoSize = 46;

    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      color: gold,
    });

    // Gerüst Look
    page.drawRectangle({ x: logoX + 11, y: logoY + 9, width: 4, height: 28, color: dark });
    page.drawRectangle({ x: logoX + 21, y: logoY + 9, width: 4, height: 28, color: dark });
    page.drawRectangle({ x: logoX + 31, y: logoY + 9, width: 4, height: 28, color: dark });
    page.drawRectangle({ x: logoX + 11, y: logoY + 14, width: 24, height: 4, color: dark });
    page.drawRectangle({ x: logoX + 11, y: logoY + 25, width: 24, height: 4, color: dark });

    // TITEL
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
      x: width - 140,
      y: height - 60,
      size: 20,
      font: bold,
      color: light,
    });

    // FIRMA LINKS
    let y = height - 165;

    page.drawText("AUGUSTA Gerüstbau UG", {
      x: 40,
      y,
      size: 11,
      font: bold,
      color: dark,
    });

    y -= 16;
    page.drawText("Musterstraße 1", { x: 40, y, size: 10, font, color: muted });

    y -= 14;
    page.drawText("86150 Augsburg", { x: 40, y, size: 10, font, color: muted });

    y -= 14;
    page.drawText("info@augusta.de", { x: 40, y, size: 10, font, color: muted });

    // KUNDE RECHTS
    let cy = height - 165;

    page.drawText("Rechnung an", {
      x: 340,
      y: cy,
      size: 11,
      font: bold,
      color: dark,
    });

    cy -= 16;
    page.drawText(customer?.company_name || "-", { x: 340, y: cy, size: 10, font });

    cy -= 14;
    page.drawText(customer?.address || "", { x: 340, y: cy, size: 10, font });

    cy -= 14;
    page.drawText(customer?.city || "", { x: 340, y: cy, size: 10, font });

    // INFOS
    const infoY = height - 260;

    page.drawRectangle({
      x: 40,
      y: infoY - 60,
      width: 515,
      height: 60,
      color: rgb(0.97, 0.97, 0.98),
    });

    page.drawText(`Rechnung: ${invoice?.invoice_no || "-"}`, {
      x: 50,
      y: infoY - 20,
      size: 10,
      font,
    });

    page.drawText(`Datum: ${invoice?.invoice_date || "-"}`, {
      x: 50,
      y: infoY - 40,
      size: 10,
      font,
    });

    page.drawText(`Projekt: ${invoice?.project_name || "-"}`, {
      x: 300,
      y: infoY - 20,
      size: 10,
      font,
    });

    // TABELLE
    let tableY = height - 350;

    page.drawRectangle({
      x: 40,
      y: tableY,
      width: 515,
      height: 25,
      color: dark,
    });

    page.drawText("Beschreibung", { x: 50, y: tableY + 7, size: 10, font: bold, color: light });
    page.drawText("Menge", { x: 320, y: tableY + 7, size: 10, font: bold, color: light });
    page.drawText("Preis", { x: 390, y: tableY + 7, size: 10, font: bold, color: light });
    page.drawText("Gesamt", { x: 470, y: tableY + 7, size: 10, font: bold, color: light });

    let rowY = tableY - 25;

    for (const item of items || []) {
      page.drawText(item.description || "-", { x: 50, y: rowY, size: 10, font });
      page.drawText(String(item.qty || 0), { x: 325, y: rowY, size: 10, font });
      page.drawText(`${item.unit_price || 0} €`, { x: 390, y: rowY, size: 10, font });
      page.drawText(`${item.line_total || 0} €`, { x: 470, y: rowY, size: 10, font: bold });

      rowY -= 20;
    }

    // SUMMEN
    const sumY = rowY - 40;

    page.drawText("Netto:", { x: 350, y: sumY, size: 10, font: bold });
    page.drawText(`${invoice?.net_amount || 0} €`, { x: 450, y: sumY, size: 10, font });

    page.drawText("MwSt:", { x: 350, y: sumY - 20, size: 10, font: bold });
    page.drawText(`${invoice?.vat_amount || 0} €`, { x: 450, y: sumY - 20, size: 10, font });

    page.drawText("Brutto:", { x: 350, y: sumY - 40, size: 12, font: bold });
    page.drawText(`${invoice?.gross_amount || 0} €`, {
      x: 450,
      y: sumY - 40,
      size: 12,
      font: bold,
      color: gold,
    });

    // FOOTER
    page.drawText("Vielen Dank für Ihren Auftrag!", {
      x: 40,
      y: 50,
      size: 10,
      font,
      color: muted,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="rechnung-${invoice?.invoice_no}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("PDF Fehler", { status: 500 });
  }
}
