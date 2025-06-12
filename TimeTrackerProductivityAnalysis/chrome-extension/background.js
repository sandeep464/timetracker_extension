let activeTabId = null;
let startTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const now = Date.now();

  if (activeTabId !== null && startTime !== null) {
    const duration = now - startTime;

    try {
      // Get tab info of previously active tab
      const tab = await chrome.tabs.get(activeTabId);

      // Get existing logs from chrome.storage
      chrome.storage.local.get(["timeLogs"], (result) => {
        const logs = result.timeLogs || {};

        // Extract hostname from tab URL
        const hostname = new URL(tab.url).hostname;

        // Update stored logs with time spent
        logs[hostname] = (logs[hostname] || 0) + duration / 1000;

        // Save updated logs back to storage
        chrome.storage.local.set({ timeLogs: logs });

        // Send new log entry to backend
        fetch("http://localhost:3000/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "sandeep123", // Use your actual userId here or make it dynamic
            logs: [
              {
                site: hostname,
                timeSpent: duration / 1000,
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Server responded with status ${res.status}`);
            }
            return res.json();
          })
          .then((data) => console.log("Log saved to backend:", data))
          .catch((err) => console.error("API error:", err));
      });
    } catch (error) {
      // This error occurs if tab is closed or no longer available
      console.warn("Tab not found or closed before logging time:", error);
      // Optional: you can skip logging or handle differently here
    }
  }

  // Update active tab and start time for next log
  activeTabId = activeInfo.tabId;
  startTime = now;
});

// Listener to handle message requests for logs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTimeLogs") {
    chrome.storage.local.get(["timeLogs"], (result) => {
      sendResponse(result.timeLogs || {});
    });
    return true; // Keep message channel open for async response
  }
});
