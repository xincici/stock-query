import chalk from 'chalk';

/**
 * Format and display a single stock's data
 * @param {Object} stock - Stock data object
 */
export function displayStock(stock) {
  const isUp = stock.changePercent >= 0;
  const color = isUp ? 'red' : 'green';
  
  const output = [
    `名称: ${stock.name}`,
    `代码: ${stock.code}`,
    `当前价格: ${stock.currentPrice}`,
    `开盘价格: ${stock.openPrice}`,
    `今日最高: ${stock.highPrice}`,
    `涨跌幅度: ${stock.changePercent}%`,
    `涨跌额度: ${stock.changeAmount}`,
    `更新时间: ${stock.updateTime}`,
  ];

  console.log(chalk[color](output.join('\n')));
}

/**
 * Display multiple stocks
 * @param {Array<Object>} stocks - Array of stock data objects
 */
export function displayMultipleStocks(stocks) {
  stocks.forEach((stock, index) => {
    if (index > 0) console.log('');
    displayStock(stock);
  });
}

/**
 * Display stock list for selection
 * @param {Array<Object>} stocks - Array of stock objects
 */
export function displayStockList(stocks) {
  console.log('\n可用的股票列表：\n');
  stocks.forEach(stock => {
    console.log(`  ${stock.key.padEnd(4)} | ${stock.name.padEnd(6)} | ${stock.code}`);
  });
  console.log('');
}
