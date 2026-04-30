import { describe, it, expect } from 'vitest';
import { translations } from '../src/i18n.js';
import { resourceTypes, getResourceDisplayName, getResourceKey } from '../src/resources.js';

describe('translations', () => {
  it('中英文翻译键一致', () => {
    const zhKeys = Object.keys(translations.zh);
    const enKeys = Object.keys(translations.en);
    expect(zhKeys).toEqual(enKeys);
  });

  it('月份翻译数量正确', () => {
    expect(translations.zh.months).toHaveLength(12);
    expect(translations.en.months).toHaveLength(12);
  });

  it('资源翻译数量一致', () => {
    const zhResources = Object.keys(translations.zh.resources);
    const enResources = Object.keys(translations.en.resources);
    expect(zhResources).toEqual(enResources);
  });
});

describe('getResourceDisplayName', () => {
  it('中文模式下返回中文名称', () => {
    expect(getResourceDisplayName('fico', 'zh')).toBe('FICO顾问');
  });

  it('英文模式下返回英文名称', () => {
    expect(getResourceDisplayName('fico', 'en')).toBe('FICO Consultant');
  });

  it('无效键值返回键值本身', () => {
    expect(getResourceDisplayName('unknown', 'zh')).toBe('unknown');
  });
});

describe('getResourceKey', () => {
  it('有效键值直接返回', () => {
    expect(getResourceKey('fico')).toBe('fico');
  });

  it('中文名称转换为键值', () => {
    expect(getResourceKey('FICO顾问')).toBe('fico');
  });

  it('英文名称转换为键值', () => {
    expect(getResourceKey('FICO Consultant')).toBe('fico');
  });

  it('无法识别的名称返回默认值 fico', () => {
    expect(getResourceKey('未知顾问')).toBe('fico');
  });
});
