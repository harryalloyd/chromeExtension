console.log("Background script running...");

// A list of domains you consider "CDN" (you can add/remove as you like)
const KNOWN_CDN_DOMAINS = [
  "fonts.gstatic.com",
  "fonts.googleapis.com",
  "ajax.googleapis.com",
  "cdn.jsdelivr.net",
  "stackpath.bootstrapcdn.com",
  "stackpath.bootstrapcdn.com",
  "cdnjs.cloudflare.com",
  // add more if needed ...
];

// Object to track how many requests come from each third-party domain
let domainCounts = {};

// Helper function to extract the domain from a URL
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    return ""; // If something goes wrong parsing
  }
}

// Keep track of the current tab’s domain (for the active tab)
let currentTabDomain = "";

// Listen for tab changes so we know the “active” domain
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    currentTabDomain = extractDomain(tab.url);
    console.log("Active tab changed. Current domain:", currentTabDomain);
  } catch (e) {
    console.error("Error in onActivated:", e);
  }
});

// Also listen for updated URL in the same tab (like navigating within a tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    currentTabDomain = extractDomain(changeInfo.url);
    console.log("Tab updated. Current domain:", currentTabDomain);
  }
});

// Listen for all network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Skip if we don't have a current domain or no URL in details
    if (!currentTabDomain || !details.url) return;

    const requestDomain = extractDomain(details.url);

    // Basic conditions to treat this request as a "3rd-party tracker"
    const isSameDomain = (requestDomain === currentTabDomain);
    const isKnownCDN = KNOWN_CDN_DOMAINS.includes(requestDomain);

    // If it's a cross-domain request and NOT a known CDN, count it
    if (!isSameDomain && !isKnownCDN) {
      // Bump the count for that domain
      domainCounts[requestDomain] = (domainCounts[requestDomain] || 0) + 1;
      console.log("Third-party tracker detected:", details.url);
    }
  },
  { urls: ["<all_urls>"] }
);

// Listen for messages from the popup
chrome.runtime.onConnect.addListener((port) => {
  console.log("Connected to popup...");

  port.onMessage.addListener((msg) => {
    console.log("Received message from popup:", msg);

    if (msg.type === "getTrackerData") {
      // Send domainCounts to the popup
      port.postMessage({ domainCounts });
    } else if (msg.type === "resetTrackerData") {
      // Clear out the data
      domainCounts = {};
      port.postMessage({ domainCounts });
      console.log("Tracker data reset");
    }
  });
});
