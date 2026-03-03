window.Skillprint = {
    /**
     * Call this exactly once when your game has finished loading.
     * Pass in the full mapping of your adjustable parameters.
     */
    registerAdjustments: function (mappings) {
        // 1. Announce adjustments to parent window
        window.parent.postMessage({
            type: 'REGISTER_ADJUSTMENTS',
            mappings: mappings
        }, '*');

        // 2. Setup testing via keys 1-9
        window.addEventListener('keydown', function (event) {
            const key = event.key;
            if (mappings[key]) {
                const mapping = mappings[key];

                // If game implemented adjustGame, call it
                if (typeof window.adjustGame === 'function') {
                    window.adjustGame({
                        parameterName: mapping.parameterName,
                        parameterValue: mapping.value
                    });

                    // Notify parent that the adjustment happened
                    window.parent.postMessage({
                        type: 'ADJUSTMENT_MADE',
                        parameterName: mapping.parameterName,
                        parameterValue: mapping.value
                    }, '*');
                } else {
                    console.warn("Skillprint testing key pressed but window.adjustGame is not defined.");
                }
            }
        });
    }
};
