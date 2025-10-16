/**
 * Processes "wide" or "pivoted" data and renders the chart.
 * @param {DataTable.Api} dt - The DataTables API instance.
 * @param {object} config - The button's main configuration object.
 * @param {object} chartDef - The specific chart definition to render.
 */
function renderPivotChart(dt, config, chartDef) {
    console.log('renderPivotChart');
    const chartContainer = config._chartContainer;
    const canvas = chartContainer.find('canvas')[0];

    const columnMap = {};
    dt.columns().every(function () {
        var idx = this.index();
        var colName = this.column(idx).header();
        columnMap[$(colName).html()] = idx;
    });

    const labelColumnName = chartDef.data.labelColumn;
    const valueColumnNames = chartDef.data.valueColumns;

    // --- Data Transformation Logic ---
    const labels = [];
    const datasets = valueColumnNames.map(colName => ({
        label: colName,
        data: []
        // We can add logic for colors here later
    }));

    // Get all rows that match the current search filter
    const filteredRows = dt.rows({ search: 'applied' });

    // Iterate over the indexes of the filtered rows to get the data
    filteredRows.indexes().each(function (rowIndex) {
        const rowData = dt.row(rowIndex).data();
        const rawLabel = rowData[labelColumnName];
        const label = cleanHtmlFromText(rawLabel);

        // 1. Add the label for the X-axis
        labels.push(label);

        // 2. For each dataset, find the corresponding value in the row and add it
        valueColumnNames.forEach((colName, index) => {
            // console.log(`colName: ${colName}, index: ${index}`);
            // console.log(`rowData[colName]: ${rowData[colName]}`);
            const value = parseNumericValue(rowData[columnMap[colName]]);
            datasets[index].data.push(value);
        });
    });

    const chartData = {
        labels: labels,
        datasets: datasets
    };
    // --- End of Data Transformation ---

    // Destroy the old chart instance if it exists
    if (config._chartInstance) {
        config._chartInstance.destroy();
    }

    console.log('chartData');
    console.log(chartData);

    // Create the new Chart.js instance
    config._chartInstance = new Chart(canvas, {
        type: chartDef.type,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartDef.title
                }
            }
        }
    });
}