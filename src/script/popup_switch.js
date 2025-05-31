document.addEventListener("DOMContentLoaded", function () {
  // Load initial state from chrome.storage
  chrome.storage.local.get(["jump_list_auto"], function (result) {
    const isAuto = result.jump_list_auto || 0;
    const slider = document.getElementById("slideThree");

    if (isAuto == 1) {
      slider.checked = true;
    } else {
      slider.checked = false;
    }
  });

  document.getElementById("slideThree").addEventListener("click", function () {
    const slider = this;
    if (slider.checked) {
      chrome.storage.local.set({ jump_list_auto: 1 });
      const icon19on = chrome.runtime.getURL("images/icon_19_bold.png");
      // const icon38on = chrome.runtime.getURL("images/icon_38.png"); // This line was part of the logging, can be removed if icon38on is not used elsewhere
      // console.log("Popup: Setting 'On' icon. Path 19:", icon19on, "Path 38:", icon38on);
      chrome.action.setIcon({
        path: icon19on, // 使用简化的path进行测试
      }, () => {
        if (chrome.runtime.lastError) {
          // console.error("Popup: Error setting icon to 'On' state:", chrome.runtime.lastError.message);
        } else {
          // console.log("Popup: Icon successfully set to 'On' state (using single path).");
        }
      });
      chrome.action.setTitle({
        title: "Auto Redirect - On"
      }).then(() => {
        // console.log("Popup: Title set to: Auto Redirect - On");
      }).catch((error) => {
        // console.error("Popup: Failed to set title (On):", error);
      });
    } else {
      chrome.storage.local.set({ jump_list_auto: 0 });
      const icon19off = chrome.runtime.getURL("images/icon_19.png");
      // const icon38off = chrome.runtime.getURL("images/icon_38.png"); // This line was part of the logging, can be removed if icon38off is not used elsewhere
      // console.log("Popup: Setting 'Off' icon. Path 19:", icon19off, "Path 38:", icon38off);
      chrome.action.setIcon({
        path: icon19off, // 使用简化的path进行测试
      }, () => {
        if (chrome.runtime.lastError) {
          // console.error("Popup: Error setting icon to 'Off' state:", chrome.runtime.lastError.message);
        } else {
          // console.log("Popup: Icon successfully set to 'Off' state (using single path).");
        }
      });
      chrome.action.setTitle({
        title: "Auto Redirect - Off"
      }).then(() => {
        // console.log("Popup: Title set to: Auto Redirect - Off");
      }).catch((error) => {
        // console.error("Popup: Failed to set title (Off):", error);
      });
    }
  });
});
