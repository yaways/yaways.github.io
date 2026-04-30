// 资源类型配置常量

export const resourceTypes = [
    { key: 'fico', zh: 'FICO顾问', en: 'FICO Consultant' },
    { key: 'pp', zh: 'PP顾问', en: 'PP Consultant' },
    { key: 'mm', zh: 'MM顾问', en: 'MM Consultant' },
    { key: 'sd', zh: 'SD顾问', en: 'SD Consultant' },
    { key: 'hr', zh: 'HR顾问', en: 'HR Consultant' },
    { key: 'abap', zh: 'ABAP顾问', en: 'ABAP Consultant' },
    { key: 'basis', zh: 'BASIS顾问', en: 'BASIS Consultant' },
    { key: 'custom', zh: '自定义', en: 'Custom' }
];

export const defaultResources = [
    { type: 'fico', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'pp', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'mm', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'sd', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'hr', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'abap', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'abap', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false },
    { type: 'basis', customType: '', manDays: [], unitPrice: '3000', remarks: '', isCustomVisible: false }
];

/**
 * 根据资源键值和语言获取显示名称
 * @param {string} key - 资源键值 (e.g. 'fico', 'pp')
 * @param {string} language - 语言代码 ('zh' 或 'en')
 * @returns {string} 显示名称
 */
export function getResourceDisplayName(key, language = 'zh') {
    const resource = resourceTypes.find(r => r.key === key);
    return resource ? resource[language] : key;
}

/**
 * 根据显示名称获取资源键值
 * @param {string} displayName - 显示名称 (中文或英文)
 * @returns {string} 资源键值
 */
export function getResourceKey(displayName) {
    // First check if displayName is already a valid key
    const isValidKey = resourceTypes.some(r => r.key === displayName);
    if (isValidKey) {
        return displayName;
    }

    // Then try to find by display name
    const resource = resourceTypes.find(r => r.zh === displayName || r.en === displayName);
    return resource ? resource.key : 'fico'; // 默认为fico
}
