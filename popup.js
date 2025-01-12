// Create a persistent connection to the background script
const port = chrome.runtime.connect();

// Request tracker count from the background script
port.postMessage({ type: "getTrackerCount" });

// Listen for responses from the background script
port.onMessage.addListener((response) => {
  const count = response ? response.count : 0;
  document.getElementById("tracker-count").textContent = count;
});

// Reset button functionality
document.getElementById("reset-btn").addEventListener("click", () => {
  port.postMessage({ type: "resetTrackerCount" });
  document.getElementById("tracker-count").textContent = 0;
});
