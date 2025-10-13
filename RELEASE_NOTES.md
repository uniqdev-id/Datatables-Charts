# Release Notes for v1.0.1

## Changes since v1.0.0

- add log (4e066d5)
- fix releae (0703c5e)
- sync package lock (1844d67)
- add github actions for release (d8e5273)

## What's Included

### Core Files
- `src/datatables.charts.js` - Main plugin source
- `src/datatables.charts.css` - Styling with UI polish improvements
- `dist/datatables.charts.min.js` - Minified production build

### Examples & Documentation
- `examples/` - Usage examples and demos
- `README.md` - Installation and usage instructions
- `UI-POLISH-SUMMARY.md` - UI improvements documentation

## Installation

### Via Direct Download
1. Download the release files
2. Include in your HTML:
```html
<link rel="stylesheet" href="path/to/datatables.charts.css">
<script src="path/to/datatables.charts.min.js"></script>
```

### Usage
```javascript
$('#myTable').DataTable({
    // DataTable options
}).charts({
    type: 'bar',
    columns: [0, 1, 2]
});
```

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)

## Dependencies
- jQuery 3.x
- DataTables 1.10+
- Chart.js 3.x

---

For detailed examples and documentation, see the [examples](examples/) directory.
