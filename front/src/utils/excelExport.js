import ExcelJS from 'exceljs';

// Helper to fetch and convert image to standard base64 PNG (handles webp, jpg, png, base64, bypassing CORS via backend proxy)
const fetchAndConvertImage = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }
    
    // Resolve the correct backend base URL matching the environment
    const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
    const proxyUrl = `${apiBase}/proxy-image?url=${encodeURIComponent(url)}`;

    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (err) {
        console.error("Canvas draw error during product image conversion:", err);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("Failed to load product image via proxy:", proxyUrl);
      resolve(null);
    };
    img.src = proxyUrl;
  });
};

// Generates the white Express Mebel brand logo dynamically from raw SVG
const getSvgLogoBase64 = () => {
  return new Promise((resolve) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 455 130">
      <polygon points="55,8 150,8 133,24 38,24" fill="#008B8B"/>
      <polygon points="37,34 150,34 133,50 20,50" fill="#008B8B"/>
      <polygon points="19,60 150,60 133,76 2,76" fill="#008B8B"/>
      <text x="163" y="72" font-family="sans-serif" font-weight="900" font-style="italic" font-size="60" fill="#ffffff">express</text>
      <text x="178" y="118" font-family="sans-serif" font-weight="900" font-style="italic" font-size="50" fill="#ffffff">mebel</text>
    </svg>`;
    
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 455;
        canvas.height = 130;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
};

/**
 * Exports a commercial proposal (Tijorat Taklifi / KP) to a beautifully formatted Excel file with styles & images.
 * @param {Object} kp - The commercial proposal object.
 */
export const exportProposalToExcel = async (kp) => {
  if (!kp) return;

  const customerName = kp.customer ? `${kp.customer.firstName} ${kp.customer.lastName}` : '—';
  const customerPhone = kp.customer?.phone || '—';
  const customerAddress = kp.customer 
    ? `${kp.customer.address || '—'}${kp.customer.houseNumber ? `, ${kp.customer.houseNumber}-uy` : ''}${kp.customer.apartmentNumber ? `, ${kp.customer.apartmentNumber}-xonadon` : ''}` 
    : '—';
  
  const managerName = kp.managerName || 'Menejer';
  const managerPhone = kp.managerPhone || '+998 90 000 00 00';

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tijorat Taklifi');

  // Ensure grid lines are visible for standard spreadsheet navigation
  worksheet.views = [{ showGridLines: true }];

  // Set precise column widths matching content hierarchy
  worksheet.columns = [
    { key: 'index', width: 6 },
    { key: 'image', width: 16 },
    { key: 'name_desc', width: 45 },
    { key: 'qty', width: 10 },
    { key: 'unit', width: 15 },
    { key: 'price', width: 18 },
    { key: 'total', width: 22 }
  ];

  // Global clean styling structures
  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
  };

  const styleCell = (cell, options = {}) => {
    if (options.fill) cell.fill = options.fill;
    if (options.font) cell.font = options.font;
    if (options.alignment) cell.alignment = options.alignment;
    if (options.border) cell.border = options.border;
    if (options.numFormat) cell.numFormat = options.numFormat;
  };

  // --- Row 1: Spacing ---
  worksheet.addRow([]);
  worksheet.getRow(1).height = 15;

  // --- Row 2: Premium Brand Banner ---
  worksheet.mergeCells('A2:G2');
  const brandRow = worksheet.getRow(2);
  brandRow.height = 42;
  const brandCell = worksheet.getCell('A2');
  brandCell.value = "TIJORAT TAKLIFI      ";
  styleCell(brandCell, {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A1A' }
    },
    font: {
      name: 'Segoe UI',
      size: 13,
      bold: true,
      color: { argb: 'FFFBBF24' } // Golden text for badge
    },
    alignment: { vertical: 'middle', horizontal: 'right' }
  });

  // Embed the brand white logo on the left of merged header
  try {
    const logoBase64 = await getSvgLogoBase64();
    if (logoBase64) {
      const logoImageId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      worksheet.addImage(logoImageId, {
        tl: { col: 0, row: 1, xColOffset: 12, yRowOffset: 5 }, // Col A, Row 2
        ext: { width: 130, height: 37 },
        editAs: 'oneCell'
      });
    }
  } catch (err) {
    console.error("Error embedding brand logo inside Excel:", err);
  }

  // --- Row 3: Subtitle Banner ---
  worksheet.mergeCells('A3:G3');
  const titleRow = worksheet.getRow(3);
  titleRow.height = 24;
  const titleCell = worksheet.getCell('A3');
  titleCell.value = "   LOYIHA ASOSIDAGI MAXSUS MEBELLAR / CUSTOM MADE FURNITURE";
  styleCell(titleCell, {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC9A83C' }
    },
    font: {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF1A1A1A' }
    },
    alignment: { vertical: 'middle', horizontal: 'left' }
  });

  // --- Row 4: Spacing ---
  worksheet.addRow([]);
  worksheet.getRow(4).height = 12;

  // --- Row 5: Document Meta ---
  const metaRow = worksheet.addRow([]);
  metaRow.height = 20;
  
  worksheet.getCell('A5').value = "Hujjat raqami:";
  styleCell(worksheet.getCell('A5'), { font: { name: 'Segoe UI', bold: true, color: { argb: 'FF888888' } } });
  
  worksheet.getCell('B5').value = `#${kp.kpNumber}`;
  styleCell(worksheet.getCell('B5'), { font: { name: 'Segoe UI', bold: true, color: { argb: 'FFC9A83C' } } });

  worksheet.getCell('F5').value = "Sana:";
  styleCell(worksheet.getCell('F5'), { font: { name: 'Segoe UI', bold: true, color: { argb: 'FF888888' } }, alignment: { horizontal: 'right' } });
  
  worksheet.getCell('G5').value = new Date(kp.createdAt).toLocaleDateString('uz-UZ');
  styleCell(worksheet.getCell('G5'), { font: { name: 'Segoe UI', bold: true }, alignment: { horizontal: 'right' } });

  // --- Row 6: Spacing ---
  worksheet.addRow([]);
  worksheet.getRow(6).height = 12;

  // --- Row 7: Info Section Headers ---
  worksheet.mergeCells('A7:C7');
  const custHeader = worksheet.getCell('A7');
  custHeader.value = "BUYURTMACHI MA'LUMOTLARI";
  styleCell(custHeader, { font: { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFC9A83C' } } });

  worksheet.mergeCells('E7:G7');
  const mgrHeader = worksheet.getCell('E7');
  mgrHeader.value = "TAKLIF TAYYORLADI";
  styleCell(mgrHeader, { font: { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFC9A83C' } } });

  // Info Cards styling
  const cardBorder = {
    top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
    left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
    right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
  };
  const cardFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFAF8F5' }
  };

  // Row 8
  const r8 = worksheet.addRow([]);
  r8.height = 20;
  worksheet.getCell('A8').value = "Buyurtmachi:";
  worksheet.getCell('B8').value = customerName;
  worksheet.getCell('E8').value = "Mas'ul Menejer:";
  worksheet.getCell('F8').value = managerName;
  styleCell(worksheet.getCell('A8'), { font: { name: 'Segoe UI', bold: true, size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('B8'), { font: { name: 'Segoe UI', size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('C8'), { fill: cardFill });
  styleCell(worksheet.getCell('E8'), { font: { name: 'Segoe UI', bold: true, size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('F8'), { font: { name: 'Segoe UI', size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('G8'), { fill: cardFill });

  // Row 9
  const r9 = worksheet.addRow([]);
  r9.height = 20;
  worksheet.getCell('A9').value = "Telefon raqami:";
  worksheet.getCell('B9').value = customerPhone;
  worksheet.getCell('E9').value = "Telefon raqami:";
  worksheet.getCell('F9').value = managerPhone;
  styleCell(worksheet.getCell('A9'), { font: { name: 'Segoe UI', bold: true, size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('B9'), { font: { name: 'Segoe UI', size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('C9'), { fill: cardFill });
  styleCell(worksheet.getCell('E9'), { font: { name: 'Segoe UI', bold: true, size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('F9'), { font: { name: 'Segoe UI', size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('G9'), { fill: cardFill });

  // Row 10
  const r10 = worksheet.addRow([]);
  r10.height = 20;
  worksheet.getCell('A10').value = "Manzil:";
  worksheet.getCell('B10').value = customerAddress;
  worksheet.getCell('E10').value = "Kompaniya:";
  worksheet.getCell('F10').value = "Express Mebel";
  styleCell(worksheet.getCell('A10'), { font: { name: 'Segoe UI', bold: true, size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('B10'), { font: { name: 'Segoe UI', size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('C10'), { fill: cardFill });
  styleCell(worksheet.getCell('E10'), { font: { name: 'Segoe UI', bold: true, size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('F10'), { font: { name: 'Segoe UI', size: 9 }, fill: cardFill });
  styleCell(worksheet.getCell('G10'), { fill: cardFill });

  // Apply card borders
  for (let c = 1; c <= 3; c++) {
    worksheet.getCell(8, c).border = { top: cardBorder.top, left: c === 1 ? cardBorder.left : null, right: c === 3 ? cardBorder.right : null };
    worksheet.getCell(9, c).border = { left: c === 1 ? cardBorder.left : null, right: c === 3 ? cardBorder.right : null };
    worksheet.getCell(10, c).border = { bottom: cardBorder.bottom, left: c === 1 ? cardBorder.left : null, right: c === 3 ? cardBorder.right : null };
  }
  for (let c = 5; c <= 7; c++) {
    worksheet.getCell(8, c).border = { top: cardBorder.top, left: c === 5 ? cardBorder.left : null, right: c === 7 ? cardBorder.right : null };
    worksheet.getCell(9, c).border = { left: c === 5 ? cardBorder.left : null, right: c === 7 ? cardBorder.right : null };
    worksheet.getCell(10, c).border = { bottom: cardBorder.bottom, left: c === 5 ? cardBorder.left : null, right: c === 7 ? cardBorder.right : null };
  }

  // --- Row 11: Spacing ---
  worksheet.addRow([]);
  worksheet.getRow(11).height = 15;

  // --- Row 12: Products Header ---
  worksheet.mergeCells('A12:G12');
  const tableTitle = worksheet.getCell('A12');
  tableTitle.value = "MAHSULOTLAR VA XIZMATLAR RO'YXATI";
  styleCell(tableTitle, { font: { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFC9A83C' } } });

  // --- Row 13: Table Headers ---
  const headers = ["T/r", "Surat", "Mahsulot Nomi / Tavsif", "Soni", "O'lchov Birligi", "Narxi", "Umumiy Summa"];
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 32;

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1A1A' }
  };
  const headerFont = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: 'FFFBBF24' }
  };

  headers.forEach((h, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    styleCell(cell, {
      fill: headerFill,
      font: headerFont,
      alignment: {
        vertical: 'middle',
        horizontal: (colIdx === 2) ? 'left' : (colIdx >= 5) ? 'right' : 'center',
        wrapText: true
      },
      border: thinBorder
    });
  });

  // Populate data rows and embed images
  const items = kp.items || [];
  const validItems = items.filter(item => item.name);
  
  let currentRowNum = 14;

  for (let idx = 0; idx < validItems.length; idx++) {
    const item = validItems[idx];
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const total = qty * price;

    const dataRow = worksheet.addRow([
      idx + 1,
      "", // Surat (Image container)
      "", // Mahsulot Nomi / Tavsif (RichText container)
      qty,
      item.unit || 'dona',
      price,
      total
    ]);
    dataRow.height = 80;

    const zebraFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: (idx % 2 === 0) ? 'FFFFFFFF' : 'FFFAF8F5' }
    };

    // Styling Col 1: T/r
    styleCell(dataRow.getCell(1), {
      font: { name: 'Segoe UI', bold: true, color: { argb: 'FF888888' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: zebraFill,
      border: thinBorder
    });

    // Styling Col 2: Surat background and border
    styleCell(dataRow.getCell(2), {
      fill: zebraFill,
      border: thinBorder
    });

    // Styling Col 3: RichText for Name and Description
    const textCell = dataRow.getCell(3);
    textCell.value = {
      richText: [
        { text: item.name + '\n', font: { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF1A1A1A' } } },
        { text: item.desc || 'Tavsif kiritilmagan', font: { name: 'Segoe UI', size: 9, color: { argb: 'FF888888' } } }
      ]
    };
    styleCell(textCell, {
      alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
      fill: zebraFill,
      border: thinBorder
    });

    // Styling Col 4: Soni
    styleCell(dataRow.getCell(4), {
      font: { name: 'Segoe UI', bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: zebraFill,
      border: thinBorder
    });

    // Styling Col 5: O'lchov Birligi
    styleCell(dataRow.getCell(5), {
      font: { name: 'Segoe UI' },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: zebraFill,
      border: thinBorder
    });

    // Styling Col 6: Narxi (Currency format)
    styleCell(dataRow.getCell(6), {
      font: { name: 'Segoe UI' },
      numFormat: '#,##0" so\'m"',
      alignment: { vertical: 'middle', horizontal: 'right' },
      fill: zebraFill,
      border: thinBorder
    });

    // Styling Col 7: Umumiy Summa (Currency format)
    styleCell(dataRow.getCell(7), {
      font: { name: 'Segoe UI', bold: true },
      numFormat: '#,##0" so\'m"',
      alignment: { vertical: 'middle', horizontal: 'right' },
      fill: zebraFill,
      border: thinBorder
    });

    // Embed Product Image asynchronously with CORS & Cache-busting
    if (item.image) {
      try {
        const base64Data = await fetchAndConvertImage(item.image);
        if (base64Data) {
          const imageId = workbook.addImage({
            base64: base64Data,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 1, row: currentRowNum - 1, xColOffset: 24, yRowOffset: 18 },
            ext: { width: 70, height: 70 },
            editAs: 'oneCell'
          });
        }
      } catch (err) {
        console.error("Error embedding product image into cell:", err);
      }
    }

    currentRowNum++;
  }

  // Spacing row after table
  worksheet.addRow([]);
  worksheet.getRow(currentRowNum).height = 15;
  currentRowNum++;

  // --- Summary Rows ---
  // Row: Topshirish muddati & Mahsulotlar summasi
  worksheet.mergeCells(`A${currentRowNum}:C${currentRowNum}`);
  const deadlineHeader = worksheet.getCell(`A${currentRowNum}`);
  deadlineHeader.value = "Topshirish muddati";
  styleCell(deadlineHeader, { font: { name: 'Segoe UI', bold: true, size: 9, color: { argb: 'FFC9A83C' } } });

  worksheet.getCell(`F${currentRowNum}`).value = "Mahsulotlar summasi:";
  styleCell(worksheet.getCell(`F${currentRowNum}`), { font: { name: 'Segoe UI', size: 10, color: { argb: 'FF888888' } }, alignment: { horizontal: 'right' } });
  worksheet.getCell(`G${currentRowNum}`).value = kp.itemsTotal || 0;
  styleCell(worksheet.getCell(`G${currentRowNum}`), { font: { name: 'Segoe UI', bold: true, size: 10 }, numFormat: '#,##0" so\'m"', alignment: { horizontal: 'right' } });
  
  currentRowNum++;

  // Row: Deadline Days & Xizmatlar summasi
  worksheet.mergeCells(`A${currentRowNum}:C${currentRowNum}`);
  const deadlineDays = worksheet.getCell(`A${currentRowNum}`);
  deadlineDays.value = `${kp.deadline || '—'} ish kuni`;
  styleCell(deadlineDays, { font: { name: 'Segoe UI', bold: true, size: 16, color: { argb: 'FFC9A83C' } } });

  worksheet.getCell(`F${currentRowNum}`).value = "Xizmatlar summasi:";
  styleCell(worksheet.getCell(`F${currentRowNum}`), { font: { name: 'Segoe UI', size: 10, color: { argb: 'FF888888' } }, alignment: { horizontal: 'right' } });
  worksheet.getCell(`G${currentRowNum}`).value = kp.servicesTotal || 0;
  styleCell(worksheet.getCell(`G${currentRowNum}`), { font: { name: 'Segoe UI', bold: true, size: 10 }, numFormat: '#,##0" so\'m"', alignment: { horizontal: 'right' } });

  currentRowNum++;

  // Row: Deadline Basis Note & Divider line
  worksheet.mergeCells(`A${currentRowNum}:C${currentRowNum}`);
  const deadlineBasis = worksheet.getCell(`A${currentRowNum}`);
  deadlineBasis.value = `* ${kp.deadlineBasis || "Muddat o'lcham olishdan boshlanadi"}`;
  styleCell(deadlineBasis, { font: { name: 'Segoe UI', italic: true, size: 9, color: { argb: 'FFBBBBBB' } } });

  worksheet.getCell(`F${currentRowNum}`).border = { bottom: { style: 'thin', color: { argb: 'FF444444' } } };
  worksheet.getCell(`G${currentRowNum}`).border = { bottom: { style: 'thin', color: { argb: 'FF444444' } } };

  currentRowNum++;

  // Spacer row before Grand Total
  worksheet.addRow([]);
  worksheet.getRow(currentRowNum).height = 10;
  currentRowNum++;

  // --- Row: Grand Total Premium Block ---
  worksheet.mergeCells(`F${currentRowNum}:G${currentRowNum}`);
  const grandTotalCell = worksheet.getCell(`F${currentRowNum}`);
  grandTotalCell.value = {
    richText: [
      { text: "JAMI SUMMA:  ", font: { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF888888' } } },
      { text: `${(kp.grandTotal || 0).toLocaleString()} so'm`, font: { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFBBF24' } } }
    ]
  };
  styleCell(grandTotalCell, {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A1A' }
    },
    alignment: { vertical: 'middle', horizontal: 'center' }
  });
  worksheet.getRow(currentRowNum).height = 36;

  // Trigger Excel file buffer download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Tijorat_Taklifi_${kp.kpNumber}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};
