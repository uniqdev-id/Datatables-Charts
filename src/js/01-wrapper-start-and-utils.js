(function (window, document, $, DataTable) {
    'use strict';

    /**
     * Parses a numeric value from various formats including currencies
     * @param {*} value - The value to parse
     * @returns {number} The parsed numeric value or NaN if invalid
     */
    function parseNumericValue(value) {
        if (value === null || value === undefined || value === '') {
            console.log(`❌ Invalid value: ${value}`);
            return NaN;
        }

        const str = String(value).trim();

        // Remove currency codes (like IDR, USD, EUR)
        let cleaned = str.replace(/[A-Z]/gi, '');

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

    /**
     * Test currency parsing functionality
     */
    function testCurrencyParsing() {
        console.log('🧪 Testing currency parsing...');
        const testValues = [
            'IDR 33.800,00',
            '$1,234.56',
            '€1.234,56',
            '¥1,234',
            '₹1,23,456.78',
            '33.800,00',
            '1,234.56',
            '1234.56',
        ];

        testValues.forEach((val) => {
            console.log(`"${val}" → ${parseNumericValue(val)}`);
        });
    }

    /**
     * Test HTML cleaning functionality
     */
    function testHtmlCleaning() {
        console.log('🧪 Testing HTML cleaning...');
        const testValues = [
            '<strong>Bold Text</strong>',
            '<em>Italic Text</em>',
            'Plain Text',
            '<span style="color: red;">Red Text</span>',
            '<a href="#">Link</a>',
            'Text with <br> breaks',
            '<div>Div content</div>',
        ];

        testValues.forEach((val) => {
            console.log(`"${val}" → "${cleanHtmlFromText(val)}"`);
        });
    }

    /**
     * Removes HTML tags from text content
     * @param {string} text - Text that may contain HTML
     * @returns {string} Clean text without HTML tags
     */
    /**
     * Removes HTML tags from text content
     * @param {string} text - Text that may contain HTML
     * @returns {string} Clean text without HTML tags
     */
    function cleanHtmlFromText(text) {
        if (!text || typeof text !== 'string') {
            return String(text || '');
        }

        // Create a temporary element to leverage browser's HTML parsing
        const tempElement = document.createElement('div');
        tempElement.innerHTML = text;
        return tempElement.textContent || tempElement.innerText || '';
    }

    /**
     * Performs K-Means clustering on an array of points based on x and y coordinates.
     * @param {Array<object>} points - Array of point objects { x: number, y: number, ... }
     * @param {number} k - Number of clusters
     * @returns {Array<object>} The original points array, with a .cluster property added to each point
     */
    function kmeans(points, k) {
        if (!points || points.length === 0) {
            return [];
        }

        const len = points.length;
        if (k > len) {
            k = len;
        }
        if (k <= 0) {
            k = 1;
        }

        // 1. Min-max normalization of x and y coordinate values
        // This prevents one attribute with large scale (e.g. Sales) from dominating distance calculations over another (e.g. Profit margin)
        const xValues = points.map((p) => p.x);
        const yValues = points.map((p) => p.y);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        const normalized = points.map((p) => ({
            x: (p.x - minX) / rangeX,
            y: (p.y - minY) / rangeY,
            original: p,
        }));

        // 2. Initialize centroids: Select k unique initial coordinates randomly from the dataset
        const shuffled = [...normalized].sort(() => 0.5 - Math.random());
        const centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push({ x: shuffled[i].x, y: shuffled[i].y });
        }

        let iterations = 0;
        const maxIterations = 100;
        let converged = false;

        while (!converged && iterations < maxIterations) {
            iterations++;
            converged = true;

            // Group points by their nearest centroid index
            const clusters = Array.from({ length: k }, () => []);

            // Assignment step
            normalized.forEach((p) => {
                let minDist = Infinity;
                let assignedCluster = 0;

                for (let c = 0; c < k; c++) {
                    const dist =
                        Math.pow(p.x - centroids[c].x, 2) +
                        Math.pow(p.y - centroids[c].y, 2);
                    if (dist < minDist) {
                        minDist = dist;
                        assignedCluster = c;
                    }
                }

                p.cluster = assignedCluster;
                clusters[assignedCluster].push(p);
            });

            // Update centroids step
            for (let c = 0; c < k; c++) {
                const clusterPoints = clusters[c];

                if (clusterPoints.length === 0) {
                    // Reinitialize centroid to a random data point if the cluster becomes empty
                    const randomPoint =
                        normalized[Math.floor(Math.random() * normalized.length)];
                    if (
                        centroids[c].x !== randomPoint.x ||
                        centroids[c].y !== randomPoint.y
                    ) {
                        centroids[c] = { x: randomPoint.x, y: randomPoint.y };
                        converged = false;
                    }
                    continue;
                }

                const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
                const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
                const newCentroid = {
                    x: sumX / clusterPoints.length,
                    y: sumY / clusterPoints.length,
                };

                // Check distance centroid has moved
                const distMoved =
                    Math.pow(newCentroid.x - centroids[c].x, 2) +
                    Math.pow(newCentroid.y - centroids[c].y, 2);

                if (distMoved > 0.0001) {
                    centroids[c] = newCentroid;
                    converged = false;
                }
            }
        }

        // Apply final cluster assignments to original points
        normalized.forEach((p) => {
            p.original.cluster = p.cluster;
        });

        return points;
    }

