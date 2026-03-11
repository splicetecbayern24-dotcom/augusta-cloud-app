import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { renderInvoicePdf } from "../../../../lib/pdf";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoiceNo = `${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const invoiceDate = new Date().toISOString().slice(0, 10);
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const customerQuery = await supabaseAdmin
      .from("customers")
      .select("id, company_name")
      .eq("company_name", body.customer)
      .maybeSingle();

    const customerId = customerQuery.data?.id || null;

    const invoiceInsert = await supabaseAdmin
      .from("invoices")
      .insert({
        customer_id: customerId,
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        due_date: dueDate,
        project_name: body.project,
        status: "offen",
        vat_rate: body.vatRate,
        net_amount: body.net,
        vat_amount: body.vat,
        gross_amount: body.gross,
        recipient_email: body.recipientEmail || null,
      })
      .select("id")
      .single();

    if (invoiceInsert.error || !invoiceInsert.data) {
      return NextResponse.json({ ok: false, error: invoiceInsert.error?.message || "invoice_insert_failed" }, { status: 500 });
    }

    const invoiceId = invoiceInsert.data.id;

    const itemRows = (body.items || []).map((item: any, index: number) => ({
      invoice_id: invoiceId,
      position_no: index + 1,
      description: item.description,
      qty: item.qty,
      unit: item.unit,
      unit_price: item.unitPrice,
      line_total: item.qty * item.unitPrice,
    }));

    const itemInsert = await supabaseAdmin.from("invoice_items").insert(itemRows);
    if (itemInsert.error) {
      return NextResponse.json({ ok: false, error: itemInsert.error.message }, { status: 500 });
    }

    const pdfBytes = await renderInvoicePdf({
      invoiceNo,
      customerName: body.customer,
      project: body.project,
      invoiceDate,
      items: body.items.map((item: any) => ({ ...item, lineTotal: item.qty * item.unitPrice })),
      netAmount: body.net,
      vatRate: body.vatRate,
      vatAmount: body.vat,
      grossAmount: body.gross,
    });

    const safeCustomerFolder = (body.customer || "kunde").replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "kunde";
    const storagePath = `customers/${safeCustomerFolder}/invoices/${invoiceNo}.pdf`;

    const upload = await supabaseAdmin.storage
      .from("customer-documents")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (upload.error) {
      return NextResponse.json({ ok: false, error: upload.error.message }, { status: 500 });
    }

    await supabaseAdmin
      .from("invoices")
      .update({ pdf_path: storagePath })
      .eq("id", invoiceId);

    return NextResponse.json({ ok: true, invoiceId, invoiceNo, storagePath });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "unknown_error" }, { status: 500 });
  }
}
