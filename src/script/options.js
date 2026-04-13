// 渲染测试结果
function renderTestResult(redirectChain) {
  const resultDiv = document.getElementById('test_result');
  const esc = RedirectEngine.escapeHtml;
  
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
            <div class="step-number">${esc(String(step.step))}</div>
            <span>${chrome.i18n.getMessage("testResult_redirect")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_from")}: ${esc(step.url)}</div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_to")}: ${esc(step.targetUrl)}</div>
          <div class="step-rule">${chrome.i18n.getMessage("testResult_matchingRule")}: ${esc(step.rule)}</div>
          <div class="step-rule">${chrome.i18n.getMessage("testResult_matchingType")}: <span class="match-type-badge ${esc(step.matchType)}">${esc(getMatchTypeText(step.matchType))}</span></div>
        `;
        break;
        
      case 'multiple':
        stepClass += ' warning-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">${esc(String(step.step))}</div>
            <span>${chrome.i18n.getMessage("testResult_multipleMatches")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_currentURL")}: ${esc(step.url)}</div>
          <div style="margin-top: 10px; font-weight: 600;">${chrome.i18n.getMessage("testResult_foundNMatches", [step.matches.length])}</div>
        `;
        step.matches.forEach((match, i) => {
          stepContent += `
            <div class="match-item">
              <div class="match-url">${i + 1}. ${esc(match.url)}</div>
              <div class="match-rule">${chrome.i18n.getMessage("testResult_rule")}: ${esc(match.rule)}</div>
              <div class="match-rule">${chrome.i18n.getMessage("testResult_type")}: <span class="match-type-badge ${esc(match.matchType)}">${esc(getMatchTypeText(match.matchType))}</span></div>
            </div>
          `;
        });
        break;
        
      case 'cycle':
        stepClass += ' error-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">!</div>
            <span>${chrome.i18n.getMessage("testResult_cycleRedirect")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_url")}: ${esc(step.url)}</div>
          <div style="color: #dc2626; font-weight: 600; margin-top: 8px;">${esc(step.message)}</div>
        `;
        break;
        
      case 'limit':
        stepClass += ' error-step';
        stepContent = `
          <div class="step-header">
            <div class="step-number">!</div>
            <span>${chrome.i18n.getMessage("testResult_limitReached")}</span>
          </div>
          <div style="color: #dc2626; font-weight: 600;">${esc(step.message)}</div>
        `;
        break;
        
      case 'final':
        stepContent = `
          <div class="step-header">
            <div class="step-number">&check;</div>
            <span>${chrome.i18n.getMessage("testResult_finalResult")}</span>
          </div>
          <div class="step-url">${chrome.i18n.getMessage("testResult_finalURL")}: ${esc(step.url)}</div>
          <div style="color: #16a34a; font-weight: 600; margin-top: 8px;">${esc(step.message)}</div>
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
      messageEl.style.backgroundColor = '#2563eb';
      break;
    case 'error':
      messageEl.style.backgroundColor = '#dc2626';
      break;
    default:
      messageEl.style.backgroundColor = '#2563eb';
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

// === 编辑器增强 ===

function classifyLine(trimmed) {
  if (!trimmed) return 'empty';
  if (trimmed.startsWith('#')) return 'comment';
  if (trimmed.indexOf('####') !== -1) return 'valid';
  return 'error';
}

function updateLineNumbers() {
  const textarea = document.getElementById('jump_list');
  const lineNumbersEl = document.getElementById('line_numbers');
  if (!textarea || !lineNumbersEl) return;

  const lines = textarea.value.split('\n');
  let html = '';
  for (let i = 0; i < lines.length; i++) {
    var cls = classifyLine(lines[i].trim());
    if (cls === 'error') {
      html += '<span class="ln-error">' + (i + 1) + '</span>\n';
    } else {
      html += (i + 1) + '\n';
    }
  }
  lineNumbersEl.innerHTML = html;
}

function syncScroll() {
  const textarea = document.getElementById('jump_list');
  const lineNumbersEl = document.getElementById('line_numbers');
  const highlightEl = document.getElementById('highlight_layer');
  if (!textarea) return;
  if (lineNumbersEl) lineNumbersEl.scrollTop = textarea.scrollTop;
  if (highlightEl) {
    highlightEl.style.transform = 'translate(' + (-textarea.scrollLeft) + 'px,' + (-textarea.scrollTop) + 'px)';
  }
}

function updateHighlight() {
  const textarea = document.getElementById('jump_list');
  const highlightEl = document.getElementById('highlight_layer');
  if (!textarea || !highlightEl) return;

  const esc = RedirectEngine.escapeHtml;
  const lines = textarea.value.split('\n');
  const htmlLines = lines.map(function(line) {
    if (!line.trim()) return '\n';
    if (line.trimStart().startsWith('#')) {
      return '<span class="hl-comment">' + esc(line) + '</span>\n';
    }
    const sepIdx = line.indexOf('####');
    if (sepIdx === -1) {
      return highlightPrefix(esc(line)) + '\n';
    }
    const src = line.substring(0, sepIdx);
    const sep = '####';
    const dst = line.substring(sepIdx + 4);
    return highlightPrefix(esc(src)) + '<span class="hl-separator">' + esc(sep) + '</span><span class="hl-target">' + esc(dst) + '</span>\n';
  });
  highlightEl.innerHTML = htmlLines.join('');
}

function highlightPrefix(escapedLine) {
  if (escapedLine.startsWith('=')) return '<span class="hl-exact">' + escapedLine + '</span>';
  if (escapedLine.startsWith('^')) return '<span class="hl-prefix">' + escapedLine + '</span>';
  if (escapedLine.startsWith('$') || escapedLine.startsWith('*')) return '<span class="hl-suffix">' + escapedLine + '</span>';
  if (escapedLine.endsWith('*')) return '<span class="hl-prefix">' + escapedLine + '</span>';
  return '<span class="hl-contains">' + escapedLine + '</span>';
}

function updateRuleStats() {
  const textarea = document.getElementById('jump_list');
  const statsEl = document.getElementById('rule_stats');
  if (!textarea || !statsEl) return;

  const lines = textarea.value.split('\n');
  let total = 0, valid = 0, comments = 0, empty = 0, errors = 0;
  lines.forEach(function(line) {
    total++;
    switch (classifyLine(line.trim())) {
      case 'empty': empty++; break;
      case 'comment': comments++; break;
      case 'valid': valid++; break;
      case 'error': errors++; break;
    }
  });

  const i18n = chrome.i18n.getMessage;
  statsEl.innerHTML =
    '<span class="stat-item">' + i18n('statsTotal', [String(total)]) + '</span>' +
    '<span class="stat-item"><span class="stat-dot valid"></span> ' + i18n('statsValid', [String(valid)]) + '</span>' +
    '<span class="stat-item"><span class="stat-dot comment"></span> ' + i18n('statsComment', [String(comments)]) + '</span>' +
    '<span class="stat-item"><span class="stat-dot error"></span> ' + i18n('statsError', [String(errors)]) + '</span>';
}

function toggleCommentLines() {
  const textarea = document.getElementById('jump_list');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  const lineStartIdx = value.lastIndexOf('\n', start - 1) + 1;
  let lineEndIdx = value.indexOf('\n', end);
  if (lineEndIdx === -1) lineEndIdx = value.length;

  const selectedText = value.substring(lineStartIdx, lineEndIdx);
  const lines = selectedText.split('\n');

  const allCommented = lines.every(function(l) {
    var t = l.trim();
    return t === '' || t.startsWith('#');
  });

  const newLines = lines.map(function(line) {
    if (!line.trim()) return line;
    if (allCommented) {
      return line.replace(/^(\s*)#\s?/, '$1');
    } else {
      if (line.trimStart().startsWith('#')) return line;
      return '# ' + line;
    }
  });

  const newText = newLines.join('\n');
  textarea.setRangeText(newText, lineStartIdx, lineEndIdx, 'select');
  textarea.dispatchEvent(new Event('input'));
  textarea.focus();
}

function refreshEditor() {
  updateLineNumbers();
  updateHighlight();
  updateRuleStats();
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.ConfigManager === 'undefined') {
    console.error("ConfigManager未正确加载！");
    // 显示错误信息给用户
    const jumpList = document.getElementById("jump_list");
    if (jumpList) {
      jumpList.value = chrome.i18n.getMessage("options_error_configManagerNotLoaded_instructions");
    }
    return;
  }
  
  
  initValue().then(function() {
    refreshEditor();
  });

  // 编辑器事件绑定
  const jumpList = document.getElementById('jump_list');
  if (jumpList) {
    jumpList.addEventListener('input', refreshEditor);
    jumpList.addEventListener('scroll', syncScroll);

    jumpList.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleCommentLines();
      }
    });
  }

  const commentBtn = document.getElementById('btn_comment_toggle');
  if (commentBtn) {
    commentBtn.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
    commentBtn.addEventListener('click', function() {
      toggleCommentLines();
    });
  }

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
        const esc = RedirectEngine.escapeHtml;
        msgAlert.innerHTML = `<h3>${chrome.i18n.getMessage("options_save_failed_header")}</h3><br>${esc(chrome.i18n.getMessage("options_error_info", [error.message]))}`;
        msgAlert.style.display = "block";
      }
    } else {
      const esc = RedirectEngine.escapeHtml;
      var errAlert = `<h3>${chrome.i18n.getMessage("options_cycle_found_header")}</h3><br>`;
      errorArr.forEach(function (v, i) {
        errAlert += esc(v);
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
      showMessage(chrome.i18n.getMessage("options_enter_test_url"), "error");
      return;
    }
    
    if (!jumpList.trim()) {
      showMessage(chrome.i18n.getMessage("options_config_rules_first"), "error");
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
        `<div class="error-step"><div class="step-header"><div class="step-number">!</div><span>${chrome.i18n.getMessage("options_test_error_header")}</span></div><div style="color: #dc2626;">${chrome.i18n.getMessage("options_test_error_message")}</div></div>`;
      
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

  // 测试模式切换
  const modeSingleBtn = document.getElementById('mode_single');
  const modeBatchBtn = document.getElementById('mode_batch');
  const singlePanel = document.getElementById('single_test_panel');
  const batchPanel = document.getElementById('batch_test_panel');

  if (modeSingleBtn && modeBatchBtn) {
    modeSingleBtn.addEventListener('click', function() {
      modeSingleBtn.classList.add('active');
      modeBatchBtn.classList.remove('active');
      if (singlePanel) singlePanel.classList.add('active');
      if (batchPanel) batchPanel.classList.remove('active');
    });
    modeBatchBtn.addEventListener('click', function() {
      modeBatchBtn.classList.add('active');
      modeSingleBtn.classList.remove('active');
      if (batchPanel) batchPanel.classList.add('active');
      if (singlePanel) singlePanel.classList.remove('active');
    });
  }

  // 批量测试按钮
  const batchTestBtn = document.getElementById('batch_test_redirect');
  if (batchTestBtn) {
    batchTestBtn.addEventListener('click', function() {
      const batchInput = document.getElementById('batch_urls').value.trim();
      const rules = document.getElementById('jump_list').value;

      if (!batchInput) {
        showMessage(chrome.i18n.getMessage('options_enter_test_url'), 'error');
        return;
      }
      if (!rules.trim()) {
        showMessage(chrome.i18n.getMessage('options_config_rules_first'), 'error');
        return;
      }

      const urls = batchInput.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
      if (urls.length === 0) {
        showMessage(chrome.i18n.getMessage('options_enter_test_url'), 'error');
        return;
      }

      renderBatchResult(urls, rules);
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

// === 批量测试 ===

function renderBatchResult(urls, jumpList) {
  const resultDiv = document.getElementById('batch_result');
  if (!resultDiv) return;

  const esc = RedirectEngine.escapeHtml;
  const results = [];

  urls.forEach(function(url) {
    try {
      const chain = RedirectEngine.testRedirectChain(url, jumpList);
      results.push({ url: url, chain: chain, error: null });
    } catch (e) {
      results.push({ url: url, chain: [], error: e.message });
    }
  });

  let matched = 0, noMatch = 0, errors = 0;
  results.forEach(function(r) {
    if (r.error) { errors++; }
    else if (r.chain.length === 0) { noMatch++; }
    else { matched++; }
  });

  const i18n = chrome.i18n.getMessage;
  let html = '<div class="batch-summary">' +
    '<span>' + i18n('batchTotal', [String(results.length)]) + '</span>' +
    '<span style="color:#16a34a">' + i18n('batchMatched', [String(matched)]) + '</span>' +
    '<span style="color:#9ca3af">' + i18n('batchNoMatch', [String(noMatch)]) + '</span>' +
    (errors > 0 ? '<span style="color:#ef4444">' + i18n('batchErrors', [String(errors)]) + '</span>' : '') +
    '</div>';

  results.forEach(function(r, idx) {
    const finalStep = r.chain.length > 0 ? r.chain[r.chain.length - 1] : null;
    let statusClass, targetHtml;

    if (r.error) {
      statusClass = 'error';
      targetHtml = '<span class="batch-card-target none">' + esc(r.error) + '</span>';
    } else if (r.chain.length === 0) {
      statusClass = 'no-match';
      targetHtml = '<span class="batch-card-target none">' + i18n('batchNoMatchLabel') + '</span>';
    } else if (r.chain.some(function(s) { return s.type === 'multiple'; })) {
      statusClass = 'multi';
      var last = finalStep;
      targetHtml = '<span class="batch-card-target">' + (last && last.url ? esc(last.url) : '...') + '</span>';
    } else {
      statusClass = 'matched';
      targetHtml = '<span class="batch-card-target">' + (finalStep && finalStep.url ? esc(finalStep.url) : '') + '</span>';
    }

    html += '<div class="batch-card" data-idx="' + idx + '">' +
      '<div class="batch-card-header">' +
        '<span class="batch-card-arrow">&#x25B6;</span>' +
        '<span class="batch-card-status ' + statusClass + '"></span>' +
        '<span class="batch-card-url">' + esc(r.url) + '</span>' +
        '<span style="color:#999;flex-shrink:0">&rarr;</span>' +
        targetHtml +
      '</div>' +
      '<div class="batch-card-detail" id="batch_detail_' + idx + '">' +
        renderBatchCardDetail(r, esc) +
      '</div>' +
    '</div>';
  });

  resultDiv.innerHTML = html;

  resultDiv.querySelectorAll('.batch-card-header').forEach(function(header) {
    header.addEventListener('click', function() {
      this.parentElement.classList.toggle('open');
    });
  });
}

function renderBatchCardDetail(r, esc) {
  if (r.error) {
    return '<div style="color:#dc2626">' + esc(r.error) + '</div>';
  }
  if (r.chain.length === 0) {
    return '<div style="color:#888">' + chrome.i18n.getMessage('testResult_noMatch') + '</div>';
  }
  let html = '';
  r.chain.forEach(function(step) {
    switch (step.type) {
      case 'single':
        html += '<div class="redirect-step" style="padding:8px 10px;margin-bottom:6px">' +
          '<div style="font-weight:600;margin-bottom:4px">' + chrome.i18n.getMessage('testResult_redirect') + ' ' + esc(String(step.step)) + '</div>' +
          '<div class="step-url" style="padding:4px 8px">' + chrome.i18n.getMessage('testResult_to') + ': ' + esc(step.targetUrl) + '</div>' +
          '<div class="step-rule" style="padding:3px 8px;font-size:11px">' + esc(step.rule) + ' <span class="match-type-badge ' + esc(step.matchType) + '">' + esc(getMatchTypeText(step.matchType)) + '</span></div>' +
        '</div>';
        break;
      case 'multiple':
        html += '<div class="redirect-step warning-step" style="padding:8px 10px;margin-bottom:6px">' +
          '<div style="font-weight:600;margin-bottom:4px">' + chrome.i18n.getMessage('testResult_multipleMatches') + ' (' + step.matches.length + ')</div>';
        step.matches.forEach(function(m, i) {
          html += '<div class="match-item" style="padding:6px 8px;margin:4px 0">' + (i+1) + '. ' + esc(m.url) + '</div>';
        });
        html += '</div>';
        break;
      case 'cycle':
        html += '<div class="redirect-step error-step" style="padding:8px 10px;margin-bottom:6px;color:#dc2626">' + esc(step.message) + '</div>';
        break;
      case 'limit':
        html += '<div class="redirect-step error-step" style="padding:8px 10px;margin-bottom:6px;color:#dc2626">' + esc(step.message) + '</div>';
        break;
      case 'final':
        html += '<div class="redirect-step" style="padding:8px 10px;margin-bottom:6px;background:#f0fdf4;border-color:#bbf7d0">' +
          '<div style="font-weight:600;color:#166534">' + chrome.i18n.getMessage('testResult_finalURL') + ': ' + esc(step.url) + '</div>' +
        '</div>';
        break;
    }
  });
  return html;
}

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
  
  const esc = RedirectEngine.escapeHtml;
  const logsHtml = logs.map(log => {
    const levelClass = log.level.toLowerCase();
    const dataStr = log.data ? `<div class="log-data">${esc(JSON.stringify(log.data, null, 2))}</div>` : '';
    const time = log.timestamp.split('T')[1].split('.')[0];
    
    return `<div class="log-entry log-${esc(levelClass)}">
      <div class="log-header">
        <span class="log-time">${esc(time)}</span>
        <span class="log-level">[${esc(log.level)}]</span>
      </div>
      <div class="log-message">${esc(log.message)}</div>
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
      messageEl.style.backgroundColor = '#2563eb';
      break;
    case 'warning':
      messageEl.style.backgroundColor = '#d97706';
      break;
    case 'error':
      messageEl.style.backgroundColor = '#dc2626';
      break;
    default:
      messageEl.style.backgroundColor = '#2563eb';
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