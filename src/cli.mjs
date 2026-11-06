import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import { searchStocks } from './search-stock.mjs';
import { fetchStockData } from './fetch-stock.mjs';
import { displayStock } from './format-output.mjs';

// Register the autocomplete plugin
inquirer.registerPrompt('autocomplete', autocomplete);

// Keep the interactive session running until the user explicitly exits with Ctrl+C
process.on('SIGINT', () => {
  console.log('\n已退出股票查询');
  process.exit(0);
});

/**
 * Parse command line arguments and return the action to perform
 * @returns {Promise<Object>} Action object with type and code/codes
 */
async function parseArguments() {
  const args = process.argv.slice(2);
  
  // No arguments - show interactive prompt
  if (args.length === 0) {
    return { type: 'interactive' };
  }
  
  const command = args[0];
  
  if (command === 'help' || command === '-h' || command === '--help') {
    return { type: 'help' };
  }

  if (command === 'search') {
    const keyword = args.slice(1).join(' ').trim();

    if (!keyword) {
      return { type: 'search-session' };
    }

    return await resolveSearchResults(keyword);
  }
  
  if (/^(sh|sz|hk)\d{1,6}$/i.test(command)) {
    return { type: 'query', code: command.toLowerCase() };
  }

  // Fall back to online search for names, pinyin, and stock codes
  return await resolveSearchResults(command);
}

/**
 * Execute a stock action and return its result
 * @param {Object} action - Action to execute
 */
async function executeAction(action) {
  switch (action.type) {
    case 'query': {
      const stock = await fetchStockData(action.code);
      displayStock(stock);
      break;
    }

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

/**
 * Show interactive menu using autocomplete with real-time filtering
 * @returns {Promise<Object>} Selected action
 */
async function showInteractiveMenu() {
  /**
   * Source function for autocomplete
   * Filters choices based on user input
   */
  const source = async (answersSoFar, input = '') => {
    const searchTerm = input.trim();

    if (!searchTerm) {
      return [];
    }

    try {
      const results = await searchStocks(searchTerm, { limit: 10 });

      if (results.length === 0) {
        return [{ name: `未找到匹配 “${searchTerm}” 的A股或港股`, value: null, disabled: true }];
      }

      return results.map((stock) => ({
        name: `${stock.name} ${stock.code} [${stock.marketLabel}]`,
        value: stock.fullCode,
      }));
    } catch (error) {
      return [{ name: error.message, value: null, disabled: true }];
    }
  };
  
  const { selected } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'selected',
      message: '请选择要查询的股票 (输入关键词搜索，支持名称或缩写):',
      source,
      pageSize: 10,
    },
  ]);
  
  return { type: 'query', code: selected };
}

/**
 * Prompt for a search keyword
 * @returns {Promise<Object>} Search action
 */
async function showSearchInput() {
  const { keyword } = await inquirer.prompt([
    {
      type: 'input',
      name: 'keyword',
      message: '请输入A股或港股的代码、名称或拼音:',
      validate: (input) => input.trim() ? true : '搜索关键词不能为空',
    },
  ]);

  return await resolveSearchResults(keyword.trim());
}

/**
 * Search continuously, choosing a stock to query each time
 */
async function showSearchSession() {
  while (true) {
    try {
      const nextAction = await showSearchInput();
      await executeAction(nextAction);
    } catch (error) {
      console.error(error.message);
    }
  }
}

/**
 * Search with a keyword and choose the stock to query
 * @param {string} keyword - Search keyword
 * @returns {Promise<Object>} Query action
 */
async function resolveSearchResults(keyword) {
  const results = await searchStocks(keyword, { limit: 10 });

  if (results.length === 0) {
    throw new Error(`未找到匹配 “${keyword}” 的A股或港股`);
  }

  if (results.length === 1) {
    return { type: 'query', code: results[0].fullCode };
  }

  const { code } = await inquirer.prompt([
    {
      type: 'list',
      name: 'code',
      message: `找到 ${results.length} 只股票，请选择要查询的股票:`,
      choices: results.map((stock) => ({
        name: `${stock.name} ${stock.code} [${stock.marketLabel}]`,
        value: stock.fullCode,
      })),
    },
  ]);

  return { type: 'query', code };
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Stock Query CLI - 股票查询工具

用法:
  stock [command]

命令:
  stock              进入连续搜索和查询模式
  stock <keyword>    查询指定股票 (支持名称、拼音或代码)
  stock search       交互式搜索A股和港股
  stock search <词>  搜索A股和港股并选择查询
  stock help         显示帮助信息

示例:
  stock              # 进入连续搜索和查询模式
  stock 美团         # 查询美团 (使用中文名称)
  stock tencent      # 查询腾讯 (使用拼音)
  stock search 茅台  # 搜索贵州茅台
  stock hk03690      # 查询美团 (使用股票代码)
  `);
}

/**
 * Main entry point
 */
export async function main() {
  try {
    const action = await parseArguments();

    switch (action.type) {
      case 'help':
        showHelp();
        break;

      case 'interactive': {
        while (true) {
          try {
            const nextAction = await showInteractiveMenu();
            await executeAction(nextAction);
          } catch (error) {
            console.error(error.message);
          }
        }
      }

      case 'search-session': {
        await showSearchSession();
        break;
      }

      default:
        await executeAction(action);
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
