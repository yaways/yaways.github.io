// Excel 导出功能

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getResourceDisplayName } from './resources.js';

/**
 * 导出表格为 Excel 文件
 * @param {Object} params - 参数对象
 * @param {HTMLElement} params.tableContainer - 表格容器元素
 * @param {Object} params.languageManager - 语言管理器实例
 * @param {Array} params.allWeeksDataGlobal - 全局周数据
 * @param {Set<string>} params.holidaysSet - 法定节假日集合
 * @param {Set<string>} params.workdaysSet - 调休工作日集合
 */
export async function exportToExcel({ tableContainer, languageManager, allWeeksDataGlobal, holidaysSet, workdaysSet }) {
    const table = tableContainer.querySelector('table');
    if (!table) {
        alert(languageManager ? languageManager.getTranslation('alerts.noTable') : '请先生成表格！');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheetName = languageManager ? languageManager.getTranslation('excel.worksheetName') : '人天费用评估';
    const worksheet = workbook.addWorksheet(worksheetName);

    // --- 1. Define Reusable Styles ---
    const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const headerStyle = {
        font: { bold: true, color: { argb: 'FF000000' } }, // Black font for light background
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2F0D5' } }, // Light Green
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: thinBorder
    };
    const totalStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: thinBorder
    };
    const cellStyle = {
        border: thinBorder,
        alignment: { vertical: 'middle' } // Base style for all cells
    };

    // --- 2. Build Header Rows ---
    const headerRow1 = worksheet.getRow(1);
    const headerRow2 = worksheet.getRow(2);
    headerRow1.height = 20;
    headerRow2.height = 40;

    const consultantHeader = languageManager ? languageManager.getTranslation('consultantResource') : '顾问资源';
    const headerTexts1 = [consultantHeader];
    const headerTexts2 = [null];
    allWeeksDataGlobal.forEach(weekInfo => {
        const weekPrefix = languageManager ? languageManager.getTranslation('weekPrefix') : 'W';
        const daysText = languageManager ? languageManager.getTranslation('days') : '天';
        headerTexts1.push(`${weekPrefix}${weekInfo.week}`);
        const displayRange = weekInfo.displayRange.replace(/&#x200B;/g, '');
        headerTexts2.push(`(${displayRange})
${weekInfo.workingDays}${daysText}`);
    });

    const subtotalText = languageManager ? languageManager.getTranslation('subtotal') : '小计 (人天)';
    const unitPriceText = languageManager ? languageManager.getTranslation('unitPrice') : '单价';
    const totalPriceText = languageManager ? languageManager.getTranslation('totalPrice') : '总价';
    const remarksText = languageManager ? languageManager.getTranslation('remarks') : '备注';
    const calcHeaders = [subtotalText, unitPriceText, totalPriceText, remarksText];
    calcHeaders.forEach(text => {
        headerTexts1.push(text);
        headerTexts2.push(null);
    });

    headerTexts1.forEach((text, i) => {
        const cell1 = headerRow1.getCell(i + 1);
        cell1.value = text;
        cell1.style = headerStyle;
        const cell2 = headerRow2.getCell(i + 1);
        cell2.value = headerTexts2[i];
        cell2.style = headerStyle;
    });

    // --- 3. Apply Merges ---
    worksheet.mergeCells('A1:A2');
    const calcHeaderStartIndex = 1 + allWeeksDataGlobal.length;
    calcHeaders.forEach((_, i) => {
        const colLetter = worksheet.getColumn(calcHeaderStartIndex + i + 1).letter;
        worksheet.mergeCells(`${colLetter}1:${colLetter}2`);
    });

    // --- 4. Build Body Rows ---
    const bodyRows = table.querySelectorAll('tbody tr');
    const currentLanguage = languageManager ? languageManager.currentLanguage : 'zh';
    bodyRows.forEach((row, rowIndex) => {
        const currentRow = worksheet.getRow(rowIndex + 3);
        const grandTotalText = languageManager ? languageManager.getTranslation('grandTotal') : '总计';
        const isTotalRow = row.querySelector('strong') && row.querySelector('strong').innerText === grandTotalText;

        row.querySelectorAll('td').forEach((cell, cellIndex) => {
            const currentCell = currentRow.getCell(cellIndex + 1);
            let value;

            // Extract value from input or text
            const input = cell.querySelector('input, select');
            if (cellIndex === 0) { // Special handling for the first column (resource name)
                const resourceSelect = cell.querySelector('.resource-select');
                const customInput = cell.querySelector('.custom-resource-input');
                if (customInput && customInput.style.display === 'block') {
                    value = customInput.value.trim();
                } else if (resourceSelect) {
                    // Convert resource key to display name
                    value = getResourceDisplayName(resourceSelect.value, currentLanguage);
                } else {
                    value = cell.innerText.trim(); // For "Grand Total" row
                }
            } else if (input) {
                if (input.tagName === 'SELECT') {
                    value = input.value;
                } else if (input.style.display !== 'none') {
                    value = input.value;
                } else {
                    value = cell.innerText.trim();
                }
            } else {
                value = cell.innerText.trim();
            }

            // Convert to number if possible
            currentCell.value = !isNaN(parseFloat(value)) ? parseFloat(value) : value;

            // Apply styles
            if (isTotalRow) {
                currentCell.style = totalStyle;
            } else {
                currentCell.style = cellStyle;
            }

            // Center-align numbers
            if (typeof currentCell.value === 'number') {
                currentCell.alignment = { ...currentCell.alignment, horizontal: 'center' };
            }
        });
    });

    // --- 5. Adjust Column Widths and Final Touches ---
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 0;
            maxLength = Math.max(maxLength, cellLength);
        });
        column.width = Math.max(12, maxLength + 3);
    });

    // --- 6. Save File ---
    // Add holidays and workdays as remarks
    const lastRow = worksheet.lastRow.number;
    const remarksRowIndex = lastRow + 3; // Two empty rows + 1 for the new content

    const holidaysText = Array.from(holidaysSet).sort().join('、');
    const workdaysText = Array.from(workdaysSet).sort().join('、');

    // Add general remarks header
    const generalRemarkText = languageManager ? languageManager.getTranslation('excel.generalRemark') : '备注：';
    const generalRemarksCell = worksheet.getCell(`A${remarksRowIndex - 1}`);
    generalRemarksCell.value = generalRemarkText;
    generalRemarksCell.font = { bold: true };
    generalRemarksCell.alignment = { wrapText: true };
    worksheet.mergeCells(`A${remarksRowIndex - 1}:F${remarksRowIndex - 1}`);

    if (holidaysText) {
        const holidaysRemarkText = languageManager ? languageManager.getTranslation('excel.holidaysRemark') : '法定节假日: ';
        const holidaysRemarkCell = worksheet.getCell(`A${remarksRowIndex}`);
        holidaysRemarkCell.value = `${holidaysRemarkText}${holidaysText}`;
        holidaysRemarkCell.font = { bold: true };
        holidaysRemarkCell.alignment = { wrapText: true };
        worksheet.mergeCells(`A${remarksRowIndex}:F${remarksRowIndex}`); // Merge across several columns
    }

    if (workdaysText) {
        const workdaysRemarkText = languageManager ? languageManager.getTranslation('excel.workdaysRemark') : '调休工作日: ';
        const workdaysRemarkCell = worksheet.getCell(`A${remarksRowIndex + (holidaysText ? 1 : 0)}`);
        workdaysRemarkCell.value = `${workdaysRemarkText}${workdaysText}`;
        workdaysRemarkCell.font = { bold: true };
        workdaysRemarkCell.alignment = { wrapText: true };
        worksheet.mergeCells(`A${remarksRowIndex + (holidaysText ? 1 : 0)}:F${remarksRowIndex + (holidaysText ? 1 : 0)}`); // Merge across several columns
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = languageManager ? languageManager.getTranslation('excel.filename') : '人天费用评估.xlsx';
    saveAs(blob, filename);
}
