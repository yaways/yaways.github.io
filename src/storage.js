// localStorage 读写

const STORAGE_KEY = 'projectResourceData';

/**
 * 保存项目数据到 localStorage
 * @param {Object} data - 项目数据
 */
export function saveTableData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 从 localStorage 加载项目数据
 * @returns {Object|null} 项目数据，如果没有保存的数据则返回 null
 */
export function loadTableData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (e) {
            console.error('Failed to parse saved data:', e);
            return null;
        }
    }
    return null;
}
