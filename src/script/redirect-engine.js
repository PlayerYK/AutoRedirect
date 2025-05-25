/**
 * Auto Redirect Engine - 共享重定向逻辑模块
 * 用于background.js和options.js之间共享重定向逻辑
 */

// 日志系统
const Logger = {
  logs: [],
  maxLogs: 1000,
  
  // 日志级别
  LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  
  currentLevel: 1, // 默认INFO级别
  
  /**
   * 添加日志
   * @param {string} message - 日志消息
   * @param {number} level - 日志级别
   * @param {object} data - 附加数据
   */
  log(message, level = this.LEVELS.INFO, data = null) {
    if (level < this.currentLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(this.LEVELS)[level] || 'UNKNOWN';
    
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // 同时输出到控制台（开发时有用）
    if (typeof console !== 'undefined') {
      const consoleMethod = level >= this.LEVELS.ERROR ? 'error' : 
                           level >= this.LEVELS.WARN ? 'warn' : 
                           level >= this.LEVELS.INFO ? 'info' : 'log';
      console[consoleMethod](`[${levelName}] ${message}`, data || '');
    }
  },
  
  debug(message, data = null) {
    this.log(message, this.LEVELS.DEBUG, data);
  },
  
  info(message, data = null) {
    this.log(message, this.LEVELS.INFO, data);
  },
  
  warn(message, data = null) {
    this.log(message, this.LEVELS.WARN, data);
  },
  
  error(message, data = null) {
    this.log(message, this.LEVELS.ERROR, data);
  },
  
  /**
   * 获取所有日志
   */
  getLogs() {
    return [...this.logs];
  },
  
  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = [];
  },
  
  /**
   * 设置日志级别
   */
  setLevel(level) {
    this.currentLevel = level;
  },
  
  /**
   * 格式化日志为HTML
   */
  formatLogsAsHtml() {
    return this.logs.map(log => {
      const levelClass = log.level.toLowerCase();
      const dataStr = log.data ? ` | 数据: ${JSON.stringify(log.data)}` : '';
      return `<div class="log-entry log-${levelClass}">
        <span class="log-time">${log.timestamp.split('T')[1].split('.')[0]}</span>
        <span class="log-level">[${log.level}]</span>
        <span class="log-message">${log.message}${dataStr}</span>
      </div>`;
    }).join('');
  },
  
  /**
   * 格式化日志为纯文本（用于复制）
   */
  formatLogsAsText() {
    if (this.logs.length === 0) {
      return '暂无日志';
    }
    
    const header = `=== Auto Redirect 测试日志 ===\n生成时间: ${new Date().toLocaleString()}\n日志条数: ${this.logs.length}\n\n`;
    
    const logText = this.logs.map(log => {
      const time = log.timestamp.split('T')[1].split('.')[0];
      const dataStr = log.data ? `\n数据: ${JSON.stringify(log.data, null, 2)}` : '';
      return `${time} [${log.level}] ${log.message}${dataStr}`;
    }).join('\n\n');
    
    return header + logText;
  }
};

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 智能处理URL模式，自动添加协议匹配
 * @param {string} pattern - 原始模式
 * @returns {string} - 处理后的模式
 */
function smartProcessUrlPattern(pattern) {
  Logger.debug(`智能协议处理开始`, { originalPattern: pattern });
  
  // 如果模式已经包含协议，直接返回
  if (pattern.match(/^https?:\/\//) || pattern.match(/^file:\/\//) || pattern.match(/^[a-z]+:\/\//)) {
    Logger.debug(`模式已包含协议，直接返回`, { pattern });
    return pattern;
  }
  
  // 检查是否是明确的本地文件路径
  if (pattern.match(/^[a-zA-Z]:\\/) || pattern.match(/^\//) || pattern.startsWith('file://')) {
    // 明确的本地文件路径
    const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const result = `(?:file:///|file://)?.*?${escapedPattern}`;
    Logger.debug(`明确本地文件模式处理`, { originalPattern: pattern, result });
    return result;
  } else if (pattern.endsWith('.html') || pattern.endsWith('.htm')) {
    // 可能是网络文件，也添加http/https支持
    const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const result = `(?:https?://.*?${escapedPattern}|file:///.*?${escapedPattern}|${escapedPattern})`;
    Logger.debug(`网络/本地文件模式处理`, { originalPattern: pattern, result });
    return result;
  }
  
  // 对于域名模式，创建一个能匹配http和https的模式
  // 支持端口号的情况
  if (pattern.includes(':') && pattern.match(/:\d+/)) {
    // 包含端口号的域名 - 使用正确的http/https匹配
    const result = `https?://${pattern}`;
    Logger.debug(`端口号域名模式处理`, { originalPattern: pattern, result });
    return result;
  } else if (pattern.includes('.') && (pattern.includes('/') || pattern.includes('*'))) {
    // 包含域名和路径的模式（如 old-domain.com/* 或 example.com/path）
    const result = `https?://${pattern}`;
    Logger.debug(`域名路径模式处理`, { originalPattern: pattern, result });
    return result;
  } else if (pattern.includes('.') || pattern.includes('localhost')) {
    // 普通域名或localhost - 使用正确的http/https匹配
    const result = `https?://.*?${pattern}`;
    Logger.debug(`普通域名模式处理`, { originalPattern: pattern, result });
    return result;
  }
  
  // 对于看起来像域名的模式（如 dev, api 等），也添加协议匹配
  if (pattern.match(/^[a-zA-Z][a-zA-Z0-9-]*\*?$/)) {
    // 简单的域名模式，添加协议匹配
    // 对于开头匹配，应该匹配域名部分以该模式开头
    const result = `https?://${pattern}`;
    Logger.debug(`简单域名模式处理`, { originalPattern: pattern, result });
    return result;
  }
  
  // 其他情况，保持原样
  Logger.debug(`其他情况，保持原样`, { pattern });
  return pattern;
}

/**
 * 处理匹配模式，支持不同的匹配类型和捕获组
 * @param {string} pattern - 原始匹配模式
 * @returns {object} - 包含处理后的正则表达式、匹配类型和捕获组信息
 */
function processMatchPattern(pattern) {
  const trimmedPattern = pattern.trim();
  
  // 精确匹配：=pattern
  if (trimmedPattern.startsWith('=')) {
    let exactPattern = trimmedPattern.substring(1);
    
    // 智能处理协议
    exactPattern = smartProcessUrlPattern(exactPattern);
    
    // 对精确匹配模式也进行URL标准化，与testUrlMatch中的逻辑保持一致
    // 只在URL看起来像是域名根路径时才移除末尾斜线
    if (exactPattern.match(/^https?:\/\/[^\/]+\/$/) || exactPattern.match(/^https?:\/\/[^\/]+:\d+\/$/)) {
      exactPattern = exactPattern.slice(0, -1);
    }
    
    const processedPattern = processPatternWithCaptures(exactPattern);
    return {
      regex: '^' + processedPattern.regex + '$',
      type: 'exact',
      captureCount: processedPattern.captureCount
    };
  }
  
  // 开头匹配：^pattern 或 pattern*
  if (trimmedPattern.startsWith('^') || trimmedPattern.endsWith('*')) {
    let cleanPattern = trimmedPattern;
    if (cleanPattern.startsWith('^')) {
      cleanPattern = cleanPattern.substring(1);
    }
    
    // 智能处理协议
    cleanPattern = smartProcessUrlPattern(cleanPattern);
    
    // 注意：不要移除末尾的*，让processPatternWithCaptures处理
    const processedPattern = processPatternWithCaptures(cleanPattern);
    return {
      regex: '^' + processedPattern.regex,
      type: 'prefix',
      captureCount: processedPattern.captureCount
    };
  }
  
  // 结尾匹配：*pattern 或 pattern$
  if (trimmedPattern.startsWith('*') || trimmedPattern.endsWith('$')) {
    let cleanPattern = trimmedPattern;
    // 注意：不要移除开头的*，让processPatternWithCaptures处理
    if (cleanPattern.endsWith('$')) {
      cleanPattern = cleanPattern.slice(0, -1);
    }
    
    // 对于结尾匹配，不自动添加协议，保持原有逻辑
    const processedPattern = processPatternWithCaptures(cleanPattern);
    return {
      regex: processedPattern.regex + '$',
      type: 'suffix',
      captureCount: processedPattern.captureCount
    };
  }
  
  // 默认包含匹配（保持向后兼容）
  // 对于包含匹配，不自动添加协议，保持原有逻辑
  const processedPattern = processPatternWithCaptures(trimmedPattern);
  return {
    regex: processedPattern.regex,
    type: 'contains',
    captureCount: processedPattern.captureCount
  };
}

/**
 * 处理模式中的通配符，转换为捕获组
 * @param {string} pattern - 原始模式
 * @returns {object} - 包含处理后的正则表达式和捕获组数量
 */
function processPatternWithCaptures(pattern) {
  // 检查是否已经是正则表达式格式（由smartProcessUrlPattern处理过）
  const isRegexPattern = pattern.match(/^\(\?\:/) || pattern.match(/^https?\?:/);
  
  let escaped;
  if (isRegexPattern) {
    // 如果已经是正则表达式格式，直接使用，只需要处理通配符
    escaped = pattern;
  } else {
    // 如果是普通字符串，需要转义特殊字符（除了*）
    escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // 计算通配符数量
  const wildcardCount = (pattern.match(/\*/g) || []).length;
  
  // 将 * 替换为捕获组，并记录数量
  let captureCount = 0;
  escaped = escaped.replace(/\*/g, (match, offset, string) => {
    captureCount++;
    
    // 如果只有一个通配符，或者这是最后一个通配符，使用贪婪匹配
    // 否则使用非贪婪匹配
    if (wildcardCount === 1 || captureCount === wildcardCount) {
      return '(.*)';  // 贪婪匹配
    } else {
      return '(.*?)';  // 非贪婪匹配
    }
  });
  
  return {
    regex: escaped,
    captureCount: captureCount
  };
}

/**
 * 解析目标URL模板中的占位符
 * @param {string} template - 目标URL模板
 * @returns {Array} - 占位符信息数组
 */
function parseUrlTemplate(template) {
  const placeholders = [];
  const regex = /\{(\d+)\}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    placeholders.push({
      placeholder: match[0],  // '{1}'
      index: parseInt(match[1]),  // 1
      position: match.index  // 在字符串中的位置
    });
  }
  
  // 按索引从大到小排序，避免替换时的位置冲突
  placeholders.sort((a, b) => b.index - a.index);
  
  Logger.debug(`解析URL模板`, { 
    template, 
    placeholders: placeholders.map(p => ({ placeholder: p.placeholder, index: p.index }))
  });
  
  return placeholders;
}

/**
 * 执行URL模板替换
 * @param {string} url - 原始URL
 * @param {string} pattern - 匹配模式
 * @param {string} template - 目标URL模板
 * @param {object} processedPattern - 处理后的模式信息
 * @returns {string|null} - 替换后的URL或null
 */
function performTemplateReplacement(url, pattern, template, processedPattern) {
  Logger.info(`开始模板替换`, { url, pattern, template });
  
  // 检查模板是否包含占位符
  const placeholders = parseUrlTemplate(template);
  
  // 如果没有占位符，直接返回模板（保持向后兼容）
  if (placeholders.length === 0) {
    Logger.debug(`模板无占位符，直接返回`, { template });
    return template;
  }
  
  // 执行正则匹配以获取捕获组
  try {
    // 标准化URL（与testUrlMatch中的逻辑保持一致）
    let normalizedUrl = url;
    if (url.match(/^https?:\/\/[^\/]+\/$/) || url.match(/^https?:\/\/[^\/]+:\d+\/$/)) {
      normalizedUrl = url.slice(0, -1);
      Logger.debug(`URL标准化: ${url} -> ${normalizedUrl}`);
    }
    
    const regex = new RegExp(processedPattern.regex, 'i');
    const match = normalizedUrl.match(regex);
    
    if (!match) {
      Logger.warn(`URL不匹配模式，无法进行模板替换`, { url: normalizedUrl, pattern: processedPattern.regex });
      return null;
    }
    
    Logger.debug(`正则匹配成功`, { 
      url: normalizedUrl,
      matchGroups: match.slice(1),  // 排除完整匹配
      captureCount: processedPattern.captureCount
    });
    
    // 执行模板替换
    let result = template;
    
    placeholders.forEach(ph => {
      if (ph.index > 0 && ph.index <= processedPattern.captureCount) {
        const capturedValue = match[ph.index] || '';
        Logger.debug(`替换占位符`, { 
          placeholder: ph.placeholder, 
          index: ph.index, 
          value: capturedValue 
        });
        
        // 使用全局替换，支持同一占位符多次使用
        result = result.replace(new RegExp(escapeRegExp(ph.placeholder), 'g'), capturedValue);
      } else {
        Logger.warn(`占位符索引超出范围`, { 
          placeholder: ph.placeholder, 
          index: ph.index, 
          maxIndex: processedPattern.captureCount 
        });
      }
    });
    
    Logger.info(`模板替换完成`, { originalTemplate: template, result });
    return result;
    
  } catch (error) {
    Logger.error(`模板替换过程中发生错误`, { pattern, template, error });
    return null;
  }
}

/**
 * 测试URL是否匹配指定的模式
 * @param {string} url - 要测试的URL
 * @param {string} regexPattern - 正则表达式模式
 * @param {string} matchType - 匹配类型
 * @returns {boolean} - 是否匹配
 */
function testUrlMatch(url, regexPattern, matchType) {
  try {
    let normalizedUrl = url;
    
    // 只在URL看起来像是域名根路径时才移除末尾斜线
    // 例如: http://example.com/ -> http://example.com
    // 但保留: http://example.com/path/ 不变
    if (url.match(/^https?:\/\/[^\/]+\/$/) || url.match(/^https?:\/\/[^\/]+:\d+\/$/)) {
      normalizedUrl = url.slice(0, -1);
      Logger.debug(`URL标准化: ${url} -> ${normalizedUrl}`);
    }
    
    const regex = new RegExp(regexPattern, 'i');
    const result = regex.test(normalizedUrl);
    
    Logger.debug(`URL匹配测试`, {
      url: normalizedUrl,
      pattern: regexPattern,
      matchType: matchType,
      result: result
    });
    
    return result;
  } catch (error) {
    Logger.error(`正则表达式错误: ${regexPattern}`, error);
    return false;
  }
}

/**
 * 解析重定向规则列表
 * @param {string} jumpList - 重定向规则文本
 * @returns {Array} - 解析后的规则数组
 */
function parseRedirectRules(jumpList) {
  const src_list = jumpList.split("\n");
  const j_list = [];

  src_list.forEach((v, i) => {
    const line = v.trim();
    // 跳过空行和注释行（以#开头的行）
    if (line != "" && !line.startsWith("#")) {
      const parts = line.split("####");
      if (parts.length >= 2) {
        const regStr = parts[0];
        const urlStr = parts[1];
        if (regStr) {
          const processedPattern = processMatchPattern(regStr);
          j_list.push({
            regStr: processedPattern.regex,
            urlStr: urlStr.replace(/\n/, "").replace(/\r/, ""),
            matchType: processedPattern.type,
            captureCount: processedPattern.captureCount || 0,
            originalPattern: regStr.trim(),
            originalRule: line,
            processedPattern: processedPattern  // 保存完整的处理信息
          });
        }
      }
    }
  });

  return j_list;
}

/**
 * 提取URL（用于空目标URL的情况）
 * @param {string} url - 当前URL
 * @param {string} originalPattern - 原始匹配模式
 * @returns {string|null} - 提取的URL或null
 */
function extractUrlFromPattern(url, originalPattern) {
  Logger.info(`开始URL提取`, { url, originalPattern });
  
  try {
    // 构建用于提取的正则表达式
    let extractPattern = originalPattern;
    
    // 处理不同的匹配模式前缀
    if (extractPattern.startsWith('=')) {
      extractPattern = extractPattern.substring(1);
      Logger.debug(`移除精确匹配前缀: ${extractPattern}`);
    } else if (extractPattern.startsWith('^')) {
      extractPattern = extractPattern.substring(1);
      Logger.debug(`移除开头匹配前缀: ${extractPattern}`);
    } else if (extractPattern.startsWith('*')) {
      extractPattern = extractPattern.substring(1);
      Logger.debug(`移除通配符前缀: ${extractPattern}`);
    }
    
    // 移除结尾的匹配符号
    if (extractPattern.endsWith('*')) {
      extractPattern = extractPattern.slice(0, -1);
      Logger.debug(`移除通配符后缀: ${extractPattern}`);
    } else if (extractPattern.endsWith('$')) {
      extractPattern = extractPattern.slice(0, -1);
      Logger.debug(`移除结尾匹配后缀: ${extractPattern}`);
    }
    
    // 转义正则特殊字符，但保留*作为通配符
    const escapedPattern = escapeRegExp(extractPattern).replace(/\\\*/g, '.*?');
    Logger.debug(`转义后的模式: ${escapedPattern}`);
    
    // 在模式后添加捕获组来提取剩余部分
    const extractRegex = new RegExp(escapedPattern + '(.*)$', 'i');
    Logger.debug(`提取正则表达式: ${extractRegex.source}`);
    
    const match = url.match(extractRegex);
    
    if (match && match[1]) {
      // 提取到的部分可能需要URL解码
      const rawExtracted = match[1];
      Logger.debug(`原始提取结果: ${rawExtracted}`);
      
      // 尝试URL解码
      try {
        const extractedUrl = decodeURIComponent(rawExtracted);
        Logger.info(`成功提取并解码URL: ${extractedUrl}`);
        return extractedUrl;
      } catch (decodeError) {
        // 如果解码失败，使用原始字符串
        Logger.warn(`URL解码失败，使用原始字符串: ${rawExtracted}`, decodeError);
        return rawExtracted;
      }
    } else {
      Logger.warn(`未能从URL中提取内容`, { url, pattern: extractRegex.source });
    }
  } catch (error) {
    Logger.error(`URL提取过程中发生错误`, { originalPattern, error });
  }
  
  return null;
}

/**
 * 查找URL的重定向匹配
 * @param {string} url - 要匹配的URL
 * @param {Array} rules - 解析后的规则数组
 * @param {Array} src_list - 原始规则行数组（用于查找完整规则）
 * @returns {Array} - 匹配的重定向目标数组
 */
function findRedirectMatches(url, rules, src_list) {
  Logger.info(`开始查找重定向匹配`, { url, rulesCount: rules.length });
  
  const result_list = [];
  const rule_info = [];

  rules.forEach((rule, index) => {
    Logger.debug(`测试规则 ${index + 1}/${rules.length}`, {
      pattern: rule.originalPattern,
      matchType: rule.matchType,
      targetUrl: rule.urlStr,
      captureCount: rule.captureCount
    });
    
    if (testUrlMatch(url, rule.regStr, rule.matchType)) {
      Logger.info(`规则匹配成功`, { 
        pattern: rule.originalPattern, 
        matchType: rule.matchType,
        captureCount: rule.captureCount
      });
      
      let targetUrl = rule.urlStr;
      let originalRule = src_list.find((line) => {
        const parts = line.split("####");
        return (
          parts.length >= 2 &&
          parts[0].trim() === rule.originalPattern
        );
      });

      // 处理目标URL
      if (!targetUrl || targetUrl.trim() === "") {
        // 通用URL提取功能：当目标URL为空时，基于匹配的规则模式提取URL
        Logger.info(`目标URL为空，尝试URL提取`, { pattern: rule.originalPattern });
        const extractedUrl = extractUrlFromPattern(url, rule.originalPattern);
        
        if (extractedUrl && extractedUrl.trim() !== "") {
          targetUrl = extractedUrl;
          Logger.info(`URL提取成功`, { extractedUrl });
        } else {
          // 如果没有提取到有效的URL，跳过这个规则
          Logger.warn(`未能提取到有效URL，跳过规则`, { pattern: rule.originalPattern });
          return;
        }
      } else {
        // 尝试模板替换（支持 {1}, {2} 等占位符）
        const templateResult = performTemplateReplacement(
          url, 
          rule.originalPattern, 
          targetUrl, 
          rule.processedPattern
        );
        
        if (templateResult !== null) {
          targetUrl = templateResult;
          Logger.info(`模板替换成功`, { 
            originalTemplate: rule.urlStr, 
            result: targetUrl,
            captureCount: rule.captureCount
          });
        } else {
          Logger.debug(`模板替换失败，使用原始目标URL`, { targetUrl });
        }
      }

      // 只有当目标URL有效时才添加到结果列表
      if (
        targetUrl &&
        targetUrl.trim() !== "" &&
        !result_list.includes(targetUrl)
      ) {
        result_list.push(targetUrl);
        rule_info.push({
          url: targetUrl,
          rule: originalRule || (rule.originalPattern + "####" + rule.urlStr),
          pattern: rule.originalPattern,
          matchType: rule.matchType,
          captureCount: rule.captureCount,
          originalTemplate: rule.urlStr
        });
        Logger.info(`添加重定向目标`, { 
          targetUrl, 
          pattern: rule.originalPattern,
          wasTemplateReplaced: targetUrl !== rule.urlStr
        });
      } else if (result_list.includes(targetUrl)) {
        Logger.debug(`重复的重定向目标，跳过`, { targetUrl });
      }
    } else {
      Logger.debug(`规则不匹配`, { pattern: rule.originalPattern });
    }
  });

  Logger.info(`重定向匹配完成`, { 
    matchCount: result_list.length,
    targets: result_list 
  });

  return { result_list, rule_info };
}

/**
 * 测试重定向链（用于测试工具）
 * @param {string} inputUrl - 输入URL
 * @param {string} jumpList - 重定向规则文本
 * @param {number} maxSteps - 最大重定向步数
 * @returns {Array} - 重定向链数组
 */
function testRedirectChain(inputUrl, jumpList, maxSteps = 5) {
  Logger.clearLogs(); // 清空之前的日志
  Logger.info(`开始测试重定向链`, { 
    inputUrl, 
    maxSteps,
    rulesLength: jumpList.split('\n').length 
  });
  
  const rules = parseRedirectRules(jumpList);
  const src_list = jumpList.split("\n");
  
  Logger.info(`解析规则完成`, { 
    totalLines: src_list.length,
    validRules: rules.length 
  });
  
  // 测试重定向链
  const redirectChain = [];
  const visitedUrls = new Set();
  let currentUrl = inputUrl;
  let stepCount = 0;
  
  Logger.info(`开始重定向链追踪`, { startUrl: currentUrl });
  
  while (stepCount < maxSteps) {
    stepCount++;
    Logger.info(`重定向步骤 ${stepCount}`, { currentUrl });
    
    // 检查是否已访问过此URL（循环检测）
    if (visitedUrls.has(currentUrl)) {
      Logger.error(`检测到循环重定向`, { 
        currentUrl, 
        visitedUrls: Array.from(visitedUrls),
        step: stepCount 
      });
      
      redirectChain.push({
        step: stepCount,
        url: currentUrl,
        type: 'cycle',
        message: '检测到循环重定向！'
      });
      break;
    }
    
    visitedUrls.add(currentUrl);
    Logger.debug(`添加URL到访问记录`, { url: currentUrl, visitedCount: visitedUrls.size });
    
    // 查找匹配的规则
    const { result_list, rule_info } = findRedirectMatches(currentUrl, rules, src_list);
    
    if (result_list.length === 0) {
      // 没有匹配的规则
      const message = stepCount === 1 ? '没有匹配的重定向规则' : '重定向链结束';
      Logger.info(`重定向链结束`, { 
        reason: 'no_match',
        step: stepCount,
        finalUrl: currentUrl 
      });
      
      redirectChain.push({
        step: stepCount,
        url: currentUrl,
        type: 'final',
        message: message
      });
      break;
    } else if (result_list.length === 1) {
      // 单个匹配
      const ruleInfo = rule_info[0];
      Logger.info(`单个规则匹配`, {
        step: stepCount,
        fromUrl: currentUrl,
        toUrl: ruleInfo.url,
        rule: ruleInfo.rule,
        matchType: ruleInfo.matchType
      });
      
      redirectChain.push({
        step: stepCount,
        url: currentUrl,
        targetUrl: ruleInfo.url,
        rule: ruleInfo.rule,
        pattern: ruleInfo.pattern,
        matchType: ruleInfo.matchType,
        type: 'single'
      });
      currentUrl = ruleInfo.url;
    } else {
      // 多个匹配
      Logger.info(`多个规则匹配`, {
        step: stepCount,
        url: currentUrl,
        matchCount: result_list.length,
        matches: rule_info.map(r => ({ url: r.url, pattern: r.pattern }))
      });
      
      redirectChain.push({
        step: stepCount,
        url: currentUrl,
        matches: rule_info,
        type: 'multiple',
        message: `找到 ${result_list.length} 个匹配的规则`
      });
      break;
    }
  }
  
  if (stepCount >= maxSteps && redirectChain[redirectChain.length - 1].type !== 'cycle') {
    Logger.warn(`达到最大重定向次数限制`, { 
      maxSteps, 
      currentStep: stepCount,
      currentUrl 
    });
    
    redirectChain.push({
      step: stepCount + 1,
      type: 'limit',
      message: `达到最大重定向次数限制（${maxSteps}次），停止测试`
    });
  }
  
  Logger.info(`重定向链测试完成`, {
    totalSteps: redirectChain.length,
    finalType: redirectChain[redirectChain.length - 1]?.type,
    visitedUrls: Array.from(visitedUrls)
  });
  
  return redirectChain;
}

// 导出函数（支持不同的模块系统）
if (typeof module !== 'undefined' && module.exports) {
  // Node.js环境
  module.exports = {
    Logger,
    processMatchPattern,
    processPatternWithCaptures,
    parseUrlTemplate,
    performTemplateReplacement,
    escapeRegExp,
    testUrlMatch,
    parseRedirectRules,
    extractUrlFromPattern,
    findRedirectMatches,
    testRedirectChain
  };
} else {
  // 浏览器环境或Service Worker环境
  const globalScope = (function() {
    if (typeof window !== 'undefined') return window;
    if (typeof self !== 'undefined') return self;
    if (typeof globalThis !== 'undefined') return globalThis;
    return this;
  })();
  
  if (globalScope) {
    globalScope.RedirectEngine = {
      Logger,
      processMatchPattern,
      processPatternWithCaptures,
      parseUrlTemplate,
      performTemplateReplacement,
      escapeRegExp,
      testUrlMatch,
      parseRedirectRules,
      extractUrlFromPattern,
      findRedirectMatches,
      testRedirectChain
    };
  }
} 