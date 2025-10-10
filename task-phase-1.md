### **Objective: Initialize a complete project structure for the 'DataTables Charts' plugin.**

**Assumptions:**
*   You are operating in the root directory of a new, empty Git repository.
*   Node.js and npm are installed.
*   The project name is `datatables-charts`.

---

### **Task 1: Initialize Project and Create Directory Structure**

1.  **Initialize npm:** Run the following command to create a `package.json` file with default values.
    ```bash
    npm init -y
    ```

2.  **Create Directories:** Execute the following commands to create the necessary project folders.
    ```bash
    mkdir src
    mkdir dist
    mkdir examples
    ```
    *   `src`: This will contain the raw, unminified source code (JavaScript and CSS).
    *   `dist`: This will contain the final, minified, production-ready files.
    *   `examples`: This will contain HTML files to demonstrate and test the plugin's functionality.

---

### **Task 2: Create Initial Source and Example Files**

1.  **Create Core Plugin Files:** Create empty files inside the `src` directory.
    ```bash
    touch src/datatables.charts.js
    touch src/datatables.charts.css
    ```

2.  **Populate `src/datatables.charts.js`:** Open this file and add the standard boilerplate for a DataTables/jQuery plugin. This structure prevents conflicts with other JavaScript libraries.
    ```javascript
    (function(window, document, $, DataTable) {
        'use strict';

        // This is where the core plugin logic will go.
        // We will define the 'charts' button and all its functionality here.

        console.log("DataTables Charts plugin loaded.");

    }(window, document, jQuery, jQuery.fn.dataTable));
    ```

3.  **Populate `src/datatables.charts.css`:** Open this file and add a simple header comment.
    ```css
    /**
     * DataTables Charts
     *
     * CSS for the chart container, modal, and buttons.
     */
    ```

4.  **Create an Example HTML File:** Create an HTML file for testing.
    ```bash
    touch examples/index.html
    ```

5.  **Populate `examples/index.html`:** This file is crucial for development. It will load all necessary libraries from a CDN and our local source files.

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DataTables Charts - Basic Example</title>

        <!-- DataTables CSS -->
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
        <!-- DataTables Buttons CSS -->
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.4.1/css/buttons.dataTables.min.css">

        <!-- Our Plugin's CSS (linking to the source file for development) -->
        <link rel="stylesheet" type="text/css" href="../src/datatables.charts.css">
    </head>
    <body>

        <div style="padding: 20px;">
            <h1>DataTables Charts Plugin</h1>
            <p>This is a basic demonstration table. The plugin is loaded, but no buttons are configured yet.</p>

            <table id="example" class="display" style="width:100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Office</th>
                        <th>Age</th>
                        <th>Start date</th>
                        <th>Salary</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tiger Nixon</td>
                        <td>System Architect</td>
                        <td>Edinburgh</td>
                        <td>61</td>
                        <td>2011/04/25</td>
                        <td>$320,800</td>
                    </tr>
                    <tr>
                        <td>Garrett Winters</td>
                        <td>Accountant</td>
                        <td>Tokyo</td>
                        <td>63</td>
                        <td>2011/07/25</td>
                        <td>$170,750</td>
                    </tr>
                    <!-- Add more sample data rows here if desired -->
                </tbody>
            </table>
        </div>

        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.7.0.js"></script>
        <!-- DataTables JS -->
        <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
        <!-- DataTables Buttons JS -->
        <script src="https://cdn.datatables.net/buttons/2.4.1/js/dataTables.buttons.min.js"></script>
        <!-- Chart.js (we will need this later) -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <!-- Our Plugin's JS (linking to the source file for development) -->
        <script src="../src/datatables.charts.js"></script>

        <script>
            $(document).ready(function() {
                $('#example').DataTable({
                    // The 'B' in dom is for Buttons
                    dom: 'Bfrtip',
                    buttons: [
                        // Buttons will be configured here in Phase 2
                        'copy', 'csv'
                    ]
                });
            });
        </script>

    </body>
    </html>
    ```

---

### **Task 3: Install and Configure Development Dependencies**

1.  **Install Dependencies:** Run the following npm command to install all necessary development tools.
    ```bash
    npm install eslint prettier terser live-server --save-dev
    ```
    *   `eslint`: For code linting to find errors.
    *   `prettier`: For automatic code formatting.
    *   `terser`: For minifying JavaScript for production.
    *   `live-server`: For running a local development server with hot-reloading.

2.  **Configure ESLint:** Create a configuration file.
    ```bash
    touch .eslintrc.json
    ```
    Populate `.eslintrc.json` with this configuration:
    ```json
    {
        "env": {
            "browser": true,
            "es2021": true,
            "jquery": true
        },
        "extends": "eslint:recommended",
        "parserOptions": {
            "ecmaVersion": "latest",
            "sourceType": "script"
        },
        "rules": {}
    }
    ```

3.  **Configure Prettier:** Create a configuration file.
    ```bash
    touch .prettierrc.json
    ```
    Populate `.prettierrc.json` with this configuration:
    ```json
    {
        "tabWidth": 4,
        "semi": true,
        "singleQuote": true
    }
    ```

4.  **Add Scripts to `package.json`:** Open the `package.json` file and replace the entire `"scripts"` section with the following. These scripts will automate our development workflow.
    ```json
    "scripts": {
      "lint": "eslint src/**/*.js",
      "build": "terser src/datatables.charts.js -c -m -o dist/datatables.charts.min.js",
      "dev": "live-server --open=./examples/"
    },
    ```

---

### **Task 4: Create Initial Documentation**

1.  **Create the README:** This is the most important file for an open-source project.
    ```bash
    touch README.md
    ```

2.  **Populate `README.md`:** Add the following content as a starting point.
    ```markdown
    # DataTables Charts

    A powerful and easy-to-use plugin for DataTables that allows developers and users to generate charts directly from table data.

    ## Features (Planned)

    *   **Developer-Defined Charts:** Pre-configure charts that summarize table data.
    *   **User-Driven Chart Builder:** An intuitive UI for end-users to create their own visualizations.
    *   **Interactive:** Charts dynamically update as the data in the table is filtered.
    *   **Aggregation Engine:** Automatically `count`, `sum`, or `average` data for meaningful charts.
    *   **Powered by Chart.js:** Leverages the popular and flexible Chart.js library.

    ## Installation

    **CDN (Coming Soon)**

    ```html
    <!-- Add links here once deployed -->
    ```

    ## Quick Start

    Include the necessary CSS and JS files, then configure the buttons in your DataTables initialization.

    ```html
    <table id="myTable">
        ...
    </table>
    ```

    ```javascript
    $(document).ready(function() {
        $('#myTable').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv',
                // Chart configuration will go here
            ]
        });
    });
    ```

    ## License

    This project is licensed under the MIT License.
    ```

---

### **Verification**

After completing all tasks, perform these checks to ensure the setup is correct:

1.  **Run the Build Process:** In your terminal, run `npm run build`.
    *   **Expected Outcome:** A new file, `datatables.charts.min.js`, should be created in the `dist` folder.

2.  **Run the Development Server:** In your terminal, run `npm run dev`.
    *   **Expected Outcome:** Your default web browser should open automatically to `examples/index.html`. You should see a standard DataTable with sorting and filtering functionality. Check the browser's developer console; you should see the message "DataTables Charts plugin loaded."

**Phase 1 is now complete.** The project has a professional structure, a development workflow, and a test environment, ready for you to begin building the core plugin features in Phase 2.
