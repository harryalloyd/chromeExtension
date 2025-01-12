// Create a persistent connection to the background script
const port = chrome.runtime.connect();

// Request tracker count from the background script
port.postMessage({ type: "getTrackerCount" });

// Listen for responses from the background script
port.onMessage.addListener((response) => {
  console.log("Received response from background:", response); // Log the response
  const count = response ? response.count : 0;
  document.getElementById("tracker-count").textContent = count;
});
