import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice, items, customer } = body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    page.drawText("AUGUSTA Gerüstbau UG", {
      x: 50,
      y,
      size: 20,
      font: bold,
      color: rgb(0.08, 0.08, 0.08),
    });

    y -= 28;
    page.drawText("Rechnung", {
      x: 50,
      y,
      size: 14,
      font: bold,
    });

    y -= 30;
    page.drawText(`Rechnungsnummer: ${invoice.invoice_no}`, {
      x: 50,
      y,
      size: 11,
      font,
    });

    y -= 18;
    page.drawText(`Rechnungsdatum: ${invoice.invoice_date || "-"}`, {
      x: 50,
      y,
      size: 11,
      font,
    });

    y -= 18;
    page.drawText(`Kunde: ${customer?.company_name || "-"}`, {
      x: 50,
      y,
      size: 11,
      font,
    });

    y -= 18;
    page.drawText(`E-Mail: ${invoice.recipient_email || "-"}`, {
      x: 50,
      y,
      size: 11,
      font,
    });

    y -= 30;
    page.drawText("Positionen", {
      x: 50,
      y,
      size: 13,
      font: bold,
    });

    y -= 20;

    for (const item of items || []) {
      page.drawText(
        `${item.description} | Menge: ${item.qty} | Einheit: ${item.unit} | Preis: ${item.unit_price} € | Gesamt: ${item.line_total} €`,
        {
          x: 50,
          y,
          size: 10,
          font,
        }
      );
      y -= 18;
    }

    y -= 20;
    page.drawText(`Netto: ${invoice.net_amount} €`, {
      x: 50,
      y,
      size: 12,
      font: bold,
    });

    y -= 18;
    page.drawText(`MwSt: ${invoice.vat_amount} €`, {
      x: 50,
      y,
      size: 12,
      font: bold,
    });

    y -= 18;
    page.drawText(`Brutto: ${invoice.gross_amount} €`, {
      x: 50,
      y,
      size: 12,
      font: bold,
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `invoice-${invoice.invoice_no}.pdf`;

    const upload = await supabase.storage
      .from("invoices")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { data } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    const update = await supabase
      .from("invoices")
      .update({ pdf_url: data.publicUrl })
      .eq("id", invoice.id);

    if (update.error) {
      return NextResponse.json({ error: update.error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "PDF konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}
