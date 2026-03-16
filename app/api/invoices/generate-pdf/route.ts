import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { invoice } = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Rechnung", {
      x: 50,
      y: 350,
      size: 24,
      font
    });

    page.drawText(`Rechnungsnummer: ${invoice.invoice_no}`, {
      x: 50,
      y: 300,
      size: 14,
      font
    });

    page.drawText(`Projekt: ${invoice.project_name || "-"}`, {
      x: 50,
      y: 270,
      size: 14,
      font
    });

    page.drawText(`Betrag: ${invoice.gross_total} €`, {
      x: 50,
      y: 240,
      size: 14,
      font
    });

    const pdfBytes = await pdfDoc.save();

    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      url: `data:application/pdf;base64,${base64}`
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "PDF konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}
