# Trails WebAR - Skillprint SDK Integration

This directory contains the game-side configuration files for adaptive parameter adjustment in Trails WebAR.

## Adaptive Game Parameters

The game supports the following dynamic adjustments received from the Skillprint SDK platform:

- `totalNodesCount` (Integer): Total nodes spawned in a round (5 to 25, default 10).
- `rotateNodesAroundUser` (Boolean/Integer): Enable slow node orbit rotation around the camera (0/1).
- `rotationSpeed` (Float): Speed of node orbit rotation in degrees per second (1.0 to 20.0).
- `nodeDimension` (String): The sequence category and combination pattern:
  - `"numbers"`: numbers 1, 2, 3...
  - `"letters"`: letters A, B, C...
  - `"emojis"`: emojis sequence
  - `"alternating"`: alternating numbers and letters (1-A-2-B...)
- `arrowHelpfulness` (Integer): Pointer guidance level:
  - `0`: disabled (no off-screen arrow, no target highlights).
  - `1`: medium (directional off-screen arrow pointing to the next target).
  - `2`: high (directional off-screen arrow + pulsate highlight circle when target is on-screen).

## Keyboard Test Mapping (Keys 1-9)

You can trigger manual adjustments during play using keyboard keys 1-9. Each key sends a preset adjustment layout:

- `1`: Fewer nodes (`totalNodesCount = 5`) — Easy.
- `2`: More nodes (`totalNodesCount = 15`) — Medium.
- `3`: Enable orbital movement (`rotateNodesAroundUser = true`, `rotationSpeed = 8.0`) — Dynamic visual search.
- `4`: Letters-only sequence (`nodeDimension = "letters"`).
- `5`: Emojis-only sequence (`nodeDimension = "emojis"`).
- `6`: Alternating sequence (`nodeDimension = "alternating"`).
- `7`: Off-screen arrow help only (`arrowHelpfulness = 1`) — Medium assistance.
- `8`: No pointer helper assistance (`arrowHelpfulness = 0`) — Hard search mode.
- `9`: Extreme Mode (`totalNodesCount = 25`, `rotateNodesAroundUser = true`, `rotationSpeed = 15.0`, `arrowHelpfulness = 0`) — Highest cognitive load.

## Deep Space Levels (Group 12, Levels 41-44)

The game includes a set of levels utilizing a 3D space scene as a background with slow-motion drifting:
- **Level 41: Nebula Drift** - Connect nodes in a teal/green nebula near a gas giant planet and a glowing blue star.
- **Level 42: Binary System** - Orbiting yellow and red-orange binary suns, a purple nebula, and a volcanic lava planet.
- **Level 43: Ice Ring** - Connect nodes in an indigo/magenta nebula with an icy planet and white sun.
- **Level 44: Solar System** - A central star/sun with three orbiting planets of different types revolving at different speeds.
