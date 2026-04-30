import { describe, it, expect } from 'vitest';
import { getWorkingDays, checkDateConflicts } from '../src/workday.js';

describe('getWorkingDays', () => {
  it('计算普通一周的工作日（周一到周五）', () => {
    const start = new Date('2025-04-07'); // 周一
    const end = new Date('2025-04-11');   // 周五
    expect(getWorkingDays(start, end, new Set(), new Set())).toBe(5);
  });

  it('排除周末', () => {
    const start = new Date('2025-04-07'); // 周一
    const end = new Date('2025-04-13');   // 周日
    expect(getWorkingDays(start, end, new Set(), new Set())).toBe(5);
  });

  it('排除法定节假日', () => {
    const holidays = new Set(['2025-10-01', '2025-10-02', '2025-10-03']);
    const start = new Date('2025-09-29'); // 周一
    const end = new Date('2025-10-03');   // 周五（但10.1-10.3是假日）
    expect(getWorkingDays(start, end, holidays, new Set())).toBe(2); // 9/29, 9/30
  });

  it('包含调休工作日（周末上班）', () => {
    const workdays = new Set(['2025-09-28']); // 周日调休上班
    const start = new Date('2025-09-28'); // 周日
    const end = new Date('2025-09-28');
    expect(getWorkingDays(start, end, new Set(), workdays)).toBe(1);
  });

  it('国庆假期 + 调休综合场景', () => {
    const holidays = new Set(['2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07']);
    const workdays = new Set(['2025-09-28', '2025-10-11']); // 周日和周六调休
    const start = new Date('2025-09-28');
    const end = new Date('2025-10-11');
    expect(getWorkingDays(start, end, holidays, workdays)).toBe(7);
    // 9/28(调休) + 9/29~9/30(正常) + 10/8~10/10(正常) + 10/11(调休) = 7
  });

  it('同一天既是节假日又是调休日时，调休日优先', () => {
    const holidays = new Set(['2025-05-01']);
    const workdays = new Set(['2025-05-01']); // 冲突
    const start = new Date('2025-05-01');
    const end = new Date('2025-05-01');
    // 当前逻辑：workdays 优先（先判断 workdays）
    expect(getWorkingDays(start, end, holidays, workdays)).toBe(1);
  });

  it('单日（工作日）', () => {
    const start = new Date('2025-04-09'); // 周三
    const end = new Date('2025-04-09');
    expect(getWorkingDays(start, end, new Set(), new Set())).toBe(1);
  });

  it('单日（周末）', () => {
    const start = new Date('2025-04-12'); // 周六
    const end = new Date('2025-04-12');
    expect(getWorkingDays(start, end, new Set(), new Set())).toBe(0);
  });
});

describe('checkDateConflicts', () => {
  it('无冲突时返回空数组', () => {
    const holidays = new Set(['2025-10-01']);
    const workdays = new Set(['2025-09-28']);
    expect(checkDateConflicts(holidays, workdays)).toEqual([]);
  });

  it('检测到冲突时返回冲突日期', () => {
    const holidays = new Set(['2025-10-01', '2025-10-02']);
    const workdays = new Set(['2025-10-01', '2025-10-03']);
    expect(checkDateConflicts(holidays, workdays)).toEqual(['2025-10-01']);
  });

  it('多个冲突日期', () => {
    const holidays = new Set(['2025-10-01', '2025-10-02']);
    const workdays = new Set(['2025-10-01', '2025-10-02']);
    const conflicts = checkDateConflicts(holidays, workdays);
    expect(conflicts).toHaveLength(2);
    expect(conflicts).toContain('2025-10-01');
    expect(conflicts).toContain('2025-10-02');
  });

  it('空集合无冲突', () => {
    expect(checkDateConflicts(new Set(), new Set())).toEqual([]);
  });
});
