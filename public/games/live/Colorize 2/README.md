# Colorize 2 Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments Testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` triggers adjustments in `parameters.json` which are applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key Mappings for Testing

We map 1-9 to combinations of category complexity and zoom constraints:

- **Key 1**: Simple Categories (animals, arabic, geometric), Full Zoom (EASY / RELAX)
- **Key 2**: Simple Categories, Medium Zoom (Zoom levels 1-3: up to 2.5x)
- **Key 3**: Simple Categories, No Zoom (Focus-Challenging Simple)
- **Key 4**: Medium Categories (adds florals, gardens), Full Zoom (STANDARD / FOCUS)
- **Key 5**: Medium Categories, Medium Zoom
- **Key 6**: Medium Categories, No Zoom (Focus-Challenging Medium)
- **Key 7**: Full Categories (all options), Full Zoom (HARD / DEFAULT)
- **Key 8**: Full Categories, Medium Zoom
- **Key 9**: Full Categories, No Zoom (EXTREME FOCUS / GRIT)

## Parameters

* **maxCategoryComplexity**: (Integer, 1 - 3) Restricts category page options in Level Select to adjust detail density:
  - `1`: Animals, Arabic, Geometric (low detail)
  - `2`: Adds Florals, Gardens (medium detail)
  - `3`: Adds Mandalas, Oriental (high detail, maximum cognitive load)
* **zoomLevelsCount**: (Integer, 1 - 5) Capping zoom increments to limit magnification. Lowering values restricts zooming in to fine details, forcing precise coloring clicks.
