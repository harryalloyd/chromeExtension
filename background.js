console.log("Background script running...");

// Initialize a counter for trackers
let trackerCount = 0;

// Helper function to extract the domain from a URL
function extractDomain(url) {
    return new URL(url).hostname.replace('www.', ''); // Extract hostname and remove 'www.'
  }

// Listen for network requests and count only third-party trackers
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        const currentTabDomain = extractDomain(tabs[0].url);
        const requestDomain = extractDomain(details.url);

        // Count as a tracker if the request domain is different from the tab domain
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
    console.log("Received message from popup:", msg); // Log the received message
    if (msg.type === "getTrackerCount") {
      port.postMessage({ count: trackerCount });
      console.log("Sent response to popup:", { count: trackerCount }); // Log the sent response
    } else if (msg.type === "resetTrackerCount") {
      trackerCount = 0;
      console.log("Tracker count reset");
    }
  });
});
