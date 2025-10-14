# Modular Structure Documentation

This directory contains the modularized source code for the DataTables Charts plugin. The code has been split into logical, maintainable modules while preserving the single-file distribution.

## File Structure

```
src/js/
├── 01-wrapper-start-and-utils.js    # IIFE wrapper start + utility functions
├── 02-data-processing.js            # Data aggregation and processing
├── 03-theming.js                    # Theme detection and application
├── 04-chart-rendering-and-controls.js # Chart rendering and UI controls
└── 05-button-definition.js          # DataTables button definition + IIFE close
```

## Module Breakdown

### 01-wrapper-start-and-utils.js
- **Purpose**: IIFE wrapper opening and utility functions
- **Contains**:
  - `parseNumericValue()` - Currency and numeric parsing
  - `testCurrencyParsing()` - Development testing function
  - `testHtmlCleaning()` - Development testing function
  - `cleanHtmlFromText()` - HTML tag removal utility

### 02-data-processing.js
- **Purpose**: Core data processing and aggregation logic
- **Contains**:
  - `aggregateData()` - Main data aggregation function
  - `generateColors()` - Color palette generation for charts

### 03-theming.js
- **Purpose**: Theme system for light/dark/auto modes
- **Contains**:
  - `detectTheme()` - Automatic theme detection
  - `applyTheme()` - Theme application to containers
  - `getThemeColors()` - Theme-specific color schemes
  - `applyThemeColorsToChartData()` - Chart.js theme integration

### 04-chart-rendering-and-controls.js
- **Purpose**: Chart rendering and user interface controls
- **Contains**:
  - `renderChart()` - Main chart rendering with Chart.js
  - `closeChart()` - Chart cleanup and hiding
  - `downloadChart()` - Chart export functionality

### 05-button-definition.js
- **Purpose**: DataTables button integration and IIFE wrapper closing
- **Contains**:
  - `DataTable.ext.buttons.charts` - Button definition object
  - IIFE wrapper closing

## Build Process

The modular files are concatenated in numerical order to create a single JavaScript file:

```bash
# Development build (creates readable concatenated file)
npm run build:dev

# Production build (concatenated + minified)
npm run build
```

### Build Scripts

- `build:dev`: `concat -o dist/datatables.charts.js src/js/*.js`
- `build`: `concat -o dist/datatables.charts.js src/js/*.js && terser dist/datatables.charts.js -c -m -o dist/datatables.charts.min.js`

## Development Workflow

1. **Edit individual module files** in `src/js/`
2. **Test with development build**: `npm run build:dev`
3. **Lint the concatenated output**: `npm run lint`
4. **Create production build**: `npm run build`
5. **Test with examples**: `npm run dev`

## Key Benefits

- **Maintainability**: Each module has a single responsibility
- **Readability**: Smaller, focused files are easier to understand
- **Debugging**: Issues can be isolated to specific modules
- **Collaboration**: Multiple developers can work on different modules
- **Single Distribution**: End users still get one optimized file

## File Naming Convention

Files are prefixed with numbers (01-, 02-, etc.) to ensure correct concatenation order. This is important because:

1. The IIFE wrapper must start first and close last
2. Utility functions must be defined before they're used
3. The DataTables button registration must come after all functions are defined

## Notes

- Individual module files are not valid standalone JavaScript (they're fragments)
- Linting is performed on the concatenated output, not individual modules
- The original monolithic file is backed up as `datatables.charts.js.backup`
- All functionality remains identical - only the development structure changed

## Adding New Modules

If you need to add new functionality:

1. Create a new file with appropriate numbering (e.g., `06-new-feature.js`)
2. Ensure functions are defined before they're called in other modules
3. Update this documentation
4. Test the build process

Remember: The concatenation order matters!