// background.js
browser.scripting.registerContentScripts([{
  id: "scihelper",
  matches: ["*://docs.google.com/*"],
  js: ["mappings.js", "SciHelper.js"],
  allFrames: true,
  runAt: "document_idle"
}]);