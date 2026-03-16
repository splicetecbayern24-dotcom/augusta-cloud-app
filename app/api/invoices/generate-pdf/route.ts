import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { invoice } = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("AUGUSTA Gerüstbau UG", {
      x: 50,
      y: 350,
      size: 20,
      font: bold,
    });

    page.drawText("Rechnung", {
      x: 50,
      y: 320,
      size: 16,
      font: bold,
    });

    page.drawText(`Rechnungsnummer: ${invoice.invoice_no || "-"}`, {
      x: 50,
      y: 280,
      size: 12,
      font,
    });

    page.drawText(`Projekt: ${invoice.project_name || "-"}`, {
      x: 50,
      y: 255,
      size: 12,
      font,
    });

    page.drawText(`Status: ${invoice.status || "-"}`, {
      x: 50,
      y: 230,
      size: 12,
      font,
    });

    page.drawText(`Brutto: ${invoice.gross_amount || 0} €`, {
      x: 50,
      y: 205,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="rechnung-${invoice.invoice_no || "augusta"}.pdf"`,
      },
    });
  } catch (error) {
    return new Response("PDF konnte nicht erstellt werden.", { status: 500 });
  }
}
