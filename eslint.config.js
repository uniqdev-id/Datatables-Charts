module.exports = [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                window: 'readonly',
                document: 'readonly',
                jQuery: 'readonly',
                $: 'readonly',
                console: 'readonly',
            },
        },
        rules: {
            // ESLint recommended rules will be applied by default
        },
    },
];
