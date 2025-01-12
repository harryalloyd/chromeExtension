console.log("Background script running...");

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log("Request URL:", details.url);
  },
  { urls: ["<all_urls>"] }
);
