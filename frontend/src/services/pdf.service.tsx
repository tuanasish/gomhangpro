import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceData, formatCurrency, formatDate, formatTime, getCompanyInfo } from '../utils/invoice.utils';

/**
 * Remove Vietnamese diacritics (dấu) from text
 */
function removeVietnameseDiacritics(str: string): string {
  if (!str) return str;
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Times-Roman',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 10,
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
  },
  invoiceInfo: {
    textAlign: 'right',
    marginBottom: 15,
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customerInfo: {
    marginBottom: 15,
    fontSize: 10,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 'bold',
    padding: 8,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1 solid #e5e7eb',
    fontSize: 9,
  },
  tableCell: {
    padding: 2,
  },
  colStt: {
    width: '5%',
    textAlign: 'center',
  },
  colDescription: {
    width: '35%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '22.5%',
    textAlign: 'right',
  },
  colTotal: {
    width: '22.5%',
    textAlign: 'right',
  },
  summary: {
    marginTop: 10,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 10,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  divider: {
    borderBottom: '1 solid #000000',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
  },
});

/**
 * Generate invoice PDF using @react-pdf/renderer
 * This library has excellent Unicode support for Vietnamese characters
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  const company = getCompanyInfo();

  // Create PDF document
  const InvoiceDocument = (
    <Document>
      <Page size={'A4'} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.companyName}>{removeVietnameseDiacritics(company.name)}</Text>
              <Text style={styles.companyInfo}>{removeVietnameseDiacritics(company.address)}</Text>
              <Text style={styles.companyInfo}>{company.phone}</Text>
            </View>
            <Text style={styles.invoiceTitle}>{removeVietnameseDiacritics('HÓA ĐƠN BÁN HÀNG')}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>{removeVietnameseDiacritics('Ngay: ')}</Text>
            {formatDate(data.date)}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <Text style={styles.sectionTitle}>{removeVietnameseDiacritics('Thong tin khach hang:')}</Text>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>{removeVietnameseDiacritics('Ten: ')}</Text>
            {removeVietnameseDiacritics(data.customerName)}
          </Text>
          {data.customerPhone && (
            <Text>
              {'\n'}
              <Text style={{ fontWeight: 'bold' }}>SDT: </Text>
              {data.customerPhone}
            </Text>
          )}
          {data.counterName && (
            <Text>
              {'\n'}
              <Text style={{ fontWeight: 'bold' }}>{removeVietnameseDiacritics('Quay/Vi tri: ')}</Text>
              {removeVietnameseDiacritics(data.counterName)}
            </Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {data.simpleMode ? (
            // Chế độ đơn giản: STT, Quầy, Tổng tiền
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>STT</Text>
                <Text style={[styles.tableCell, { width: '40%' }]}>{removeVietnameseDiacritics('Quay')}</Text>
                <Text style={[styles.tableCell, { width: '50%', textAlign: 'right' }]}>{removeVietnameseDiacritics('Tong tien')}</Text>
              </View>
              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => {
                  const price = item.price || 0;
                  const counterName = item.counterName || item.description || 'N/A';
                  return (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>{index + 1}</Text>
                      <Text style={[styles.tableCell, { width: '40%' }]}>{removeVietnameseDiacritics(counterName)}</Text>
                      <Text style={[styles.tableCell, { width: '50%', textAlign: 'right' }]}>{formatCurrency(price)}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>1</Text>
                  <Text style={[styles.tableCell, { width: '40%' }]}>{removeVietnameseDiacritics(data.counterName || 'N/A')}</Text>
                  <Text style={[styles.tableCell, { width: '50%', textAlign: 'right' }]}>{formatCurrency(data.tongTienHoaDon)}</Text>
                </View>
              )}
            </>
          ) : (
            // Chế độ đầy đủ: có chi tiết
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.colStt]}>STT</Text>
                <Text style={[styles.tableCell, styles.colDescription]}>{removeVietnameseDiacritics('Mo ta')}</Text>
                <Text style={[styles.tableCell, styles.colQuantity]}>{removeVietnameseDiacritics('So luong')}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{removeVietnameseDiacritics('Don gia')}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{removeVietnameseDiacritics('Thanh tien')}</Text>
              </View>

              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => {
                  const quantity = item.quantity || 1;
                  const price = item.price || 0;
                  return (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.colStt]}>{index + 1}</Text>
                      <Text style={[styles.tableCell, styles.colDescription]}>{removeVietnameseDiacritics(item.description || '')}</Text>
                      <Text style={[styles.tableCell, styles.colQuantity]}>{quantity}</Text>
                      <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(price)}</Text>
                      <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(quantity * price)}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colStt]}>1</Text>
                  <Text style={[styles.tableCell, styles.colDescription]}>{removeVietnameseDiacritics('Dich vu gom hang')}</Text>
                  <Text style={[styles.tableCell, styles.colQuantity]}>1</Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(data.tongTienHoaDon)}</Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(data.tongTienHoaDon)}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Payment Summary */}
        {!data.simpleMode && (
          <View style={styles.summary}>
            <Text style={styles.sectionTitle}>{removeVietnameseDiacritics('Chi tiet thanh toan:')}</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{removeVietnameseDiacritics('Tien hang:')}</Text>
              <Text>{formatCurrency(data.tienHang)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{removeVietnameseDiacritics('Tien cong gom:')}</Text>
              <Text>{formatCurrency(data.tienCongGom)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{removeVietnameseDiacritics('Phi dong hang:')}</Text>
              <Text>{formatCurrency(data.phiDongHang)}</Text>
            </View>

            {data.tienHoaHong > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{removeVietnameseDiacritics('Tien hoa hong:')}</Text>
                <Text>{formatCurrency(data.tienHoaHong)}</Text>
              </View>
            )}

            {data.tienThem !== undefined && data.tienThem !== null && data.tienThem > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{removeVietnameseDiacritics(data.loaiTienThem || 'Tien them')}:</Text>
                <Text>{formatCurrency(data.tienThem)}</Text>
              </View>
            )}

            <View style={styles.divider} />
          </View>
        )}

        {/* Total Row - Always show */}
        <View style={styles.totalRow}>
          <Text>{removeVietnameseDiacritics('TONG TIEN:')}</Text>
          <Text>{formatCurrency(data.tongTienHoaDon)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{removeVietnameseDiacritics('Cam on quy khach da su dung dich vu!')}</Text>
          <Text>{'\n'}{removeVietnameseDiacritics('Hotline ho tro:')} {company.phone}</Text>
        </View>
      </Page>
    </Document>
  );

  // Generate PDF blob and download
  const blob = await pdf(InvoiceDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `HoaDon_${data.orderId.slice(-8)}_${formatDate(data.date).replace(/\//g, '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
