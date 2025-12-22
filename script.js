console.log('script.js loaded');

// 语言配置对象
const translations = {
    zh: {
        // HTML元素
        pageTitle: "人天费用评估工具",
        mainTitle: "人天费用评估工具",
        projectYear: "项目年份:",
        startMonth: "项目启动月份:",
        projectDuration: "项目周期 (月):",
        generateTable: "生成/更新表格",
        addRow: "添加资源行",
        exportExcel: "导出为 Excel",
        holidays: "法定节假日:",
        workdays: "调休工作日:",
        holidaysPlaceholder: "点击选择节假日",
        workdaysPlaceholder: "点击选择调休工作日",
        months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

        // 表格相关
        consultantResource: "顾问资源",
        subtotal: "小计 (人天)",
        unitPrice: "单价",
        totalPrice: "总价",
        remarks: "备注",
        grandTotal: "总计",
        weekPrefix: "W",
        days: "天",

        // 顾问类型
        resources: {
            "FICO顾问": "FICO顾问",
            "PP顾问": "PP顾问",
            "MM顾问": "MM顾问",
            "SD顾问": "SD顾问",
            "HR顾问": "HR顾问",
            "ABAP顾问": "ABAP顾问",
            "BASIS顾问": "BASIS顾问",
            "自定义": "自定义"
        },
        customResourcePlaceholder: "输入顾问类型",

        // 提示信息
        alerts: {
            invalidInput: "请输入有效的项目年份、启动月份和项目周期！",
            noTable: "请先生成表格！",
            dateConflict: "检测到日期冲突: {dates} 同时存在于节假日和调休工作日中，请检查并修正！"
        },
        notifications: {
            regenerateTable: "日期已更新，请点击 <strong>生成/更新表格</strong> 按钮重新计算工作日！",
            adjustResource: "已添加新的资源行，请根据实际需求调整 <strong>顾问资源类型</strong> 和 <strong>单价</strong>！"
        },

        // Excel导出
        excel: {
            worksheetName: "人天费用评估",
            holidaysRemark: "法定节假日: ",
            workdaysRemark: "调休工作日: ",
            generalRemark: "备注：",
            filename: "人天费用评估.xlsx"
        }
    },
    en: {
        // HTML元素
        pageTitle: "Man-Day Cost Assessment Tool",
        mainTitle: "Man-Day Cost Assessment Tool",
        projectYear: "Project Year:",
        startMonth: "Start Month:",
        projectDuration: "Duration (months):",
        generateTable: "Generate/Update Table",
        addRow: "Add Resource Row",
        exportExcel: "Export to Excel",
        holidays: "Legal Holidays:",
        workdays: "Adjusted Workdays:",
        holidaysPlaceholder: "Click to select holidays",
        workdaysPlaceholder: "Click to select adjusted workdays",
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

        // 表格相关
        consultantResource: "Consultant Resources",
        subtotal: "Subtotal (Man-Days)",
        unitPrice: "Unit Price",
        totalPrice: "Total Price",
        remarks: "Remarks",
        grandTotal: "Grand Total",
        weekPrefix: "W",
        days: "days",

        // 顾问类型
        resources: {
            "FICO顾问": "FICO Consultant",
            "PP顾问": "PP Consultant",
            "MM顾问": "MM Consultant",
            "SD顾问": "SD Consultant",
            "HR顾问": "HR Consultant",
            "ABAP顾问": "ABAP Consultant",
            "BASIS顾问": "BASIS Consultant",
            "自定义": "Custom"
        },
        customResourcePlaceholder: "Enter consultant type",

        // 提示信息
        alerts: {
            invalidInput: "Please enter valid project year, start month, and duration!",
            noTable: "Please generate the table first!",
            dateConflict: "Date conflict detected: {dates} exists in both holidays and adjusted workdays. Please check and correct!"
        },
        notifications: {
            regenerateTable: "Dates updated, please click <strong>Generate/Update Table</strong> button to recalculate working days!",
            adjustResource: "New resource row added, please adjust <strong>consultant type</strong> and <strong>unit price</strong> according to actual needs!"
        },

        // Excel导出
        excel: {
            worksheetName: "Man-Day Cost Assessment",
            holidaysRemark: "Legal Holidays: ",
            workdaysRemark: "Adjusted Workdays: ",
            generalRemark: "Remarks:",
            filename: "Man-Day_Cost_Assessment.xlsx"
        }
    }
};

// 语言管理器类
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = translations;
        this.init();
    }

    init() {
        this.bindEvents();
        this.applyLanguage(this.currentLanguage);
    }

    bindEvents() {
        const langToggleBtn = document.getElementById('language-toggle-btn');
        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', () => this.toggleLanguage());
        }
    }

    toggleLanguage() {
        const newLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        this.applyLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
        this.currentLanguage = newLanguage;
    }

    applyLanguage(language) {
        document.documentElement.setAttribute('data-language', language);
        document.documentElement.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en-US');
        this.updatePageTitle(language);
        this.updateMainTitle(language);
        this.updateFormLabels(language);
        this.updateButtons(language);
        this.updateDatePickers(language);
        this.updateMonthOptions(language);

        // 重新生成表格以应用新的语言设置
        if (hasTableBeenGenerated && window.generateTable && typeof window.generateTable === 'function') {
            const tableExists = document.querySelector('#tableContainer table');
            if (tableExists) {
                // 更新languageManager的当前语言，确保generateTable使用正确的语言
                if (languageManager) {
                    languageManager.currentLanguage = language;
                }
                window.generateTable();
            }
        }
    }

    updatePageTitle(language) {
        document.title = this.translations[language].pageTitle;
    }

    updateMainTitle(language) {
        const h1 = document.querySelector('h1');
        if (h1) h1.textContent = this.translations[language].mainTitle;
    }

    updateFormLabels(language) {
        const labels = {
            'projectYear': this.translations[language].projectYear,
            'startMonth': this.translations[language].startMonth,
            'projectDuration': this.translations[language].projectDuration,
            'holidays-picker': this.translations[language].holidays,
            'workdays-picker': this.translations[language].workdays
        };

        Object.keys(labels).forEach(id => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = labels[id];
        });
    }

    updateButtons(language) {
        const buttons = {
            'generateTableBtn': this.translations[language].generateTable,
            'addRowBtn': this.translations[language].addRow,
            'exportBtn': this.translations[language].exportExcel
        };

        Object.keys(buttons).forEach(id => {
            const button = document.getElementById(id);
            if (button) button.textContent = buttons[id];
        });
    }

    updateDatePickers(language) {
        const holidaysPicker = document.getElementById('holidays-picker');
        const workdaysPicker = document.getElementById('workdays-picker');

        if (holidaysPicker) holidaysPicker.placeholder = this.translations[language].holidaysPlaceholder;
        if (workdaysPicker) workdaysPicker.placeholder = this.translations[language].workdaysPlaceholder;
    }

    updateMonthOptions(language) {
        const startMonth = document.getElementById('startMonth');
        if (startMonth) {
            const options = startMonth.querySelectorAll('option');
            options.forEach((option, index) => {
                if (this.translations[language].months[index]) {
                    option.textContent = this.translations[language].months[index];
                }
            });
        }
    }

    // 获取当前语言的翻译文本
    getTranslation(key) {
        const keys = key.split('.');
        let result = this.translations[this.currentLanguage];
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key; // 如果找不到翻译，返回原始key
            }
        }
        return result;
    }
}

// 全局语言管理器实例
let languageManager;

// 表格生成状态标记
let hasTableBeenGenerated = false;

// --- State for selected dates ---
let holidaysSet = new Set();
let workdaysSet = new Set();
let allWeeksDataGlobal = []; // Store week data globally
let currentTableResources = []; // Global variable to store current table resources

// 检查日期冲突的函数
function checkDateConflicts() {
    const conflicts = [];
    holidaysSet.forEach(holiday => {
        if (workdaysSet.has(holiday)) {
            conflicts.push(holiday);
        }
    });
    return conflicts;
}

// 显示日期冲突警告的函数
function showConflictWarning(conflicts) {
    // 如果没有冲突，隐藏现有的警告
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

    // 创建或更新警告通知
    let warning = document.getElementById('date-conflict-warning');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'date-conflict-warning';
        warning.className = 'notification warning';
        // 插入到日期选择器控件之前
        document.querySelector('.date-picker-controls').before(warning);
    }

    warning.innerHTML = `
        <span class="notification-message">${message}</span>
        <span class="close-notification">&times;</span>
    `;
    warning.style.display = 'flex';

    // 绑定关闭事件
    const closeBtn = warning.querySelector('.close-notification');
    if (closeBtn) {
        closeBtn.onclick = function() {
            warning.style.display = 'none';
        };
    }

    // 5秒后自动隐藏警告
    setTimeout(() => {
        if (warning) warning.style.display = 'none';
    }, 5000);
}

// --- Date Picker Management ---
// Removed setupDatePicker function

document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言管理器
    languageManager = new LanguageManager();

    const projectYearInput = document.getElementById('projectYear');
    const startMonthInput = document.getElementById('startMonth');
    const projectDurationInput = document.getElementById('projectDuration');

    // --- New Date Picker Elements ---
    const holidaysPicker = document.getElementById('holidays-picker');
    const holidaysList = document.getElementById('holidays-list');

    const workdaysPicker = document.getElementById('workdays-picker');
    const workdaysList = document.getElementById('workdays-list');

    const generateTableBtn = document.getElementById('generateTableBtn');
    const addRowBtn = document.getElementById('addRowBtn');
    const exportBtn = document.getElementById('exportBtn');
    const tableContainer = document.getElementById('tableContainer');

    // 资源类型配置 - 使用内部键值
    const resourceTypes = [
        { key: 'fico', zh: 'FICO顾问', en: 'FICO Consultant' },
        { key: 'pp', zh: 'PP顾问', en: 'PP Consultant' },
        { key: 'mm', zh: 'MM顾问', en: 'MM Consultant' },
        { key: 'sd', zh: 'SD顾问', en: 'SD Consultant' },
        { key: 'hr', zh: 'HR顾问', en: 'HR Consultant' },
        { key: 'abap', zh: 'ABAP顾问', en: 'ABAP Consultant' },
        { key: 'basis', zh: 'BASIS顾问', en: 'BASIS Consultant' },
        { key: 'custom', zh: '自定义', en: 'Custom' }
    ];

    const resourceOptions = [
        "FICO顾问", "PP顾问", "MM顾问", "SD顾问", "HR顾问", "ABAP顾问", "BASIS顾问", "自定义"
    ];
    const defaultResources = [
        "FICO顾问", "PP顾问", "MM顾问", "SD顾问", "HR顾问", "ABAP顾问", "ABAP顾问", "BASIS顾问"
    ];

    // 获取当前语言的顾问类型选项
    function getResourceOptions() {
        if (!languageManager) return resourceOptions;
        return resourceOptions.map(option => languageManager.getTranslation(`resources.${option}`));
    }

    // 根据资源键值和当前语言获取显示名称
    function getResourceDisplayName(key) {
        if (!languageManager) {
            // 默认返回中文名称
            const resource = resourceTypes.find(r => r.key === key);
            return resource ? resource.zh : key;
        }

        const currentLanguage = languageManager.currentLanguage;
        const resource = resourceTypes.find(r => r.key === key);
        return resource ? resource[currentLanguage] : key;
    }

    // 根据显示名称获取资源键值
    function getResourceKey(displayName) {
        // First check if displayName is already a valid key
        const isValidKey = resourceTypes.some(r => r.key === displayName);
        if (isValidKey) {
            return displayName;
        }

        // Then try to find by display name
        const resource = resourceTypes.find(r => r.zh === displayName || r.en === displayName);
        return resource ? resource.key : 'fico'; // 默认为fico
    }

    // 获取当前语言的默认资源
    function getDefaultResources() {
        if (!languageManager) return defaultResources;
        return defaultResources.map(resource => languageManager.getTranslation(`resources.${resource}`));
    }


    function updateDateList(dateSet, listElement) {
        // Removed content as per user request
    }


    function getWorkingDays(startDate, endDate, holidays, workdays) {
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            // Timezone-safe method to get YYYY-MM-DD string
            const year = curDate.getFullYear();
            const month = String(curDate.getMonth() + 1).padStart(2, '0');
            const day = String(curDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const dayOfWeek = curDate.getDay();

            if (workdays.has(dateString)) {
                count++;
            }
            else if (holidays.has(dateString)) {
                // Holiday, do nothing
            }
            else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }

            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    }

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
            const manDayInputs = row.querySelectorAll('.man-day-input');
            const unitPriceInput = row.querySelector('.unit-price-input');
            const remarksInput = row.querySelector('.remarks-input');

            const resource = {
                type: selectElement ? selectElement.value : 'fico', // 使用资源键值而不是显示名称
                customType: customInput ? customInput.value : '',
                manDays: Array.from(manDayInputs).map(input => input.value),
                unitPrice: unitPriceInput ? unitPriceInput.value : '',
                remarks: remarksInput ? remarksInput.value : '',
                isCustomVisible: customInput ? customInput.style.display === 'block' : false
            };

            // If custom input is visible, ensure resource type is 'custom'
            if (resource.isCustomVisible) {
                resource.type = 'custom';
            }
            currentTableResources.push(resource);
        });

        // If no resources are loaded or present, initialize with default
        if (currentTableResources.length === 0) {
            // 使用资源键值初始化默认资源
            currentTableResources = [
                { type: 'fico', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'pp', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'mm', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'sd', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'hr', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'abap', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'abap', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'basis', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false }
            ];
        }

        let tableHTML = '<table border="1"><thead>';
        let weekHeaders = '';
        let totalWeeks = 0;
        const allWeeksData = [];

        // Calculate project start and end dates
        const projectStartDate = new Date(year, startMonth, 1);
        const projectEndDate = new Date(year, startMonth + duration, 0); // Last day of the last month

        let currentWeekStart = new Date(projectStartDate);
        // Adjust currentWeekStart to the Monday of its week
        const dayOfWeek = currentWeekStart.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

        // Iterate through weeks for the entire project duration
        while (currentWeekStart <= projectEndDate) {
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekEnd.getDate() + 6); // End of the current calendar week (Sunday)

            // Determine the effective start and end for this week within the project duration
            const effectiveStart = new Date(Math.max(projectStartDate.getTime(), currentWeekStart.getTime()));
            const effectiveEnd = new Date(Math.min(projectEndDate.getTime(), currentWeekEnd.getTime()));

            if (effectiveStart <= effectiveEnd) {
                const workingDays = getWorkingDays(effectiveStart, effectiveEnd, holidays, workdays);

                // Always add week data, even if workingDays is 0
                allWeeksData.push({
                    week: allWeeksData.length + 1, // Use array length for sequential week numbering
                    workingDays: workingDays,
                    displayRange: `${effectiveStart.getMonth() + 1}/${effectiveStart.getDate()}&#x200B; - &#x200B;${effectiveEnd.getMonth() + 1}/${effectiveEnd.getDate()}` // For header
                });
                totalWeeks++; // Increment totalWeeks for every calendar week within project duration
            }

            currentWeekStart.setDate(currentWeekStart.getDate() + 7); // Move to the next week
        }

        allWeeksDataGlobal = allWeeksData; // Store for addResourceRow

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

        // Add headers for calculation columns
        const calculationHeaders = languageManager ?
            `<th scope="col" rowspan="2">${languageManager.getTranslation('subtotal')}</th><th scope="col" rowspan="2">${languageManager.getTranslation('unitPrice')}</th><th scope="col" rowspan="2">${languageManager.getTranslation('totalPrice')}</th><th scope="col" rowspan="2">${languageManager.getTranslation('remarks')}</th>` :
            '<th scope="col" rowspan="2">小计 (人天)</th><th scope="col" rowspan="2">单价</th><th scope="col" rowspan="2">总价</th><th scope="col" rowspan="2">备注</th>';

        const consultantHeader = languageManager ? languageManager.getTranslation('consultantResource') : '顾问资源';
        tableHTML += `<tr><th scope="col" rowspan="2">${consultantHeader}</th>${weekHeaders}${calculationHeaders}</tr>`;
        tableHTML += `</thead><tbody>`;

        // Generate rows based on currentTableResources
        currentTableResources.forEach((resource, rowIndex) => {
            tableHTML += generateResourceRow(rowIndex, resource.type, totalWeeks, allWeeksDataGlobal, resource);
        });

        const grandTotalText = languageManager ? languageManager.getTranslation('grandTotal') : '总计';
        tableHTML += `<tr><td class="sticky-total-cell"><strong>${grandTotalText}</strong></td>`; // First cell for "总计"
        // Loop for weekly totals
        for (let j = 0; j < totalWeeks; j++) {
            tableHTML += `<td class="grand-total-week-manday" id="grand-total-week-${j}">0</td>`;
        }
        tableHTML += `<td class="grand-subtotal-manday" id="grand-subtotal-manday-total">0</td>`; // Grand total man-day for subtotal column
        tableHTML += `<td></td>`; // Empty cell under Unit Price
        tableHTML += `<td class="grand-total-price" id="grand-total-price-total">0</td>`; // Grand total price for total price column
        tableHTML += `<td><input type="text" class="remarks-input" data-row="total"></td>`; // Remarks cell
        tableHTML += '</tr></tbody></table>';

        tableContainer.innerHTML = tableHTML;
        setupEventListeners();
        updateTotals();

        // 设置表格已生成标记
        hasTableBeenGenerated = true;
    }

    // 将generateTable函数暴露到全局window对象
    window.generateTable = generateTable;

    function generateResourceRow(rowIndex, initialResourceKey, totalWeeks, allWeeksData = null, resourceData = null) {
        let rowHTML = `<tr data-row-index="${rowIndex}">`;

        // 获取当前语言的资源选项
        const customPlaceholder = languageManager ? languageManager.getTranslation('customResourcePlaceholder') : '输入顾问类型';

        // 生成资源选项，使用键值作为option的value
        let resourceOptionsHTML = '';
        resourceTypes.forEach(resource => {
            const displayName = getResourceDisplayName(resource.key);
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
            rowHTML += `<td><input type="number" class="man-day-input" min="0" step="0.1" value="${manDayValue}" data-row="${rowIndex}" data-week="${j}"></td>`;
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
        const newRowIndex = currentTableResources.length; // New index for the added row
        const totalWeeks = allWeeksDataGlobal.length; // Use global totalWeeks

        // Create a new resource object for the added row
        const newResource = {
            type: 'fico', // Default to fico resource key
            customType: '',
            manDays: allWeeksDataGlobal.map(week => week.workingDays), // Initialize manDays with calculated workingDays
            unitPrice: '3000',
            remarks: '',
            isCustomVisible: false
        };
        currentTableResources.push(newResource); // Add to our data model

        const newRowHTML = generateResourceRow(newRowIndex, newResource.type, totalWeeks, allWeeksDataGlobal, newResource);
        const totalRow = tableBody.querySelector('tr:last-child');
        totalRow.insertAdjacentHTML('beforebegin', newRowHTML);
        setupRowEventListeners(tableBody.querySelector(`tr[data-row-index="${newRowIndex}"]`));
        updateTotals();
        saveTableData();
        
        // 显示调整资源的提示
        console.log('Calling showAdjustResourceNotification');
        showAdjustResourceNotification();
    }

    function updateTotals() {
        let grandTotalManDay = 0;
        let grandTotalPrice = 0;
        const resourceRows = tableContainer.querySelectorAll('tbody tr:not(:last-child)');

        // Initialize weekly totals array
        const firstResourceRow = resourceRows[0];
        const numberOfWeeks = firstResourceRow ? firstResourceRow.querySelectorAll('.man-day-input').length : 0;
        const weeklyTotals = Array(numberOfWeeks).fill(0);

        resourceRows.forEach(row => {
            const rowIndex = row.dataset.rowIndex;
            let rowSubtotal = 0;
            row.querySelectorAll('.man-day-input').forEach((input, weekIndex) => {
                const manDayValue = parseFloat(input.value) || 0;
                rowSubtotal += manDayValue;
                weeklyTotals[weekIndex] += manDayValue; // Accumulate for weekly total
            });
            const unitPrice = parseFloat(row.querySelector('.unit-price-input').value) || 0;
            const rowTotalPrice = rowSubtotal * unitPrice;
            row.querySelector(`#subtotal-${rowIndex}`).textContent = rowSubtotal.toFixed(1);
            row.querySelector(`#total-price-${rowIndex}`).textContent = rowTotalPrice.toFixed(2);
            grandTotalManDay += rowSubtotal;
            grandTotalPrice += rowTotalPrice;
        });

        // Update weekly total cells
        weeklyTotals.forEach((total, index) => {
            const weekTotalCell = document.getElementById(`grand-total-week-${index}`);
            if (weekTotalCell) {
                weekTotalCell.textContent = total.toFixed(1);
            }
        });

        // Update grand totals
        const grandSubtotalManDayCell = document.getElementById('grand-subtotal-manday-total');
        if (grandSubtotalManDayCell) {
            grandSubtotalManDayCell.textContent = grandTotalManDay.toFixed(1);
        }
        const grandTotalPriceCell = document.getElementById('grand-total-price-total');
        if (grandTotalPriceCell) {
            grandTotalPriceCell.textContent = grandTotalPrice.toFixed(2);
        }
    }

    function handleResourceChange(event) {
        const selectElement = event.target;
        const selectedValue = selectElement.value; // 这现在是资源键值
        const rowIndex = selectElement.dataset.row;
        const customInput = tableContainer.querySelector(`.custom-resource-input[data-row="${rowIndex}"]`);
        if (customInput) {
            // 检查是否选择了自定义资源键值
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
            if (target.classList.contains('man-day-input') || target.classList.contains('unit-price-input') || target.classList.contains('remarks-input') || target.classList.contains('custom-resource-input')) {
                updateTotals();
                saveTableData();
            }
        });
        tableContainer.addEventListener('change', (event) => {
            if (event.target.classList.contains('resource-select')) {
                handleResourceChange(event);
                saveTableData();
            }
        });
        tableContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-row-btn')) {
                const rowIndex = event.target.dataset.row;
                const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
                if (row) {
                    row.remove();
                    updateTotals();
                    saveTableData();
                }
            }
        });
    }

    function setupRowEventListeners(rowElement) {
        // Event delegation handles this now.
    }

    function saveTableData() {
        const tableData = {
            resources: currentTableResources, // Save currentTableResources
            year: projectYearInput.value,
            month: startMonthInput.value,
            duration: projectDurationInput.value,
            holidays: Array.from(holidaysSet), // Save as array
            workdays: Array.from(workdaysSet)   // Save as array
        };
        localStorage.setItem('projectResourceData', JSON.stringify(tableData));
    }

    function loadTableData() {
        const savedData = localStorage.getItem('projectResourceData');
        if (savedData) {
            const tableData = JSON.parse(savedData);
            projectYearInput.value = tableData.year || new Date().getFullYear();
            startMonthInput.value = tableData.month || new Date().getMonth() + 1;
            projectDurationInput.value = tableData.duration || 1;

            // Load dates and update UI
            holidaysSet.clear(); // Clear existing set
            (tableData.holidays || []).forEach(date => holidaysSet.add(date));
            workdaysSet.clear(); // Clear existing set
            (tableData.workdays || []).forEach(date => workdaysSet.add(date));

            // Load resources and ensure they use resource keys
            if (tableData.resources) {
                currentTableResources = tableData.resources.map(resource => {
                    // Ensure the resource has a valid type key
                    // Check if the resource.type is already a valid key
                    const isValidKey = resourceTypes.some(r => r.key === resource.type);
                    if (!isValidKey) {
                        // Try to convert display name to key if possible
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

            // IMPORTANT: Do not generate the table on load.
            // The user must click the button to generate the table.

        } else {
            // Set default year/month if no saved data, but do not generate the table.
            const currentDate = new Date();
            projectYearInput.value = currentDate.getFullYear();
            startMonthInput.value = currentDate.getMonth() + 1;
            projectDurationInput.value = 1;
            // 使用资源键值初始化默认资源
            currentTableResources = [
                { type: 'fico', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'pp', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'mm', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'sd', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'hr', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'abap', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'abap', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
                { type: 'basis', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false }
            ];
        }
    }

    async function exportToExcel() {
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
                        value = getResourceDisplayName(resourceSelect.value);
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

    // --- Initial Setup ---
    // Helper function to adjust input width based on content
    function adjustInputWidth(inputElement, text) {
        // Create a temporary span to measure text width
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'nowrap';
        span.style.font = getComputedStyle(inputElement).font; // Match font styles
        span.textContent = text;
        document.body.appendChild(span);

        // Calculate width including padding and border
        const padding = parseFloat(getComputedStyle(inputElement).paddingLeft) + parseFloat(getComputedStyle(inputElement).paddingRight);
        const border = parseFloat(getComputedStyle(inputElement).borderLeftWidth) + parseFloat(getComputedStyle(inputElement).borderRightWidth);
        const newWidth = span.offsetWidth + padding + border + 2; // Add a small buffer

        inputElement.style.width = `${newWidth}px`;
        document.body.removeChild(span);
    }

    // 添加一个函数来显示重新生成表格的提示
    function showRegenerateTableNotification() {
        // 检查表格是否已经存在
        const tableExists = tableContainer.querySelector('table');
        if (tableExists) {
            // 创建或获取通知元素
            let notification = document.getElementById('regenerate-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'regenerate-notification';
                notification.className = 'notification';

                // 添加关闭按钮
                const closeBtn = document.createElement('span');
                closeBtn.className = 'close-notification';
                closeBtn.innerHTML = '&times;';
                closeBtn.onclick = function () {
                    notification.style.display = 'none';
                };
                notification.appendChild(closeBtn);

                // 插入到表格容器前面
                tableContainer.parentNode.insertBefore(notification, tableContainer);
            }

            // 更新通知内容以匹配当前语言
            const message = languageManager ? languageManager.getTranslation('notifications.regenerateTable') : '日期已更新，请点击 <strong>生成/更新表格</strong> 按钮重新计算工作日！';
            notification.innerHTML = `<span class="notification-message">${message}</span>`;

            // 添加关闭按钮（在更新内容后重新添加）
            const closeBtn = document.createElement('span');
            closeBtn.className = 'close-notification';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = function () {
                notification.style.display = 'none';
            };
            notification.appendChild(closeBtn);

            // 确保通知是可见的
            notification.style.display = 'block';

            // 高亮生成表格按钮
            generateTableBtn.classList.add('highlight-button');

            // 5秒后自动隐藏通知
            setTimeout(() => {
                if (notification) notification.style.display = 'none';
                generateTableBtn.classList.remove('highlight-button');
            }, 5000);
        }
    }

    // 添加一个函数来显示调整资源的提示
    function showAdjustResourceNotification() {
        // 创建或获取通知元素
        let notification = document.getElementById('adjust-resource-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'adjust-resource-notification';
            notification.className = 'notification';

            // 添加关闭按钮
            const closeBtn = document.createElement('span');
            closeBtn.className = 'close-notification';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = function() {
                notification.style.display = 'none';
            };
            notification.appendChild(closeBtn);

            // 插入到表格容器前面
            tableContainer.parentNode.insertBefore(notification, tableContainer);
        }

        // 更新通知内容以匹配当前语言
        const message = languageManager ? languageManager.getTranslation('notifications.adjustResource') : '已添加新的资源行，请根据实际需求调整 <strong>顾问资源类型</strong> 和 <strong>单价</strong>！';
        notification.innerHTML = `<span class="notification-message">${message}</span>`;

        // 添加关闭按钮（在更新内容后重新添加）
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-notification';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = function() {
            notification.style.display = 'none';
        };
        notification.appendChild(closeBtn);

        // 确保通知是可见的
        notification.style.display = 'block';

        // 4秒后自动隐藏通知
        setTimeout(() => {
            if (notification) notification.style.display = 'none';
        }, 4000);
    }

    // Initialize Flatpickr for holidays
    flatpickr(holidaysPicker, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            holidaysSet.clear();
            selectedDates.forEach(date => holidaysSet.add(flatpickr.formatDate(date, "Y-m-d")));
            updateDateList(holidaysSet, holidaysList);
            saveTableData();
            adjustInputWidth(holidaysPicker, dateStr); // Adjust width dynamically

            // 检查日期冲突
            const conflicts = checkDateConflicts();
            showConflictWarning(conflicts);

            // 如果表格已经生成且无冲突，则自动更新表格
            if (conflicts.length === 0 && hasTableBeenGenerated && typeof window.generateTable === 'function') {
                window.generateTable();
            } else if (conflicts.length === 0) {
                showRegenerateTableNotification(); // 如果表格尚未生成且无冲突，显示提示
            }
        }
    });

    // Initialize Flatpickr for workdays
    flatpickr(workdaysPicker, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            workdaysSet.clear();
            selectedDates.forEach(date => workdaysSet.add(flatpickr.formatDate(date, "Y-m-d")));
            updateDateList(workdaysSet, workdaysList);
            saveTableData();
            adjustInputWidth(workdaysPicker, dateStr); // Adjust width dynamically

            // 检查日期冲突
            const conflicts = checkDateConflicts();
            showConflictWarning(conflicts);

            // 如果表格已经生成且无冲突，则自动更新表格
            if (conflicts.length === 0 && hasTableBeenGenerated && typeof window.generateTable === 'function') {
                window.generateTable();
            } else if (conflicts.length === 0) {
                showRegenerateTableNotification(); // 如果表格尚未生成且无冲突，显示提示
            }
        }
    });

    generateTableBtn.addEventListener('click', () => {
        generateTable();
        saveTableData();

        // 隐藏通知
        const notification = document.getElementById('regenerate-notification');
        if (notification) {
            notification.style.display = 'none';
        }

        // 移除按钮高亮
        generateTableBtn.classList.remove('highlight-button');
    });
    addRowBtn.addEventListener('click', addResourceRow);
    exportBtn.addEventListener('click', exportToExcel);

    // 添加实时验证函数
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

    // 添加输入事件监听器
    projectYearInput.addEventListener('input', () => validateProjectYear(projectYearInput));
    projectDurationInput.addEventListener('input', () => validateProjectDuration(projectDurationInput));

    // 在失去焦点时也进行验证
    projectYearInput.addEventListener('blur', () => validateProjectYear(projectYearInput));
    projectDurationInput.addEventListener('blur', () => validateProjectDuration(projectDurationInput));

    // Auto-save on main control changes
    [projectYearInput, startMonthInput, projectDurationInput].forEach(input => {
        input.addEventListener('change', saveTableData);
    });

    loadTableData();

    // ========================================
    // 主题切换功能 (Theme Toggle Functionality)
    // ========================================

    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // 函数：加载保存的主题
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 函数：切换主题
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // 绑定click事件到按钮
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 页面加载时应用保存的主题
    loadTheme();
});


console.log('script.js fully executed');