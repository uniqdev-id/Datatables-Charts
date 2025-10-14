/**
 * Aggregates data from a DataTable based on a given configuration.
 * @param {DataTable.Api} dt - The DataTables API instance.
 * @param {object} chartDef - The chart definition object from the config.
 * @returns {object} Data formatted for Chart.js ({ labels: [], datasets: [] }).
 */
function aggregateData(dt, chartDef) {
    console.log('📊 aggregateData called with chartDef:', chartDef);

    // Run tests in development
    if (
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost'
    ) {
        testCurrencyParsing();
        testHtmlCleaning();
    }

    const columnMap = {};
    dt.columns().every(function () {
        var idx = this.index();
        var colName = this.column(idx).header();
        console.log('datatable header: ', idx, $(colName).html());
        columnMap[$(colName).html()] = idx;
    });

    //if labelColumn use string (labelColumn), lookup from columnMap
    if (
        typeof chartDef.data.labelColumn === 'string' ||
        isNaN(chartDef.data.labelColumn)
    ) {
        chartDef.data.labelColumn = columnMap[chartDef.data.labelColumn];
    }

    //if valueColumn use string (valueColumn), lookup from columnMap
    if (
        typeof chartDef.data.valueColumn === 'string' ||
        isNaN(chartDef.data.valueColumn)
    ) {
        chartDef.data.valueColumn = columnMap[chartDef.data.valueColumn];
    }

    const labelColumnIndex = chartDef.data.labelColumn;
    const valueColumnIndex = chartDef.data.valueColumn;
    const aggregateType = chartDef.data.aggregate;

    console.log('🏷️ labelColumnIndex:', labelColumnIndex);
    console.log('💰 valueColumnIndex:', valueColumnIndex);
    console.log('📈 aggregateType:', aggregateType);

    const groups = {};

    // Get all rows that match the current search filter
    const filteredRows = dt.rows({ search: 'applied' });
    console.log('🔍 filteredRows count:', filteredRows.count());

    // Iterate over the filtered rows
    let processedRows = 0;
    filteredRows.every(function (rowIndex) {
        const rowData = this.data(); // Get the row data array
        const rawLabel = rowData[labelColumnIndex];
        const label = cleanHtmlFromText(rawLabel);
        const value =
            valueColumnIndex !== undefined
                ? parseNumericValue(rowData[valueColumnIndex])
                : 1;

        processedRows++;
        if (processedRows <= 3) {
            // Log first 3 rows for debugging
            console.log(
                `📋 Row ${processedRows}: rawLabel="${rawLabel}", cleanLabel="${label}", rawValue="${rowData[valueColumnIndex]}", parsedValue=${value}`,
            );
        }

        if (isNaN(value)) {
            console.warn('⚠️ Skipping row with invalid value:', value);
            return true; // Skip if value is not a number, continue iteration
        }

        if (!groups[label]) {
            groups[label] = { sum: 0, count: 0 };
        }

        groups[label].sum += value;
        groups[label].count++;

        return true; // Continue iteration
    });

    console.log('📊 Final groups:', groups);

    const labels = Object.keys(groups);
    const aggregatedValues = [];

    console.log('🏷️ Labels found:', labels);

    labels.forEach((label) => {
        const group = groups[label];
        let finalValue;

        switch (aggregateType) {
            case 'sum':
                finalValue = group.sum;
                break;
            case 'avg':
                finalValue = group.sum / group.count;
                break;
            case 'count':
            default:
                finalValue = group.count;
                break;
        }
        aggregatedValues.push(finalValue);
    });

    // Add color schemes based on chart type
    const colors = generateColors(labels.length, chartDef.type);

    //// Sort Data Descending, and take to 20 only
    // 1. Combine the arrays into an array of objects
    const combined = labels.map((label, index) => {
        return {
            label: label,
            data: aggregatedValues[index],
        };
    });

    // 2. Sort the combined array in descending order based on the 'data' property
    combined.sort((a, b) => {
        return b.data - a.data; // For descending order
        // For ascending order, you would use: a.data - b.data
    });

    // 3. Separate the sorted array back into two arrays
    const sortedLabels = combined.map((item) => item.label).slice(0, 20);
    const sortedData = combined.map((item) => item.data).slice(0, 20);

    return {
        labels: sortedLabels,
        datasets: [
            {
                label: chartDef.title,
                data: sortedData,
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
            },
        ],
    };
}

/**
 * Generates colors for chart data points.
 * @param {number} count - Number of colors needed.
 * @param {string} chartType - Type of chart (affects color scheme).
 * @returns {object} Object with background and border color arrays.
 */
function generateColors(count, chartType) {
    console.log(`🎨 Generating ${count} colors for ${chartType} chart`);

    const colorPalette = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF',
        '#4BC0C0',
        '#FF6384',
    ];

    const backgroundColors = [];
    const borderColors = [];

    for (let i = 0; i < count; i++) {
        const baseColor = colorPalette[i % colorPalette.length];
        backgroundColors.push(baseColor + '80'); // Add transparency
        borderColors.push(baseColor);
    }

    return {
        background: backgroundColors,
        border: borderColors,
    };
}
