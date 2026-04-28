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

/* console.log("WORKING");
chrome.runtime.onMessage.addListener((message, sender) => {
	console.log("HELLO");
	if (message.type === "AUTOFILL") {
		const tryAutofill = (attempts: number) => {
			if (attempts === 0) return;
			chrome.tabs.sendMessage(
				message.tabId,
				{
					type: "AUTOFILL",
					username: message.username,
					password: message.password,
				},
				() => {
					if (chrome.runtime.lastError) {
						setTimeout(() => tryAutofill(attempts - 1), 100);
					}
				},
			);
		};
		tryAutofill(10);
	}
});
 */
