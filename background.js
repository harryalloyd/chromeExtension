console.log("Background script running...");

// Initialize a counter for trackers
let trackerCount = 0;

// Listen for network requests and increment the tracker count
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    trackerCount++;
    console.log("Tracker detected:", details.url);
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
    }
  });
});
