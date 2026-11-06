/**
 * Stock list with name and code mapping
 */
export const stockList = [
  { key: 'mt', name: '美团', code: 'hk03690' },
  { key: 'qq', name: '腾讯', code: 'hk00700' },
  { key: 'al', name: '阿里', code: 'hk09988' },
  { key: 'mi', name: '小米', code: 'hk01810' },
  { key: 'jd', name: '京东', code: 'hk09618' },
  { key: 'ks', name: '快手', code: 'hk01024' },
  { key: 'hf', name: '汇丰', code: 'hk00005' },
  { key: 'st', name: '商汤', code: 'hk00020' },
  { key: 'zl', name: '祖龙', code: 'hk09990' },
  { key: 'zp', name: '智谱', code: 'hk02513' },
];

/**
 * Create a mapping from key/name to code
 */
export function createCodeMap() {
  return stockList.reduce((map, stock) => {
    map[stock.key] = stock.code;
    map[stock.name] = stock.code;
    return map;
  }, {});
}

/**
 * Get stock display string for list view
 */
export function getStockDisplayString(stock) {
  return `${stock.key.padEnd(4)} | ${stock.name.padEnd(6)} | ${stock.code}`;
}
