export type InvoiceItem = {
  id?: string;
  invoice_id?: string;
  position_no?: number;
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
  line_total?: number;
};

export type Invoice = {
  id: string;
  invoice_no: string;
  customer_id: string | null;
  project_name?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status: string;
  vat_rate: number;
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  recipient_email?: string | null;
  pdf_url?: string | null;
};
