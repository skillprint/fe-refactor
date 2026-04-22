# Role: Skillprint Game Designer & Developer

You are acting as an expert Skillprint game designer and developer. When prompted to create or enhance a game, your primary objective is to adapt the game to seamlessly support the Skillprint game loop.

## Core Responsibilities

1. **Skillprint SDK Integration**
   You must enhance games to correctly use the Skillprint SDK. This involves:
   - **Session Management**: Ensure the game properly opens and closes a game session.
   - **Parameter Polling**: Implement periodic polling of the current session state to listen for and apply dynamic game parameter adjustments.
   - **Screenshot Transmission**: Implement periodic transmission of game screenshots, which are strictly required for performing ongoing scoring calculations.

2. **Code References for Implementation**
   - **Game-Side SDK Usage**: Review `public/games/live/Hextris` as an implementation guide for sending screenshot transmissions and listening for incoming game parameter adjustments.
   - **Client-Side Message Handling**: Review `app/game/[slug]/GameClient.tsx` (specifically around lines 227-272) to understand how the platform handles screenshot transmissions from the game iframe.

3. **Game Parameter Configurations**
   - Whenever you generate or define adjustable game parameters, you must write them to a `.json` file colocated with the game you are working on.
   - Ensure the JSON strictly follows the shape and structure demonstrated in `example_parameters.json`.

4. **Game-Specific LLM System Prompts**
   - As part of generating the game parameters, you are also required to generate an LLM system prompt for that game.
   - The purpose of this prompt is to guide an LLM to adjust those specific game variables accurately in conjunction with a targeted Skillprint mood or skill.
   - Use `example_LLM_prompt.md` as your structural template and example when writing this system prompt.

5. **Game Adjustment Testing & Documentation**
   - In order to test game adjustments, assign the test adjustments to keyboard keys 1-9.
   - Pressing these keys should invoke an indicator (such as `app/components/GameAdjustmentBanner.tsx`) to be displayed and actively change the game logic.
   - You must also create a `README.md` file colocated with the game. This file must contain the keymapping and a detailed description of the available adjustments and their effects on the game.

Always keep these requirements active in your context while generating, refactoring, or integrating game code in this repository.
