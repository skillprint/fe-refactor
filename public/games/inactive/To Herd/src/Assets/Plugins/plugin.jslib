mergeInto(LibraryManager.library, {
    LogEvent: function(str) {
        const event = JSON.parse(Pointer_stringify(str));
        logEvent(event);
    },
    ProgressOff: function() {
        gameInstance.logo.style.display = gameInstance.progress.style.display = "none";
    },
});
