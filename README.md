# DataTables Charts

A powerful and easy-to-use plugin for DataTables that allows developers and users to generate charts directly from table data.

## Features (Planned)

*   **Developer-Defined Charts:** Pre-configure charts that summarize table data.
*   **User-Driven Chart Builder:** An intuitive UI for end-users to create their own visualizations.
*   **Interactive:** Charts dynamically update as the data in the table is filtered.
*   **Aggregation Engine:** Automatically `count`, `sum`, or `average` data for meaningful charts.
*   **Powered by Chart.js:** Leverages the popular and flexible Chart.js library.

## Installation

**CDN (Coming Soon)**

```html
<!-- Add links here once deployed -->
```

## Quick Start

Include the necessary CSS and JS files, then configure the buttons in your DataTables initialization.

```html
<table id="myTable">
    ...
</table>
```

```javascript
$(document).ready(function() {
    $('#myTable').DataTable({
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv',
            // Chart configuration will go here
        ]
    });
});
```

## License

This project is licensed under the MIT License.