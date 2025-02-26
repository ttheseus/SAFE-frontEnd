/*

HTML CODE

*/

function navigateToPage(page) {
    console.log("Navigating to:", page);
    window.location.href = page;
}

window.addEventListener('DOMContentLoaded', function () { // DO NOT DELETE. This needed for Electron to run properly
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                               PRELIMINARY SETUP CODE                                                  *//
    /*                                                                                                                         */

    document.getElementById('homeBtn').addEventListener('click', function () {
        navigateToPage('index.html');
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                           DEFINITIONS & GLOBAL VARIABLES                                              *//
    /*                                                                                                                         */

    const generateButton = document.querySelector('.generateButton'); // gets generate button for dynamic html

    const sidebarItems = document.querySelectorAll('.sidebar ul li'); // gets sidebar items from html/css
    const sidebar = document.querySelector('.sidebar ul'); // gets the sidebar from html/css
    const formPages = document.querySelectorAll('.form-page'); // gets the form page from html/css
    const cameraFormsContainer = document.getElementById('camera-forms-container'); // Container for generated forms

    const uploadButton = document.getElementById('upload-btn');
    const submitButton = this.document.getElementById('submit-file');

    let zones = {};

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                               MAIN SIDEBAR FUNCTION                                                   *//
    /*                                                                                                                         */


    /* > MAIN SIDEBAR

        - Handles clicks to navigate between the sidebar pages on the first section
        - IS NOT USED FOR THE SECOND SECTION

    */
    sidebarItems.forEach(item => {
        item.addEventListener('click', function () { // click activation

            // Initial setup:
            sidebarItems.forEach(sideItem => {
                sideItem.classList.remove('active'); // Removes 'active' class from sidebar items
                sideItem.querySelector('.circle').style.backgroundColor = '#9aa3ac'; // Makes sure the circle is its unactivated color
            });

            // Clicked item process:
            this.classList.add('active'); // add 'active' to clicked sidebar item
            this.querySelector('.circle').style.backgroundColor = '#4c6c8c'; // circle color changed to active color
            formPages.forEach(page => page.classList.remove('active')); // Hide all other form pages so that the pages don't overlap 

            // Showing the page: 
            const targetId = this.id.replace('-nav', ''); // get id of clicked sidebar item (e.g., 'preliminary-nav')
            const targetPage = document.getElementById(targetId); // gets the page of clicked item 
            targetPage.classList.add('active'); // adds 'active' to the page to display it

            // GFX:
            const formPage = document.querySelector('.form-page.active'); // get the active form page
            formPage.classList.add('fade-in'); // apply the fade-in class (css) to the page trigger the animation
            formPage.addEventListener('click', function () { // on click reset the animation for the next page
                formPage.classList.remove('fade-in');
            });
        });
    });

    // Initial page display:
    formPages[0].classList.add('active'); // Display the first page
    sidebarItems[0].classList.add('active'); // Display the first page as active on the sidebar

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                                SUBMISSION HANDLING                                                    *//
    /*                                                                                                                         */

    /* > FORM SUBMISSION HANDLER

        - turns the inputs into data that is used for the JSON file generation
        - calls on a function to format the data
        - downloads the data

    */

    /* > SUBMIT PROCESS

        - Accesses, stores & formats data from the form
        - Downloads the data

    */
    const submitForm = (numCams) => {
        console.log("from submitForm: ", numCams);

        // Initial setup:
        const formPage1 = new FormData(document.getElementById('upload-form')); // Gets the filled out form data
        const dataObj = {}; // Creates an array that will contain the data

        // Fill dataObj array:
        formPage1.forEach((value, key) => {
            dataObj[key] = value; // pushes input values from the form into the array
        });
        // format to get a value from dataObj: dataObj['object_id_here']
        // array contents are strings

        // Format the data:
        const modifiedData = formatData(dataObj, numCams); // variable holds the formatted data

        // Create JSON file:
        const jsonData = JSON.stringify(modifiedData, null, 1); // Prettifies the JSON format (no other functionality)
        const jsonBlob = new Blob([jsonData], { type: 'application/json' }); // Creates the JSON file

        // Downloading JSON file:
        const link = document.createElement('a'); // creates a blank link
        link.href = URL.createObjectURL(jsonBlob); // fills link with the JSON file URL
        link.download = 'input.json'; // downloads the JSON file with the file name 'input.json'
        window.Electron.download({ // accesses Electron's download API to ensure the file is downloaded/saved properly
            url: link.href,
            filename: 'input.json'
        }); // try not to change anything in this block as it's linked back to the preload.cjs. 
        // Changing something here may cause something to break in the preload file.
    };



    /* > DATA FORMATTER
 
        - Correctly edits the dataObj data into proper JSON formatting
        - Returns the data in the correct format
 
    */
    function formatData(dataObj, numCams) {
        console.log("from formatData: ", numCams);

        // Initial setup:
        const formatted = []; // empty return value to be filled

        // Formatting:
        for (let cameraIndex = 1; cameraIndex <= numCams; cameraIndex++) { // Handles the camera format dynamically
            const camera = {
                camera_id: cameraIndex,
                camera_name: dataObj[`camera_name_${cameraIndex}`], // It is extremely important that what's in the dataObj
                video_path: dataObj[`video_path_${cameraIndex}`], // square brackets are the IDs of what is generated in the
                model_path: dataObj[`model_path_${cameraIndex}`], // HTML generation functions
                plc_ip: dataObj[`plc_ip_${cameraIndex}`],
                rpi_ip: dataObj[`rpi_ip_${cameraIndex}`],
                features: [
                    {
                        feature: "backwards",
                        config: {
                            trapezoid: [
                                [parseInt(dataObj[`BTcoord1x_${cameraIndex}`]), parseInt(dataObj[`BTcoord1y_${cameraIndex}`])],
                                [parseInt(dataObj[`BTcoord2x_${cameraIndex}`]), parseInt(dataObj[`BTcoord2y_${cameraIndex}`])],
                                [parseInt(dataObj[`BTcoord3x_${cameraIndex}`]), parseInt(dataObj[`BTcoord3y_${cameraIndex}`])],
                                [parseInt(dataObj[`BTcoord4x_${cameraIndex}`]), parseInt(dataObj[`BTcoord4y_${cameraIndex}`])]
                            ],
                            area_dim: { width: parseInt(dataObj[`BWidth_${cameraIndex}`]), length: parseInt(dataObj[`BLength_${cameraIndex}`]) },
                            backwards_line: { start: parseInt(dataObj[`back_line_start_${cameraIndex}`]), end: parseInt(dataObj[`back_line_end_${cameraIndex}`]) }
                        }
                    },
                    {
                        feature: "collision-nearmiss",
                        config: {
                            trapezoid: [
                                [parseInt(dataObj[`CNcoord1x_${cameraIndex}`]), parseInt(dataObj[`CNcoord1y_${cameraIndex}`])],
                                [parseInt(dataObj[`CNcoord2x_${cameraIndex}`]), parseInt(dataObj[`CNcoord2y_${cameraIndex}`])],
                                [parseInt(dataObj[`CNcoord3x_${cameraIndex}`]), parseInt(dataObj[`CNcoord3y_${cameraIndex}`])],
                                [parseInt(dataObj[`CNcoord4x_${cameraIndex}`]), parseInt(dataObj[`CNcoord4y_${cameraIndex}`])],
                            ],
                            columns: [
                                [parseInt(dataObj[`columnx_${cameraIndex}`]), parseInt(dataObj[`columny_${cameraIndex}`])],
                            ],
                            area_dim: { width: parseInt(dataObj[`CNWidth_${cameraIndex}`]), length: parseInt(dataObj[`CNLength_${cameraIndex}`]) }
                        }
                    },
                    {
                        feature: "pedestrian",
                        config: {
                            trapezoid: [
                                [parseInt(dataObj[`Pcoord1x_${cameraIndex}`]), parseInt(dataObj[`Pcoord1y_${cameraIndex}`])],
                                [parseInt(dataObj[`Pcoord2x_${cameraIndex}`]), parseInt(dataObj[`Pcoord2y_${cameraIndex}`])],
                                [parseInt(dataObj[`Pcoord3x_${cameraIndex}`]), parseInt(dataObj[`Pcoord3y_${cameraIndex}`])],
                                [parseInt(dataObj[`Pcoord4x_${cameraIndex}`]), parseInt(dataObj[`Pcoord4y_${cameraIndex}`])],
                            ],
                            area_dim: { width: parseInt(dataObj[`PWidth_${cameraIndex}`]), length: parseInt(dataObj[`PLength_${cameraIndex}`]) }
                            // zones are dynamically generated here
                        }
                    }
                ]
            };

            // Zones:
            for (let zoneIndex = 1; zoneIndex <= zones[cameraIndex]; zoneIndex++) { // Generate zone formatting dynamically
                const zoneKey = `zone${zoneIndex}`;
                camera.features[2].config[zoneKey] = [
                    [parseInt(dataObj[`zone${zoneIndex}1x_${cameraIndex}`]), parseInt(dataObj[`zone${zoneIndex}1y_${cameraIndex}`])],
                    [parseInt(dataObj[`zone${zoneIndex}2x_${cameraIndex}`]), parseInt(dataObj[`zone${zoneIndex}2y_${cameraIndex}`])],
                    [parseInt(dataObj[`zone${zoneIndex}3x_${cameraIndex}`]), parseInt(dataObj[`zone${zoneIndex}3y_${cameraIndex}`])],
                    [parseInt(dataObj[`zone${zoneIndex}4x_${cameraIndex}`]), parseInt(dataObj[`zone${zoneIndex}4y_${cameraIndex}`])],
                ]
            }

            formatted.push(camera); // push the format to the blank return value
        }

        return formatted; // return the formatting
    };



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                                UPLOADING JSON FILE                                                    *//
    /*                                                                                                                         */


    /* > UPLOAD FILE

        - Allows user to upload only json files

    */

    uploadButton.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            if (file.type === 'application/json' || file.name.split('.').pop().toLowerCase() === 'json') {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const fileContent = JSON.parse(e.target.result);
                    console.log("File Content1: ", fileContent);
                };

                reader.onerror = function (errorEvent) {
                    console.error("Error reading file: ", errorEvent.target.error);
                };

                reader.readAsText(file);
            } else {
                alert("Please upload a valid JSON file.");
                // Clear the input field if the file is not a JSON file
                uploadButton.value = '';
            }
        } else {
            console.log("No file selected");
        }
    });

    function getNumCam(callback) {
        const file = uploadButton.files[0]; // Get the file from input
        const reader = new FileReader();

        // File read is successful
        reader.onload = function (e) {
            try {
                const fileContent = JSON.parse(e.target.result); // Parse the JSON content
                const numCams = fileContent.length; // Get the number of cameras
                callback(null, numCams); // Call the callback with no error and the number of cameras
            } catch (error) {
                callback('Error parsing JSON: ' + error, null); // If there's an error, pass the error to the callback
            }
        };

        // If there's an error reading the file
        reader.onerror = function (error) {
            callback('Error reading file: ' + error.target.error, null); // Pass the error to the callback
        };

        reader.readAsText(file); // Start reading the file
    }


    /* > READING FILE

        - Reads the file data and generates the next section

    */
    if (generateButton) {
        generateButton.addEventListener('click', function () { // begin process when button is clicked

            // Initial setup:
            const file = uploadButton.files[0];

            const reader = new FileReader();

            // Error handling:
            if (!file) {
                alert("Please select a file first!");
                return;
            } // throw an error if numCams is invalid

            reader.onload = function (e) {
                const fileContent = JSON.parse(e.target.result);
                console.log("File Content2: ", fileContent);
                try {
                    sidebar.innerHTML = ''; // creates empty sidebar HTML
                    cameraFormsContainer.innerHTML = ''; // creates empty container HTML
                    formPages.forEach(page => page.classList.remove('active')); // clear existing pages from sidebar

                    const numCams = fileContent.length;

                    // HTML generation:
                    for (let camIndex = 1; camIndex <= numCams; camIndex++) { // dynamically generate new HTML
                        // Generate camera form HTML
                        generateCameraForm(camIndex, fileContent);

                        //Generate additionals form HTML
                        additionalsForm(camIndex, fileContent);

                        // Add new sidebar items for each feature (camera, backwards, collision, pedestrian, zones)
                        addSidebarNav(camIndex);
                    }

                    // Final setup:
                    addSubmitButton(numCams); // generate submit button in the sidebar
                    setupSidebarLinks(); // makes sure the new sidebar works (clicking on it will navigate to that page)
                    // makes sure the new sidebar works (clicking on it will navigate to that page)
                } catch (error) {
                    console.error('Error parsing JSON file: ' + error);
                }
            };

            reader.onerror = function (error) {
                console.error('Error reading file:', error.target.error);
            }

            reader.readAsText(file);
        });
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*                                                 FORM SECTION TWO                                                      *//
    /*                                                                                                                         */

    /* > NEW SIDEBAR

        - Sets up the new sidebar to navigate between feature pages and cameras

    */
    // Functionality:
    function setupSidebarLinks() {
        const sidebarItems = document.querySelectorAll('.sidebar ul li a'); // get new sidebar items
        const formPages = document.querySelectorAll('.form-page'); // get new form pages
        const circles = document.querySelectorAll('.sidebar-links .circle'); // get new circles

        sidebarItems.forEach(item => {
            item.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent the default anchor link behavior

                // Remove 'active' class from all sidebar links
                sidebarItems.forEach(sideItem => {
                    sideItem.classList.remove('active');
                    const parentLi = sideItem.closest('li');
                    parentLi.classList.remove('active');
                    const circle = sideItem.querySelector('.circle');
                    if (circle) {
                        circle.style.backgroundColor = '#9aa3ac';
                    }
                });

                // Hide all form pages
                formPages.forEach(page => page.classList.remove('active'));

                // Add 'active' class to the clicked sidebar item
                this.classList.add('active');
                const parentLi = this.closest('li');
                parentLi.classList.add('active');

                // Change circle color on active
                const circle = this.querySelector('.circle');
                if (circle) {
                    circle.style.backgroundColor = '#4c6c8c';  // Change circle color to active state
                }

                // Get the target form page ID from the href value of the clicked link
                const targetId = this.getAttribute('href').substring(1); // Remove the '#' from href

                // Show the corresponding form page by adding 'active'
                const targetPage = document.getElementById(targetId);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
            });
        });
    }

    // Setup:
    const addSidebarNav = (cameraIndex) => {

        // Initial setup:
        const sidebarItem = document.createElement('li'); // create a list
        sidebarItem.classList.add('sidebar-links'); // add the new sidebar css to the list
        const sidebarList = this.document.createElement('ul'); // create the items in the list

        // HTML generation:
        sidebarItem.innerHTML = `
                <span>Camera ${cameraIndex}</span>
                <li>
                    <span class="circle"></span>
                    <a href="#camera-form-${cameraIndex}">Basic Config</a>
                </li>
                <li>
                    <span class="circle"></span>
                    <a href="#additionals-form-${cameraIndex}">Advanced Config</a>
                </li>
            `;

        sidebarItem.appendChild(sidebarList); // Push the HTML into the Items
        sidebar.appendChild(sidebarItem); // Push the items into the sidebar
    };

    // Add submit button to the sidebar
    const addSubmitButton = (numCams) => {
        console.log("from addSubmit: ", numCams);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Form';
        submitButton.type = 'button';
        submitButton.classList.add('submit-btn');  // Add a class for easy identification

        // Add event listener for the submit button
        submitButton.addEventListener('click', () => submitForm(numCams));

        // Append the submit button to the sidebar (outside camera sections)
        sidebar.appendChild(submitButton);
    }

    const generateCameraForm = (cameraIndex, fileContent) => {
        try {
            const camera = fileContent[cameraIndex - 1];

            const cameraPage = document.createElement('div');
            cameraPage.classList.add('form-page');
            cameraPage.id = `camera-form-${cameraIndex}`;

            cameraPage.innerHTML = `
                <h2>Camera ${cameraIndex}</h2>

                <h4>Camera setup:</h4>
                <label for="camera_name_${cameraIndex}">Camera Name:</label>
                <input type="text" id="camera_name_${cameraIndex}" name="camera_name_${cameraIndex}" value="${camera.camera_name}" required>

                <label for="video_path_${cameraIndex}">Video Path:</label>
                <input type="text" id="video_path_${cameraIndex}" name="video_path_${cameraIndex}" value="${camera.video_path}" required>

                <label for="model_path_${cameraIndex}">Model Path:</label>
                <input type="text" id="model_path_${cameraIndex}" name="model_path_${cameraIndex}" value="${camera.model_path}" required>

                <label for="plc_ip_${cameraIndex}">PLC IP:</label>
                <input type="text" id="plc_ip_${cameraIndex}" name="plc_ip_${cameraIndex}" value="${camera.plc_ip}" required>

                <label for="rpi_ip_${cameraIndex}">Raspberry Pi IP:</label>
                <input type="text" id="rpi_ip_${cameraIndex}" name="rpi_ip_${cameraIndex}" value="${camera.rpi_ip}" required>

                <br>

                <h4>Backwards Movement (Camera ${cameraIndex}):</h4>

                <div class="input-group">
                    <label for="BTcoord1_${cameraIndex}">Trapezoid Coord 1:</label>
                    <input class="coords" type="number" id="BTcoord1x_${cameraIndex}" name="BTcoord1x_${cameraIndex}" value="${camera.features[0].config.trapezoid[0][0]}" required>
                    <input class="coords" type="number" id="BTcoord1y_${cameraIndex}" name="BTcoord1y_${cameraIndex}" value="${camera.features[0].config.trapezoid[0][1]}" required>
                </div>

                <div class="input-group">
                    <label for="BTcoord2_${cameraIndex}">Trapezoid Coord 2:</label>
                    <input class="coords" type="number" id="BTcoord2x_${cameraIndex}" name="BTcoord2x_${cameraIndex}" value="${camera.features[0].config.trapezoid[1][0]}" required>
                    <input class="coords" type="number" id="BTcoord2y_${cameraIndex}" name="BTcoord2y_${cameraIndex}" value="${camera.features[0].config.trapezoid[1][1]}" required>
                </div>

                <div class="input-group">
                    <label for="BTcoord3_${cameraIndex}">Trapezoid Coord 3:</label>
                    <input class="coords" type="number" id="BTcoord3x_${cameraIndex}" name="BTcoord3x_${cameraIndex}" value="${camera.features[0].config.trapezoid[2][0]}" required>
                    <input class="coords" type="number" id="BTcoord3y_${cameraIndex}" name="BTcoord3y_${cameraIndex}" value="${camera.features[0].config.trapezoid[2][1]}" required>
                </div>

                <div class="input-group">
                    <label for="BTcoord4_${cameraIndex}">Trapezoid Coord 4:</label>
                    <input class="coords" type="number" id="BTcoord4x_${cameraIndex}" name="BTcoord4x_${cameraIndex}" value="${camera.features[0].config.trapezoid[3][0]}" required>
                    <input class="coords" type="number" id="BTcoord4y_${cameraIndex}" name="BTcoord4y_${cameraIndex}" value="${camera.features[0].config.trapezoid[3][1]}" required>
                </div>

                <label for="BWidth_${cameraIndex}">Area Width:</label>
                <input type="number" id="BWidth_${cameraIndex}" name="BWidth_${cameraIndex}" value="${camera.features[0].config.area_dim.width}">

                <label for="BLength_${cameraIndex}">Area Length:</label>
                <input type="number" id="BLength_${cameraIndex}" name="BLength_${cameraIndex}" value="${camera.features[0].config.area_dim.length}">

                <label for="back_line_start_${cameraIndex}">Backwards Line Start:</label>
                <input type="number" id="back_line_start_${cameraIndex}" name="back_line_start_${cameraIndex}" value="${camera.features[0].config.backwards_line.start}">

                <label for="back_line_end_${cameraIndex}">Backwards Line End:</label>
                <input type="number" id="back_line_end_${cameraIndex}" name="back_line_end_${cameraIndex}" value="${camera.features[0].config.backwards_line.start}">

                <br>

                <h4>Collision & Nearmiss Zones (Camera ${cameraIndex})</h4>

                <div class="input-group">
                    <label for="CNcoord1_${cameraIndex}">Trapezoid Coord 1:</label>
                    <input class="coords" type="number" id="CNcoord1x_${cameraIndex}" name="CNcoord1x_${cameraIndex}" value="${camera.features[1].config.trapezoid[0][0]}" required>
                    <input class="coords" type="number" id="CNcoord1y_${cameraIndex}" name="CNcoord1y_${cameraIndex}" value="${camera.features[1].config.trapezoid[0][1]}" required>
                </div>

                <div class="input-group">
                    <label for="CNcoord2_${cameraIndex}">Trapezoid Coord 2:</label>
                    <input class="coords" type="number" id="CNcoord2x_${cameraIndex}" name="CNcoord2x_${cameraIndex}" value="${camera.features[1].config.trapezoid[1][0]}" required>
                    <input class="coords" type="number" id="CNcoord2y_${cameraIndex}" name="CNcoord2y_${cameraIndex}" value="${camera.features[1].config.trapezoid[1][1]}" required>
                </div>

                <div class="input-group">
                    <label for="CNcoord3_${cameraIndex}">Trapezoid Coord 3:</label>
                    <input class="coords" type="number" id="CNcoord3x_${cameraIndex}" name="CNcoord3x_${cameraIndex}" value="${camera.features[1].config.trapezoid[2][0]}" required>
                    <input class="coords" type="number" id="CNcoord3y_${cameraIndex}" name="CNcoord3y_${cameraIndex}" value="${camera.features[1].config.trapezoid[2][1]}" required>
                </div>

                <div class="input-group">
                    <label for="CNcoord4_${cameraIndex}">Trapezoid Coord 4:</label>
                    <input class="coords" type="number" id="CNcoord4x_${cameraIndex}" name="CNcoord4x_${cameraIndex}" value="${camera.features[1].config.trapezoid[3][0]}" required>
                    <input class="coords" type="number" id="CNcoord4y_${cameraIndex}" name="CNcoord4y_${cameraIndex}" value="${camera.features[1].config.trapezoid[3][1]}" required>
                </div>

                <label for="CNWidth_${cameraIndex}">Area Width:</label>
                <input type="number" id="CNWidth_${cameraIndex}" name="CNWidth_${cameraIndex}" value="${camera.features[1].config.area_dim.width}"> <br>

                <label for="CNLength_${cameraIndex}">Area Length:</label>
                <input type="number" id="CNLength_${cameraIndex}" name="CNLength_${cameraIndex}" value="${camera.features[1].config.area_dim.length}"> <br>

                <div class="input-group">
                    <label for="columnCoords_${cameraIndex}">Column Coords:</label>
                    <input class="coords" type="number" id="columnx_${cameraIndex}" name="columnx_${cameraIndex}" value="${camera.features[1].config.columns[0][0]}" required>
                    <input class="coords" type="number" id="columny_${cameraIndex}" name="columny_${cameraIndex}" value="${camera.features[1].config.columns[0][1]}" required>
                </div>

                <br>

                <h4>Pedestrian Zones (Camera ${cameraIndex})</h4>

                <div class="input-group">
                    <label for="Pcoord1_${cameraIndex}">Trapezoid Coord 1:</label>
                    <input class="coords" type="number" id="Pcoord1x_${cameraIndex}" name="Pcoord1x_${cameraIndex}" value="${camera.features[2].config.trapezoid[0][0]}" required>
                    <input class="coords" type="number" id="Pcoord1y_${cameraIndex}" name="Pcoord1y_${cameraIndex}" value="${camera.features[2].config.trapezoid[0][1]}" required>
                </div>

                <div class="input-group">
                    <label for="Pcoord2_${cameraIndex}">Trapezoid Coord 2:</label>
                    <input class="coords" type="number" id="Pcoord2x_${cameraIndex}" name="Pcoord2x_${cameraIndex}" value="${camera.features[2].config.trapezoid[1][0]}" required>
                    <input class="coords" type="number" id="Pcoord2y_${cameraIndex}" name="Pcoord2y_${cameraIndex}" value="${camera.features[2].config.trapezoid[1][0]}" required>
                </div>

                <div class="input-group">
                    <label for="Pcoord3_${cameraIndex}">Trapezoid Coord 3:</label>
                    <input class="coords" type="number" id="Pcoord3x_${cameraIndex}" name="Pcoord3x_${cameraIndex}" value="${camera.features[2].config.trapezoid[2][0]}" required>
                    <input class="coords" type="number" id="Pcoord3y_${cameraIndex}" name="Pcoord3y_${cameraIndex}" value="${camera.features[2].config.trapezoid[2][0]}" required>
                </div>

                <div class="input-group">
                    <label for="Pcoord4_${cameraIndex}">Trapezoid Coord 4:</label>
                    <input class="coords" type="number" id="Pcoord4x_${cameraIndex}" name="Pcoord4x_${cameraIndex}" value="${camera.features[2].config.trapezoid[3][0]}" required>
                    <input class="coords" type="number" id="Pcoord4y_${cameraIndex}" name="Pcoord4y_${cameraIndex}" value="${camera.features[2].config.trapezoid[3][0]}" required>
                </div>

                <label for="PWidth_${cameraIndex}">Area Width:</label>
                <input type="number" id="PWidth_${cameraIndex}" name="PWidth_${cameraIndex}" value="${camera.features[2].config.area_dim.width}"> <br>

                <label for="PLength_${cameraIndex}">Area Length:</label>
                <input type="number" id="PLength_${cameraIndex}" name="PLength_${cameraIndex}" value="${camera.features[2].config.area_dim.length}"> <br>
                `;
            cameraFormsContainer.appendChild(cameraPage);

            let numZones = 0;

            const configKeys = Object.keys(camera.features[2].config);
            configKeys.forEach(key => {
                if (key.startsWith('zone') && Array.isArray(camera.features[2].config[key])) {
                    numZones++;
                }
            });

            for (let zoneIndex = 1; zoneIndex <= numZones; zoneIndex++) {
                const zoneForm = document.createElement('div');
                zoneForm.classList.add('zone-setup');
                zoneForm.innerHTML = `
                <h5>Zone ${zoneIndex} (Camera ${cameraIndex})</h5>

                <div class="input-group">
                    <label for="zone${zoneIndex}1_${cameraIndex}">Coord 1:</label>
                    <input class="coords" type="number" id="zone${zoneIndex}1x_${cameraIndex}" name="zone${zoneIndex}1x_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][0][0]}" required>
                    <input class="coords" type="number" id="zone${zoneIndex}1y_${cameraIndex}" name="zone${zoneIndex}1y_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][0][1]}" required>
                </div>

                <div class="input-group">
                    <label for="zone${zoneIndex}2_${cameraIndex}">Coord 2:</label>
                    <input class="coords" type="number" id="zone${zoneIndex}2x_${cameraIndex}" name="zone${zoneIndex}2x_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][1][0]}" required>
                    <input class="coords" type="number" id="zone${zoneIndex}2y_${cameraIndex}" name="zone${zoneIndex}2y_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][1][1]}" required>
                </div>

                <div class="input-group">
                    <label for="zone${zoneIndex}3_${cameraIndex}">Coord 3:</label>
                    <input class="coords" type="number" id="zone${zoneIndex}3x_${cameraIndex}" name="zone${zoneIndex}3x_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][2][0]}" required>
                    <input class="coords" type="number" id="zone${zoneIndex}3y_${cameraIndex}" name="zone${zoneIndex}3y_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][2][1]}" required>
                </div>

                <div class="input-group">
                    <label for="zone${zoneIndex}4_${cameraIndex}">Coord 4:</label>
                    <input class="coords" type="number" id="zone${zoneIndex}4x_${cameraIndex}" name="zone${zoneIndex}4x_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][3][0]}" required>
                    <input class="coords" type="number" id="zone${zoneIndex}4y_${cameraIndex}" name="zone${zoneIndex}4y_${cameraIndex}" value="${camera.features[2].config[`zone_${zoneIndex}`][3][1]}" required>
                </div>
                `
                cameraPage.appendChild(zoneForm);
            }

        } catch (error) {
            console.error('Error parsing JSON file: ', error);
        }
    }

    const additionalsForm = (cameraIndex, fileContent) => {
        try {
            const camera = fileContent[cameraIndex - 1];
            console.log("generate camera form: ", camera);

            const zoneContainer = document.createElement('div');
            const zoneForm = document.createElement('div');
            zoneForm.classList.add('form-page');
            zoneForm.id = `additionals-form-${cameraIndex}`;
            zoneForm.innerHTML = `
                <h2>Add Zones (Camera ${cameraIndex})</h2>

                <div class="input-group">
                    <label for="num-zone-${cameraIndex}">NUMBER OF ZONES TO ADD:</label>
                    <input type="number" id="num-zone-${cameraIndex}" name="num-zone-${cameraIndex}" required>
                </div>

                <button type="button" class="generateZones">NEXT</button>

                <div class="add-zones-dyn"></div>
            `;

            zoneContainer.appendChild(zoneForm);
            cameraFormsContainer.appendChild(zoneContainer);

            const numZoneInput = document.getElementById(`num-zone-${cameraIndex}`);

            let numZonesCur = 0;

            const configKeys = Object.keys(camera.features[2].config);
            configKeys.forEach(key => {
                if (key.startsWith('zone') && Array.isArray(camera.features[2].config[key])) {
                    numZonesCur++;
                }
            });

            zones[cameraIndex] = numZonesCur;

            const generateZonesButton = zoneForm.querySelector('.generateZones');

            const generateZones = () => {
                const numZones = parseInt(numZoneInput.value) + numZonesCur;
                if (isNaN(numZones) || numZones < 0) {
                    console.error('Please enter a valid number of zones.');
                    return; // Exit early if the value is invalid
                }

                // Clear any previous zone forms

                const addZonesDynCont = zoneForm.querySelector('.add-zones-dyn');
                addZonesDynCont.innerHTML = '';

                // Generate zone forms dynamically based on the number of zones
                for (let zoneIndex = numZonesCur + 1; zoneIndex <= numZones; zoneIndex++) {
                    const zoneForm2 = document.createElement('div');
                    zoneForm2.classList.add('zone-setup');
                    zoneForm2.innerHTML = `
                    <p></p>
    
                    <h5>Zone ${zoneIndex} (Camera ${cameraIndex})</h5>
    
                    <div class="input-group">
                        <label for="zone${zoneIndex}1_${cameraIndex}">Coord 1:</label>
                        <input class="coords" type="number" id="zone${zoneIndex}1x_${cameraIndex}" name="zone${zoneIndex}1x_${cameraIndex}" placeholder="X" required>
                        <input class="coords" type="number" id="zone${zoneIndex}1y_${cameraIndex}" name="zone${zoneIndex}1y_${cameraIndex}" placeholder="Y" required>
                    </div>
    
                    <div class="input-group">
                        <label for="zone${zoneIndex}2_${cameraIndex}">Coord 2:</label>
                        <input class="coords" type="number" id="zone${zoneIndex}2x_${cameraIndex}" name="zone${zoneIndex}2x_${cameraIndex}" placeholder="X" required>
                        <input class="coords" type="number" id="zone${zoneIndex}2y_${cameraIndex}" name="zone${zoneIndex}2y_${cameraIndex}" placeholder="Y" required>
                    </div>
    
                    <div class="input-group">
                        <label for="zone${zoneIndex}3_${cameraIndex}">Coord 3:</label>
                        <input class="coords" type="number" id="zone${zoneIndex}3x_${cameraIndex}" name="zone${zoneIndex}3x_${cameraIndex}" placeholder="X" required>
                        <input class="coords" type="number" id="zone${zoneIndex}3y_${cameraIndex}" name="zone${zoneIndex}3y_${cameraIndex}" placeholder="Y" required>
                    </div>
    
                    <div class="input-group">
                        <label for="zone${zoneIndex}4_${cameraIndex}">Coord 4:</label>
                        <input class="coords" type="number" id="zone${zoneIndex}4x_${cameraIndex}" name="zone${zoneIndex}4x_${cameraIndex}" placeholder="X" required>
                        <input class="coords" type="number" id="zone${zoneIndex}4y_${cameraIndex}" name="zone${zoneIndex}4y_${cameraIndex}" placeholder="Y" required>
                    </div>
                    `;

                    addZonesDynCont.appendChild(zoneForm2);
                }

                zones[cameraIndex] = numZones;
            };

            if (numZoneInput.value === '') {
                generateZones();
            }

            generateZonesButton.addEventListener('click', function () {
                const numZones = parseInt(numZoneInput.value) + numZonesCur;

                // If input is not blank or zero, generate zones when the button is clicked
                if (numZones !== 0 && numZoneInput.value !== '') {
                    generateZones();
                } else {
                    console.error('Please enter a valid number of zones.');
                }
            });

        } catch (error) {
            console.error('Error parsing JSON file: ', error);
        }
    }
});
