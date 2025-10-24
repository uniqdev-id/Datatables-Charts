# DataTables Charts

A powerful and easy-to-use plugin for DataTables that allows developers and users to generate charts directly from table data.

## Features

*   **Pivot Charts:** Support for wide-format data with multiple value columns for complex visualizations.
*   **Stacked Bar Charts:** Create stacked bar charts to visualize part-to-whole relationships with automatic sorting and limiting.
*   **Column Totals Charts:** Sum and compare total values across columns (stores/outlets) for performance analysis.
*   **Chart.js Options:** Full support for adding custom Chart.js options to customize chart appearance and behavior.
*   **Theming System:** Built-in light and dark themes for seamless integration with your website design.
*   **OnClick Callbacks:** Custom click handlers for charts with access to chart context, data, and DataTable instance.
*   **Interactive Charts:** Charts dynamically update as the data in the table is filtered or searched.
*   **Aggregation Engine:** Automatically `count`, `sum`, or `average` data for meaningful chart representations.
*   **Multiple Chart Types:** Support for bar, line, pie, doughnut, and other Chart.js chart types.
*   **Professional Controls:** Close and download buttons for each chart with smooth animations.
*   **Responsive Design:** Charts automatically adapt to different screen sizes.
*   **Powered by Chart.js:** Leverages the popular and flexible Chart.js library for robust charting capabilities.

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
    <!-- Optional: Theme CSS for dark/light themes -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/datatables-chart@latest/src/datatables.charts.themes.css">
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
    <!-- DataTables Buttons JS (required for chart buttons) -->
    <script src="https://cdn.datatables.net/buttons/2.4.1/js/dataTables.buttons.min.js"></script>
    <!-- DataTables Chart Plugin JS -->
    <script src="https://cdn.jsdelivr.net/npm/datatables-chart@latest/dist/datatables.charts.min.js"></script>

    <script>
        $(document).ready(function() {
            $('#myTable').DataTable({
                dom: 'Bfrtip', // Include buttons
                buttons: [
                    {
                        extend: 'charts',
                        text: '📊 Charts',
                        theme: 'light', // or 'dark' for dark theme
                        onClick: function(context) {
                            console.log('Chart clicked:', context.chart.title);
                            // Return false to prevent chart rendering
                        },
                        charts: [
                            {
                                type: 'bar',
                                title: 'Average Salary by Office',
                                data: {
                                    labelColumn: 'Office',
                                    valueColumn: 'Salary',
                                    aggregate: 'avg'
                                },
                                options: {
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }
                            },
                            {
                                type: 'pie',
                                title: 'Employee Count by Office',
                                data: {
                                    labelColumn: 'Office',
                                    aggregate: 'count'
                                }
                            }
                        ]
                    }
                ]
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
import 'datatables.net-buttons';
import 'datatables-chart';
import 'datatables-chart/src/datatables.charts.css';
import 'datatables-chart/src/datatables.charts.themes.css'; // Optional for themes

$('#myTable').DataTable({
    dom: 'Bfrtip',
    buttons: [
        {
            extend: 'charts',
            text: '📊 Charts',
            theme: 'light',
            onClick: function(context) {
                console.log('Chart clicked:', context.chart.title);
            },
            charts: [
                {
                    type: 'bar',
                    title: 'Average Salary by Office',
                    data: {
                        labelColumn: 'Office',
                        valueColumn: 'Salary',
                        aggregate: 'avg'
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top'
                            }
                        }
                    }
                }
            ]
        }
    ]
});
```

## Advanced Features

### Pivot Charts

For wide-format data with multiple value columns:

```javascript
charts: [
    {
        type: 'line',
        title: 'Sales Over Time',
        data: {
            labelColumn: 'Date',
            valueColumns: ['Store A', 'Store B', 'Store C']
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
]
```

### Stacked Bar Charts

Create stacked bar charts to visualize part-to-whole relationships. The plugin automatically sorts data by total value and limits the display:

- **Non-stacked bars:** Limited to top 10 items
- **Stacked bars:** Limited to top 20 items

```javascript
charts: [
    {
        type: 'bar',
        title: 'Sales by Product and Store',
        stacked: true,  // Enable stacking
        data: {
            labelColumn: 'Product Name',
            valueColumns: ['Store A', 'Store B', 'Store C', 'Store D']
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000) + 'K';
                        }
                    }
                }
            }
        }
    }
]
```

**Key Features:**
- Automatically sorts items by total value (highest first)
- Displays top 20 items for stacked bars, top 10 for regular bars
- All datasets are reordered consistently with labels
- Perfect for comparing contributions across multiple categories

### Column Totals Charts

Visualize the total value for each column (store/outlet) by summing all rows. This is useful for comparing overall performance across different categories:

```javascript
charts: [
    {
        type: 'bar',
        title: 'Total Sales by Store',
        data: {
            valueColumns: ['Store A', 'Store B', 'Store C', 'Store D'],
            columnTotals: true  // Enable column totals mode
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    }
]
```

**Key Features:**
- Sums all values in each column across all rows
- Automatically sorts stores by total sales (highest first)
- Perfect for comparing store/outlet performance
- Works with any chart type (bar, line, etc.)

### Custom Chart.js Options

Add any Chart.js options to customize your charts:

```javascript
charts: [
    {
        type: 'bar',
        title: 'Custom Styled Chart',
        data: {
            labelColumn: 'Category',
            valueColumn: 'Value',
            aggregate: 'sum'
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    }
]
```

### OnClick Callbacks

Handle chart clicks with custom logic:

```javascript
buttons: [
    {
        extend: 'charts',
        text: '📊 Charts',
        onClick: function(context) {
            console.log('Chart:', context.chart.title);
            console.log('DataTable:', context.dataTable);
            console.log('Data:', context.data);

            // Return false to prevent default chart rendering
            // return false;
        },
        charts: [...]
    }
]
```

### Theming

Choose between light and dark themes:

```javascript
buttons: [
    {
        extend: 'charts',
        text: '📊 Charts',
        theme: 'dark', // or 'light'
        charts: [...]
    }
]
```

## License

This project is licensed under the MIT License.