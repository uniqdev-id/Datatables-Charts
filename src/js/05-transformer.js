/**
 * Processes column totals (sums all values in each column/store).
 * @param {DataTable.Api} dt - The DataTables API instance.
 * @param {object} config - The button's main configuration object.
 * @param {object} chartDef - The specific chart definition to render.
 */
function renderColumnTotalsChart(dt, config, chartDef) {
    console.log('renderColumnTotalsChart');
    const chartContainer = config._chartContainer;
    const canvas = chartContainer.find('canvas')[0];

    const columnMap = {};
    dt.columns().every(function () {
        var idx = this.index();
        var colName = this.column(idx).header();
        columnMap[$(colName).html()] = idx;
    });

    const valueColumnNames = chartDef.data.valueColumns;

    // --- Data Transformation Logic ---
    // For each column, sum all values in that column
    const labels = [];
    const totals = [];

    valueColumnNames.forEach(colName => {
        labels.push(colName);
        let columnTotal = 0;

        // Get all rows that match the current search filter
        const filteredRows = dt.rows({ search: 'applied' });

        // Sum all values in this column
        filteredRows.indexes().each(function (rowIndex) {
            var rowData = dt.row(rowIndex).data();
            if (!Array.isArray(rowData)) {
                console.log('rowData is not array, converting to array');
                rowData = Object.values(rowData);
            }
            const value = parseNumericValue(rowData[columnMap[colName]]);
            if (!isNaN(value)) {
                columnTotal += value;
            }
        });

        totals.push(columnTotal);
    });

    const chartData = {
        labels: labels,
        datasets: [{
            label: chartDef.title,
            data: totals
        }]
    };

    // --- End of Data Transformation ---

    // --- Sorting Logic for Column Totals ---
    // Create array of indices with their totals for sorting
    const indexedTotals = totals.map((total, index) => ({ index, total }));

    // Sort by total in descending order (highest first)
    indexedTotals.sort((a, b) => b.total - a.total);

    // Reorder labels and data based on sorted indices
    chartData.labels = indexedTotals.map(item => chartData.labels[item.index]);
    chartData.datasets[0].data = indexedTotals.map(item => chartData.datasets[0].data[item.index]);

    console.log(`📊 Column totals chart sorted by total value`);
    // --- End of Sorting Logic ---

    // --- Chart.js Options Logic ---
    const chartOptions = {
        ...chartDef.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: chartDef.title
            }
        }
    };

    // Destroy the old chart instance if it exists
    if (config._chartInstance) {
        config._chartInstance.destroy();
    }

    console.log('chartData');
    console.log(chartData);

    // Create the new Chart.js instance using our dynamically built options
    config._chartInstance = new Chart(canvas, {
        type: chartDef.type,
        data: chartData,
        options: chartOptions
    });
}

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
        var rowData = dt.row(rowIndex).data();
         if (!Array.isArray(rowData)) {
            console.log('rowData is not array, converting to array');
            rowData = Object.values(rowData);
        } 
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
            if (isNaN(value)) {
                console.warn('⚠️ Skipping row with invalid value:', value);
                console.log(`colName: ${colName}, columnMap: ${JSON.stringify(columnMap)}, rowData[colName]: ${rowData[columnMap[colName]]}, rowData: ${JSON.stringify(rowData)}`);
            }
        });
    });

    const chartData = {
        labels: labels,
        datasets: datasets
    };

    // --- End of Data Transformation ---

    // --- Sorting and Limiting Logic for Bar Charts ---
    if (chartDef.type === 'bar') {
        // Calculate total for each row (sum of all values in that row)
        const rowTotals = chartData.datasets[0].data.map((_, rowIndex) => {
            return chartData.datasets.reduce((sum, dataset) => sum + dataset.data[rowIndex], 0);
        });

        // Create array of indices with their totals for sorting
        const indexedTotals = rowTotals.map((total, index) => ({ index, total }));

        // Sort by total in descending order (highest first)
        indexedTotals.sort((a, b) => b.total - a.total);

        // Determine limit based on stacked property
        const limit = chartDef.stacked === true ? 20 : 10;

        // Take only the top N items
        const topIndices = indexedTotals.slice(0, limit).map(item => item.index);

        // Reorder labels and datasets based on sorted indices
        chartData.labels = topIndices.map(idx => chartData.labels[idx]);
        chartData.datasets = chartData.datasets.map(dataset => ({
            ...dataset,
            data: topIndices.map(idx => dataset.data[idx])
        }));

        console.log(`📊 Bar chart limited to top ${limit} items (stacked: ${chartDef.stacked === true})`);
    }
    // --- End of Sorting and Limiting Logic ---

    // --- Chart.js Options Logic ---
    // Start with a base options object
    const chartOptions = {
        ...chartDef.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: chartDef.title
            }
        }
    };

    // ** NEW LOGIC FOR STACKED BARS **
    // If the developer set "stacked: true" in the config,
    // we merge in the specific 'scales' options that Chart.js needs.
    if (chartDef.stacked === true && chartDef.type === 'bar') {
        chartOptions.scales = {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            }
        };
    }

    // Destroy the old chart instance if it exists
    if (config._chartInstance) {
        config._chartInstance.destroy();
    }

    console.log('chartData');
    console.log(chartData);

    // Create the new Chart.js instance using our dynamically built options
    config._chartInstance = new Chart(canvas, {
        type: chartDef.type,
        data: chartData,
        options: chartOptions
    });
}