# Stock Query CLI

一个基于 Node.js 的股票查询命令行工具，支持实时搜索并查询 A 股和港股行情。

## 功能

- 搜索上海 A 股、深圳 A 股（含科创板）和港股
- 支持股票名称、拼音缩写、股票代码搜索
- 支持查询当前价格、开盘价、最高价、涨跌幅、涨跌额和更新时间
- 交互模式下可连续搜索，直到使用 `Ctrl + C` 退出
- 内置常用港股快捷键映射

## 安装依赖

```bash
yarn install
```

也可以使用 npm：

```bash
npm install
```

## 使用方法

### 直接启动交互模式

```bash
yarn start
```

或：

```bash
node bin/stock
```

进入后直接输入关键词，例如 `腾讯`、`maotai` 或 `688981`。工具会实时返回搜索结果，选择股票后展示行情，然后可以继续下一次搜索。按 `Ctrl + C` 退出。

### 查询单只股票

使用快捷键：

```bash
node bin/stock mt
```

使用中文名称：

```bash
node bin/stock 美团
```

使用拼音：

```bash
node bin/stock tencent
```

使用股票代码：

```bash
node bin/stock hk00700
node bin/stock sh600519
node bin/stock sz000001
```

如果匹配结果有多个，CLI 会显示候选列表供选择。

### 使用搜索命令

交互式连续搜索：

```bash
node bin/stock search
```

使用关键词搜索：

```bash
node bin/stock search 茅台
node bin/stock search 688981
```

### 查看列表

查看内置的常用港股列表：

```bash
node bin/stock list
```

或：

```bash
node bin/stock ls
```

查询所有内置股票：

```bash
node bin/stock all
```

### 查看帮助

```bash
node bin/stock help
```

也支持：

```bash
node bin/stock --help
```

## 内置快捷键

| 快捷键 | 股票 | 代码 |
| --- | --- | --- |
| `mt` | 美团 | `hk03690` |
| `qq` | 腾讯 | `hk00700` |
| `al` | 阿里 | `hk09988` |
| `mi` | 小米 | `hk01810` |
| `jd` | 京东 | `hk09618` |
| `ks` | 快手 | `hk01024` |
| `hf` | 汇丰 | `hk00005` |
| `st` | 商汤 | `hk00020` |
| `zl` | 祖龙 | `hk09990` |
| `zp` | 智谱 | `hk02513` |

## 股票代码格式

- 上海 A 股 / 科创板：`sh600519`、`sh688981`
- 深圳 A 股：`sz000001`
- 港股：`hk00700`、`hk03690`

港股代码会在搜索结果中自动补齐为 5 位，例如 `700` 会规范化为 `hk00700`。

## 调用的 API

当前工具使用腾讯证券提供的公开接口，不包含鉴权。

### 股票搜索

```text
https://smartbox.gtimg.cn/s3/
```

请求参数：

| 参数 | 值 | 说明 |
| --- | --- | --- |
| `v` | `2` | 接口版本 |
| `q` | 搜索关键词 | 支持中文、拼音、股票代码 |
| `t` | `all` | 搜索所有证券类型 |
| `c` | `1` | 返回候选结果 |

接口返回 GBK 编码文本，工具会解析并解码候选记录，然后只保留上海 A 股、深圳 A 股和港股。搜索结果中的证券类型支持 `GP`、`GP-A` 和 `GP-A-KCB`。

### 股票行情

```text
http://qt.gtimg.cn/q={code}
```

示例：

```text
http://qt.gtimg.cn/q=hk00700
```

接口返回 `~` 分隔的行情文本，编码为 GBK。工具会解码后提取以下字段：

- 股票名称
- 股票代码
- 当前价格
- 开盘价格
- 今日最高价
- 涨跌额
- 涨跌幅
- 更新时间

## 项目结构

```text
.
├── bin
│   └── stock                 # CLI 入口
└── src
    ├── cli.mjs               # 命令解析、交互模式和程序流程
    ├── fetch-stock.mjs       # 行情接口请求与解析
    ├── format-output.mjs     # 终端输出格式化
    ├── search-stock.mjs      # 股票搜索接口请求与解析
    └── stock-list.mjs        # 内置股票快捷键列表
```
