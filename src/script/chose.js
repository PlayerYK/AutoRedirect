document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("list").addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      e.preventDefault();
      chrome.tabs.update(null, { url: e.target.getAttribute("href") });
    }
  });
});

function hideLoading() {
  const loading = document.querySelector(".loading");
  if (loading) {
    loading.classList.remove("show");
  }
}

function showEmptyState() {
  const list = document.getElementById("list");
  list.innerHTML = `
    <div class="empty-state">
      <div class="icon">🔍</div>
      <h3>${chrome.i18n.getMessage("choseEmptyStateHeader")}</h3>
      <p>${chrome.i18n.getMessage("choseEmptyStateMessage")}</p>
    </div>
  `;
}

function genUrlSelect(name, value, rules) {
  hideLoading();

  if (!value || value.length === 0) {
    showEmptyState();
    return;
  }

  const escape = typeof RedirectEngine !== 'undefined' ? RedirectEngine.escapeHtml : function(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  };
  const isSafe = typeof RedirectEngine !== 'undefined' ? RedirectEngine.isSafeUrl : function(u) {
    return /^https?:\/\//i.test(u) || /^file:\/\//i.test(u);
  };

  var liStr = "";
  value.forEach(function (v, i) {
    const ruleInfo = rules && rules[i] ? rules[i] : null;
    const ruleText = ruleInfo ? ruleInfo.rule : (chrome.i18n.getMessage("choseUnknownRule") || "Unknown Rule");
    const matchType = ruleInfo ? ruleInfo.matchType : "contains";

    const matchTypeMap = {
      'exact': { text: chrome.i18n.getMessage("choseMatchTypeExact"), class: 'exact' },
      'prefix': { text: chrome.i18n.getMessage("choseMatchTypePrefix"), class: 'prefix' },
      'suffix': { text: chrome.i18n.getMessage("choseMatchTypeSuffix"), class: 'suffix' },
      'contains': { text: chrome.i18n.getMessage("choseMatchTypeContains"), class: 'contains' }
    };
    const matchTypeInfo = matchTypeMap[matchType] || { text: chrome.i18n.getMessage("choseMatchTypeContains"), class: 'contains' };

    const displayUrl = v.length > 80 ? v.substring(0, 77) + "..." : v;
    const safeHref = isSafe(v) ? escape(v) : '#';

    liStr += `
      <li class="url-item">
        <div class="url-container">
          <a href="${safeHref}" class="url-link" title="${escape(v)}">${escape(displayUrl)}</a>
          <div class="rule-info">
            <span class="rule-label">${chrome.i18n.getMessage("choseRuleTriggerLabel")}</span>
            <span class="rule-text">${escape(ruleText)}</span>
            <span class="match-type-label">${chrome.i18n.getMessage("choseMatchTypeLabel")}</span>
            <span class="match-type-badge ${escape(matchTypeInfo.class)}">${escape(matchTypeInfo.text)}</span>
          </div>
        </div>
      </li>
    `;
  });
  document.getElementById("list").innerHTML = liStr;
}

// 主动向background请求数据，消除 setTimeout 竞态
chrome.runtime.sendMessage({ type: 'getChoseData' }, function (response) {
  if (chrome.runtime.lastError) {
    console.warn("Failed to get chose data:", chrome.runtime.lastError.message);
    return;
  }
  if (response && response.type === 'urls' && response.value && response.value.length > 0) {
    genUrlSelect(response.name, response.value, response.rules);
  }
});

// 保留被动监听作为兜底
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  if (request.type === "urls") {
    genUrlSelect(request.name, request.value, request.rules);
    if (callback) callback();
  }
});

// 如果5秒后还没有收到消息，显示错误状态
setTimeout(function () {
  const loading = document.querySelector(".loading");
  if (loading && loading.classList.contains("show")) {
    hideLoading();
    const list = document.getElementById("list");
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">&#x26A0;&#xFE0F;</div>
        <h3>${chrome.i18n.getMessage("choseTimeoutHeader")}</h3>
        <p>${chrome.i18n.getMessage("choseTimeoutMessage")}</p>
      </div>
    `;
  }
}, 5000);
