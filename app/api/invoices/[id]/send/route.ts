import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { sendInvoiceMail } from "../../../../../lib/mail";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const invoiceQuery = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_no, recipient_email, pdf_path")
      .eq("id", id)
      .single();

    if (invoiceQuery.error || !invoiceQuery.data) {
      return NextResponse.json({ ok: false, error: invoiceQuery.error?.message || "invoice_not_found" }, { status: 404 });
    }

    const invoice = invoiceQuery.data;

    if (!invoice.recipient_email || !invoice.pdf_path) {
      return NextResponse.json({ ok: false, error: "missing_recipient_or_pdf" }, { status: 400 });
    }

    const signed = await supabaseAdmin.storage
      .from("customer-documents")
      .createSignedUrl(invoice.pdf_path, 60 * 60 * 24 * 7);

    if (signed.error || !signed.data?.signedUrl) {
      return NextResponse.json({ ok: false, error: signed.error?.message || "signed_url_failed" }, { status: 500 });
    }

    const result = await sendInvoiceMail({
      to: invoice.recipient_email,
      invoiceNo: invoice.invoice_no,
      pdfUrl: signed.data.signedUrl,
    });

    return NextResponse.json({ ok: true, result, pdfUrl: signed.data.signedUrl });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "unknown_error" }, { status: 500 });
  }
}
