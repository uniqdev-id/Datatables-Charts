(function (window, document, $, DataTable) {
    'use strict';

    /**
     * Parses a numeric value from various formats including currencies
     * @param {*} value - The value to parse
     * @returns {number} The parsed numeric value or NaN if invalid
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
    function cleanHtmlFromText(text) {
        if (!text || typeof text !== 'string') {
            return String(text || '');
        }

        // Create a temporary element to leverage browser's HTML parsing
        const tempElement = document.createElement('div');
        tempElement.innerHTML = text;
        return tempElement.textContent || tempElement.innerText || '';
    }
