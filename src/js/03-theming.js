    /**
     * Detects the current theme based on various indicators
     * @param {jQuery} container - The container element to check for theme
     * @returns {string} The detected theme ('light', 'dark', 'auto')
     */
    function detectTheme(container) {
        // Check if theme is explicitly set on container
        const explicitTheme = container.attr('data-dt-chart-theme');
        if (explicitTheme) {
            return explicitTheme;
        }

        // Check parent elements for theme indicators
        const $body = $('body');
        const $html = $('html');

        // Common dark theme class patterns
        const darkPatterns = [
            'dark',
            'dark-theme',
            'theme-dark',
            'dark-mode',
            'night-mode',
        ];

        for (const pattern of darkPatterns) {
            if (
                $body.hasClass(pattern) ||
                $html.hasClass(pattern) ||
                $body.attr('data-theme') === pattern ||
                $html.attr('data-theme') === pattern
            ) {
                return 'dark';
            }
        }

        // Check CSS custom properties or computed styles
        const computedStyle = window.getComputedStyle(document.body);
        const bgColor = computedStyle.backgroundColor;

        // If background is dark, assume dark theme
        if (
            bgColor &&
            bgColor !== 'rgba(0, 0, 0, 0)' &&
            bgColor !== 'transparent'
        ) {
            const rgb = bgColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                const brightness =
                    (parseInt(rgb[0]) * 299 +
                        parseInt(rgb[1]) * 587 +
                        parseInt(rgb[2]) * 114) /
                    1000;
                if (brightness < 128) {
                    return 'dark';
                }
            }
        }

        // Check system preference
        if (
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            return 'auto';
        }

        return 'light';
    }

    /**
     * Applies theme to the chart container
     * @param {jQuery} container - The chart container element
     * @param {string} theme - The theme to apply ('light', 'dark', 'auto', etc.)
     */
    function applyTheme(container, theme) {
        console.log('🎨 Applying theme:', theme);

        // Remove any existing theme classes
        const existingThemes = [
            'light',
            'dark',
            'auto',
            'high-contrast',
            'sepia',
        ];
        existingThemes.forEach((t) => {
            container.removeAttr(`data-dt-chart-theme-${t}`);
        });

        // Apply new theme
        container.attr('data-dt-chart-theme', theme);

        // Apply to parent elements if needed for broader theme application
        const $tableWrapper = container.closest('.dataTables_wrapper');
        if ($tableWrapper.length) {
            $tableWrapper.attr('data-dt-chart-theme', theme);
        }
    }

    /**
     * Gets theme-specific colors and styling options
     * @param {string} theme - The theme name
     * @returns {object} Theme color configuration
     */
    function getThemeColors(theme) {
        const themes = {
            light: {
                backgroundColor: '#fafafa',
                textColor: '#333333',
                gridColor: '#e0e0e0',
                borderColor: '#cccccc',
                tooltipBackground: '#ffffff',
                tooltipBorder: '#cccccc',
                tooltipTextColor: '#333333',
                chartColors: [
                    '#3366cc',
                    '#dc3912',
                    '#ff9900',
                    '#109618',
                    '#990099',
                    '#0099c6',
                    '#dd4477',
                    '#66aa00',
                    '#b82e2e',
                    '#316395',
                ],
            },
            dark: {
                backgroundColor: '#1a1a1a',
                textColor: '#ffffff',
                gridColor: '#404040',
                borderColor: '#666666',
                tooltipBackground: '#2a2a2a',
                tooltipBorder: '#666666',
                tooltipTextColor: '#ffffff',
                chartColors: [
                    '#4285f4',
                    '#ea4335',
                    '#fbbc04',
                    '#34a853',
                    '#9c27b0',
                    '#00acc1',
                    '#e91e63',
                    '#8bc34a',
                    '#f44336',
                    '#2196f3',
                ],
            },
            auto: {
                backgroundColor: 'transparent',
                textColor: 'inherit',
                gridColor: '#e0e0e0',
                borderColor: '#cccccc',
                tooltipBackground: '#ffffff',
                tooltipBorder: '#cccccc',
                tooltipTextColor: '#333333',
                chartColors: [
                    '#3366cc',
                    '#dc3912',
                    '#ff9900',
                    '#109618',
                    '#990099',
                    '#0099c6',
                    '#dd4477',
                    '#66aa00',
                    '#b82e2e',
                    '#316395',
                ],
            },
            'high-contrast': {
                backgroundColor: '#000000',
                textColor: '#ffffff',
                gridColor: '#808080',
                borderColor: '#ffffff',
                tooltipBackground: '#000000',
                tooltipBorder: '#ffffff',
                tooltipTextColor: '#ffffff',
                chartColors: [
                    '#ffffff',
                    '#ffff00',
                    '#00ffff',
                    '#ff00ff',
                    '#00ff00',
                    '#ff8000',
                    '#8000ff',
                    '#ff0080',
                    '#80ff00',
                    '#0080ff',
                ],
            },
            sepia: {
                backgroundColor: '#f4f1e8',
                textColor: '#5c4b37',
                gridColor: '#d4c4a8',
                borderColor: '#c4b998',
                tooltipBackground: '#f4f1e8',
                tooltipBorder: '#c4b998',
                tooltipTextColor: '#5c4b37',
                chartColors: [
                    '#8b4513',
                    '#a0522d',
                    '#cd853f',
                    '#daa520',
                    '#b8860b',
                    '#d2691e',
                    '#bc8f8f',
                    '#f4a460',
                    '#deb887',
                    '#d2b48c',
                ],
            },
        };

        return themes[theme] || themes.light;
    }

    /**
     * Applies theme colors to Chart.js chart data
     * @param {object} chartData - Chart.js data object
     * @param {string} theme - Theme name
     * @returns {object} Modified chart data with theme colors
     */
    function applyThemeColorsToChartData(chartData, theme) {
        const themeColors = getThemeColors(theme);

        if (chartData.datasets) {
            chartData.datasets.forEach((dataset, datasetIndex) => {
                if (!dataset.backgroundColor) {
                    dataset.backgroundColor = themeColors.chartColors.map(
                        (color) => color + '80',
                    ); // Add transparency
                }
                if (!dataset.borderColor) {
                    dataset.borderColor = themeColors.chartColors;
                }
                if (!dataset.borderWidth) {
                    dataset.borderWidth = 2;
                }
            });
        }

        return chartData;
    }
