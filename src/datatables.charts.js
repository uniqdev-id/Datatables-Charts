(function (window, document, $, DataTable) {
    'use strict';

    /**
     * Aggregates data from a DataTable based on a given configuration.
     * @param {DataTable.Api} dt - The DataTables API instance.
     * @param {object} chartDef - The chart definition object from the config.
     * @returns {object} Data formatted for Chart.js ({ labels: [], datasets: [] }).
     */
    function parseNumericValue(value) {
        if (value === null || value === undefined || value === '') {
            return NaN;
        }

        const str = String(value).trim();

        // Remove currency codes (like IDR, USD, EUR)
        let cleaned = str.replace(/[A-Z]{3}/gi, '');

        // Remove currency symbols
        cleaned = cleaned.replace(/[$€£¥₹]/g, '');

        // Handle different number formats
        // Check if it looks like European format (comma as decimal separator)
        if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned.trim())) {
            // Format like "33.800,00" - thousand separator is dot, decimal is comma
            cleaned = cleaned.replace(/\./g, '').replace(/,/, '.');
        } else if (/^\d+,\d{2}$/.test(cleaned.trim())) {
            // Format like "10,00" - just decimal comma
            cleaned = cleaned.replace(/,/, '.');
        } else {
            // Standard format - remove commas as thousand separators
            cleaned = cleaned.replace(/,/g, '');
        }

        // Remove any remaining non-numeric characters except decimal point
        cleaned = cleaned.replace(/[^\d.-]/g, '');

        const result = parseFloat(cleaned);

        // Debug logging for currency parsing
        if (str !== cleaned) {
            console.log(
                `💱 Currency parsed: "${str}" → "${cleaned}" → ${result}`,
            );
        }

        return result;
    }

    // Test the currency parsing function
    function testCurrencyParsing() {
        console.log('🧪 Testing currency parsing:');
        const testCases = [
            'IDR33.800,00',
            '10,00',
            '$1,234.56',
            '€2.500,75',
            '1000',
            '1,000',
            '1.000',
            'USD 5,432.10',
        ];

        testCases.forEach((test) => {
            const result = parseNumericValue(test);
            console.log(`  "${test}" → ${result}`);
        });
    }

    function aggregateData(dt, chartDef) {
        console.log('📊 aggregateData called with chartDef:', chartDef);

        // Run currency parsing tests in development
        if (
            typeof window !== 'undefined' &&
            window.location.hostname === 'localhost'
        ) {
            testCurrencyParsing();
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
            const label = rowData[labelColumnIndex];
            const value =
                valueColumnIndex !== undefined
                    ? parseNumericValue(rowData[valueColumnIndex])
                    : 1;

            processedRows++;
            if (processedRows <= 3) {
                // Log first 3 rows for debugging
                console.log(
                    `📋 Row ${processedRows}: label="${label}", rawValue="${rowData[valueColumnIndex]}", parsedValue=${value}`,
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

        return {
            labels: labels,
            datasets: [
                {
                    label: chartDef.title,
                    data: aggregatedValues,
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
        const colorPalette = [
            { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgba(255, 99, 132, 1)' },
            { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgba(54, 162, 235, 1)' },
            { bg: 'rgba(255, 205, 86, 0.8)', border: 'rgba(255, 205, 86, 1)' },
            { bg: 'rgba(75, 192, 192, 0.8)', border: 'rgba(75, 192, 192, 1)' },
            {
                bg: 'rgba(153, 102, 255, 0.8)',
                border: 'rgba(153, 102, 255, 1)',
            },
            { bg: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)' },
            {
                bg: 'rgba(199, 199, 199, 0.8)',
                border: 'rgba(199, 199, 199, 1)',
            },
            { bg: 'rgba(83, 102, 255, 0.8)', border: 'rgba(83, 102, 255, 1)' },
        ];

        const background = [];
        const border = [];

        for (let i = 0; i < count; i++) {
            const color = colorPalette[i % colorPalette.length];
            background.push(color.bg);
            border.push(color.border);
        }

        return { background, border };
    }

    /**
     * Renders a chart on the canvas using Chart.js.
     * @param {DataTable.Api} dt - The DataTables API instance.
     * @param {object} config - The button's main configuration object.
     * @param {object} chartDef - The specific chart definition to render.
     */
    function renderChart(dt, config, chartDef) {
        console.log('🎯 renderChart called');
        console.log('📊 chartDef:', chartDef);
        console.log('⚙️ config:', config);

        try {
            const chartContainer = config._chartContainer;
            console.log('📦 chartContainer found:', !!chartContainer);

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
            const chartData = aggregateData(dt, chartDef);
            console.log('📊 Aggregated data:', chartData);

            // Check if we have any data to display
            if (!chartData.labels.length) {
                console.warn('DataTables Charts: No data available for chart');
                chartContainer.html(
                    '<p style="text-align: center; padding: 20px;">No data available for this chart</p>',
                );
                return;
            }

            // If a chart instance already exists on this canvas, destroy it first.
            if (config._chartInstance) {
                console.log('🗑️ Destroying existing chart instance');
                config._chartInstance.destroy();
            }

            // Create the new Chart.js instance.
            console.log('🚀 Creating new Chart.js instance...');
            const ctx = canvas.getContext('2d');
            console.log('🎨 Canvas context:', ctx);
            config._chartInstance = new Chart(ctx, {
                type: chartDef.type, // e.g., 'bar', 'pie'
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio:
                        chartDef.type === 'pie' || chartDef.type === 'doughnut'
                            ? 1
                            : 1.5,
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart',
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: chartDef.title,
                            font: {
                                size: 18,
                                weight: 'bold',
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            },
                            padding: {
                                top: 20,
                                bottom: 20,
                            },
                            color: '#333',
                        },
                        legend: {
                            display:
                                chartDef.type === 'pie' ||
                                chartDef.type === 'doughnut',
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                },
                            },
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                            cornerRadius: 6,
                            displayColors: true,
                            padding: 12,
                        },
                    },
                    scales:
                        chartDef.type !== 'pie' && chartDef.type !== 'doughnut'
                            ? {
                                  x: {
                                      ticks: {
                                          font: {
                                              size: 11,
                                              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                          },
                                          color: '#666',
                                      },
                                      grid: {
                                          color: 'rgba(0, 0, 0, 0.1)',
                                      },
                                  },
                                  y: {
                                      beginAtZero: true,
                                      ticks: {
                                          font: {
                                              size: 11,
                                              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                          },
                                          color: '#666',
                                      },
                                      grid: {
                                          color: 'rgba(0, 0, 0, 0.1)',
                                      },
                                  },
                              }
                            : undefined,
                    // We can merge user-defined options here later.
                },
            });

            console.log(
                '✅ Chart rendered successfully!',
                config._chartInstance,
            );

            // Add success indicator
            const successMsg = $(
                '<div style="text-align: center; color: green; font-size: 12px; margin-top: 5px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 15; background: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 4px;">✅ Chart loaded</div>',
            );
            chartContainer.append(successMsg);
            setTimeout(() => successMsg.fadeOut(), 2000);
        } catch (error) {
            console.error('❌ DataTables Charts: Error rendering chart', error);
            console.error('📍 Error stack:', error.stack);

            // Show detailed error information
            const errorHtml = `
                <div style="text-align: center; padding: 20px; color: red; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 5px;">
                    <h4 style="margin: 0 0 10px 0;">❌ Chart Rendering Error</h4>
                    <p style="margin: 0;"><strong>Error:</strong> ${error.message}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Check the browser console for more details</p>
                </div>
            `;
            config._chartContainer.html(errorHtml);
        }
    }

    // Register a new button type for DataTables.
    DataTable.ext.buttons.charts = {
        // Use a custom implementation instead of extending collection
        text: '📊 Charts',

        init: function (dt, node, config) {
            // Create the chart container
            // const chartContainer = $(
            //     '<div class="dt-charts-container" style="display:block; margin-bottom: 1em; border: 2px solid red; background: yellow; min-height: 400px; height: 400px;"></div>',
            // );
            // chartContainer.append(
            //     '<canvas id="dt-chart-canvas" width="800" height="350" style="width: 100%; height: 350px;"></canvas>',
            // );
            //
            // Create a container div that will hold our charts, but DON'T attach it yet.
            const chartContainer = $(
                '<div class="dt-charts-container" style="display:none; margin-bottom: 1em;"></div>',
            );

            // The container will be populated with canvas and controls when a chart is rendered

            config._chartContainer = chartContainer;

            console.log('📦 Chart container created:', chartContainer);
            console.log('📦 Container jQuery object:', chartContainer.length);
            console.log('📦 Container HTML:', chartContainer[0].outerHTML);

            const tableContainer = $(dt.table().container());
            console.log('📋 Table container:', tableContainer);
            console.log('📋 Inserting container before table...');

            // Use the 'init.dt' event, which fires only after the table is fully initialized.
            // We use .one() so this event listener is automatically removed after it runs once.
            dt.one('init.dt', function () {
                // NOW we can be sure that dt.table().container() refers to the correct
                // dataTables_wrapper div, and we can safely insert our element.
                tableContainer.before(chartContainer);
                // $(dt.table().container()).before(newElement);
            });

            console.log(
                '📦 Container inserted, checking if it exists in DOM...',
            );
            console.log(
                '📦 Container in DOM:',
                $('.dt-charts-container').length,
            );
            console.log(
                '📦 Table container position:',
                tableContainer.offset(),
            );
            console.log(
                '📦 Chart container position:',
                chartContainer.offset(),
            );

            // Store dropdown state
            config._dropdownOpen = false;
            config._dropdownMenu = null;
        },

        action: function (e, dt, node, config) {
            const $button = $(node);
            const charts = config.charts || [];

            // If dropdown exists, remove it
            if (config._dropdownMenu) {
                config._dropdownMenu.remove();
                config._dropdownMenu = null;
                config._dropdownOpen = false;
                return;
            }

            // Create dropdown menu
            const $dropdown = $('<div class="dt-button-collection"></div>');

            charts.forEach((chartDef) => {
                const $item = $(
                    '<button type="button" class="dt-button"></button>',
                )
                    .text(chartDef.title)
                    .on('click', function () {
                        console.log('🖱️ Chart button clicked:', chartDef.title);

                        // Hide dropdown
                        $dropdown.remove();
                        config._dropdownMenu = null;
                        config._dropdownOpen = false;

                        // Show chart container and render chart
                        console.log('👁️ Showing chart container...');
                        console.log(
                            '📦 Container before show:',
                            config._chartContainer.css('display'),
                        );
                        console.log(
                            '📦 Container visibility:',
                            config._chartContainer.is(':visible'),
                        );
                        console.log(
                            '📦 Container in DOM check:',
                            $('.dt-charts-container').length,
                        );
                        console.log(
                            '📦 Container dimensions:',
                            config._chartContainer.width() +
                                'x' +
                                config._chartContainer.height(),
                        );

                        config._chartContainer.show();
                        config._chartContainer.css('display', 'block');

                        console.log(
                            '📦 Container after show:',
                            config._chartContainer.css('display'),
                        );
                        console.log(
                            '📦 Container visibility after show:',
                            config._chartContainer.is(':visible'),
                        );
                        console.log(
                            '📦 Container final dimensions:',
                            config._chartContainer.width() +
                                'x' +
                                config._chartContainer.height(),
                        );

                        // Add loading state
                        config._chartContainer.addClass('loading');

                        // Create the chart container with controls and footer
                        const chartHtml = `
                            <div class="dt-chart-controls">
                                <button class="dt-chart-btn close-btn" title="Close Chart" data-action="close">✕</button>
                                <button class="dt-chart-btn download-btn" title="Download Chart" data-action="download">⬇</button>
                            </div>
                            <canvas id="dt-chart-canvas" width="800" height="350" style="width: 100%; height: 350px;"></canvas>
                            <div class="dt-chart-footer">
                                <div class="dt-chart-title">${chartDef.title}</div>
                                <div class="dt-chart-actions">
                                    <button class="dt-chart-action-btn download" data-action="download">📥 Download</button>
                                    <button class="dt-chart-action-btn close" data-action="close">✕ Close</button>
                                </div>
                            </div>
                        `;

                        config._chartContainer.html(chartHtml);

                        // Add event listeners for control buttons
                        config._chartContainer
                            .find('[data-action="close"]')
                            .on('click', function () {
                                closeChart(config);
                            });

                        config._chartContainer
                            .find('[data-action="download"]')
                            .on('click', function () {
                                downloadChart(
                                    config._chartInstance,
                                    chartDef.title,
                                );
                            });

                        console.log('🎯 Calling renderChart...');

                        // Wait for DOM to update and canvas to be ready
                        setTimeout(() => {
                            // Force a reflow to ensure canvas is properly sized
                            config._chartContainer[0].offsetHeight;

                            // Double-check canvas exists and has dimensions
                            const canvas =
                                config._chartContainer.find('canvas')[0];
                            if (canvas) {
                                console.log(
                                    '📐 Pre-render canvas check:',
                                    canvas.width + 'x' + canvas.height,
                                );

                                // Ensure canvas is visible and has proper parent
                                const canvasRect =
                                    canvas.getBoundingClientRect();
                                console.log(
                                    '📐 Canvas bounding rect:',
                                    canvasRect,
                                );

                                if (
                                    canvasRect.width === 0 ||
                                    canvasRect.height === 0
                                ) {
                                    console.log(
                                        '⚠️ Canvas has zero bounding rect, forcing layout...',
                                    );
                                    canvas.style.display = 'block';
                                    canvas.style.width = '100%';
                                    canvas.style.height = '350px';
                                    canvas.width = 800;
                                    canvas.height = 350;
                                }
                            }

                            renderChart(dt, config, chartDef);
                            config._chartContainer.removeClass('loading');
                        }, 300);
                    });
                $dropdown.append($item);
            });

            // Position dropdown
            const buttonOffset = $button.offset();
            $dropdown.css({
                position: 'absolute',
                top: buttonOffset.top + $button.outerHeight(),
                left: buttonOffset.left,
                'z-index': 9999,
                background: 'white',
                border: '1px solid #ccc',
                'box-shadow': '0 2px 10px rgba(0,0,0,0.1)',
                'border-radius': '4px',
                'min-width': $button.outerWidth(),
            });

            // Add to document and store reference
            $('body').append($dropdown);
            config._dropdownMenu = $dropdown;
            config._dropdownOpen = true;

            // Close dropdown when clicking outside
            $(document).on('click.dt-charts', function (event) {
                if (
                    !$dropdown.is(event.target) &&
                    $dropdown.has(event.target).length === 0 &&
                    !$button.is(event.target)
                ) {
                    $dropdown.remove();
                    config._dropdownMenu = null;
                    config._dropdownOpen = false;
                    $(document).off('click.dt-charts');
                }
            });
        },
    };

    /**
     * Closes the chart container and cleans up resources
     * @param {object} config - The button configuration object
     */
    function closeChart(config) {
        console.log('🗑️ Closing chart...');

        if (config._chartInstance) {
            config._chartInstance.destroy();
            config._chartInstance = null;
            console.log('📊 Chart instance destroyed');
        }

        if (config._chartContainer) {
            config._chartContainer.fadeOut(300, function () {
                $(this).hide();
                console.log('📦 Chart container hidden');
            });
        }
    }

    /**
     * Downloads the chart as an image
     * @param {Chart} chartInstance - The Chart.js instance
     * @param {string} title - The chart title for filename
     */
    function downloadChart(chartInstance, title) {
        if (!chartInstance) {
            console.error('❌ No chart instance available for download');
            return;
        }

        try {
            console.log('💾 Starting chart download...');

            // Get the canvas from the chart instance
            const canvas = chartInstance.canvas;

            // Create a download link
            const link = document.createElement('a');
            link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chart.png`;
            link.href = canvas.toDataURL('image/png');

            // Trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Chart downloaded successfully');

            // Show success feedback
            const successMsg = $(
                '<div style="position: fixed; top: 20px; right: 20px; background: #38a169; color: white; padding: 10px 15px; border-radius: 6px; z-index: 10000; font-size: 14px;">📥 Chart downloaded!</div>',
            );
            $('body').append(successMsg);
            setTimeout(() => successMsg.fadeOut(500), 2000);
        } catch (error) {
            console.error('❌ Error downloading chart:', error);

            // Show error feedback
            const errorMsg = $(
                '<div style="position: fixed; top: 20px; right: 20px; background: #e53e3e; color: white; padding: 10px 15px; border-radius: 6px; z-index: 10000; font-size: 14px;">❌ Download failed!</div>',
            );
            $('body').append(errorMsg);
            setTimeout(() => errorMsg.fadeOut(500), 3000);
        }
    }

    console.log('DataTables Charts plugin loaded.');
})(window, document, jQuery, jQuery.fn.dataTable);
