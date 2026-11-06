import axios from 'axios';
import iconv from 'iconv-lite';

/**
 * Fetch stock data from API and parse the response
 * @param {string} code - Stock code (e.g., 'hk03690')
 * @returns {Promise<Object>} Parsed stock data
 */
export async function fetchStockData(code) {
  const url = `http://qt.gtimg.cn/q=${code}`;
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    
    // Decode GBK encoded response to UTF-8 string
    const data = iconv.decode(response.data, 'gbk');
    const parts = data.split('~');
    
    // Validate that we got valid data
    if (!parts[1] || !parts[2]) {
      throw new Error(`Invalid stock code or no data found`);
    }
    
    return {
      name: parts[1],
      code: parts[2],
      currentPrice: parts[3],
      openPrice: parts[4],
      highPrice: parts[5],
      changePercent: parseFloat(parts[32]),
      changeAmount: parts[31],
      updateTime: parts[30],
    };
  } catch (error) {
    throw new Error(`Failed to fetch stock data for ${code}: ${error.message}`);
  }
}

/**
 * Fetch multiple stocks data
 * @param {Array<string>} codes - Array of stock codes
 * @returns {Promise<Array>} Array of parsed stock data
 */
export async function fetchMultipleStocks(codes) {
  const results = await Promise.all(
    codes.map(code => fetchStockData(code))
  );
  return results;
}
