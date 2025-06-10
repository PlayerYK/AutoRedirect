/**
 * 配置管理器 - 统一处理重定向规则的获取、缓存和管理
 */
class ConfigManager {
  constructor() {
    this.baseConfigUrl = "https://extcreator.com/autoredirect/example_config";
    this.storageKey = "jump_list";
    this.cache = null;
    this.isLoading = false;
    this.loadPromise = null;
  }

  /**
   * 获取当前语言对应的配置文件URL
   * @returns {string} 配置文件URL
   */
  getConfigUrl() {
    // 获取浏览器语言
    const language = this.getBrowserLanguage();
    
    // 根据语言选择配置文件
    if (language.startsWith('zh')) {
      return `${this.baseConfigUrl}.zh-CN.txt`;
    } else {
      return `${this.baseConfigUrl}.en.txt`;
    }
  }

  /**
   * 获取浏览器语言
   * @returns {string} 语言代码
   */
  getBrowserLanguage() {
    // 优先使用Chrome扩展API获取语言
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) {
      return chrome.i18n.getUILanguage();
    }
    
    // 备用方案：使用浏览器语言
    if (typeof navigator !== 'undefined') {
      this.debugLog("备用方案：使用浏览器语言");
      this.debugLog("navigator.language", navigator.language);
      this.debugLog("navigator.userLanguage", navigator.userLanguage);
      return navigator.language || navigator.userLanguage || 'en';
    }
    
    // 默认返回英文
    return 'en';
  }

  /**
   * 获取配置 - 优先从缓存，然后本地存储，最后远程获取
   * @param {boolean} forceRefresh - 是否强制刷新配置
   * @returns {Promise<string>} 配置内容
   */
  async getConfig(forceRefresh = false) {
    // 如果有缓存且不强制刷新，直接返回缓存
    if (this.cache && !forceRefresh) {
      this.debugLog("从内存缓存获取配置");
      return this.cache;
    }

    // 如果正在加载中，返回加载Promise避免重复请求
    if (this.isLoading && this.loadPromise) {
      this.debugLog("配置正在加载中，等待完成");
      return await this.loadPromise;
    }

    // 开始加载配置
    this.isLoading = true;
    this.loadPromise = this._loadConfig(forceRefresh);

    try {
      const config = await this.loadPromise;
      this.cache = config;
      return config;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * 内部加载配置方法
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<string>} 配置内容
   */
  async _loadConfig(forceRefresh) {
    try {
      // 如果不强制刷新，先尝试从本地存储获取
      if (!forceRefresh) {
        const result = await chrome.storage.local.get([this.storageKey]);
        if (result[this.storageKey]) {
          this.debugLog("从本地存储获取配置");
          return result[this.storageKey];
        }
      }

      // 从远程获取配置
      const configUrl = this.getConfigUrl();
      this.debugLog("从远程服务器获取配置: " + configUrl);
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const config = await response.text();
      
      // 保存到本地存储
      await this.saveConfig(config);
      this.debugLog("配置已保存到本地存储");
      
      return config;

    } catch (error) {
      this.debugLog("获取配置失败: " + error.message);
      
      // 如果是强制刷新失败，尝试返回本地存储的配置
      if (forceRefresh) {
        const result = await chrome.storage.local.get([this.storageKey]);
        if (result[this.storageKey]) {
          this.debugLog("远程获取失败，使用本地存储的配置");
          return result[this.storageKey];
        }
      }
      
      throw new Error("无法获取配置: " + error.message);
    }
  }

  /**
   * 保存配置到本地存储
   * @param {string} config - 配置内容
   * @returns {Promise<void>}
   */
  async saveConfig(config) {
    try {
      await chrome.storage.local.set({ [this.storageKey]: config });
      this.cache = config; // 更新内存缓存
      this.debugLog("配置已保存");
    } catch (error) {
      this.debugLog("保存配置失败: " + error.message);
      throw error;
    }
  }

  /**
   * 清除配置缓存
   */
  clearCache() {
    this.cache = null;
    this.debugLog("配置缓存已清除");
  }

  /**
   * 检查配置是否存在
   * @returns {Promise<boolean>}
   */
  async hasConfig() {
    if (this.cache) {
      return true;
    }

    const result = await chrome.storage.local.get([this.storageKey]);
    return !!result[this.storageKey];
  }

  /**
   * 获取配置状态信息
   * @returns {Promise<object>}
   */
  async getConfigStatus() {
    const hasLocal = await this.hasConfig();
    const hasCache = !!this.cache;
    
    return {
      hasLocalStorage: hasLocal,
      hasMemoryCache: hasCache,
      isLoading: this.isLoading,
      configUrl: this.getConfigUrl()
    };
  }

  /**
   * 设置自定义配置URL基础路径
   * @param {string} baseUrl - 新的配置URL基础路径（不包含语言后缀）
   */
  setConfigUrl(baseUrl) {
    // 如果传入的是完整URL（包含.txt），则提取基础部分
    if (baseUrl.endsWith('.txt')) {
      // 移除语言后缀和.txt扩展名
      baseUrl = baseUrl.replace(/\.(zh-CN|en)\.txt$/, '').replace(/\.txt$/, '');
    }
    
    this.baseConfigUrl = baseUrl;
    this.clearCache(); // 清除缓存以便使用新URL
    this.debugLog("配置URL基础路径已更新: " + baseUrl);
  }

  /**
   * 调试日志
   * @param {string} message - 日志消息
   */
  debugLog(message) {
    if (typeof debugLog === 'function') {
      debugLog("[ConfigManager] " + message);
    } else {
      console.log("[ConfigManager] " + message);
    }
  }
}

// 创建全局单例实例
(function() {
  const configManagerInstance = new ConfigManager();
  
  if (typeof window !== 'undefined') {
    // 在页面环境中
    window.ConfigManager = configManagerInstance;
    // 同时也设置为全局变量，方便直接访问
    window.configManager = configManagerInstance;
  } else if (typeof self !== 'undefined') {
    // 在Service Worker环境中
    self.ConfigManager = configManagerInstance;
    self.configManager = configManagerInstance;
  } else if (typeof global !== 'undefined') {
    // 在Node.js环境中
    global.ConfigManager = configManagerInstance;
    global.configManager = configManagerInstance;
  }
})(); 