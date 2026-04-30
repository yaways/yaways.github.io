// 国际化翻译 + 语言管理器

export const translations = {
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
        pageTitle: "Person-day Cost Assessment Tool",
        mainTitle: "Person-day Cost Assessment Tool",
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
        subtotal: "Subtotal (Person-days)",
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
            worksheetName: "Person-day Cost Assessment",
            holidaysRemark: "Legal Holidays: ",
            workdaysRemark: "Adjusted Workdays: ",
            generalRemark: "Remarks:",
            filename: "Person-day_Cost_Assessment.xlsx"
        }
    }
};

export class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = translations;
        this._onTableRegenerate = null;
        this.init();
    }

    set onTableRegenerate(callback) {
        this._onTableRegenerate = callback;
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
    }

    applyLanguage(language) {
        document.documentElement.setAttribute('data-language', language);
        document.documentElement.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en-US');
        this.currentLanguage = language;
        this.updatePageTitle(language);
        this.updateMainTitle(language);
        this.updateFormLabels(language);
        this.updateButtons(language);
        this.updateDatePickers(language);
        this.updateMonthOptions(language);

        // 通过回调触发表格重新生成
        if (this._onTableRegenerate) {
            this._onTableRegenerate();
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
