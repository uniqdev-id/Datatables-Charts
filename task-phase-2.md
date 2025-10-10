### **Objective: Implement the "Developer-Defined Charts" functionality for the plugin.**

**Prerequisites:** All steps from Phase 1 are complete. The project structure is in place, and the `dev` environment is working.

**Core Concept:** We will extend the DataTables `collection` button type. This provides the dropdown menu functionality "for free." Our main task is to write the logic that reads a developer's chart configuration, aggregates the data, and renders a chart using Chart.js.

---

### **Task 1: Define the Button and Chart Container**

1.  **Open `src/datatables.charts.js`**.
2.  **Define the `charts` button type.** We will base it on the `collection` button so we can have a dropdown.

    ```javascript
    // Inside the (function(...) { ... } block

    // Register a new button type for DataTables.
    DataTable.ext.buttons.charts = {
        // This button will behave like a 'collection' button, which creates a dropdown.
        extend: 'collection',

        // Default text for the button. Can be overridden by the user.
        text: '📊 Charts',

        // The 'init' function is called by DataTables when the button is created.
        // It's the perfect place to set up our chart container.
        init: function (dt, node, config) {
            // Create a container div that will hold our charts.
            const chartContainer = $('<div class="dt-charts-container" style="display:none; margin-bottom: 1em;"></div>');

            // Add a canvas element inside the container where Chart.js will draw.
            chartContainer.append('<canvas id="dt-chart-canvas"></canvas>');

            // Store the container element on the button's config object for later access.
            config._chartContainer = chartContainer;

            // Insert the chart container right before the DataTables wrapper.
            $(dt.table().container()).before(chartContainer);
        },

        // The 'action' function is the core of our button. It will be responsible
        // for building the dropdown menu from the developer's configuration.
        action: function (e, dt, node, config) {
            // This rebuilds the dropdown every time it's clicked. This ensures it
            // always has the correct items, even if the config changes.
            this.clear(); // Clear any existing items from the collection.

            const charts = config.charts || []; // Get the array of chart definitions.
            const self = this;

            // Loop through each chart definition provided by the developer.
            charts.forEach(chartDef => {
                // For each definition, add an item (a button) to our dropdown.
                self.add({
                    text: chartDef.title, // The text for the dropdown item.
                    // This action is what happens when the user clicks a specific chart type.
                    action: function () {
                        // For now, let's just log a message. We'll implement this next.
                        console.log(`User wants to render chart: "${chartDef.title}"`);

                        // Show the chart container.
                        config._chartContainer.show();

                        // Call the main render function (which we will build in Task 3).
                        renderChart(dt, config, chartDef);
                    }
                });
            });

            // After adding all items, we must call the original 'collection' action
            // to make the dropdown menu actually appear.
            $.fn.dataTable.ext.buttons.collection.action.call(this, e, dt, node, config);
        }
    };
    ```

3.  **Open `src/datatables.charts.css`** and add some basic styling for our container.
    ```css
    .dt-charts-container {
        border: 1px solid #ccc;
        padding: 15px;
        border-radius: 5px;
    }
    ```

---

### **Task 2: Create the Data Aggregation Engine**

This is the most critical piece of logic. It will process the raw table data into a format that Chart.js understands.

1.  **In `src/datatables.charts.js`**, add a new helper function *outside* of the `DataTable.ext.buttons.charts` definition but *inside* the main `(function(...) { ... })` block.

    ```javascript
    /**
     * Aggregates data from a DataTable based on a given configuration.
     * @param {DataTable.Api} dt - The DataTables API instance.
     * @param {object} chartDef - The chart definition object from the config.
     * @returns {object} Data formatted for Chart.js ({ labels: [], datasets: [] }).
     */
    function aggregateData(dt, chartDef) {
        const data = dt.rows({ search: 'applied' }).data(); // Get only filtered data
        const labelColumn = chartDef.data.labelColumn;
        const valueColumn = chartDef.data.valueColumn;
        const aggregateType = chartDef.data.aggregate;

        const groups = {}; // e.g., { "Tokyo": { sum: 500000, count: 10 }, "London": { ... } }

        data.each(function (row) {
            const label = row[labelColumn];
            // Clean the salary data (remove $, commas) and convert to a number.
            // This is a simple example; a more robust solution might be needed.
            const value = valueColumn ? parseFloat(String(row[valueColumn]).replace(/[$,]/g, '')) : 1;

            if (!groups[label]) {
                groups[label] = { sum: 0, count: 0, values: [] };
            }

            groups[label].sum += value;
            groups[label].count++;
            groups[label].values.push(value);
        });

        const labels = Object.keys(groups);
        const aggregatedValues = [];

        labels.forEach(label => {
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

        return {
            labels: labels,
            datasets: [{
                label: chartDef.title,
                data: aggregatedValues,
                // Add default colors later
            }]
        };
    }
    ```
    *   **Note:** The line `parseFloat(String(row[valueColumn]).replace(/[$,]/g, ''))` is a simple way to handle currency. This highlights that data cleaning is an important consideration.

---

### **Task 3: Create the Chart Rendering Engine**

This function will take the aggregated data and use Chart.js to draw it on our canvas.

1.  **In `src/datatables.charts.js`**, add another helper function.

    ```javascript
    /**
     * Renders a chart on the canvas using Chart.js.
     * @param {DataTable.Api} dt - The DataTables API instance.
     * @param {object} config - The button's main configuration object.
     * @param {object} chartDef - The specific chart definition to render.
     */
    function renderChart(dt, config, chartDef) {
        const chartContainer = config._chartContainer;
        const canvas = chartContainer.find('canvas')[0]; // Get the raw canvas element

        // Aggregate the data using our new function.
        const chartData = aggregateData(dt, chartDef);

        // If a chart instance already exists on this canvas, destroy it first.
        if (config._chartInstance) {
            config._chartInstance.destroy();
        }

        // Create the new Chart.js instance.
        config._chartInstance = new Chart(canvas, {
            type: chartDef.type, // e.g., 'bar', 'pie'
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: chartDef.title
                    }
                }
                // We can merge user-defined options here later.
            }
        });
    }
    ```

---

### **Task 4: Update the Example to Test Everything**

Now we tie it all together in our test file.

1.  **Open `examples/index.html`**.
2.  **Add a `data-name` attribute to your `<th>` elements.** This makes the configuration much cleaner than using indexes.
    ```html
    <!-- Update the table header -->
    <thead>
        <tr>
            <th data-name="name">Name</th>
            <th data-name="position">Position</th>
            <th data-name="office">Office</th>
            <th data-name="age">Age</th>
            <th data-name="startDate">Start date</th>
            <th data-name="salary">Salary</th>
        </tr>
    </thead>
    ```
3.  **Update the DataTables initialization script** to use our new `charts` button and provide a configuration. You will also need to add the `columns` option to map the `data-name` attributes.

    ```javascript
    // Inside the $(document).ready function
    $('#example').DataTable({
        dom: 'Bfrtip',
        // Add the columns option
        columns: [
            { data: 'name', name: 'name' },
            { data: 'position', name: 'position' },
            { data: 'office', name: 'office' },
            { data: 'age', name: 'age' },
            { data: 'startDate', name: 'startDate' },
            { data: 'salary', name: 'salary' }
        ],
        buttons: [
            'copy',
            'csv',
            {
                // This is our new plugin configuration
                extend: 'charts',
                text: 'Show Charts', // Custom button text
                charts: [
                    // --- Chart Definition 1: Bar Chart ---
                    {
                        type: 'bar',
                        title: 'Average Salary by Office',
                        data: {
                            labelColumn: 'office',
                            valueColumn: 'salary',
                            aggregate: 'avg'
                        }
                    },
                    // --- Chart Definition 2: Pie Chart ---
                    {
                        type: 'pie',
                        title: 'Number of Employees by Office',
                        data: {
                            labelColumn: 'office',
                            aggregate: 'count'
                        }
                    }
                ]
            }
        ]
    });
    ```
    *   **Crucial Change:** We need to change how we access data. Instead of `row[labelColumn]`, we need to use `dt.column(`${labelColumn}:name`).data()` for proper mapping. Let's update the `aggregateData` function.

    **Correction for `aggregateData`:** Modify the function to use DataTables' column selectors for robustness. This is a much better approach.

    ```javascript
    // REVISED aggregateData function in src/datatables.charts.js
    function aggregateData(dt, chartDef) {
        const labelColumnName = chartDef.data.labelColumn;
        const valueColumnName = chartDef.data.valueColumn;
        const aggregateType = chartDef.data.aggregate;

        const groups = {};

        // Get all rows that match the current search filter
        const filteredRows = dt.rows({ search: 'applied' });

        // Iterate over the indexes of the filtered rows
        filteredRows.indexes().each(function (rowIndex) {
            const rowData = dt.row(rowIndex).data(); // Get the data object for the row
            const label = rowData[labelColumnName];
            const value = valueColumnName ? parseFloat(String(rowData[valueColumnName]).replace(/[$,]/g, '')) : 1;

            if (isNaN(value)) return; // Skip if value is not a number

            if (!groups[label]) {
                groups[label] = { sum: 0, count: 0 };
            }

            groups[label].sum += value;
            groups[label].count++;
        });

        const labels = Object.keys(groups);
        const aggregatedValues = [];

        labels.forEach(label => {
            const group = groups[label];
            let finalValue;

            switch (aggregateType) {
                case 'sum': finalValue = group.sum; break;
                case 'avg': finalValue = group.sum / group.count; break;
                case 'count': default: finalValue = group.count; break;
            }
            aggregatedValues.push(finalValue);
        });

        return {
            labels: labels,
            datasets: [{ label: chartDef.title, data: aggregatedValues }]
        };
    }
    ```
    *This revised function now correctly uses the named columns from the DataTables configuration, making it robust.*

---

### **Verification**

1.  **Run the development server:** `npm run dev`.
2.  **Observe the page:** You should see a new "📊 Charts" button.
3.  **Click the button:** A dropdown should appear with "Average Salary by Office" and "Number of Employees by Office".
4.  **Click "Average Salary by Office":** A bar chart should appear above the table, showing the average salary for each office.
5.  **Click the button again and select "Number of Employees...":** The chart should be replaced by a pie chart showing the employee distribution.
6.  **Test the interactivity:** Type "Tokyo" into the DataTables search box. The table will filter. Now, select a chart again. The chart should re-render showing data *only for Tokyo*.

**Phase 2 is now complete.** You have a working plugin that can render developer-defined charts based on the table's data, and it's interactive with the table's filtering. The next phase can focus on adding more features like the User-Driven ChartBuilder or dynamic updates.
