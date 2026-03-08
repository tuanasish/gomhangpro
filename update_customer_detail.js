const fs = require('fs');
const path = 'e:\\gom-hang\\gomhangpro-new\\gomhangpro-app\\src\\screens\\manager\\CustomerDetailScreen.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
    `import * as Print from 'expo-print';\nimport * as Sharing from 'expo-sharing';\nimport * as FileSystem from 'expo-file-system/legacy';`,
    `import * as Sharing from 'expo-sharing';\nimport ViewShot from 'react-native-view-shot';`
);
content = content.replace(
    `import React, { useState, useEffect } from 'react';`,
    `import React, { useState, useEffect, useRef } from 'react';`
);

// 2. State
content = content.replace(
    `const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);`,
    `const [isExportingImage, setIsExportingImage] = useState(false);\n    const invoiceRef = useRef();`
);

// 3. Remove generateBatchHTMLString, handlePreviewAllOrders, handleExportAllOrders
const startIndex = content.indexOf('const generateBatchHTMLString =');
const endIndex = content.indexOf('const renderDateSelector =');

if (startIndex !== -1 && endIndex !== -1) {
    const handleExportImageCode = `    const handleExportImage = async () => {
        if (!customer || orders.length === 0) return;
        try {
            setIsExportingImage(true);
            
            // Wait a bit for layout to settle if needed
            await new Promise(resolve => setTimeout(resolve, 500));

            if (invoiceRef.current) {
                const uri = await invoiceRef.current.capture();
                if (Platform.OS === 'web') {
                    const link = document.createElement('a');
                    link.download = \`tong_hop_\${customer.name}.jpg\`;
                    link.href = uri;
                    link.click();
                } else {
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(uri, {
                            mimeType: 'image/jpeg',
                            dialogTitle: 'Chia sẻ hóa đơn tổng hợp',
                            UTI: 'public.jpeg'
                        });
                    } else {
                        Alert.alert('Thành công', 'Đã lưu ảnh hóa đơn.');
                    }
                }
            }
        } catch (error) {
            console.error('Error exporting image:', error);
            Alert.alert('Lỗi', 'Không thể tạo ảnh hóa đơn. Vui lòng thử lại.');
        } finally {
            setIsExportingImage(false);
        }
    };

`;

    content = content.substring(0, startIndex) + handleExportImageCode + content.substring(endIndex);
}

// 4. Update the export buttons in render
const buttonsRegex = /<View style=\{styles\.exportButtonsRow\}>[\s\S]*?<\/View>\s*<\/View>\s*\)}/m;
const buttonsReplacement = `<View style={styles.exportButtonsRow}>
                                            <TouchableOpacity
                                                style={[styles.exportButton, { flex: 1, flexDirection: 'row', justifyContent: 'center' }, isExportingImage && { opacity: 0.6 }]}
                                                onPress={handleExportImage}
                                                disabled={isExportingImage}
                                            >
                                                {isExportingImage ? (
                                                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                                                ) : (
                                                    <Ionicons name="share-social-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                                )}
                                                <Text style={styles.exportButtonText}>
                                                    {isExportingImage ? 'Đang tạo ảnh...' : 'Lưu / Chia sẻ ảnh'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}`;

content = content.replace(buttonsRegex, buttonsReplacement);

// 5. Add hidden ViewShot
const hiddenViewShot = `
            {/* Hidden Receipt for Image Export */}
            {(customer && orders.length > 0) && (
                <View style={{ position: 'absolute', top: -10000, left: -10000 }} collapsable={false}>
                    <ViewShot ref={invoiceRef} options={{ format: 'jpg', quality: 0.9 }}>
                        <View style={{ width: 600, backgroundColor: '#fff', padding: 24 }} collapsable={false}>
                            {/* Header */}
                            <View style={{ alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#2563eb' }}>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>Gom Hàng Ninh Hiệp</Text>
                                <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 2 }}>Ninh Hiệp, Gia Lâm, Hà Nội</Text>
                                <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 8 }}>0922238683</Text>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 8 }}>TỔNG HỢP HÓA ĐƠN</Text>
                            </View>

                            {/* Meta Info */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                                <View style={{ backgroundColor: '#f0f4ff', padding: 12, borderRadius: 8, flex: 1, marginRight: 16 }}>
                                    <Text style={{ fontSize: 15, color: '#111827' }}>
                                        <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>Khách hàng:</Text> {customer.name}
                                    </Text>
                                    {customer.phone && (
                                        <Text style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>
                                            <Text style={{ fontWeight: 'bold' }}>SĐT:</Text> {customer.phone}
                                        </Text>
                                    )}
                                </View>
                                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14, color: '#111827', marginBottom: 4 }}>
                                        <Text style={{ fontWeight: 'bold' }}>Ngày:</Text> {formatDate(selectedDate)}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#111827' }}>
                                        <Text style={{ fontWeight: 'bold' }}>Số đơn:</Text> {orders.length}
                                    </Text>
                                </View>
                            </View>

                            {/* Table Header */}
                            <View style={{ flexDirection: 'row', backgroundColor: '#f0f4ff', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 2, borderBottomColor: '#2563eb' }}>
                                <Text style={{ flex: 0.5, fontWeight: 'bold', fontSize: 13, color: '#111827', textAlign: 'center' }}>STT</Text>
                                <Text style={{ flex: 1.5, fontWeight: 'bold', fontSize: 13, color: '#111827' }}>Quầy</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 13, color: '#111827', textAlign: 'center' }}>Giờ</Text>
                                <Text style={{ flex: 1.5, fontWeight: 'bold', fontSize: 13, color: '#111827', textAlign: 'right' }}>Tiền hàng</Text>
                                <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 13, color: '#111827', textAlign: 'right' }}>Công gom</Text>
                                <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 13, color: '#111827', textAlign: 'right' }}>Thuế</Text>
                                <Text style={{ flex: 1.5, fontWeight: 'bold', fontSize: 13, color: '#111827', textAlign: 'right' }}>Tổng</Text>
                            </View>

                            {/* Table Rows */}
                            {orders.map((order, index) => {
                                const orderDate = new Date(order.createdAt);
                                const timeStr = \`\${orderDate.getHours().toString().padStart(2, '0')}:\${orderDate.getMinutes().toString().padStart(2, '0')}\`;
                                const tienHangGop = (order.tienHang || 0) + (order.tienHoaHong || 0);

                                return (
                                    <View key={index} style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                                        <Text style={{ flex: 0.5, fontSize: 13, color: '#111827', textAlign: 'center' }}>{index + 1}</Text>
                                        <Text style={{ flex: 1.5, fontSize: 13, color: '#111827' }}>{order.counterName || 'N/A'}</Text>
                                        <Text style={{ flex: 1, fontSize: 13, color: '#111827', textAlign: 'center' }}>{timeStr}</Text>
                                        <Text style={{ flex: 1.5, fontSize: 13, color: '#111827', textAlign: 'right' }}>{tienHangGop.toLocaleString('vi-VN')}đ</Text>
                                        <Text style={{ flex: 1.2, fontSize: 13, color: '#111827', textAlign: 'right' }}>{(order.tienCongGom || 0).toLocaleString('vi-VN')}đ</Text>
                                        <Text style={{ flex: 1.2, fontSize: 13, color: '#111827', textAlign: 'right' }}>{(order.phiDongHang || 0).toLocaleString('vi-VN')}đ</Text>
                                        <Text style={{ flex: 1.5, fontSize: 13, fontWeight: '600', color: '#2563eb', textAlign: 'right' }}>{(order.tongTienHoaDon || 0).toLocaleString('vi-VN')}đ</Text>
                                    </View>
                                );
                            })}

                            {/* Table Footer / Summary */}
                            <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 2, borderTopColor: '#2563eb', marginTop: 8 }}>
                                <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 14, color: '#111827' }}>TỔNG CỘNG</Text>
                                <Text style={{ flex: 1, fontSize: 14, color: '#4b5563', textAlign: 'center' }}>{orders.length} đơn</Text>
                                <Text style={{ flex: 1.5, fontWeight: 'bold', fontSize: 14, color: '#111827', textAlign: 'right' }}>{orders.reduce((s, o) => s + ((o.tienHang || 0) + (o.tienHoaHong || 0)), 0).toLocaleString('vi-VN')}đ</Text>
                                <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 14, color: '#111827', textAlign: 'right' }}>{orders.reduce((s, o) => s + (o.tienCongGom || 0), 0).toLocaleString('vi-VN')}đ</Text>
                                <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 14, color: '#111827', textAlign: 'right' }}>{orders.reduce((s, o) => s + (o.phiDongHang || 0), 0).toLocaleString('vi-VN')}đ</Text>
                                <Text style={{ flex: 1.5, fontWeight: 'bold', fontSize: 14, color: '#2563eb', textAlign: 'right' }}>{orders.reduce((s, o) => s + (o.tongTienHoaDon || 0), 0).toLocaleString('vi-VN')}đ</Text>
                            </View>

                            <View style={{ alignItems: 'flex-end', marginTop: 16, marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb' }}>
                                    TỔNG TIỀN HÓA ĐƠN: {orders.reduce((s, o) => s + (o.tongTienHoaDon || 0), 0).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            {/* Extra Info */}
                            <View style={{ alignItems: 'flex-end' }}>
                                <View style={{ width: 320, backgroundColor: '#f8fafc', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 14, color: '#4b5563' }}>Đóng gửi:</Text>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{Number(dongGui || 0).toLocaleString('vi-VN')}đ</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 14, color: '#4b5563' }}>Số dư của khách:</Text>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{Number(soDuKhach || 0).toLocaleString('vi-VN')}đ</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 14, color: '#4b5563' }}>Nợ của khách:</Text>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{Number(noKhach || 0).toLocaleString('vi-VN')}đ</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#cbd5e1', borderTopStyle: 'dashed' }}>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#111827' }}>Tổng khách thanh toán:</Text>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#dc2626' }}>{Number(tongThanhToan || 0).toLocaleString('vi-VN')}đ</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{ marginTop: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16 }}>
                                <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Cảm ơn quý khách đã sử dụng dịch vụ!</Text>
                                <Text style={{ fontSize: 13, color: '#6b7280' }}>Hotline hỗ trợ: 0922238683</Text>
                            </View>
                        </View>
                    </ViewShot>
                </View>
            )}
`;

content = content.replace('        </View>\\n    );\\n}\\n\\nconst styles', hiddenViewShot + '\\n        </View>\\n    );\\n}\\n\\nconst styles');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing!');
