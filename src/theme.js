// 主题切换功能

/**
 * 加载保存的主题
 */
export function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

/**
 * 切换主题
 */
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

/**
 * 初始化主题切换按钮
 */
export function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 页面加载时应用保存的主题
    loadTheme();
}
