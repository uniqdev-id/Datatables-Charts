/**
 * Renders a chart in the container using Chart.js
 * @param {DataTable.Api} dt - The DataTables API instance
 * @param {object} config - The button configuration
 * @param {object} chartDef - The chart definition
 */
function renderAggregateChart(dt, config, chartDef) {
    console.log('🎯 renderChart called');
    console.log('📊 chartDef:', chartDef);
    console.log('⚙️ config:', config);

    try {
        const chartContainer = config._chartContainer;
        console.log('📦 chartContainer found:', !!chartContainer);

        // Detect and apply theme
        const currentTheme = config.theme || detectTheme(chartContainer);
        console.log('🎨 Detected theme:', currentTheme);
        applyTheme(chartContainer, currentTheme);

        // Get theme colors
        const themeColors = getThemeColors(currentTheme);
        console.log('🎨 Theme colors:', themeColors);

        const canvas = chartContainer.find('canvas')[0]; // Get the raw canvas element
        console.log('🎨 canvas element found:', !!canvas);
        console.log('🎨 canvas details:', canvas);
        console.log(
            '🎨 canvas dimensions:',
            canvas.width + 'x' + canvas.height,
        );
        console.log(
            '🎨 canvas style dimensions:',
            canvas.style.width + ' x ' + canvas.style.height,
        );
        console.log(
            '📦 chartContainer visibility during render:',
            chartContainer.is(':visible'),
        );
        console.log(
            '📦 chartContainer display style:',
            chartContainer.css('display'),
        );

        // Get canvas bounding rect for better debugging
        const canvasRect = canvas.getBoundingClientRect();
        console.log('📐 Canvas bounding rect:', canvasRect);

        // Force proper canvas dimensions if they are 0
        if (
            canvas.width === 0 ||
            canvas.height === 0 ||
            canvasRect.width === 0
        ) {
            console.log('⚠️ Canvas has zero dimensions, forcing resize...');

            // Set reasonable default dimensions with proper aspect ratio
            const defaultWidth = 600;
            const defaultHeight = 400;

            canvas.width = defaultWidth;
            canvas.height = defaultHeight;
            canvas.style.display = 'block';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.maxWidth = '100%';

            // Force the container to be visible and sized
            chartContainer.css({
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                width: '100%',
                'min-height': '400px',
                height: 'auto',
            });

            // Trigger a reflow
            canvas.offsetHeight;

            const newRect = canvas.getBoundingClientRect();
            console.log('✅ Canvas resized - new rect:', newRect);
            console.log(
                '✅ Canvas dimensions:',
                canvas.width + 'x' + canvas.height,
            );
        }

        if (!canvas) {
            console.error('DataTables Charts: Canvas element not found');
            return;
        }

        // Aggregate the data using our new function.
        console.log('📈 Starting data aggregation...');
        const chartData = aggregateDataByGroup(dt, chartDef);
        console.log('📊 Aggregated data:', chartData);

        // Apply theme colors to chart data
        const themedChartData = applyThemeColorsToChartData(
            chartData,
            currentTheme,
        );
        console.log('🎨 Themed chart data:', themedChartData);

        if (!themedChartData.labels || themedChartData.labels.length === 0) {
            console.warn('⚠️ No data to display in chart');
            const errorHtml = `
                    <div class="dt-charts-error" style="
                        padding: 20px;
                        text-align: center;
                        color: ${themeColors.textColor};
                        background: ${themeColors.backgroundColor};
                        border: 1px solid ${themeColors.borderColor};
                        border-radius: 4px;
                        margin: 10px 0;
                    ">
                        <h4 style="margin-top: 0; color: ${themeColors.textColor};">📊 No Data Available</h4>
                        <p style="color: ${themeColors.textColor}; opacity: 0.8;">
                            No data found for the selected chart configuration.<br>
                            Please check your column mappings and data filters.
                        </p>
                    </div>
                `;
            chartContainer.html(errorHtml);
            return;
        }

        // Clear any existing content
        chartContainer.empty();

        // Create a proper container structure with controls
        const chartContent = $(`
                <div class="dt-charts-content" style="width: 100%; position: relative;">
                    <div class="dt-charts-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px;
                        border-bottom: 1px solid ${themeColors.borderColor};
                        // background: ${themeColors.backgroundColor};
                    ">
                        <h3 style="
                            margin: 0;
                            color: ${themeColors.textColor};
                            font-size: 1.1em;
                            font-weight: 500;
                        ">${chartDef.title}</h3>
                        <div class="dt-charts-controls">
                            <button class="dt-chart-download" title="Download Chart as PNG" style="
                                background: none;
                                border: 1px solid ${themeColors.borderColor};
                                color: ${themeColors.textColor};
                                padding: 5px 10px;
                                margin-right: 5px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 12px;
                            ">📥 PNG</button>
                            <button class="dt-chart-download-data" title="Download Data as CSV" style="
                                background: none;
                                border: 1px solid ${themeColors.borderColor};
                                color: ${themeColors.textColor};
                                padding: 5px 10px;
                                margin-right: 5px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 12px;
                            ">📊 CSV</button>
                            <button class="dt-chart-close" title="Close Chart" style="
                                background: none;
                                border: 1px solid ${themeColors.borderColor};
                                color: ${themeColors.textColor};
                                padding: 5px 10px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 12px;
                            ">✖ Close</button>
                        </div>
                    </div>
                    <div class="dt-charts-body" style="
                        padding: 20px;
                        // background: ${themeColors.backgroundColor};
                        position: relative;
                        min-height: 400px;
                    ">
                        <canvas id="dt-chart-canvas" style="
                            display: block;
                            width: 100% !important;
                            height: 400px !important;
                            max-width: 100%;
                        "></canvas>
                    </div>
                </div>
            `);

        chartContainer.append(chartContent);

        // Get the new canvas element
        const newCanvas = chartContainer.find('canvas')[0];
        console.log('🎨 New canvas element:', newCanvas);

        // Attach event handlers
        chartContainer.find('.dt-chart-close').on('click', function () {
            closeChart(config);
        });

        chartContainer.find('.dt-chart-download').on('click', function () {
            downloadChart(config._chartInstance, chartDef.title);
        });

        chartContainer.find('.dt-chart-download-data').on('click', function () {
            downloadDataAsCsv(dt, chartDef.title, config._chartInstance);
        });

        // Add hover effects to buttons
        chartContainer.find('.dt-chart-close, .dt-chart-download, .dt-chart-download-data').hover(
            function () {
                $(this).css('background-color', themeColors.gridColor);
            },
            function () {
                $(this).css('background-color', 'transparent');
            },
        );

        // Destroy existing chart instance if it exists
        if (config._chartInstance) {
            console.log('🗑️ Destroying existing chart instance');
            config._chartInstance.destroy();
            config._chartInstance = null;
        }

        // Create Chart.js configuration with theme-appropriate options
        const chartConfig = {
            type: chartDef.type,
            data: themedChartData,
            options: {
                ...chartDef.options,
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 10,
                },
                plugins: {
                    title: {
                        display: false, // We handle title in our header
                    },
                    legend: {
                        labels: {
                            color: themeColors.textColor,
                            font: {
                                size: 12,
                            },
                        },
                    },
                    tooltip: {
                        backgroundColor: themeColors.tooltipBackground,
                        titleColor: themeColors.tooltipTextColor,
                        bodyColor: themeColors.tooltipTextColor,
                        borderColor: themeColors.tooltipBorder,
                        borderWidth: 1,
                    },
                },
                scales:
                    chartDef.type !== 'pie' && chartDef.type !== 'doughnut'
                        ? {
                              x: {
                                  ticks: {
                                      color: themeColors.textColor,
                                  },
                                  grid: {
                                      color: themeColors.gridColor,
                                  },
                              },
                              y: {
                                  ticks: {
                                      color: themeColors.textColor,
                                  },
                                  grid: {
                                      color: themeColors.gridColor,
                                  },
                              },
                          }
                        : {},
            },
        };

        console.log('📊 Creating Chart.js instance with config:', chartConfig);

        // Create the chart
        config._chartInstance = new Chart(newCanvas, chartConfig);
        console.log('✅ Chart created successfully:', config._chartInstance);
    } catch (error) {
        console.error('❌ Error in renderChart:', error);
        const errorHtml = `
                <div class="dt-charts-error" style="
                    padding: 20px;
                    text-align: center;
                    color: #d32f2f;
                    background: #ffebee;
                    border: 1px solid #ffcdd2;
                    border-radius: 4px;
                    margin: 10px 0;
                ">
                    <h4 style="margin-top: 0; color: #d32f2f;">❌ Chart Error</h4>
                    <p style="color: #d32f2f; opacity: 0.8;">
                        Failed to render chart: ${error.message}<br>
                        Please check the console for more details.
                    </p>
                </div>
            `;
        config._chartContainer.html(errorHtml);
    }
}

/**
 * Closes the chart and hides the container
 * @param {object} config - The button configuration
 */
function closeChart(config) {
    console.log('🚪 Closing chart');

    if (config._chartInstance) {
        config._chartInstance.destroy();
        config._chartInstance = null;
    }

    if (config._chartContainer) {
        config._chartContainer.hide().empty();
    }

    // Clear the current chart definition so auto-refresh won't trigger
    config._currentChartDef = null;
    console.log('💾 Cleared current chart definition');
}

/**
 * Downloads the chart data as a CSV file
 * @param {DataTable.Api} dt - The DataTables API instance
 * @param {string} title - The chart title for filename
 */
/**
 * Shows a brief toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'info' or 'warning'
 */
function showToast(message, type) {
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText =
        'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:6px;' +
        'z-index:99999;font-size:14px;font-family:sans-serif;transition:opacity .3s;' +
        (type === 'warning'
            ? 'background:#fff3cd;color:#856404;border:1px solid #ffeeba;'
            : 'background:#d1ecf1;color:#0c5460;border:1px solid #bee5eb;');
    document.body.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
}

/**
 * Escapes a cell value for CSV (quote if contains comma, quote, or newline)
 * @param {*} value
 * @returns {string}
 */
function csvEscape(value) {
    var str = String(value);
    if (
        str.indexOf(',') !== -1 ||
        str.indexOf('"') !== -1 ||
        str.indexOf('\n') !== -1
    ) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/**
 * Triggers a browser download of a CSV Blob
 * @param {string} csvContent
 * @param {string} filename
 */
function downloadCsvBlob(csvContent, filename) {
    var bom = '\uFEFF';
    var blob = new Blob([bom + csvContent], {
        type: 'text/csv;charset=utf-8;',
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Downloads the chart data as a CSV file.
 * First attempts to export the actual chart data from the Chart.js instance.
 * Falls back to raw DataTable rows if chart data is unavailable.
 * @param {DataTable.Api} dt - The DataTables API instance
 * @param {string} title - The chart title for filename
 * @param {Chart|null} chartInstance - The Chart.js instance to extract data from
 */
function downloadDataAsCsv(dt, title, chartInstance) {
    console.log('📊 Downloading chart data as CSV:', title);

    // Attempt 1: export chart data from Chart.js instance
    if (chartInstance && chartInstance.data) {
        try {
            var chartData = chartInstance.data;
            var csvRows = [];
            var isScatter =
                chartData.datasets &&
                chartData.datasets[0] &&
                chartData.datasets[0].data &&
                typeof chartData.datasets[0].data[0] === 'object' &&
                chartData.datasets[0].data[0] !== null &&
                'x' in chartData.datasets[0].data[0];

            if (isScatter) {
                // Build columns: label (from dataset), x, y
                var scatterHeaders = ['Dataset', 'X', 'Y'];
                csvRows.push(scatterHeaders.join(','));
                chartData.datasets.forEach(function (ds) {
                    ds.data.forEach(function (pt) {
                        csvRows.push(
                            csvEscape(ds.label || '') +
                                ',' +
                                csvEscape(pt.x) +
                                ',' +
                                csvEscape(pt.y),
                        );
                    });
                });
            } else {
                // Standard chart: one column for labels, one per dataset
                var headers = ['Label'];
                chartData.datasets.forEach(function (ds) {
                    headers.push(ds.label || 'Series ' + headers.length);
                });
                csvRows.push(headers.join(','));

                (chartData.labels || []).forEach(function (label, i) {
                    var row = [csvEscape(label)];
                    chartData.datasets.forEach(function (ds) {
                        row.push(
                            csvEscape(
                                ds.data[i] !== undefined ? ds.data[i] : '',
                            ),
                        );
                    });
                    csvRows.push(row.join(','));
                });
            }

            if (csvRows.length > 1) {
                downloadCsvBlob(
                    csvRows.join('\n'),
                    title.replace(/[^a-z0-9]/gi, '_').toLowerCase() +
                        '_chart.csv',
                );
                console.log('✅ Chart data downloaded as chart-structured CSV');
                return;
            }
        } catch (chartError) {
            console.warn(
                '⚠️ Chart data export failed, falling back to raw data:',
                chartError,
            );
        }
    }

    // Fallback: export raw DataTable rows
    try {
        console.log('📋 Falling back to raw DataTable export');
        showToast(
            'Could not extract chart data, downloading table data instead',
            'warning',
        );

        var columnCount = dt.columns().count();
        var fbHeaders = [];
        for (var ci = 0; ci < columnCount; ci++) {
            fbHeaders.push($(dt.column(ci).header()).text().trim());
        }
        var fbRows = [];
        dt.rows({ search: 'applied' }).every(function (rowIdx) {
            var row = [];
            for (var cj = 0; cj < columnCount; cj++) {
                row.push(
                    csvEscape(
                        cleanHtmlFromText(
                            dt.cell(rowIdx, cj).render('display'),
                        ),
                    ),
                );
            }
            fbRows.push(row.join(','));
        });

        downloadCsvBlob(
            [fbHeaders.join(','), fbRows.join('\n')].join('\n'),
            title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_data.csv',
        );
        console.log('✅ Raw DataTable data downloaded as CSV');
    } catch (error) {
        console.error('❌ Error downloading data:', error);
        showToast('Failed to download data. Check console for details.', 'warning');
    }
}

/**
 * Downloads the chart as an image
 * @param {Chart} chartInstance - The Chart.js instance
 * @param {string} title - The chart title for filename
 */
function downloadChart(chartInstance, title) {
    console.log('📥 Downloading chart:', title);

    if (!chartInstance || !chartInstance.canvas) {
        console.error('❌ No chart instance available for download');
        return;
    }

    try {
        const canvas = chartInstance.canvas;
        const url = canvas.toDataURL('image/png');

        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chart.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ Chart downloaded successfully');
    } catch (error) {
        console.error('❌ Error downloading chart:', error);
    }
}
