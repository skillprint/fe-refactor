"use strict";



{
	const scriptsInEvents = {

		async Es_game_Event66_Act2(runtime, localVars)
		{
			var curLev = runtime.globalVars.currentLevel;
			logEvent({event: "LEVEL_START", level: curLev});
		},

		async Es_game_Event67_Act2(runtime, localVars)
		{
			var condition = localVars.Condition;
			var guess = runtime.globalVars.found;
			var timer = parseInt(runtime.globalVars.timer); 
			logEvent({event: "TAP", condition: condition, guess: guess, time : timer});
		},

		async Es_game_Event68_Act2(runtime, localVars)
		{
			var curLev = runtime.globalVars.currentLevel;
			logEvent({event: "LEVEL_RESTART", level: curLev});
		},

		async Es_game_Event69_Act2(runtime, localVars)
		{
			var condition = localVars.Condition;
			var guess = runtime.globalVars.found;
			var timer = parseInt(runtime.globalVars.timer); 
			logEvent({event: "LEVEL_FAILED",guess: guess, time : timer});
		},

		async Es_game_Event70_Act2(runtime, localVars)
		{
			var condition = localVars.Condition;
			var guess = runtime.globalVars.found;
			var timer = parseInt(runtime.globalVars.timer); 
			logEvent({event: "LEVEL_COMPLETE",guess: guess, time : timer});
		},

		async Es_game_Event71_Act2(runtime, localVars)
		{
			var curLev = runtime.globalVars.currentLevel;
			logEvent({event: "LEVEL_QUIT", level: curLev});
		},

		async Es_game_Event72_Act2(runtime, localVars)
		{
			logEvent({event: "ALL_LEVELS_COMPLETED"});
		}

	};
	
	self.C3.ScriptsInEvents = scriptsInEvents;
}
