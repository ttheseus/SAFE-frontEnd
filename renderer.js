window.addEventListener('DOMContentLoaded', function () {

    // definitions
    const subButton = document.getElementById('submitButton'); // HTML submit button

    const sidebarItems = document.querySelectorAll('.sidebar ul li'); // defs for the sidebar
    const formPages = document.querySelectorAll('.form-page');
    let currentSidebarItem = this.document.querySelector('.sidebar ul li.active');
    let zones = {};

    const generateButton = document.querySelector('.generateButton');
    const numCamInput = document.getElementById('num-cam'); // more generalized customizations
    const cameraFormsContainer = document.getElementById('camera-forms-container'); // Container for generated forms
    const sidebar = document.querySelector('.sidebar ul');

    // Sidebar: click to navigate between pages + GFX
    sidebarItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove 'active' class from all sidebar items
            sidebarItems.forEach(sideItem => {
                sideItem.classList.remove('active');
                sideItem.querySelector('.circle').style.backgroundColor = '#9aa3ac';
            });

            // Add 'active' class to the clicked sidebar item
            this.classList.add('active');
            this.querySelector('.circle').style.backgroundColor = '#4c6c8c';

            // Hide all form pages
            formPages.forEach(page => page.classList.remove('active'));

            // Get the id of the clicked sidebar item (e.g., 'preliminary-nav')
            const targetId = this.id.replace('-nav', '');

            // Show the corresponding form page by adding 'active'
            const targetPage = document.getElementById(targetId);
            targetPage.classList.add('active');


            //GFX
            const formPage = document.querySelector('.form-page.active');

            // Apply the fade-in class to trigger the animation
            formPage.classList.add('fade-in');

            // Remove the fade-in class after the animation is done to reset it for next click
            formPage.addEventListener('click', function () {
                formPage.classList.remove('fade-in');
            });
        });
    });

    // Display first page
    formPages[0].classList.add('active');
    sidebarItems[0].classList.add('active');


    // Submitting the form --> turn it into data that we can use later for the json file generation
    const submitForm = () => {
        console.log("Submit form function triggered");

        if (!numCamInput) {
            console.error('num-cam input not found!');
            return;
        }

        const formPage1 = new FormData(document.getElementById('custom-form'));
        const dataObj = {};

        formPage1.forEach((value, key) => {
            dataObj[key] = value;
        });

        console.log('OG data: ', dataObj);

        const modifiedData = formatData(dataObj, numCamInput, numZones);

        console.log('Modified data: ', modifiedData)

        const jsonData = JSON.stringify(modifiedData, null, 1);
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });

        console.log('Created modified blob: ', jsonBlob);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(jsonBlob);
        link.download = 'input.json';

        window.Electron.download({
            url: link.href,
            filename: 'input.json'
        });
        console.log('Download function called');

        window.Electron.onDownloadComplete((event, message) => {
            console.log(message);

            const filePath = `${downloadsPath}\\input.json`;

            console.log(`File saved to: ${filePath}`);
        });
    };


    // make it so that clicking will submit the form
    if (subButton) {
        subButton.addEventListener('click', submitForm);
    }


    // Formatting the data for Json file
    function formatData(dataObj, numCamInput, numZones) {
        const numCams = parseInt(numCamInput.value);

        const formatted = [];

        for (let cameraIndex = 1; cameraIndex <= numCams; cameraIndex++) {
            const camera = {
                camera_id: cameraIndex,
                camera_name: dataObj[`camera_name_${cameraIndex}`],
                video_path: dataObj[`video_path_${cameraIndex}`],
                model_path: dataObj[`model_path_${cameraIndex}`],
                plc_ip: dataObj[`plc_ip_${cameraIndex}`],
                rpi_ip: dataObj[`rpi_ip_${cameraIndex}`],
                features: [
                    {
                        feature: "backwards",
                        config: {
                            trapezoid: [
                                [parseInt(dataObj[`BTcoord1x_${cameraIndex}`]), parseInt(dataObj[`BTcoord1y_${cameraIndex}`])],
                                [parseInt(dataObj[`BTcoord2x_${cameraIndex}`]), parseInt(dataObj[`BTcoord2y_${cameraIndex}`])],
                                [parseInt(dataObj[`/BTcoord3x_${cameraIndex}`]), parseInt(dataObj[`BTcoord3y_${cameraIndex}`])],
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
                                [dataObj[`CNcoord1x_${cameraIndex}`], dataObj[`CNcoord1y_${cameraIndex}`]],
                                [dataObj[`CNcoord2x_${cameraIndex}`], dataObj[`CNcoord2y_${cameraIndex}`]],
                                [dataObj[`CNcoord3x_${cameraIndex}`], dataObj[`CNcoord3y_${cameraIndex}`]],
                                [dataObj[`CNcoord4x_${cameraIndex}`], dataObj[`CNcoord4y_${cameraIndex}`]],
                            ],
                            columns: [
                                [dataObj[`columnsx_${cameraIndex}`]], [dataObj[`columnsy_${cameraIndex}`]],
                            ],
                            area_dim: { width: dataObj[`CNWidth_${cameraIndex}`], length: dataObj[`CNLength_${cameraIndex}`] }
                        }
                    },
                    {
                        feature: "pedestrian",
                        config: {
                            trapezoid: [
                                [dataObj[`Pcoord1x_${cameraIndex}`], dataObj[`Pcoord1y_${cameraIndex}`]],
                                [dataObj[`Pcoord2x_${cameraIndex}`], dataObj[`Pcoord2y_${cameraIndex}`]],
                                [dataObj[`Pcoord3x_${cameraIndex}`], dataObj[`Pcoord3y_${cameraIndex}`]],
                                [dataObj[`Pcoord4x_${cameraIndex}`], dataObj[`Pcoord4y_${cameraIndex}`]],
                            ],
                            // zones dynamically generated here
                            area_dim: { width: dataObj[`PWidth_${cameraIndex}`], length: dataObj[`PLength_${cameraIndex}`] }
                        }
                    }
                ]
            };

            for (let zoneIndex = 1; zoneIndex <= zones[cameraIndex]; zoneIndex++) {
                const zoneKey = `zone_${zoneIndex}`;
                camera.features[2].config[zoneKey] = [
                    [dataObj[`zone${zoneIndex}1x_${cameraIndex}`], dataObj[`zone${zoneIndex}1y_${cameraIndex}`]],
                    [dataObj[`zone${zoneIndex}2x_${cameraIndex}`], dataObj[`zone${zoneIndex}2y_${cameraIndex}`]],
                    [dataObj[`zone${zoneIndex}3x_${cameraIndex}`], dataObj[`zone${zoneIndex}3y_${cameraIndex}`]],
                    [dataObj[`zone${zoneIndex}4x_${cameraIndex}`], dataObj[`zone${zoneIndex}4y_${cameraIndex}`]],
                ]
            }

            formatted.push(camera);
        }

        return formatted;
    };


    if (generateButton) {
        generateButton.addEventListener('click', function () {
            const numCams = parseInt(numCamInput.value);

            if (isNaN(numCams) || numCams <= 0) {
                alert("Please enter a valid non-negative number");
                return;
            }

            sidebar.innerHTML = '';
            cameraFormsContainer.innerHTML = '';

            // Clear existing form pages
            formPages.forEach(page => page.classList.remove('active'));

            for (let camIndex = 1; camIndex <= numCams; camIndex++) {
                // Generate Camera Form
                generateCameraSetupForm(camIndex);

                // Generate Backwards Feature Form for the camera
                generateBackwardsForm(camIndex);

                // Generate Collision/Nearmiss Form for the camera
                generateCollisionNearmissForm(camIndex);

                // Generate Pedestrian Feature Form for the camera
                generatePedestrianForm(camIndex);

                // Generate Zone Forms for the camera
                generateZoneForms(camIndex);

                // Add sidebar navigation items for each feature (Backwards, Pedestrian, Zones)
                addSidebarNav(camIndex);
            }

            addSubmitButton();

            setupSidebarLinks();

            setTimeout(() => {
                const formContainers = document.querySelectorAll('.form-container');
                formContainers.forEach(container => {
                    container.classList.add('fade-in'); // Or 'active' if you prefer transitions
                });
            });
        });
    }


    const addSubmitButton = () => {
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Form';
        submitButton.type = 'button';
        submitButton.classList.add('submit-btn');  // Add a class for easy identification

        // Add event listener for the submit button
        submitButton.addEventListener('click', submitForm);

        // Append the submit button to the sidebar (outside camera sections)
        sidebar.appendChild(submitButton);
    }

    // Function to re-setup sidebar links after generate button click
    function setupSidebarLinks() {
        const sidebarItems = document.querySelectorAll('.sidebar ul li a');
        const formPages = document.querySelectorAll('.form-page');
        const circles = document.querySelectorAll('.sidebar-links .circle');

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

    // Function to add sidebar navigation for each feature (Backwards, Pedestrian, Zones)
    const addSidebarNav = (cameraIndex) => {
        const sidebarItem = document.createElement('li');
        sidebarItem.classList.add('sidebar-links');

        const sidebarList = this.document.createElement('ul');
        // const camHeader = this.document.createElement('span');
        // camHeader.textContent = `Camera ${cameraIndex}`;
        // sidebarItem.appendChild(camHeader);

        sidebarItem.innerHTML = `
                <span>Camera ${cameraIndex}</span>
                <li>
                    <span class="circle"></span>
                    <a href="#camera-form-${cameraIndex}">Camera</a>
                </li>
                <li>
                    <span class="circle"></span>
                    <a href="#backwards-form-${cameraIndex}">Backwards</a>
                </li>
                <li>
                    <span class="circle"></span>
                    <a href="#collision-nearmiss-form-${cameraIndex}">Collision</a>
                </li>
                <li>
                    <span class="circle"></span>
                    <a href="#pedestrian-form-${cameraIndex}">Pedestrian</a>
                </li>
                <li>
                    <span class="circle"></span>
                    <a href="#zone-form-${cameraIndex}">Zones</a>
                </li>
            `;

        sidebarItem.appendChild(sidebarList);
        sidebar.appendChild(sidebarItem);
    };


    // Generating HTML for form pages
    const generateCameraSetupForm = (cameraIndex) => {
        const cameraSetupForm = document.createElement('div');
        cameraSetupForm.classList.add('form-page');
        cameraSetupForm.id = `camera-form-${cameraIndex}`;

        cameraSetupForm.innerHTML = ` 
                <h2>Setup (Camera ${cameraIndex})</h2>

                <label for="camera_name_${cameraIndex}">Camera Name:</label>
                <input type="text" id="camera_name_${cameraIndex}" name="camera_name_${cameraIndex}" required>
    
                <label for="video_path_${cameraIndex}">Video Path:</label>
                <input type="text" id="video_path_${cameraIndex}" name="video_path_${cameraIndex}" required>
    
                <label for="model_path_${cameraIndex}">Model Path:</label>
                <input type="text" id="model_path_${cameraIndex}" name="model_path_${cameraIndex}" required>
    
                <label for="plc_ip_${cameraIndex}">PLC IP:</label>
                <input type="text" id="plc_ip_${cameraIndex}" name="plc_ip_${cameraIndex}" required>
    
                <label for="rpi_ip_${cameraIndex}">Raspberry Pi IP:</label>
                <input type="text" id="rpi_ip_${cameraIndex}" name="rpi_ip_${cameraIndex}" required>
            `;
        cameraFormsContainer.appendChild(cameraSetupForm);

        // addNextButtonEventListeners();
    };

    // Generate feature-specific pages for each camera
    const generateBackwardsForm = (cameraIndex) => {
        const backwardsForm = document.createElement('div');
        backwardsForm.classList.add('form-page');
        backwardsForm.id = `backwards-form-${cameraIndex}`;
        backwardsForm.innerHTML = `
                <h2>Backwards Movement (Camera: ${cameraIndex})</h2>

                <h4>Trapezoid:</h4>

                <div class="input-group">
                    <label for="BTcoord1_${cameraIndex}">Trapezoid Coord 1:</label>
                    <input class="coords" type="number" id="BTcoord1x_${cameraIndex}" name="BTcoord1x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="BTcoord1y_${cameraIndex}" name="BTcoord1y_${cameraIndex}" placeholder="Y"required>
                </div>

                <div class="input-group">
                    <label for="BTcoord2_${cameraIndex}">Trapezoid Coord 2:</label>
                    <input class="coords" type="number" id="BTcoord2x_${cameraIndex}" name="BTcoord2x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="BTcoord2y_${cameraIndex}" name="BTcoord2y_${cameraIndex}" placeholder="Y" required>
                </div>

                <div class="input-group">
                    <label for="BTcoord3_${cameraIndex}">Trapezoid Coord 3:</label>
                    <input class="coords" type="number" id="BTcoord3x_${cameraIndex}" name="BTcoord3x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="BTcoord3y_${cameraIndex}" name="BTcoord3y_${cameraIndex}" placeholder="Y"required>
                </div>

                <div class="input-group">
                    <label for="BTcoord4_${cameraIndex}">Trapezoid Coord 4:</label>
                    <input class="coords" type="number" id="BTcoord4x_${cameraIndex}" name="BTcoord4x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="BTcoord4y_${cameraIndex}" name="BTcoord4y_${cameraIndex}" placeholder="Y" required>
                </div>

                <p></p>

                <label for="BWidth_${cameraIndex}">Area Width:</label>
                <input type="number" id="BWidth_${cameraIndex}" name="BWidth_${cameraIndex}">

                <p></p>

                <label for="BLength_${cameraIndex}">Area Length:</label>
                <input type="number" id="BLength_${cameraIndex}" name="BLength_${cameraIndex}">

                <p></p>

                <label for="back_line_start_${cameraIndex}">Backwards Line Start:</label>
                <input type="number" id="back_line_start_${cameraIndex}" name="back_line_start_${cameraIndex}">

                <p></p>

                <label for="back_line_end_${cameraIndex}">Backwards Line End:</label>
                <input type="number" id="back_line_end_${cameraIndex}" name="back_line_end_${cameraIndex}">
            `;
        cameraFormsContainer.appendChild(backwardsForm);

        // addNextButtonEventListeners();
    };

    const generateCollisionNearmissForm = (cameraIndex) => {
        const collisionNearmissForm = document.createElement('div');
        collisionNearmissForm.classList.add('form-page');
        collisionNearmissForm.id = `collision-nearmiss-form-${cameraIndex}`;

        collisionNearmissForm.innerHTML = `
                <h2>Collision & Nearmiss Zones (Camera: ${cameraIndex})</h2>

                <h4>Trapezoid:</h4>

                <div class="input-group">
                    <label for="CNcoord1_${cameraIndex}">Trapezoid Coord 1:</label>
                    <input class="coords" type="number" id="CNcoord1x_${cameraIndex}" name="CNcoord1x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="CNcoord1y_${cameraIndex}" name="CNcoord1y_${cameraIndex}" placeholder="Y"required>
                </div>

                <div class="input-group">
                    <label for="CNcoord2_${cameraIndex}">Trapezoid Coord 2:</label>
                    <input class="coords" type="number" id="CNcoord2x_${cameraIndex}" name="CNcoord2x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="CNcoord2y_${cameraIndex}" name="CNcoord2y_${cameraIndex}" placeholder="Y" required>
                </div>

                <div class="input-group">
                    <label for="CNcoord3_${cameraIndex}">Trapezoid Coord 3:</label>
                    <input class="coords" type="number" id="CNcoord3x_${cameraIndex}" name="CNcoord3x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="CNcoord3y_${cameraIndex}" name="CNcoord3y_${cameraIndex}" placeholder="Y"required>
                </div>

                <div class="input-group">
                    <label for="CNcoord4_${cameraIndex}">Trapezoid Coord 4:</label>
                    <input class="coords" type="number" id="CNcoord4x_${cameraIndex}" name="CNcoord4x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="CNcoord4y_${cameraIndex}" name="CNcoord4y_${cameraIndex}" placeholder="Y" required>
                </div>

                <p></p>

                <label for="CNWidth_${cameraIndex}">Area Width:</label>
                <input type="number" id="CNWidth_${cameraIndex}" name="CNWidth_${cameraIndex}"> <br>

                <label for="CNLength_${cameraIndex}">Area Length:</label>
                <input type="number" id="CNLength_${cameraIndex}" name="CNLength_${cameraIndex}"> <br>

                <p></p>

                <div class="input-group">
                    <label for="columnCoords_${cameraIndex}">Column Coords:</label>
                    <input class="coords" type="number" id="columnx_${cameraIndex}" name="columnx_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="columny_${cameraIndex}" name="columny_${cameraIndex}" placeholder="Y"required>
                </div>
            `;
        cameraFormsContainer.appendChild(collisionNearmissForm);

        // addNextButtonEventListeners();
    };

    const generatePedestrianForm = (cameraIndex) => {
        const pedestrianForm = document.createElement('div');
        pedestrianForm.classList.add('form-page');
        pedestrianForm.id = `pedestrian-form-${cameraIndex}`;
        pedestrianForm.innerHTML = `
                <h2>Pedestrian Zones (Camera ${cameraIndex})</h2>

                <h4>Trapezoid:</h4>

                <div class="input-group">
                    <label for="Pcoord1_${cameraIndex}">Trapezoid Coord 1:</label>
                    <input class="coords" type="number" id="Pcoord1x_${cameraIndex}" name="Pcoord1x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="Pcoord1y_${cameraIndex}" name="Pcoord1y_${cameraIndex}" placeholder="Y"required>
                </div>

                <div class="input-group">
                    <label for="Pcoord2_${cameraIndex}">Trapezoid Coord 2:</label>
                    <input class="coords" type="number" id="Pcoord2x_${cameraIndex}" name="Pcoord2x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="Pcoord2y_${cameraIndex}" name="Pcoord2y_${cameraIndex}" placeholder="Y" required>
                </div>

                <div class="input-group">
                    <label for="Pcoord3_${cameraIndex}">Trapezoid Coord 3:</label>
                    <input class="coords" type="number" id="Pcoord3x_${cameraIndex}" name="Pcoord3x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="Pcoord3y_${cameraIndex}" name="Pcoord3y_${cameraIndex}" placeholder="Y"required>
                </div>

                <div class="input-group">
                    <label for="Pcoord4_${cameraIndex}">Trapezoid Coord 4:</label>
                    <input class="coords" type="number" id="Pcoord4x_${cameraIndex}" name="Pcoord4x_${cameraIndex}" placeholder="X" required>
                    <input class="coords" type="number" id="Pcoord4y_${cameraIndex}" name="Pcoord4y_${cameraIndex}" placeholder="Y" required>
                </div>

                <label for="PWidth_${cameraIndex}">Area Width:</label>
                <input type="number" id="PWidth_${cameraIndex}" name="PWidth_${cameraIndex}"> <br>

                <label for="PLength_${cameraIndex}">Area Length:</label>
                <input type="number" id="PLength_${cameraIndex}" name="PLength_${cameraIndex}"> <br>
            `;
        cameraFormsContainer.appendChild(pedestrianForm);

        // addNextButtonEventListeners();
    };

    const generateZoneForms = (cameraIndex) => {
        const zoneContainer = document.createElement('div');

        // const zoneHeader = document.createElement('h3');
        // zoneHeader.textContent = `Zones for Camera ${cameraIndex}`;
        // zoneContainer.appendChild(zoneHeader);

        const zoneForm = document.createElement('div');
        zoneForm.classList.add('form-page');
        zoneForm.id = `zone-form-${cameraIndex}`;
        zoneForm.innerHTML = `
                <h2>Zone Initialization (Camera ${cameraIndex})</h2>

                <div class="input-group">
                    <label for="num-zone-${cameraIndex}">NUMBER OF ZONES:</label>
                    <input type="number" id="num-zone-${cameraIndex}" name="num-zone-${cameraIndex}" required>
                </div>

                <button type="button" class="generateZones">NEXT</button>
            `;

        zoneContainer.appendChild(zoneForm);
        cameraFormsContainer.appendChild(zoneContainer);

        const numZoneInput = document.getElementById(`num-zone-${cameraIndex}`);
        numZones = parseInt(numZoneInput.value);

        const generateZonesButton = zoneForm.querySelector('.generateZones');

        generateZonesButton.addEventListener('click', function () {
            const numZones = parseInt(numZoneInput.value);
            if (isNaN(numZones) || numZones <= 0) {
                console.error('Please enter a valid number of zones.');
                return; // Exit early if the value is invalid
            }
            console.log(numZones);

            zones[cameraIndex] = numZones;

            // Clear any previous zone forms
            const existingZoneForms = document.querySelectorAll(`#zone-form-${cameraIndex} .zone-setup`);
            existingZoneForms.forEach(zone => zone.remove());

            // Generate zone forms dynamically based on the number of zones
            for (let zoneIndex = 1; zoneIndex <= numZones; zoneIndex++) {
                const zoneForm = document.createElement('div');
                zoneForm.classList.add('zone-setup');
                zoneForm.innerHTML = `
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

                zoneContainer.appendChild(zoneForm);
            }
        });
    };
});
