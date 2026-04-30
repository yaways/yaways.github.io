// 入口模块

import './style.css';
import 'flatpickr/dist/flatpickr.min.css';
import { LanguageManager } from './i18n.js';
import { initThemeToggle } from './theme.js';
import { initTable } from './table.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言管理器
    const languageManager = new LanguageManager();

    // 初始化主题切换
    initThemeToggle();

    // 初始化表格模块
    initTable(languageManager);
});
