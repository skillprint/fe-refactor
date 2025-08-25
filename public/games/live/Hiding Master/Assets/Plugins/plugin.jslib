mergeInto(LibraryManager.library, {
    LogEvent: function(str) {
        const event = JSON.parse(Pointer_stringify(str));
        logEvent(event);
    },
    SendEndSignal: function(str) {
	window.parent.postMessage(Pointer_stringify(str),"*");
    },
    ProgressOff: function() {
        gameInstance.logo.style.display = gameInstance.progress.style.display = "none";
    },
});
