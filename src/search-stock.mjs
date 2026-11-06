import axios from 'axios';
import iconv from 'iconv-lite';

const SEARCH_URL = 'https://smartbox.gtimg.cn/s3/';
const SUPPORTED_MARKETS = new Map([
  ['sh', '上海A股'],
  ['sz', '深圳A股'],
  ['hk', '港股'],
]);

function normalizeCode(market, code) {
  if (!market || !code) return null;

  if (market === 'hk') {
    return `hk${code.padStart(5, '0')}`;
  }

  if (market === 'sh' || market === 'sz') {
    return `${market}${code}`;
  }

  return null;
}

function decodeEscapedText(text) {
  try {
    return JSON.parse(`"${text}"`);
  } catch {
    return text;
  }
}

function parseSearchResponse(data) {
  const match = data.match(/v_hint="([^"]*)"/);

  if (!match) {
    return [];
  }

  return match[1]
    .split('^')
    .map((item) => item.split('~'))
    .filter((fields) => fields.length >= 5)
    .map(([market, code, name, pinyin, type]) => ({
      market,
      code,
      name: decodeEscapedText(name),
      pinyin: decodeEscapedText(pinyin),
      type,
    }));
}

/**
 * Search A-share and Hong Kong stocks by code, name, or pinyin
 * @param {string} keyword - Search keyword
 * @param {Object} options - Search options
 * @param {number} options.limit - Maximum number of results
 * @returns {Promise<Array>} Matched stocks
 */
export async function searchStocks(keyword, { limit = 10 } = {}) {
  const searchTerm = String(keyword ?? '').trim();

  if (!searchTerm) {
    return [];
  }

  try {
    const response = await axios({
      url: SEARCH_URL,
      method: 'GET',
      params: {
        v: '2',
        q: searchTerm,
        t: 'all',
        c: '1',
      },
      responseType: 'arraybuffer',
      timeout: 5000,
    });

    const data = iconv.decode(response.data, 'gbk');

    return parseSearchResponse(data)
      .filter((stock) => SUPPORTED_MARKETS.has(stock.market))
      .filter((stock) => ['GP', 'GP-A', 'GP-A-KCB'].includes(stock.type))
      .map((stock) => ({
        ...stock,
        fullCode: normalizeCode(stock.market, stock.code),
        marketLabel: SUPPORTED_MARKETS.get(stock.market),
      }))
      .slice(0, limit);
  } catch (error) {
    throw new Error(`搜索股票失败: ${error.message}`);
  }
}

