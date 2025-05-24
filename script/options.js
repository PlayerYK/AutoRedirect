var regPatternUrl = 'http://jslab.pro/autoredirect/regpattern.txt';

// 渲染测试结果
function renderTestResult(redirectChain) {
  const resultDiv = document.getElementById('test_result');
  
  if (redirectChain.length === 0) {
    resultDiv.innerHTML = '<div class="no-match">没有找到匹配的规则</div>';
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
            <span>重定向</span>
          </div>
          <div class="step-url">从: ${step.url}</div>
          <div class="step-url">到: ${step.targetUrl}</div>
          <div class="step-rule">匹配规则: ${step.rule}</div>
          <div class="step-rule">匹配类型: <span class="match-type-badge ${step.matchType}">${getMatchTypeText(step.matchType)}</span></div>
        `;
        break;
        
      case 'multiple':
        stepClass += ' warning-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">${step.step}</div>
            <span>多个匹配</span>
          </div>
          <div class="step-url">当前URL: ${step.url}</div>
          <div style="margin-top: 10px; font-weight: 600;">找到 ${step.matches.length} 个匹配的规则:</div>
        `;
        step.matches.forEach((match, i) => {
          stepContent += `
            <div class="match-item">
              <div class="match-url">${i + 1}. ${match.url}</div>
              <div class="match-rule">规则: ${match.rule}</div>
              <div class="match-rule">类型: <span class="match-type-badge ${match.matchType}">${getMatchTypeText(match.matchType)}</span></div>
            </div>
          `;
        });
        break;
        
      case 'cycle':
        stepClass += ' error-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">⚠️</div>
            <span>循环重定向</span>
          </div>
          <div class="step-url">URL: ${step.url}</div>
          <div style="color: #dc3545; font-weight: 600; margin-top: 8px;">${step.message}</div>
        `;
        break;
        
      case 'limit':
        stepClass += ' error-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">⚠️</div>
            <span>达到限制</span>
          </div>
          <div style="color: #dc3545; font-weight: 600;">${step.message}</div>
        `;
        break;
        
      case 'final':
        stepContent = `
          <div class="step-header">
            <div class="step-number">✓</div>
            <span>最终结果</span>
          </div>
          <div class="step-url">最终URL: ${step.url}</div>
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
    'exact': '精确匹配',
    'prefix': '开头匹配', 
    'suffix': '结尾匹配',
    'contains': '包含匹配'
  };
  return typeMap[type] || type;
}

async function initValue() {
  const result = await chrome.storage.local.get(["jump_list"]);
  let list = result.jump_list;

  if (!list) {
    try {
      const response = await fetch(regPatternUrl);
      const text = await response.text();
      document.getElementById("jump_list").value = text;
      await chrome.storage.local.set({ jump_list: text });
    } catch (error) {
      console.error("Failed to fetch pattern list:", error);
    }
  } else {
    document.getElementById("jump_list").value = list;
  }
}

function checkCircleRedirect(src_list) {
  src_list = src_list.split("\n");
  var errorList = [];
  src_list.forEach(function (v, i) {
    var line = v.trim();
    // 跳过空行和注释行（以#开头的行）
    if (line != "" && !line.startsWith("#")) {
      var parts = line.split("####");
      if (parts.length >= 2) {
        var regStr = parts[0];
        var urlStr = parts[1];

        // 空目标URL是允许的（用于通用URL提取功能，如知乎链接解码）
        // 只检查循环重定向
        if (urlStr && urlStr.trim() !== "" && urlStr.indexOf(regStr) != -1) {
          errorList.push("循环重定向: " + line);
        }
      } else if (parts.length === 1 && line.indexOf("####") !== -1) {
        // 检查格式错误（只有分隔符但没有目标URL）
        errorList.push("格式错误: " + line);
      }
    }
  });
  return errorList;
}

document.addEventListener("DOMContentLoaded", function () {
  initValue();

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
      await chrome.storage.local.set({ jump_list: srcList });
      const tips = document.getElementById("tips");
      tips.style.display = "block";
      tips.textContent = "保存成功！";
      setTimeout(function () {
        tips.style.display = "none";
      }, 1000);
    } else {
      var errAlert = "<h3>Redirect loop found!</h3><br>";
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
      alert("请输入要测试的URL");
      return;
    }
    
    if (!jumpList.trim()) {
      alert("请先配置重定向规则");
      return;
    }
    
    try {
      // 每次测试前先清空之前的日志
      RedirectEngine.Logger.clearLogs();
      
      // 设置日志级别为DEBUG以获取详细信息
      RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.DEBUG);
      
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
        '<div class="error-step"><div class="step-header"><div class="step-number">❌</div><span>测试出错</span></div><div style="color: #dc3545;">测试过程中发生错误，请检查规则格式是否正确</div></div>';
      
      // 即使出错也显示日志
      renderTestLogs();
    }
  });

  // 添加日志级别控制
  const logLevelSelect = document.getElementById("log_level");
  if (logLevelSelect) {
    logLevelSelect.addEventListener("change", function() {
      const level = parseInt(this.value);
      RedirectEngine.Logger.setLevel(level);
    });
  }

  // 添加清空日志按钮事件
  const clearLogsBtn = document.getElementById("clear_logs");
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener("click", function() {
      RedirectEngine.Logger.clearLogs();
      const logsContainer = document.getElementById('test_logs');
      if (logsContainer) {
        logsContainer.innerHTML = '<div class="no-logs">日志已清空</div>';
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
});

// 渲染测试日志
function renderTestLogs() {
  const logsContainer = document.getElementById('test_logs');
  if (!logsContainer) return;
  
  const logs = RedirectEngine.Logger.getLogs();
  
  if (logs.length === 0) {
    logsContainer.innerHTML = '<div class="no-logs">暂无日志</div>';
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
    showCopyMessage('暂无日志可复制', 'warning');
    return;
  }
  
  try {
    // 使用重定向引擎提供的格式化方法
    const fullText = RedirectEngine.Logger.formatLogsAsText();
    
    // 使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(fullText);
      showCopyMessage('日志已复制到剪贴板', 'success');
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
          showCopyMessage('日志已复制到剪贴板', 'success');
        } else {
          showCopyMessage('复制失败，请手动选择复制', 'error');
        }
      } catch (err) {
        showCopyMessage('复制失败: ' + err.message, 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
    
  } catch (error) {
    console.error('复制日志失败:', error);
    showCopyMessage('复制失败: ' + error.message, 'error');
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