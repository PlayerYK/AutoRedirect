// 渲染测试结果
function renderTestResult(redirectChain) {
  const resultDiv = document.getElementById('test_result');
  
  if (redirectChain.length === 0) {
    resultDiv.innerHTML = `<div class="no-match">${chrome.i18n.getMessage("testResult_noMatch")}</div>`;
    return;
  }
  
  let html = '';
  
  redirectChain.forEach((step, index) => {
    let stepClass = 'redirect-step';
    let stepContent = '';
    
    switch (step.type) {
      case 'single':
        stepContent = `
          <div class="step-header">
            <div class="step-number">${step.step}</div>
            <span>${chrome.i18n.getMessage("testResult_redirect")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_from")}: ${step.url}</div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_to")}: ${step.targetUrl}</div>
          <div class="step-rule">${chrome.i18n.getMessage("testResult_matchingRule")}: ${step.rule}</div>
          <div class="step-rule">${chrome.i18n.getMessage("testResult_matchingType")}: <span class="match-type-badge ${step.matchType}">${getMatchTypeText(step.matchType)}</span></div>
        `;
        break;
        
      case 'multiple':
        stepClass += ' warning-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">${step.step}</div>
            <span>${chrome.i18n.getMessage("testResult_multipleMatches")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_currentURL")}: ${step.url}</div>
          <div style="margin-top: 10px; font-weight: 600;">${chrome.i18n.getMessage("testResult_foundNMatches", [step.matches.length])}</div>
        `;
        step.matches.forEach((match, i) => {
          stepContent += `
            <div class="match-item">
              <div class="match-url">${i + 1}. ${match.url}</div>
              <div class="match-rule">${chrome.i18n.getMessage("testResult_rule")}: ${match.rule}</div>
              <div class="match-rule">${chrome.i18n.getMessage("testResult_type")}: <span class="match-type-badge ${match.matchType}">${getMatchTypeText(match.matchType)}</span></div>
            </div>
          `;
        });
        break;
        
      case 'cycle':
        stepClass += ' error-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">⚠️</div>
            <span>${chrome.i18n.getMessage("testResult_cycleRedirect")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_url")}: ${step.url}</div>
          <div style="color: #dc3545; font-weight: 600; margin-top: 8px;">${step.message}</div>
        `;
        break;
        
      case 'limit':
        stepClass += ' error-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">⚠️</div>
            <span>${chrome.i18n.getMessage("testResult_limitReached")}</span>
          </div>
          <div style="color: #dc3545; font-weight: 600;">${step.message}</div>
        `;
        break;
        
      case 'final':
        stepContent = `
          <div class="step-header">
            <div class="step-number">✓</div>
            <span>${chrome.i18n.getMessage("testResult_finalResult")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_finalURL")}: ${step.url}</div>
          <div style="color: #28a745; font-weight: 600; margin-top: 8px;">${step.message}</div>
        `;
        break;
    }
    
    html += `<div class="${stepClass}">${stepContent}</div>`;
  });
  
  resultDiv.innerHTML = html;
}

function getMatchTypeText(type) {
  const typeMap = {
    'exact': chrome.i18n.getMessage("choseMatchTypeExact"),
    'prefix': chrome.i18n.getMessage("choseMatchTypePrefix"), 
    'suffix': chrome.i18n.getMessage("choseMatchTypeSuffix"),
    'contains': chrome.i18n.getMessage("choseMatchTypeContains")
  };
  return typeMap[type] || type;
}

async function initValue() {
  try {
    // 确保ConfigManager已加载
    if (typeof window.ConfigManager === 'undefined') {
      throw new Error(chrome.i18n.getMessage("options_error_configManagerNotLoaded"));
    }
    
    // 使用配置管理器获取配置
    const config = await window.ConfigManager.getConfig();
    document.getElementById("jump_list").value = config;
  } catch (error) {
    console.error("Failed to get config:", error);
    // 如果获取失败，显示错误信息
    document.getElementById("jump_list").value = chrome.i18n.getMessage("options_getConfigError", [error.message]);
  }
}

// 初始化扩展开关
async function initExtensionSwitch() {
  try {
    // 获取当前扩展状态
    const result = await chrome.storage.local.get(["jump_list_auto"]);
    const isAuto = result.jump_list_auto || 0;
    
    // 设置开关状态
    const switchElement = document.getElementById("extension_enabled_switch");
    if (switchElement) {
      switchElement.checked = isAuto == 1;
      updateSwitchStatus(isAuto == 1);
    }
    
    // 添加开关事件监听器
    if (switchElement) {
      switchElement.addEventListener("change", async function() {
        const newState = this.checked ? 1 : 0;
        
        try {
          // 保存新状态到存储
          await chrome.storage.local.set({ jump_list_auto: newState });
          updateSwitchStatus(this.checked);
          
          // 显示状态更新消息
          const messageKey = this.checked ? "options_extEnabled" : "options_extDisabled";
          showMessage(chrome.i18n.getMessage(messageKey), "success");
        } catch (error) {
          console.error("Failed to update extension state:", error);
          showMessage(chrome.i18n.getMessage("options_statusUpdateFailed", [error.message]), "error");
          // 恢复开关状态
          this.checked = !this.checked;
          updateSwitchStatus(this.checked);
        }
      });
    }
  } catch (error) {
    console.error("Failed to initialize extension switch:", error);
    showMessage(chrome.i18n.getMessage("options_switchInitFailed", [error.message]), "error");
  }
}

// 更新开关状态显示
function updateSwitchStatus(isEnabled) {
  const statusElement = document.getElementById("switch_status");
  if (statusElement) {
    const statusKey = isEnabled ? "options_statusOn" : "options_statusOff";
    statusElement.textContent = chrome.i18n.getMessage(statusKey);
    statusElement.className = isEnabled ? "switch-status enabled" : "switch-status disabled";
  }
}

// 显示消息提示
function showMessage(message, type = "info") {
  const messageEl = document.createElement('div');
  messageEl.textContent = message;

  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(100%);
  `;

  switch (type) {
    case 'success':
      messageEl.style.backgroundColor = '#28a745';
      break;
    case 'error':
      messageEl.style.backgroundColor = '#dc3545';
      break;
    default:
      messageEl.style.backgroundColor = '#007bff';
      break;
  }

  document.body.appendChild(messageEl);

  setTimeout(() => {
    messageEl.style.opacity = '1';
    messageEl.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          document.body.removeChild(messageEl);
        }
      }, 300);
    }
  }, 3000);
}

function checkCircleRedirect(src_list) {
  src_list = src_list.split("\n");
  var errorList = [];
  src_list.forEach(function (v, i) {
    var line = v.trim();
    if (line != "" && !line.startsWith("#")) {
      var parts = line.split("####");
      if (parts.length >= 2) {
        var regStr = parts[0];
        var urlStr = parts[1];
        if (urlStr && urlStr.trim() !== "" && urlStr.indexOf(regStr) != -1) {
          errorList.push(chrome.i18n.getMessage("options_error_cycle", [line]));
        }
      } else if (parts.length === 1 && line.indexOf("####") !== -1) {
        errorList.push(chrome.i18n.getMessage("options_error_format", [line]));
      }
    }
  });
  return errorList;
}

document.addEventListener("DOMContentLoaded", function () {
  // 调试：检查ConfigManager是否正确加载
  console.log("检查ConfigManager加载状态:");
  console.log("window.ConfigManager:", typeof window.ConfigManager);
  console.log("window.configManager:", typeof window.configManager);
  
  if (typeof window.ConfigManager === 'undefined') {
    console.error("ConfigManager未正确加载！");
    // 显示错误信息给用户
    const jumpList = document.getElementById("jump_list");
    if (jumpList) {
      jumpList.value = chrome.i18n.getMessage("options_error_configManagerNotLoaded_instructions");
    }
    return;
  }
  
  // Set switch labels dynamically to avoid inline script CSP violation
  const style = document.createElement('style');
  document.head.appendChild(style);
  const onText = chrome.i18n.getMessage('textOn');
  const offText = chrome.i18n.getMessage('textOff');
  if (onText) style.sheet.insertRule(`.slideThree:before { content: '${onText}'; }`, 0);
  if (offText) style.sheet.insertRule(`.slideThree:after { content: '${offText}'; }`, 1);
  
  initValue();

  // 初始化扩展开关
  initExtensionSwitch();

  // 标签页切换功能
  function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // 移除所有活动状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 添加当前活动状态
        this.classList.add('active');
        document.getElementById(targetTab + '-tab').classList.add('active');
      });
    });
  }

  // 初始化标签页切换
  initTabSwitching();

  document.getElementById("save").addEventListener("click", async function () {
    const msgAlert = document.getElementById("msg-alert");
    msgAlert.innerHTML = "";
    msgAlert.style.display = "none";

    var srcList = document.getElementById("jump_list").value;
    var errorArr = checkCircleRedirect(srcList);
    if (errorArr.length == 0) {
      try {
        // 确保ConfigManager已加载
        if (typeof window.ConfigManager === 'undefined') {
          throw new Error(chrome.i18n.getMessage("options_error_configManagerNotLoaded"));
        }
        
        // 使用配置管理器保存配置
        await window.ConfigManager.saveConfig(srcList);
        const tips = document.getElementById("tips");
        tips.style.display = "block";
        tips.textContent = chrome.i18n.getMessage("options_save_success");
        setTimeout(function () {
          tips.style.display = "none";
        }, 3000);
      } catch (error) {
        console.error("保存配置失败:", error);
        msgAlert.innerHTML = `<h3>${chrome.i18n.getMessage("options_save_failed_header")}</h3><br>${chrome.i18n.getMessage("options_error_info", [error.message])}`;
        msgAlert.style.display = "block";
      }
    } else {
      var errAlert = `<h3>${chrome.i18n.getMessage("options_cycle_found_header")}</h3><br>`;
      errorArr.forEach(function (v, i) {
        errAlert += v;
      });
      msgAlert.innerHTML = errAlert;
      msgAlert.style.display = "block";
    }
  });

  // 添加测试按钮事件监听器
  document.getElementById("test_redirect").addEventListener("click", function () {
    const testUrl = document.getElementById("test_url").value.trim();
    const jumpList = document.getElementById("jump_list").value;
    
    if (!testUrl) {
      alert(chrome.i18n.getMessage("options_enter_test_url"));
      return;
    }
    
    if (!jumpList.trim()) {
      alert(chrome.i18n.getMessage("options_config_rules_first"));
      return;
    }
    
    try {
      // 每次测试前先清空之前的日志
      RedirectEngine.Logger.clearLogs();
      
      // 设置日志级别为DEBUG以捕获所有日志
      RedirectEngine.Logger.setLevel(0); // 0 = DEBUG
      
      // 使用共享的重定向引擎
      const redirectChain = RedirectEngine.testRedirectChain(testUrl, jumpList);
      
      // 渲染测试结果
      renderTestResult(redirectChain);
      
      // 显示详细日志
      renderTestLogs();
      
    } catch (error) {
      console.error("测试重定向时出错:", error);
      RedirectEngine.Logger.error("测试重定向时出错", error);
      
      document.getElementById('test_result').innerHTML = 
        `<div class="error-step"><div class="step-header"><div class="step-number">❌</div><span>${chrome.i18n.getMessage("options_test_error_header")}</span></div><div style="color: #dc3545;">${chrome.i18n.getMessage("options_test_error_message")}</div></div>`;
      
      // 即使出错也显示日志
      renderTestLogs();
    }
  });

  // 添加日志级别控制
  const logLevelSelect = document.getElementById("log_level");
  if (logLevelSelect) {
    logLevelSelect.addEventListener("change", function() {
      // 日志级别更改时，仅重新渲染日志
      renderTestLogs();
    });
  }

  // 添加清空日志按钮事件
  const clearLogsBtn = document.getElementById("clear_logs");
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener("click", function() {
      RedirectEngine.Logger.clearLogs();
      const logsContainer = document.getElementById('test_logs');
      if (logsContainer) {
        logsContainer.innerHTML = `<div class="no-logs">${chrome.i18n.getMessage("options_logs_cleared")}</div>`;
      }
    });
  }

  // 添加复制日志按钮事件
  const copyLogsBtn = document.getElementById("copy_logs");
  if (copyLogsBtn) {
    copyLogsBtn.addEventListener("click", function() {
      copyLogsToClipboard();
    });
  }

  // 添加回车键支持
  document.getElementById("test_url").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("test_redirect").click();
    }
  });

  // 添加全局键盘快捷键支持
  document.addEventListener("keydown", function (e) {
    // 检查是否按下了 Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // 阻止浏览器默认的保存行为
      document.getElementById("save").click(); // 触发保存按钮点击事件
    }
  });

  // 为输入框添加特定的键盘快捷键支持
  document.getElementById("jump_list").addEventListener("keydown", function (e) {
    // 检查是否按下了 Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // 阻止浏览器默认的保存行为
      document.getElementById("save").click(); // 触发保存按钮点击事件
    }
  });
});

// 渲染测试日志
function renderTestLogs() {
  const logsContainer = document.getElementById('test_logs');
  if (!logsContainer) return;
  
  const allLogs = RedirectEngine.Logger.getLogs();
  
  const logLevelSelect = document.getElementById("log_level");
  const selectedLevel = logLevelSelect ? parseInt(logLevelSelect.value, 10) : 1; // 默认为 INFO

  const LOG_LEVEL_MAP = {
    'DEBUG': 0,
    'INFO': 1,
    'WARN': 2,
    'ERROR': 3
  };

  const logs = allLogs.filter(log => {
    const logNumericLevel = LOG_LEVEL_MAP[log.level.toUpperCase()];
    return typeof logNumericLevel !== 'undefined' && logNumericLevel >= selectedLevel;
  });
  
  if (logs.length === 0) {
    const logsContainer = document.getElementById('test_logs');
    if (logsContainer) {
      logsContainer.innerHTML = `<div class="no-logs">${chrome.i18n.getMessage("options_no_logs_yet")}</div>`;
    }
    return;
  }
  
  const logsHtml = logs.map(log => {
    const levelClass = log.level.toLowerCase();
    const dataStr = log.data ? `<div class="log-data">${JSON.stringify(log.data, null, 2)}</div>` : '';
    const time = log.timestamp.split('T')[1].split('.')[0];
    
    return `<div class="log-entry log-${levelClass}">
      <div class="log-header">
        <span class="log-time">${time}</span>
        <span class="log-level">[${log.level}]</span>
      </div>
      <div class="log-message">${log.message}</div>
      ${dataStr}
    </div>`;
  }).join('');
  
  logsContainer.innerHTML = logsHtml;
  
  // 自动滚动到底部
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// 复制日志到剪贴板
async function copyLogsToClipboard() {
  const logs = RedirectEngine.Logger.getLogs();
  
  if (logs.length === 0) {
    showCopyMessage(chrome.i18n.getMessage("options_no_logs_to_copy"), 'warning');
    return;
  }
  
  try {
    // 使用重定向引擎提供的格式化方法
    const fullText = RedirectEngine.Logger.formatLogsAsText();
    
    // 使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(fullText);
      showCopyMessage(chrome.i18n.getMessage("options_logs_copied"), 'success');
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showCopyMessage(chrome.i18n.getMessage("options_logs_copied"), 'success');
        } else {
          showCopyMessage(chrome.i18n.getMessage("options_copy_failed"), 'error');
        }
      } catch (err) {
        showCopyMessage(chrome.i18n.getMessage("options_copy_failed_error", [err.message]), 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
    
  } catch (error) {
    console.error('复制日志失败:', error);
    showCopyMessage(chrome.i18n.getMessage("options_copy_failed_error", [error.message]), 'error');
  }
}

// 显示复制结果消息
function showCopyMessage(message, type = 'info') {
  // 创建临时消息元素
  const messageEl = document.createElement('div');
  messageEl.className = `copy-message copy-message-${type}`;
  messageEl.textContent = message;
  
  // 添加样式
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `;
  
  // 根据类型设置背景色
  switch (type) {
    case 'success':
      messageEl.style.backgroundColor = '#28a745';
      break;
    case 'warning':
      messageEl.style.backgroundColor = '#ffc107';
      messageEl.style.color = '#212529';
      break;
    case 'error':
      messageEl.style.backgroundColor = '#dc3545';
      break;
    default:
      messageEl.style.backgroundColor = '#007bff';
  }
  
  // 添加到页面
  document.body.appendChild(messageEl);
  
  // 3秒后自动移除
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }
  }, 3000);
}