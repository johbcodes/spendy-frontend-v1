import { Invoice } from '../types';

export function generateInvoicePDF(
  invoice: Invoice,
  companyLogo?: string,
  companyName?: string,
  companyPhone?: string,
  companyOfficialEmail?: string,
  companyOfficeAddress?: string,
  spendyPaybillNumber?: string,
  spendyAccountNumber?: string
) {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups for this website to download the PDF');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${invoice.documentType || 'Invoice'} ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logo {
      max-height: 60px;
      max-width: 150px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 32px;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .invoice-number {
      font-size: 16px;
      color: #6b7280;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }
    .party h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 10px;
    }
    .party p {
      margin: 3px 0;
    }
    .party-name {
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
    }
    .invoice-details {
      text-align: right;
    }
    .detail-row {
      margin: 5px 0;
    }
    .detail-label {
      color: #6b7280;
      font-size: 12px;
    }
    .detail-value {
      font-weight: 600;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    thead {
      background-color: #f3f4f6;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }
    .text-right { text-align: right; }
    .totals {
      margin-left: auto;
      width: 350px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-row.border-top {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
    .total-row.grand-total {
      border-top: 2px solid #3b82f6;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
      color: #3b82f6;
    }
    .notes-section {
      margin-top: 40px;
      padding: 20px;
      background-color: #f9fafb;
      border-left: 3px solid #3b82f6;
    }
    .notes-section h4 {
      font-size: 14px;
      margin-bottom: 10px;
      color: #1f2937;
    }
    .notes-section p {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.6;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
    .status-paid { background-color: #d1fae5; color: #065f46; }
    .status-sent { background-color: #fef3c7; color: #92400e; }
    .status-draft { background-color: #e5e7eb; color: #1f2937; }
    .status-overdue { background-color: #fee2e2; color: #991b1b; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div>
        ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" class="logo" />` : ''}
        ${companyName ? `<div class="company-name">${companyName}</div>` : ''}
        ${companyPhone || companyOfficialEmail || companyOfficeAddress ? `
          <div style="margin-top: 10px; font-size: 12px; color: #6b7280; line-height: 1.6;">
            ${companyPhone ? `<div>Tel: ${companyPhone}</div>` : ''}
            ${companyOfficialEmail ? `<div>Email: ${companyOfficialEmail}</div>` : ''}
            ${companyOfficeAddress ? `<div>Address: ${companyOfficeAddress}</div>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
    <div class="invoice-title">
      <h1>${(invoice.documentType || 'INVOICE').toUpperCase()}</h1>
      <div class="invoice-number">#${invoice.invoiceNumber}</div>
      <div class="status-badge status-${invoice.status.toLowerCase().replace(' ', '-')}">${invoice.status}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To:</h3>
      <p class="party-name">${invoice.clientName}</p>
      <p>${invoice.clientEmail}</p>
      <p>${invoice.clientPhone}</p>
      ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
    </div>
    <div class="invoice-details">
      <div class="detail-row">
        <span class="detail-label">Issue Date:</span>
        <div class="detail-value">${new Date(invoice.issueDate).toLocaleDateString()}</div>
      </div>
      <div class="detail-row">
        <span class="detail-label">Due Date:</span>
        <div class="detail-value">${new Date(invoice.dueDate).toLocaleDateString()}</div>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Terms:</span>
        <div class="detail-value">${invoice.paymentTerms}</div>
      </div>
      ${invoice.eventName ? `
      <div class="detail-row">
        <span class="detail-label">Event:</span>
        <div class="detail-value">${invoice.eventName}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item/Product</th>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lineItems.map(item => `
        <tr>
          <td style="font-weight: 600;">${item.itemName}</td>
          <td style="color: #6b7280;">${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${invoice.currency} ${item.unitPrice.toLocaleString()}</td>
          <td class="text-right">${invoice.currency} ${item.amount.toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>${invoice.currency} ${invoice.subtotal.toLocaleString()}</span>
    </div>
    ${invoice.discount > 0 ? `
    <div class="total-row">
      <span>Discount:</span>
      <span style="color: #059669;">- ${invoice.currency} ${invoice.discount.toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="total-row">
      <span>Tax (${invoice.taxRate}%):</span>
      <span>${invoice.currency} ${invoice.taxAmount.toLocaleString()}</span>
    </div>
    <div class="total-row grand-total">
      <span>Total:</span>
      <span>${invoice.currency} ${invoice.total.toLocaleString()}</span>
    </div>
    <div class="total-row border-top">
      <span>Amount Paid:</span>
      <span style="color: #059669;">${invoice.currency} ${(invoice.amountPaid || 0).toLocaleString()}</span>
    </div>
    <div class="total-row">
      <span style="font-weight: 600;">Balance Due:</span>
      <span style="font-weight: 600; color: #d97706;">${invoice.currency} ${(invoice.balance || 0).toLocaleString()}</span>
    </div>
  </div>

  ${invoice.notes ? `
  <div class="notes-section">
    <h4>Notes</h4>
    <p>${invoice.notes}</p>
  </div>
  ` : ''}

  ${invoice.terms ? `
  <div class="notes-section" style="margin-top: 15px;">
    <h4>Terms & Conditions</h4>
    <p>${invoice.terms}</p>
  </div>
  ` : ''}

  <!-- Payment Details Section -->
  ${spendyPaybillNumber && spendyAccountNumber ? `
  <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
    <h4 style="margin-bottom: 15px; font-size: 16px; color: white;">Payment Details</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div>
        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Paybill Number</p>
        <p style="font-size: 20px; font-weight: 700; letter-spacing: 2px;">${spendyPaybillNumber}</p>
      </div>
      <div>
        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Account Number</p>
        <p style="font-size: 20px; font-weight: 700; letter-spacing: 2px;">${spendyAccountNumber}</p>
      </div>
    </div>
    <p style="margin-top: 15px; font-size: 12px; opacity: 0.9;">
      💡 Send payment via M-Pesa Paybill or from your Spendy account
    </p>
  </div>
  ` : ''}

  <!-- Footer -->
  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
    <p style="font-size: 12px; color: #6b7280; margin: 0;">
      <a href="https://www.spendy.africa" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 500;">www.spendy.africa</a> - Spend well with Spendy
    </p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; margin-right: 10px;">
      Print / Save as PDF
    </button>
    <button onclick="window.close()" style="padding: 10px 24px; background: #6b7280; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
      Close
    </button>
  </div>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
