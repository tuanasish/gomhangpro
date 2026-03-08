const fs = require('fs');
const path = 'e:\\\\gom-hang\\\\gomhangpro-new\\\\gomhangpro-app\\\\src\\\\screens\\\\worker\\\\OrderDetailScreen.js';
let content = fs.readFileSync(path, 'utf8');

// remove imports
content = content.replace(/import \* as Print from 'expo-print';\r?\n/, '');
content = content.replace(/import \* as FileSystem from 'expo-file-system\/legacy';\r?\n/, '');

// remove state
content = content.replace(/[ \t]*const \[isGeneratingPDF, setIsGeneratingPDF\] = useState\(false\);\r?\n/, '');

// remove generateHTMLString and handlePreviewPDF, handleExportPDF
content = content.replace(/[ \t]*const generateHTMLString = \(\) => \{[\s\S]*?    const handleExportImage = async \(\) => \{/, '    const handleExportImage = async () => {');

// remove button Xem trước
content = content.replace(/[ \t]*<Button\r?\n\s*title="Xem trước \/ In"[\s\S]*?style=\{styles\.actionButton\}\r?\n\s*\/>\r?\n/, '');

// change title and icon
content = content.replace(/title="Chia sẻ ảnh hóa đơn"/, 'title="Lưu / Chia sẻ ảnh"');
content = content.replace(/variant="outline"\r?\n\s*icon={<Ionicons name="share-social-outline" size=\{20\} color=\{colors\.primary\} \/>}/, 'icon={<Ionicons name="share-social-outline" size={20} color="white" />}');

// remove disabled dependencies on isGeneratingPDF
content = content.replace(/disabled=\{isGeneratingPDF \|\| isExportingImage \|\| isSaving \|\| !order\}/g, 'disabled={isExportingImage || isSaving || !order}');
content = content.replace(/disabled=\{isExportingImage \|\| isGeneratingPDF\}/g, 'disabled={isExportingImage}');

fs.writeFileSync(path, content);
console.log('Update Script Completed Successfully');
