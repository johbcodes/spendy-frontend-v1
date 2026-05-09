export function exportToCSV(data: Array<Record<string, unknown>>, filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [headers.join(','), ...data.map(row => headers.map(header => {
    const value = row[header];
    const str = value === undefined || value === null ? '' : String(value);
    return str.includes(',') ? `"${str}"` : str;
  }).join(','))].join('\n');
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}
export function exportToPDF(data: Array<Record<string, unknown>>, filename: string, title: string) {
  // Mock PDF export - in production, use jsPDF or similar
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#093b40;color:white;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h1>' + title + '</h1>');
  printWindow.document.write('<table>');
    if (data.length > 0) {
    const headers = Object.keys(data[0]);
    printWindow.document.write('<tr>');
    headers.forEach(header => {
      printWindow.document.write('<th>' + header + '</th>');
    });
    printWindow.document.write('</tr>');
    data.forEach(row => {
      printWindow.document.write('<tr>');
      headers.forEach(header => {
        const v = row[header];
        printWindow.document.write('<td>' + (v === undefined || v === null ? '' : String(v)) + '</td>');
      });
      printWindow.document.write('</tr>');
    });
  }
  printWindow.document.write('</table></body></html>');
  printWindow.document.close();
  printWindow.print();
}
export function exportToExcel(data: Array<Record<string, unknown>>, filename: string) {
  // Mock Excel export - in production, use xlsx library
  exportToCSV(data, filename);
}