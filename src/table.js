// 表格生成/更新/行管理（核心逻辑）

import { resourceTypes, defaultResources, getResourceDisplayName, getResourceKey } from './resources.js';
import { getWorkingDays, checkDateConflicts } from './workday.js';
import { saveTableData, loadTableData } from './storage.js';
import { exportToExcel } from './export.js';
import flatpickr from 'flatpickr';

// 模块级状态变量
let languageManager;
let hasTableBeenGenerated = false;
let holidaysSet = new Set();
let workdaysSet = new Set();
let allWeeksDataGlobal = [];
let currentTableResources = [];

// DOM 元素引用
let projectYearInput;
let startMonthInput;
let projectDurationInput;
let holidaysPicker;
let workdaysPicker;
let generateTableBtn;
let addRowBtn;
let exportBtn;
let tableContainer;


/**
 * 收集当前表格数据用于保存
 */
function collectTableData() {
    return {
        resources: currentTableResources,
        year: projectYearInput.value,
        month: startMonthInput.value,
        duration: projectDurationInput.value,
        holidays: Array.from(holidaysSet),
        workdays: Array.from(workdaysSet)
    };
}

/**
 * 保存当前数据（收集并存储）
 */
function saveCurrentData() {
    saveTableData(collectTableData());
}

// --- 验证函数 ---

function validateProjectYear(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 2020 || value > 2030) {
        input.classList.add('invalid');
        input.classList.remove('valid');
    } else {
        input.classList.add('valid');
        input.classList.remove('invalid');
    }
}

function validateProjectDuration(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1 || value > 36) {
        input.classList.add('invalid');
        input.classList.remove('valid');
    } else {
        input.classList.add('valid');
        input.classList.remove('invalid');
    }
}

// --- 输入宽度调整 ---

function adjustInputWidth(inputElement, text) {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'nowrap';
    span.style.font = getComputedStyle(inputElement).font;
    span.textContent = text;
    document.body.appendChild(span);

    const padding = parseFloat(getComputedStyle(inputElement).paddingLeft) + parseFloat(getComputedStyle(inputElement).paddingRight);
    const border = parseFloat(getComputedStyle(inputElement).borderLeftWidth) + parseFloat(getComputedStyle(inputElement).borderRightWidth);
    const newWidth = span.offsetWidth + padding + border + 2;

    inputElement.style.width = `${newWidth}px`;
    document.body.removeChild(span);
}

// --- 通知功能 ---

function showConflictWarning(conflicts) {
    if (conflicts.length === 0) {
        const existingWarning = document.getElementById('date-conflict-warning');
        if (existingWarning) {
            existingWarning.style.display = 'none';
        }
        return;
    }

    const conflictDates = conflicts.join('、');
    const message = languageManager ?
        languageManager.getTranslation('alerts.dateConflict').replace('{dates}', conflictDates) :
        `检测到日期冲突: ${conflictDates} 同时存在于节假日和调休工作日中，请检查并修正！`;

    let warning = document.getElementById('date-conflict-warning');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'date-conflict-warning';
        warning.className = 'notification warning';
        document.querySelector('.date-picker-controls').before(warning);
    }

    warning.innerHTML = `
        <span class="notification-message">${message}</span>
        <span class="close-notification">&times;</span>
    `;
    warning.style.display = 'flex';

    const closeBtn = warning.querySelector('.close-notification');
    if (closeBtn) {
        closeBtn.onclick = function() {
            warning.style.display = 'none';
        };
    }

    setTimeout(() => {
        if (warning) warning.style.display = 'none';
    }, 5000);
}

function showRegenerateTableNotification() {
    const tableExists = tableContainer.querySelector('table');
    if (tableExists) {
        let notification = document.getElementById('regenerate-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'regenerate-notification';
            notification.className = 'notification';

            const closeBtn = document.createElement('span');
            closeBtn.className = 'close-notification';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = function () {
                notification.style.display = 'none';
            };
            notification.appendChild(closeBtn);

            tableContainer.parentNode.insertBefore(notification, tableContainer);
        }

        const message = languageManager ? languageManager.getTranslation('notifications.regenerateTable') : '日期已更新，请点击 <strong>生成/更新表格</strong> 按钮重新计算工作日！';
        notification.innerHTML = `<span class="notification-message">${message}</span>`;

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-notification';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = function () {
            notification.style.display = 'none';
        };
        notification.appendChild(closeBtn);

        notification.style.display = 'block';

        generateTableBtn.classList.add('highlight-button');

        setTimeout(() => {
            if (notification) notification.style.display = 'none';
            generateTableBtn.classList.remove('highlight-button');
        }, 5000);
    }
}

function showAdjustResourceNotification() {
    let notification = document.getElementById('adjust-resource-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'adjust-resource-notification';
        notification.className = 'notification';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-notification';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = function() {
            notification.style.display = 'none';
        };
        notification.appendChild(closeBtn);

        tableContainer.parentNode.insertBefore(notification, tableContainer);
    }

    const message = languageManager ? languageManager.getTranslation('notifications.adjustResource') : '已添加新的资源行，请根据实际需求调整 <strong>顾问资源类型</strong> 和 <strong>单价</strong>！';
    notification.innerHTML = `<span class="notification-message">${message}</span>`;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-notification';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function() {
        notification.style.display = 'none';
    };
    notification.appendChild(closeBtn);

    notification.style.display = 'block';

    setTimeout(() => {
        if (notification) notification.style.display = 'none';
    }, 4000);
}

// --- 表格核心逻辑 ---

function generateTable() {
    const year = parseInt(projectYearInput.value);
    const startMonth = parseInt(startMonthInput.value) - 1; // JS months are 0-indexed
    const duration = parseInt(projectDurationInput.value);

    const holidays = holidaysSet;
    const workdays = workdaysSet;

    // 验证项目年份
    if (isNaN(year) || year < 2020 || year > 2030) {
        alert(languageManager ?
            languageManager.getTranslation('alerts.invalidInput').replace('项目年份、启动月份和项目周期', '项目年份(2020-2030)') :
            "请输入有效的项目年份(2020-2030)！");
        projectYearInput.focus();
        validateProjectYear(projectYearInput);
        return;
    }

    // 验证项目周期
    if (isNaN(duration) || duration < 1 || duration > 36) {
        alert(languageManager ?
            languageManager.getTranslation('alerts.invalidInput').replace('项目年份、启动月份和项目周期', '项目周期(1-36个月)') :
            "请输入有效的项目周期(1-36个月)！");
        projectDurationInput.focus();
        validateProjectDuration(projectDurationInput);
        return;
    }

    // 验证启动月份
    if (isNaN(startMonth)) {
        alert(languageManager ?
            languageManager.getTranslation('alerts.invalidInput').replace('项目年份、启动月份和项目周期', '启动月份') :
            "请输入有效的启动月份！");
        startMonthInput.focus();
        return;
    }

    // Read current table data from DOM before regenerating
    currentTableResources = [];
    document.querySelectorAll('tbody tr:not(:last-child)').forEach(row => {
        const selectElement = row.querySelector('.resource-select');
        const customInput = row.querySelector('.custom-resource-input');
        const manDayInputs = row.querySelectorAll('.personday-input');
        const unitPriceInput = row.querySelector('.unit-price-input');
        const remarksInput = row.querySelector('.remarks-input');

        const resource = {
            type: selectElement ? selectElement.value : 'fico',
            customType: customInput ? customInput.value : '',
            manDays: Array.from(manDayInputs).map(input => input.value),
            unitPrice: unitPriceInput ? unitPriceInput.value : '',
            remarks: remarksInput ? remarksInput.value : '',
            isCustomVisible: customInput ? customInput.style.display === 'block' : false
        };

        if (resource.isCustomVisible) {
            resource.type = 'custom';
        }
        currentTableResources.push(resource);
    });

    // If no resources are loaded or present, initialize with default
    if (currentTableResources.length === 0) {
        currentTableResources = defaultResources.map(r => ({ ...r, manDays: [] }));
    }

    let tableHTML = '<table border="1"><thead>';
    let weekHeaders = '';
    let totalWeeks = 0;
    const allWeeksData = [];

    const projectStartDate = new Date(year, startMonth, 1);
    const projectEndDate = new Date(year, startMonth + duration, 0);

    let currentWeekStart = new Date(projectStartDate);
    const dayOfWeek = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    while (currentWeekStart <= projectEndDate) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

        const effectiveStart = new Date(Math.max(projectStartDate.getTime(), currentWeekStart.getTime()));
        const effectiveEnd = new Date(Math.min(projectEndDate.getTime(), currentWeekEnd.getTime()));

        if (effectiveStart <= effectiveEnd) {
            const workingDays = getWorkingDays(effectiveStart, effectiveEnd, holidays, workdays);

            allWeeksData.push({
                week: allWeeksData.length + 1,
                workingDays: workingDays,
                displayRange: `${effectiveStart.getMonth() + 1}/${effectiveStart.getDate()}&#x200B; - &#x200B;${effectiveEnd.getMonth() + 1}/${effectiveEnd.getDate()}`
            });
            totalWeeks++;
        }

        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    allWeeksDataGlobal = allWeeksData;

    // Update manDays for existing resources based on new week data
    currentTableResources.forEach(resource => {
        resource.manDays = allWeeksDataGlobal.map(week => week.workingDays);
    });

    // Generate Week Headers
    allWeeksData.forEach(weekInfo => {
        const weekPrefix = languageManager ? languageManager.getTranslation('weekPrefix') : 'W';
        const daysText = languageManager ? languageManager.getTranslation('days') : '天';
        weekHeaders += `<th scope="col" class="weekly-header">${weekPrefix}${weekInfo.week}<br>(${weekInfo.displayRange})<br>${weekInfo.workingDays}${daysText}</th>`;
    });

    const calculationHeaders = languageManager ?
        `<th scope="col" rowspan="2">${languageManager.getTranslation('subtotal')}</th><th scope="col" rowspan="2">${languageManager.getTranslation('unitPrice')}</th><th scope="col" rowspan="2">${languageManager.getTranslation('totalPrice')}</th><th scope="col" rowspan="2">${languageManager.getTranslation('remarks')}</th>` :
        '<th scope="col" rowspan="2">小计 (人天)</th><th scope="col" rowspan="2">单价</th><th scope="col" rowspan="2">总价</th><th scope="col" rowspan="2">备注</th>';

    const consultantHeader = languageManager ? languageManager.getTranslation('consultantResource') : '顾问资源';
    tableHTML += `<tr><th scope="col" rowspan="2">${consultantHeader}</th>${weekHeaders}${calculationHeaders}</tr>`;
    tableHTML += `</thead><tbody>`;

    currentTableResources.forEach((resource, rowIndex) => {
        tableHTML += generateResourceRow(rowIndex, resource.type, totalWeeks, allWeeksDataGlobal, resource);
    });

    const grandTotalText = languageManager ? languageManager.getTranslation('grandTotal') : '总计';
    tableHTML += `<tr><td class="sticky-total-cell"><strong>${grandTotalText}</strong></td>`;
    for (let j = 0; j < totalWeeks; j++) {
        tableHTML += `<td class="grand-total-week-personday" id="grand-total-week-${j}">0</td>`;
    }
    tableHTML += `<td class="grand-subtotal-personday" id="grand-subtotal-personday-total">0</td>`;
    tableHTML += `<td></td>`;
    tableHTML += `<td class="grand-total-price" id="grand-total-price-total">0</td>`;
    tableHTML += `<td><input type="text" class="remarks-input" data-row="total"></td>`;
    tableHTML += '</tr></tbody></table>';

    tableContainer.innerHTML = tableHTML;
    setupEventListeners();
    updateTotals();

    hasTableBeenGenerated = true;
}

function generateResourceRow(rowIndex, initialResourceKey, totalWeeks, allWeeksData = null, resourceData = null) {
    let rowHTML = `<tr data-row-index="${rowIndex}">`;

    const customPlaceholder = languageManager ? languageManager.getTranslation('customResourcePlaceholder') : '输入顾问类型';
    const currentLanguage = languageManager ? languageManager.currentLanguage : 'zh';

    let resourceOptionsHTML = '';
    resourceTypes.forEach(resource => {
        const displayName = getResourceDisplayName(resource.key, currentLanguage);
        const isSelected = initialResourceKey === resource.key ? 'selected' : '';
        resourceOptionsHTML += `<option value="${resource.key}" ${isSelected}>${displayName}</option>`;
    });

    rowHTML += `<td class="phase-bar">
        <button class="delete-row-btn" data-row="${rowIndex}">-</button>
        <select class="resource-select" data-row="${rowIndex}" style="display: ${resourceData && resourceData.isCustomVisible ? 'none' : 'block'};">
            ${resourceOptionsHTML}
        </select>
        <input type="text" class="custom-resource-input" placeholder="${customPlaceholder}" data-row="${rowIndex}" style="display: ${resourceData && resourceData.isCustomVisible ? 'block' : 'none'};" value="${resourceData ? resourceData.customType : ''}">
    </td>`;

    for (let j = 0; j < totalWeeks; j++) {
        let manDayValue = '0';
        if (resourceData && resourceData.manDays && resourceData.manDays[j] !== undefined) {
            manDayValue = resourceData.manDays[j];
        } else if (allWeeksData && allWeeksData[j]) {
            manDayValue = allWeeksData[j].workingDays;
        }
        rowHTML += `<td><input type="number" class="personday-input" min="0" step="0.1" value="${manDayValue}" data-row="${rowIndex}" data-week="${j}"></td>`;
    }

    rowHTML += `<td class="subtotal" id="subtotal-${rowIndex}">0</td>`;
    rowHTML += `<td><input type="number" class="unit-price-input" value="${resourceData ? resourceData.unitPrice : '3000'}" min="0" data-row="${rowIndex}"></td>`;
    rowHTML += `<td class="total-price" id="total-price-${rowIndex}">0</td>`;
    rowHTML += `<td><input type="text" class="remarks-input" data-row="${rowIndex}" value="${resourceData ? resourceData.remarks : ''}"></td>`;
    rowHTML += '</tr>';
    return rowHTML;
}

function addResourceRow() {
    const tableBody = tableContainer.querySelector('tbody');
    if (!tableBody) {
        alert(languageManager ? languageManager.getTranslation('alerts.noTable') : '请先生成表格！');
        return;
    }
    const existingRows = tableBody.querySelectorAll('tr').length;
    const newRowIndex = currentTableResources.length;
    const totalWeeks = allWeeksDataGlobal.length;

    const newResource = {
        type: 'fico',
        customType: '',
        manDays: allWeeksDataGlobal.map(week => week.workingDays),
        unitPrice: '3000',
        remarks: '',
        isCustomVisible: false
    };
    currentTableResources.push(newResource);

    const newRowHTML = generateResourceRow(newRowIndex, newResource.type, totalWeeks, allWeeksDataGlobal, newResource);
    const totalRow = tableBody.querySelector('tr:last-child');
    totalRow.insertAdjacentHTML('beforebegin', newRowHTML);
    setupRowEventListeners(tableBody.querySelector(`tr[data-row-index="${newRowIndex}"]`));
    updateTotals();
    saveCurrentData();

    showAdjustResourceNotification();
}

function updateTotals() {
    let grandTotalPersonDay = 0;
    let grandTotalPrice = 0;
    const resourceRows = tableContainer.querySelectorAll('tbody tr:not(:last-child)');

    const firstResourceRow = resourceRows[0];
    const numberOfWeeks = firstResourceRow ? firstResourceRow.querySelectorAll('.personday-input').length : 0;
    const weeklyTotals = Array(numberOfWeeks).fill(0);

    resourceRows.forEach(row => {
        const rowIndex = row.dataset.rowIndex;
        let rowSubtotal = 0;
        row.querySelectorAll('.personday-input').forEach((input, weekIndex) => {
            const manDayValue = parseFloat(input.value) || 0;
            rowSubtotal += manDayValue;
            weeklyTotals[weekIndex] += manDayValue;
        });
        const unitPrice = parseFloat(row.querySelector('.unit-price-input').value) || 0;
        const rowTotalPrice = rowSubtotal * unitPrice;
        row.querySelector(`#subtotal-${rowIndex}`).textContent = rowSubtotal.toFixed(1);
        row.querySelector(`#total-price-${rowIndex}`).textContent = rowTotalPrice.toFixed(2);
        grandTotalPersonDay += rowSubtotal;
        grandTotalPrice += rowTotalPrice;
    });

    weeklyTotals.forEach((total, index) => {
        const weekTotalCell = document.getElementById(`grand-total-week-${index}`);
        if (weekTotalCell) {
            weekTotalCell.textContent = total.toFixed(1);
        }
    });

    const grandSubtotalPersonDayCell = document.getElementById('grand-subtotal-personday-total');
    if (grandSubtotalPersonDayCell) {
        grandSubtotalPersonDayCell.textContent = grandTotalPersonDay.toFixed(1);
    }
    const grandTotalPriceCell = document.getElementById('grand-total-price-total');
    if (grandTotalPriceCell) {
        grandTotalPriceCell.textContent = grandTotalPrice.toFixed(2);
    }
}

function handleResourceChange(event) {
    const selectElement = event.target;
    const selectedValue = selectElement.value;
    const rowIndex = selectElement.dataset.row;
    const customInput = tableContainer.querySelector(`.custom-resource-input[data-row="${rowIndex}"]`);
    if (customInput) {
        if (selectedValue === 'custom') {
            customInput.style.display = 'block';
            selectElement.style.display = 'none';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            selectElement.style.display = 'block';
            customInput.value = '';
        }
    }
}

function setupEventListeners() {
    tableContainer.addEventListener('input', (event) => {
        const target = event.target;
        if (target.classList.contains('personday-input') || target.classList.contains('unit-price-input') || target.classList.contains('remarks-input') || target.classList.contains('custom-resource-input')) {
            updateTotals();
            saveCurrentData();
        }
    });
    tableContainer.addEventListener('change', (event) => {
        if (event.target.classList.contains('resource-select')) {
            handleResourceChange(event);
            saveCurrentData();
        }
    });
    tableContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-row-btn')) {
            const rowIndex = event.target.dataset.row;
            const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
            if (row) {
                row.remove();
                updateTotals();
                saveCurrentData();
            }
        }
    });
}

function setupRowEventListeners(rowElement) {
    // Event delegation handles this now.
}

// --- 数据加载 ---

function applyLoadedData(tableData) {
    projectYearInput.value = tableData.year || new Date().getFullYear();
    startMonthInput.value = tableData.month || new Date().getMonth() + 1;
    projectDurationInput.value = tableData.duration || 1;

    holidaysSet.clear();
    (tableData.holidays || []).forEach(date => holidaysSet.add(date));
    workdaysSet.clear();
    (tableData.workdays || []).forEach(date => workdaysSet.add(date));

    if (tableData.resources) {
        currentTableResources = tableData.resources.map(resource => {
            const isValidKey = resourceTypes.some(r => r.key === resource.type);
            if (!isValidKey) {
                resource.type = getResourceKey(resource.type);
            }
            return resource;
        });
    } else {
        currentTableResources = [];
    }

    // Set Flatpickr dates from loaded data
    holidaysPicker._flatpickr.setDate(Array.from(holidaysSet), true);
    workdaysPicker._flatpickr.setDate(Array.from(workdaysSet), true);
}

function applyDefaultData() {
    const currentDate = new Date();
    projectYearInput.value = currentDate.getFullYear();
    startMonthInput.value = currentDate.getMonth() + 1;
    projectDurationInput.value = 1;
    currentTableResources = defaultResources.map(r => ({ ...r, manDays: [] }));
}

// --- Flatpickr 初始化 ---

function initFlatpickr() {
    flatpickr(holidaysPicker, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            holidaysSet.clear();
            selectedDates.forEach(date => holidaysSet.add(flatpickr.formatDate(date, "Y-m-d")));
            saveCurrentData();
            adjustInputWidth(holidaysPicker, dateStr);

            const conflicts = checkDateConflicts(holidaysSet, workdaysSet);
            showConflictWarning(conflicts);

            if (conflicts.length === 0 && hasTableBeenGenerated) {
                generateTable();
            } else if (conflicts.length === 0) {
                showRegenerateTableNotification();
            }
        }
    });

    flatpickr(workdaysPicker, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            workdaysSet.clear();
            selectedDates.forEach(date => workdaysSet.add(flatpickr.formatDate(date, "Y-m-d")));
            saveCurrentData();
            adjustInputWidth(workdaysPicker, dateStr);

            const conflicts = checkDateConflicts(holidaysSet, workdaysSet);
            showConflictWarning(conflicts);

            if (conflicts.length === 0 && hasTableBeenGenerated) {
                generateTable();
            } else if (conflicts.length === 0) {
                showRegenerateTableNotification();
            }
        }
    });
}

// --- 初始化入口 ---

/**
 * 初始化表格模块
 * @param {Object} langManager - LanguageManager 实例
 */
export function initTable(langManager) {
    languageManager = langManager;

    // 获取 DOM 元素引用
    projectYearInput = document.getElementById('projectYear');
    startMonthInput = document.getElementById('startMonth');
    projectDurationInput = document.getElementById('projectDuration');
    holidaysPicker = document.getElementById('holidays-picker');
    workdaysPicker = document.getElementById('workdays-picker');
    generateTableBtn = document.getElementById('generateTableBtn');
    addRowBtn = document.getElementById('addRowBtn');
    exportBtn = document.getElementById('exportBtn');
    tableContainer = document.getElementById('tableContainer');


    // 设置 LanguageManager 的表格重新生成回调
    languageManager.onTableRegenerate = () => {
        if (hasTableBeenGenerated) {
            const tableExists = document.querySelector('#tableContainer table');
            if (tableExists) {
                generateTable();
            }
        }
    };

    // 初始化 Flatpickr
    initFlatpickr();

    // 绑定按钮事件
    generateTableBtn.addEventListener('click', () => {
        generateTable();
        saveCurrentData();

        const notification = document.getElementById('regenerate-notification');
        if (notification) {
            notification.style.display = 'none';
        }
        generateTableBtn.classList.remove('highlight-button');
    });

    addRowBtn.addEventListener('click', addResourceRow);

    exportBtn.addEventListener('click', () => {
        exportToExcel({
            tableContainer,
            languageManager,
            allWeeksDataGlobal,
            holidaysSet,
            workdaysSet
        });
    });

    // 添加输入验证事件监听器
    projectYearInput.addEventListener('input', () => validateProjectYear(projectYearInput));
    projectDurationInput.addEventListener('input', () => validateProjectDuration(projectDurationInput));
    projectYearInput.addEventListener('blur', () => validateProjectYear(projectYearInput));
    projectDurationInput.addEventListener('blur', () => validateProjectDuration(projectDurationInput));

    // Auto-save on main control changes
    [projectYearInput, startMonthInput, projectDurationInput].forEach(input => {
        input.addEventListener('change', saveCurrentData);
    });

    // 加载保存的数据
    const savedData = loadTableData();
    if (savedData) {
        applyLoadedData(savedData);
    } else {
        applyDefaultData();
    }
}
