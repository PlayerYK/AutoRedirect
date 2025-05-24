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
      <h3>没有找到匹配的链接</h3>
      <p>当前页面没有匹配到任何重定向规则</p>
    </div>
  `;
}

function genUrlSelect(name, value, rules) {
  hideLoading();

  if (!value || value.length === 0) {
    showEmptyState();
    return;
  }

  var liStr = "";
  value.forEach(function (v, i) {
    const ruleInfo = rules && rules[i] ? rules[i] : null;
    const ruleText = ruleInfo ? ruleInfo.rule : "未知规则";
    const pattern = ruleInfo ? ruleInfo.pattern : "";
    const matchType = ruleInfo ? ruleInfo.matchType : "contains";

    // 匹配类型的中文显示和样式类
    const matchTypeMap = {
      'exact': { text: '精确匹配', class: 'exact' },
      'prefix': { text: '开头匹配', class: 'prefix' },
      'suffix': { text: '结尾匹配', class: 'suffix' },
      'contains': { text: '包含匹配', class: 'contains' }
    };
    const matchTypeInfo = matchTypeMap[matchType] || { text: '包含匹配', class: 'contains' };

    // 美化URL显示
    const displayUrl = v.length > 80 ? v.substring(0, 77) + "..." : v;

    liStr += `
      <li class="url-item">
        <div class="url-container">
          <a href="${v}" class="url-link" title="${v}">${displayUrl}</a>
          <div class="rule-info">
            <span class="rule-label">触发规则</span>
            <span class="rule-text">${ruleText}</span>
            <span class="match-type-label">匹配类型</span>
            <span class="match-type-badge ${matchTypeInfo.class}">${matchTypeInfo.text}</span>
          </div>
        </div>
      </li>
    `;
  });
  document.getElementById("list").innerHTML = liStr;
}

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
        <div class="icon">⚠️</div>
        <h3>加载超时</h3>
        <p>无法获取重定向选项，请刷新页面重试</p>
      </div>
    `;
  }
}, 5000);
