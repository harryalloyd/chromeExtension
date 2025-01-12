// Create a persistent connection to the background script
const port = chrome.runtime.connect();

// Request tracker count and list from the background script
port.postMessage({ type: "getTrackerCount" });

// Listen for responses from the background script
port.onMessage.addListener((response) => {
  const count = response ? response.count : 0;
  const trackers = response ? response.trackers : [];

  // Update tracker count
  document.getElementById("tracker-count").textContent = count;

  // Update tracker list
  const trackerListElement = document.getElementById("tracker-list");
  trackerListElement.innerHTML = ""; // Clear existing list
  trackers.forEach((tracker) => {
    const listItem = document.createElement("li");
    listItem.textContent = tracker;
    trackerListElement.appendChild(listItem);
  });
});

// Reset button functionality
document.getElementById("reset-btn").addEventListener("click", () => {
  port.postMessage({ type: "resetTrackerCount" });
  document.getElementById("tracker-count").textContent = 0;
  document.getElementById("tracker-list").innerHTML = ""; // Clear the list
});
