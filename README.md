# DataTables Charts

A powerful and easy-to-use plugin for DataTables that allows developers and users to generate charts directly from table data.

## Features (Planned)

*   **Developer-Defined Charts:** Pre-configure charts that summarize table data.
*   **User-Driven Chart Builder:** An intuitive UI for end-users to create their own visualizations.
*   **Interactive:** Charts dynamically update as the data in the table is filtered.
*   **Aggregation Engine:** Automatically `count`, `sum`, or `average` data for meaningful charts.
*   **Powered by Chart.js:** Leverages the popular and flexible Chart.js library.

## Installation

### NPM

```bash
npm install datatables-chart
```

### Yarn

```bash
yarn add datatables-chart
```

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/datatables-chart@latest/src/datatables.charts.css">
<script src="https://cdn.jsdelivr.net/npm/datatables-chart@latest/dist/datatables.charts.min.js"></script>
```

### Manual Download

Download the latest release from the [GitHub Releases page](https://github.com/annasblackhat/datatables-chart/releases) and include the files in your project:

```html
<link rel="stylesheet" href="path/to/datatables.charts.css">
<script src="path/to/datatables.charts.min.js"></script>
```

## Quick Start

### Prerequisites

Make sure you have the required dependencies:

- jQuery 3.x
- DataTables 1.10+
- Chart.js 3.x

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- DataTables Chart Plugin CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/datatables-chart@latest/src/datatables.charts.css">
</head>
<body>
    <table id="myTable" class="display">
        <thead>
            <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Office</th>
                <th>Salary</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>John Doe</td>
                <td>Developer</td>
                <td>New York</td>
                <td>$120,000</td>
            </tr>
            <!-- More data rows -->
        </tbody>
    </table>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <!-- DataTables Chart Plugin JS -->
    <script src="https://cdn.jsdelivr.net/npm/datatables-chart@latest/dist/datatables.charts.min.js"></script>

    <script>
        $(document).ready(function() {
            $('#myTable').DataTable({
                // DataTable configuration
            }).charts({
                type: 'bar',
                columns: [1, 3], // Position and Salary columns
                // Chart configuration options
            });
        });
    </script>
</body>
</html>
```

### NPM Usage

If you installed via NPM, you can import the plugin:

```javascript
import $ from 'jquery';
import 'datatables.net';
import 'datatables-chart';
import 'datatables-chart/src/datatables.charts.css';

// Initialize DataTable with charts
$('#myTable').DataTable().charts({
    type: 'bar',
    columns: [0, 1, 2]
});
```

## License

This project is licensed under the MIT License.