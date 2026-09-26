// ==UserScript==
// @name         Moneytree shortcut keys
// @version      1.3.3
// @description  Moneytree にショートカットキーを追加します
// @icon         https://www.google.com/s2/favicons?domain=getmoneytree.com
// @match        https://app.getmoneytree.com/*
// @run-at       document-end
// ==/UserScript==

// test/src/moneytree-shortcuts/index.user.ts
void (() => {
  document.onkeypress = (e) => {
    if (e.ctrlKey && e.code === "Enter") {
      const saveBtnInner = document.getElementsByClassName("modal-header-done-text")[0];
      if (saveBtnInner) {
        saveBtnInner.parentElement?.click();
      }
    }
  };
  document.onkeyup = (e) => {
    if (e.key === "Escape") {
      const cancelBtnInner = document.getElementsByClassName("modal-header-back-text")[0];
      if (cancelBtnInner) {
        cancelBtnInner.parentElement?.click();
      }
    }
  };
})();
