// 工作日计算纯函数

/**
 * 计算两个日期之间的工作日数
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @param {Set<string>} holidays - 法定节假日集合 (YYYY-MM-DD 格式)
 * @param {Set<string>} workdays - 调休工作日集合 (YYYY-MM-DD 格式)
 * @returns {number} 工作日数
 */
export function getWorkingDays(startDate, endDate, holidays, workdays) {
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

/**
 * 检查节假日和调休工作日之间的日期冲突
 * @param {Set<string>} holidays - 法定节假日集合
 * @param {Set<string>} workdays - 调休工作日集合
 * @returns {string[]} 冲突的日期列表
 */
export function checkDateConflicts(holidays, workdays) {
    const conflicts = [];
    holidays.forEach(holiday => {
        if (workdays.has(holiday)) {
            conflicts.push(holiday);
        }
    });
    return conflicts;
}
