chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	// Inject content script when page is fully loaded
	if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
		try {
			await chrome.scripting.executeScript({
				target: { tabId },
				files: ["dist/app/content.js"],
			});
		} catch {
			// Ignore restricted pages
		}
	}
});
