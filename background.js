chrome.runtime.onMessage.addListener(message=>{ // yes this is the only background script, download an object URL when given one
	chrome.downloads.download(message,()=>URL.revokeObjectURL(message.url))
});
