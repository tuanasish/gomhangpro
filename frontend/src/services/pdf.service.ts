import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData, formatCurrency, formatDate, formatTime, getCompanyInfo } from '../utils/invoice.utils';

/**
 * Generate invoice PDF
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const company = getCompanyInfo();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, margin, 28);
  doc.text(company.phone, margin, 33);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HÓA ĐƠN BÁN HÀNG', pageWidth - margin, 20, {
    align: 'right',
  });

  // Invoice Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 45;

  doc.text(`Mã đơn: ${data.orderId}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Ngày: ${formatDate(data.date)} ${formatTime(data.time)}`, pageWidth - margin, yPos, { align: 'right' });

  // Customer Info
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Thông tin khách hàng:', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tên: ${data.customerName}`, margin, yPos);
  yPos += 6;

  if (data.customerPhone) {
    doc.text(`SĐT: ${data.customerPhone}`, margin, yPos);
    yPos += 6;
  }

  if (data.counterName) {
    doc.text(`Quầy/Vị trí: ${data.counterName}`, margin, yPos);
    yPos += 6;
  }

  // Items Table
  yPos += 5;
  const tableData = [
    [
      'STT',
      'Mô tả',
      'Số lượng',
      'Đơn giá',
      'Thành tiền',
    ],
  ];

  // Add invoice items or summary
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      tableData.push([
        String(index + 1),
        item.description,
        String(quantity),
        formatCurrency(price),
        formatCurrency(quantity * price),
      ]);
    });
  } else {
    // If no items, show summary line
    tableData.push([
      '1',
      'Dịch vụ gom hàng',
      '1',
      formatCurrency(data.tongTienHoaDon),
      formatCurrency(data.tongTienHoaDon),
    ]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Primary color
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as any).lastAutoTable.finalY || yPos + 30;

  // Summary Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let summaryY = finalY + 10;

  doc.text('Chi tiết thanh toán:', margin, summaryY);
  summaryY += 8;

  doc.text('Tiền hàng:', margin, summaryY);
  doc.text(formatCurrency(data.tienHang), pageWidth - margin, summaryY, { align: 'right' });
  summaryY += 6;

  doc.text('Tiền công gom:', margin, summaryY);
  doc.text(formatCurrency(data.tienCongGom), pageWidth - margin, summaryY, { align: 'right' });
  summaryY += 6;

  doc.text('Phí đóng hàng:', margin, summaryY);
  doc.text(formatCurrency(data.phiDongHang), pageWidth - margin, summaryY, { align: 'right' });
  summaryY += 6;

  if (data.tienHoaHong > 0) {
    doc.text('Tiền hoa hồng:', margin, summaryY);
    doc.text(formatCurrency(data.tienHoaHong), pageWidth - margin, summaryY, { align: 'right' });
    summaryY += 6;
  }

  // Total
  summaryY += 3;
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, summaryY, pageWidth - margin, summaryY);
  summaryY += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TỔNG TIỀN:', margin, summaryY);
  doc.text(formatCurrency(data.tongTienHoaDon), pageWidth - margin, summaryY, { align: 'right' });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Cảm ơn quý khách đã sử dụng dịch vụ!', margin, pageHeight - 15, {
    align: 'center',
    maxWidth: pageWidth - 2 * margin,
  });
  doc.text('Hotline hỗ trợ: 1900 xxxx', margin, pageHeight - 10, {
    align: 'center',
    maxWidth: pageWidth - 2 * margin,
  });

  // Save PDF
  const fileName = `HoaDon_${data.orderId}_${data.date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

