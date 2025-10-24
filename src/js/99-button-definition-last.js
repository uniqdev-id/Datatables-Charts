    // Register a new button type for DataTables.
    DataTable.ext.buttons.charts = {
        // Use a custom implementation instead of extending collection
        text: '📊 Charts',

        init: function (dt, node, config) {
            // Store theme configuration
            config.theme = config.theme || 'light';
            console.log('🎨 Initializing with theme:', config.theme);

            // Create the chart container
            const chartContainer = $(
                '<div class="dt-charts-container" style="display:none; margin-bottom: 1em;"></div>',
            );

            // Apply initial theme
            applyTheme(chartContainer, config.theme);

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
            console.log('🖱️ Button clicked - event:', e);
            console.log('🖱️ Click coordinates:', e.offsetX, e.offsetY);
            console.log('🖱️ Button dimensions:', node.offsetWidth, node.offsetHeight);


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
                    .on('click', function (e) {
                        console.log('🖱️ Chart button clicked:', chartDef.title);
                        console.log('🖱️ Chart item click coordinates:', e.offsetX, e.offsetY);

                        //check if datatable has data
                        if (dt.data().length === 0) {
                            alert('Klik tombol "Apply" untuk menampilkan data terlebih dahulu!');
                            return;
                        }

                        // Call the global onClick callback if provided (at button level)
                        if (typeof config.onClick === 'function') {
                            try {
                                console.log('🎯 Calling global onClick callback for chart:', chartDef.title);
                                const globalCallbackResult = config.onClick({
                                    event: e,
                                    chart: chartDef,
                                    dataTable: dt,
                                    config: config,
                                    data: dt.data().toArray()
                                });

                                // If callback returns false, prevent chart rendering
                                if (globalCallbackResult === false) {
                                    console.log('🚫 Global onClick callback returned false, preventing chart rendering');
                                    return;
                                }
                            } catch (error) {
                                console.error('❌ Error in global onClick callback:', error);
                                // Continue with chart rendering even if callback fails
                            }
                        }

                        // Call the chart-specific onClick callback if provided
                        if (typeof chartDef.onClick === 'function') {
                            try {
                                console.log('🎯 Calling chart-specific onClick callback for chart:', chartDef.title);
                                const callbackResult = chartDef.onClick({
                                    event: e,
                                    chart: chartDef,
                                    dataTable: dt,
                                    config: config,
                                    data: dt.data().toArray()
                                });

                                // If callback returns false, prevent chart rendering
                                if (callbackResult === false) {
                                    console.log('🚫 Chart-specific onClick callback returned false, preventing chart rendering');
                                    return;
                                }
                            } catch (error) {
                                console.error('❌ Error in chart-specific onClick callback:', error);
                                // Continue with chart rendering even if callback fails
                            }
                        }

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


                            // ROUTER LOGIC:
                            // Check if the developer provided the 'valueColumns' array.
                            // console.log('🔍 Checking for valueColumns...', chartDef.data.valueColumns);
                            // console.log('🔍 Checking for valueColumns is array...', Array.isArray(chartDef.data.valueColumns));
                            if (chartDef.data.valueColumns && Array.isArray(chartDef.data.valueColumns)) {
                                // Check if columnTotals is enabled
                                if (chartDef.data.columnTotals === true) {
                                    // Use column totals logic (sum each column)
                                    renderColumnTotalsChart(dt, config, chartDef);
                                } else {
                                    // Use the pivot transformation logic (products on X-axis, stores as segments)
                                    renderPivotChart(dt, config, chartDef);
                                }
                            } else {
                                // Otherwise, use the original aggregation logic.
                                renderAggregateChart(dt, config, chartDef);
                            }
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
            // Use event delegation to handle clicks immediately
            $(document).off('click.dt-charts').on('click.dt-charts', function (event) {
                // Check if dropdown still exists
                if (!config._dropdownMenu || !config._dropdownOpen) {
                    return;
                }

                const target = event.target;
                const isDropdownClick = $dropdown[0] === target || $dropdown[0].contains(target);
                const isButtonClick = $button[0] === target || $button[0].contains(target);

                console.log('🖱️ Click detected:', {
                    target: target.tagName + (target.className ? '.' + target.className : ''),
                    isDropdownClick: isDropdownClick,
                    isButtonClick: isButtonClick
                });

                if (!isDropdownClick && !isButtonClick) {
                    console.log('🖱️ Clicking outside dropdown, closing...');
                    $dropdown.remove();
                    config._dropdownMenu = null;
                    config._dropdownOpen = false;
                    $(document).off('click.dt-charts');
                }
            });
        },
    };

    // Close the IIFE wrapper
}(window, document, jQuery, jQuery.fn.dataTable));
