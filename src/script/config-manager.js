/**
 * 配置管理器 - 统一处理重定向规则的获取、缓存和管理
 */
class ConfigManager {
  constructor() {
    this.defaultConfigUrl = "https://extcreator.com/autoredirect/example_config.txt";
    this.storageKey = "jump_list";
    this.cache = null;
    this.isLoading = false;
    this.loadPromise = null;
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
      this.debugLog("从远程服务器获取配置: " + this.defaultConfigUrl);
      const response = await fetch(this.defaultConfigUrl);
      
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
      configUrl: this.defaultConfigUrl
    };
  }

  /**
   * 设置自定义配置URL
   * @param {string} url - 新的配置URL
   */
  setConfigUrl(url) {
    this.defaultConfigUrl = url;
    this.clearCache(); // 清除缓存以便使用新URL
    this.debugLog("配置URL已更新: " + url);
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