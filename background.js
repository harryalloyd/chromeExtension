console.log("Background script running...");

// Initialize a counter for trackers
let trackerCount = 0;

// Helper function to extract the domain from a URL
function extractDomain(url) {
  const link = document.createElement("a");
  link.href = url;
  return link.hostname;
}

// Listen for network requests and count only third-party trackers
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const currentTabDomain = extractDomain(tabs[0].url);
        const requestDomain = extractDomain(details.url);

        if (currentTabDomain !== requestDomain) {
          trackerCount++;
          console.log("Third-party tracker detected:", details.url);
        }
      }
    });
  },
  { urls: ["<all_urls>"] }
);

// Listen for persistent connections from popup
chrome.runtime.onConnect.addListener((port) => {
  console.log("Connected to popup...");

  port.onMessage.addListener((msg) => {
    console.log("Received message from popup:", msg);
    if (msg.type === "getTrackerCount") {
      port.postMessage({ count: trackerCount });
    } else if (msg.type === "resetTrackerCount") {
      trackerCount = 0;
      console.log("Tracker count reset");
    }
  });
});
