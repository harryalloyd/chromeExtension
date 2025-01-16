// Create a persistent connection to the background script
const port = chrome.runtime.connect();
console.log("Connecting to background script...");

// DOM references
const totalTrackersEl = document.getElementById("total-trackers");
const domainListEl = document.getElementById("domain-list");
const resetBtn = document.getElementById("reset-btn");

// Initialize Chart.js
const ctx = document.getElementById("domain-bar-chart").getContext("2d");
let domainBarChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Tracker Count",
        data: [],
        backgroundColor: "rgba(255, 99, 132, 0.6)"
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Third-Party Domains" }
      },
      y: {
        title: { display: true, text: "Request Count" },
        beginAtZero: true
      }
    }
  }
});

// Request domainCounts from background
port.postMessage({ type: "getTrackerData" });

// Listen for messages from background
port.onMessage.addListener((msg) => {
  console.log("Received from background:", msg);

  if (msg.domainCounts) {
    // Build the chart with top 5
    updateBarChart(msg.domainCounts);

    // Update total trackers
    const total = Object.values(msg.domainCounts).reduce((a, b) => a + b, 0);
    totalTrackersEl.textContent = `Total Trackers: ${total}`;

    // Update the <ul> with all domains
    updateDomainList(msg.domainCounts);
  }
});

// Update bar chart with top domains
function updateBarChart(domainCounts) {
  // Sort domains by descending count
  const sortedDomains = Object.keys(domainCounts).sort(
    (a, b) => domainCounts[b] - domainCounts[a]
  );
  // Get top 5
  const top5 = sortedDomains.slice(0, 5);

  // Prepare chart data
  const labels = top5;
  const data = top5.map(domain => domainCounts[domain]);

  // Replace chart data
  domainBarChart.data.labels = labels;
  domainBarChart.data.datasets[0].data = data;
  domainBarChart.update();
}

// Render the full domain list
function updateDomainList(domainCounts) {
  domainListEl.innerHTML = ""; // clear

  const entries = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
  // entries is an array of [domain, count], e.g. [ ["facebook.com", 12], ...]

  entries.forEach(([domain, count]) => {
    const li = document.createElement("li");
    li.textContent = `${domain} — ${count}`;
    domainListEl.appendChild(li);
  });
}

// Reset button
resetBtn.addEventListener("click", () => {
  port.postMessage({ type: "resetTrackerData" });
  // Clear local UI
  domainBarChart.data.labels = [];
  domainBarChart.data.datasets[0].data = [];
  domainBarChart.update();
  domainListEl.innerHTML = "";
  totalTrackersEl.textContent = "Total Trackers: 0";
});
