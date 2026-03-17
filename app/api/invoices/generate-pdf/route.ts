import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { invoice } = await req.json();

    if (!invoice) {
      return new Response("Keine Rechnungsdaten", { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("AUGUSTA Gerüstbau UG", {
      x: 50,
      y: 350,
      size: 18,
      font: bold,
    });

    page.drawText("Rechnung", {
      x: 50,
      y: 320,
      size: 14,
      font: bold,
    });

    page.drawText(`Nr: ${invoice.invoice_no || "-"}`, {
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

    page.drawText(`Betrag: ${invoice.gross_amount || 0} €`, {
      x: 50,
      y: 230,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = new Uint8Array(pdfBytes);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });

  } catch (err) {
    console.error(err);
    return new Response("PDF Fehler", { status: 500 });
  }
}
