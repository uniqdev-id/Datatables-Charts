/**
 * Processes scatter chart data and renders the chart.
 * Plots individual points with x and y coordinates, supports item labels and optional grouping (clusters).
 * @param {DataTable.Api} dt - The DataTables API instance.
 * @param {object} config - The button's main configuration object.
 * @param {object} chartDef - The specific chart definition to render.
 */
function renderScatterChart(dt, config, chartDef) {
    console.log('🎯 renderScatterChart called');
    const chartContainer = config._chartContainer;
    const canvas = chartContainer.find('canvas')[0];

    if (!canvas) {
        console.error('DataTables Charts: Canvas element not found');
        return;
    }

    // Detect and apply theme
    const currentTheme = config.theme || detectTheme(chartContainer);
    applyTheme(chartContainer, currentTheme);

    // Get theme colors
    const themeColors = getThemeColors(currentTheme);

    const xCol = resolveColumnIndex(dt, chartDef.data.xColumn);
    const yCol = resolveColumnIndex(dt, chartDef.data.yColumn);
    const labelCol = resolveColumnIndex(dt, chartDef.data.labelColumn);
    const clusterCol = resolveColumnIndex(dt, chartDef.data.clusterColumn);

    // Get header names for X and Y axes
    let xHeader = 'X';
    let yHeader = 'Y';
    if (xCol !== undefined) {
        xHeader = cleanHtmlFromText($(dt.column(xCol).header()).html());
    }
    if (yCol !== undefined) {
        yHeader = cleanHtmlFromText($(dt.column(yCol).header()).html());
    }

    // Get all rows that match the current search filter
    const filteredRows = dt.rows({ search: 'applied' });

    // Compile coordinate points from the DataTable
    const points = [];
    filteredRows.indexes().each(function (rowIndex) {
        // Render cells to display string so formatting (e.g. currency, commas) is captured
        const rawX = dt.cell(rowIndex, xCol).render('display');
        const rawY = dt.cell(rowIndex, yCol).render('display');

        const xVal = parseNumericValue(rawX);
        const yVal = parseNumericValue(rawY);

        // Skip rows with missing or invalid numeric values
        if (isNaN(xVal) || isNaN(yVal)) {
            return;
        }

        let labelVal = '';
        if (labelCol !== undefined) {
            labelVal = cleanHtmlFromText(dt.cell(rowIndex, labelCol).render('display'));
        }

        let clusterVal = 'Data Points';
        if (clusterCol !== undefined) {
            clusterVal = cleanHtmlFromText(dt.cell(rowIndex, clusterCol).render('display'));
        }

        points.push({
            x: xVal,
            y: yVal,
            label: labelVal,
            clusterVal: clusterVal
        });
    });

    // Determine if we should perform dynamic clustering
    const groups = {};
    const useKMeans = chartDef.data.clusters !== undefined &&
                      !isNaN(chartDef.data.clusters) &&
                      clusterCol === undefined;

    if (useKMeans) {
        const k = Math.max(1, parseInt(chartDef.data.clusters, 10));
        console.log(`🧠 Dynamic K-Means clustering requested with K = ${k}`);
        kmeans(points, k);
        points.forEach((p) => {
            const groupName = `Cluster ${p.cluster + 1}`;
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(p);
        });
    } else {
        points.forEach((p) => {
            if (!groups[p.clusterVal]) {
                groups[p.clusterVal] = [];
            }
            groups[p.clusterVal].push(p);
        });
    }

    // Build the Chart.js datasets
    const datasets = [];
    const clusterNames = Object.keys(groups);

    // Sort cluster names so clusters/legends are in sequential order (e.g. Cluster 1, Cluster 2, Cluster 3)
    if (useKMeans) {
        clusterNames.sort((a, b) => {
            const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
            const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
            return numA - numB;
        });
    }

    clusterNames.forEach((clusterName, index) => {
        const color = themeColors.chartColors[index % themeColors.chartColors.length];
        datasets.push({
            label: clusterName,
            data: groups[clusterName],
            backgroundColor: color + 'B3', // 70% opacity for points fill
            borderColor: color,
            borderWidth: 1.5,
            pointRadius: 6,
            pointHoverRadius: 8
        });
    });

    const chartData = {
        datasets: datasets
    };

    // Construct Chart.js configuration
    const chartOptions = {
        ...chartDef.options,
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 10
        },
        plugins: {
            title: {
                display: false // Title is already handled by header
            },
            legend: {
                display: clusterCol !== undefined || useKMeans, // Display legend if we group by cluster column or K-Means clusters
                labels: {
                    color: themeColors.textColor,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: themeColors.tooltipBackground,
                titleColor: themeColors.tooltipTextColor,
                bodyColor: themeColors.tooltipTextColor,
                borderColor: themeColors.tooltipBorder,
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        const point = context.raw;
                        let tooltipText = '';
                        if (point.label) {
                            tooltipText += point.label + ': ';
                        }
                        tooltipText += `(${xHeader}: ${point.x}, ${yHeader}: ${point.y})`;
                        return tooltipText;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                ticks: {
                    color: themeColors.textColor
                },
                grid: {
                    color: themeColors.gridColor
                },
                title: {
                    display: true,
                    text: xHeader,
                    color: themeColors.textColor,
                    font: {
                        weight: 'bold'
                    }
                }
            },
            y: {
                ticks: {
                    color: themeColors.textColor
                },
                grid: {
                    color: themeColors.gridColor
                },
                title: {
                    display: true,
                    text: yHeader,
                    color: themeColors.textColor,
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    };

    // Merge default options with any user-provided options overrides
    if (chartDef.options) {
        $.extend(true, chartOptions, chartDef.options);
    }

    // Destroy the old chart instance if it exists
    if (config._chartInstance) {
        config._chartInstance.destroy();
        config._chartInstance = null;
    }

    console.log('📊 Creating scatter chart with data:', chartData);

    // Create the new Chart.js instance
    config._chartInstance = new Chart(canvas, {
        type: 'scatter',
        data: chartData,
        options: chartOptions
    });
}
