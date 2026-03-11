import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceMail(input: {
  to: string;
  invoiceNo: string;
  pdfUrl: string;
}) {
  return resend.emails.send({
    from: `AUGUSTA Gerüstbau UG <${process.env.MAIL_FROM}>`,
    to: input.to,
    subject: `Rechnung ${input.invoiceNo}`,
    html: `
      <p>Guten Tag,</p>
      <p>anbei erhalten Sie die Rechnung <strong>${input.invoiceNo}</strong>.</p>
      <p>PDF-Link: <a href="${input.pdfUrl}">${input.pdfUrl}</a></p>
      <p>Mit freundlichen Grüßen<br/>AUGUSTA Gerüstbau UG</p>
    `,
  });
}
