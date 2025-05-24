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
      chrome.action.setIcon({
        path: {
          19: "images/icon_19_bold.png",
          38: "images/icon_19_bold.png",
        },
      });
    } else {
      chrome.storage.local.set({ jump_list_auto: 0 });
      chrome.action.setIcon({
        path: {
          19: "images/icon_19.png",
          38: "images/icon_19.png",
        },
      });
    }
  });
});
