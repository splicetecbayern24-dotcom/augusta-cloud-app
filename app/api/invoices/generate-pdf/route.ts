import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function euro(value: number | string | null | undefined) {
  return `${Number(value || 0).toFixed(2)} €`;
}

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

    const dark = rgb(0.06, 0.09, 0.15);
    const darker = rgb(0.03, 0.05, 0.09);
    const gold = rgb(0.96, 0.74, 0.15);
    const goldSoft = rgb(0.99, 0.96, 0.88);
    const white = rgb(0.98, 0.99, 1);
    const text = rgb(0.12, 0.14, 0.18);
    const muted = rgb(0.45, 0.49, 0.56);
    const line = rgb(0.87, 0.89, 0.92);
    const soft = rgb(0.97, 0.98, 0.99);

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

    // Top premium dark header
    page.drawRectangle({
      x: 0,
      y: height - 135,
      width,
      height: 135,
      color: dark,
    });

    // Gold accent strip
    page.drawRectangle({
      x: 0,
      y: height - 135,
      width,
      height: 6,
      color: gold,
    });

    // Logo block
    const logoX = 42;
    const logoY = height - 92;
    const logoSize = 50;

    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      color: gold,
    });

    // Scaffold monogram
    page.drawRectangle({ x: logoX + 11, y: logoY + 9, width: 4, height: 30, color: darker });
    page.drawRectangle({ x: logoX + 22, y: logoY + 9, width: 4, height: 30, color: darker });
    page.drawRectangle({ x: logoX + 33, y: logoY + 9, width: 4, height: 30, color: darker });
    page.drawRectangle({ x: logoX + 11, y: logoY + 14, width: 26, height: 4, color: darker });
    page.drawRectangle({ x: logoX + 11, y: logoY + 26, width: 26, height: 4, color: darker });

    page.drawText("AUGUSTA", {
      x: 105,
      y: height - 60,
      size: 24,
      font: bold,
      color: white,
    });

    page.drawText("GERÜSTBAU UG", {
      x: 106,
      y: height - 83,
      size: 11,
      font: bold,
      color: rgb(0.84, 0.87, 0.92),
    });

    page.drawText("RECHNUNG", {
      x: width - 155,
      y: height - 66,
      size: 19,
      font: bold,
      color: white,
    });

    // Info areas
    let leftY = height - 175;
    page.drawText("AUGUSTA Gerüstbau UG", {
      x: 42,
      y: leftY,
      size: 11,
      font: bold,
      color: text,
    });
    leftY -= 15;
    page.drawText("Musterstraße 1", { x: 42, y: leftY, size: 10, font, color: muted });
    leftY -= 14;
    page.drawText("86150 Augsburg", { x: 42, y: leftY, size: 10, font, color: muted });
    leftY -= 14;
    page.drawText("info@augusta-geruestbau.de", { x: 42, y: leftY, size: 10, font, color: muted });
    leftY -= 14;
    page.drawText("+49 0000 000000", { x: 42, y: leftY, size: 10, font, color: muted });

    let rightY = height - 175;
    page.drawText("Rechnung an", {
      x: 345,
      y: rightY,
      size: 11,
      font: bold,
      color: text,
    });
    rightY -= 15;
    page.drawText(customer?.company_name || "-", {
      x: 345,
      y: rightY,
      size: 10,
      font,
      color: text,
    });
    rightY -= 14;
    if (customer?.contact_name) {
      page.drawText(customer.contact_name, {
        x: 345,
        y: rightY,
        size: 10,
        font,
        color: muted,
      });
      rightY -= 14;
    }
    if (customer?.address) {
      page.drawText(customer.address, {
        x: 345,
        y: rightY,
        size: 10,
        font,
        color: muted,
      });
      rightY -= 14;
    }
    if (customer?.city) {
      page.drawText(customer.city, {
        x: 345,
        y: rightY,
        size: 10,
        font,
        color: muted,
      });
      rightY -= 14;
    }
    if (invoice?.recipient_email || customer?.email) {
      page.drawText(invoice?.recipient_email || customer?.email || "", {
        x: 345,
        y: rightY,
        size: 10,
        font,
        color: muted,
      });
    }

    // Invoice meta card
    const cardX = 42;
    const cardY = height - 315;
    const cardW = 511;
    const cardH = 66;

    page.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      color: soft,
      borderColor: line,
      borderWidth: 1,
    });

    const meta = [
      ["Rechnungsnr.", invoice?.invoice_no || "-"],
      ["Datum", invoice?.invoice_date || "-"],
      ["Fällig", invoice?.due_date || "-"],
      ["Projekt", invoice?.project_name || "-"],
    ];

    let mx = cardX + 14;
    for (const [label, value] of meta) {
      page.drawText(label, {
        x: mx,
        y: cardY + 42,
        size: 9,
        font: bold,
        color: muted,
      });
      page.drawText(String(value), {
        x: mx,
        y: cardY + 22,
        size: 10,
        font,
        color: text,
      });
      mx += 123;
    }

    // Section title
    page.drawText("Leistungsübersicht", {
      x: 42,
      y: height - 350,
      size: 12,
      font: bold,
      color: text,
    });

    // Table header
    const tableHeadY = height - 385;
    page.drawRectangle({
      x: 42,
      y: tableHeadY,
      width: 511,
      height: 28,
      color: dark,
    });

    page.drawText("Beschreibung", { x: 52, y: tableHeadY + 9, size: 10, font: bold, color: white });
    page.drawText("Menge", { x: 315, y: tableHeadY + 9, size: 10, font: bold, color: white });
    page.drawText("Einheit", { x: 370, y: tableHeadY + 9, size: 10, font: bold, color: white });
    page.drawText("Preis", { x: 435, y: tableHeadY + 9, size: 10, font: bold, color: white });
    page.drawText("Gesamt", { x: 495, y: tableHeadY + 9, size: 10, font: bold, color: white });

    // Rows
    let rowY = tableHeadY - 22;
    const safeItems = Array.isArray(items) && items.length > 0
      ? items
      : [{ description: "Keine Positionen", qty: 0, unit: "-", unit_price: 0, line_total: 0 }];

    for (const item of safeItems) {
      page.drawLine({
        start: { x: 42, y: rowY - 4 },
        end: { x: 553, y: rowY - 4 },
        thickness: 1,
        color: line,
      });

      page.drawText(String(item.description || "-"), {
        x: 52,
        y: rowY + 5,
        size: 10,
        font,
        color: text,
      });

      page.drawText(String(item.qty ?? 0), {
        x: 322,
        y: rowY + 5,
        size: 10,
        font,
        color: text,
      });

      page.drawText(String(item.unit || "-"), {
        x: 375,
        y: rowY + 5,
        size: 10,
        font,
        color: text,
      });

      page.drawText(euro(item.unit_price), {
        x: 430,
        y: rowY + 5,
        size: 10,
        font,
        color: text,
      });

      page.drawText(euro(item.line_total), {
        x: 490,
        y: rowY + 5,
        size: 10,
        font: bold,
        color: text,
      });

      rowY -= 26;
    }

    // Summary card
    const sumX = 332;
    const sumY = rowY - 88;
    const sumW = 221;
    const sumH = 94;

    page.drawRectangle({
      x: sumX,
      y: sumY,
      width: sumW,
      height: sumH,
      color: goldSoft,
      borderColor: rgb(0.94, 0.87, 0.63),
      borderWidth: 1,
    });

    page.drawText("Netto", {
      x: sumX + 16,
      y: sumY + 64,
      size: 10,
      font: bold,
      color: muted,
    });
    page.drawText(euro(invoice?.net_amount), {
      x: sumX + 130,
      y: sumY + 64,
      size: 10,
      font,
      color: text,
    });

    page.drawText(`MwSt. (${invoice?.vat_rate ?? 19}%)`, {
      x: sumX + 16,
      y: sumY + 42,
      size: 10,
      font: bold,
      color: muted,
    });
    page.drawText(euro(invoice?.vat_amount), {
      x: sumX + 130,
      y: sumY + 42,
      size: 10,
      font,
      color: text,
    });

    page.drawLine({
      start: { x: sumX + 16, y: sumY + 30 },
      end: { x: sumX + sumW - 16, y: sumY + 30 },
      thickness: 1,
      color: rgb(0.92, 0.84, 0.56),
    });

    page.drawText("Brutto", {
      x: sumX + 16,
      y: sumY + 12,
      size: 12,
      font: bold,
      color: text,
    });
    page.drawText(euro(invoice?.gross_amount), {
      x: sumX + 120,
      y: sumY + 12,
      size: 12,
      font: bold,
      color: gold,
    });

    // Footer note
    page.drawLine({
      start: { x: 42, y: 88 },
      end: { x: 553, y: 88 },
      thickness: 1,
      color: line,
    });

    page.drawText(
      "Vielen Dank für Ihren Auftrag. Bitte überweisen Sie den Rechnungsbetrag fristgerecht.",
      {
        x: 42,
        y: 62,
        size: 9,
        font,
        color: muted,
      }
    );

    page.drawText(
      "AUGUSTA Gerüstbau UG · Augsburg · Bankverbindung folgt",
      {
        x: 42,
        y: 46,
        size: 9,
        font,
        color: muted,
      }
    );

    const pdfBytes = await pdfDoc.save();

    return new Response(new Uint8Array(pdfBytes), {
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
