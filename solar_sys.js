
        import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
        import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

        let scene, camera, renderer, controls, skybox;
        let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;

        let mercury_orbit_radius = 50
        let venus_orbit_radius = 60
        let earth_orbit_radius = 70
        let mars_orbit_radius = 80
        let jupiter_orbit_radius = 100
        let saturn_orbit_radius = 120
        let uranus_orbit_radius = 140
        let neptune_orbit_radius = 160

        let mercury_revolution_speed = 2
        let venus_revolution_speed = 1.5
        let earth_revolution_speed = 1
        let mars_revolution_speed = 0.8
        let jupiter_revolution_speed = 0.7
        let saturn_revolution_speed = 0.6
        let uranus_revolution_speed = 0.5
        let neptune_revolution_speed = 0.4

        let animationPaused = false; 
        let animationFrameId; 

        const planets = {};
        function createMaterialArray() {
            const skyboxImagepaths = ['space_ft.png', 'space_bk.png', 'space_up.png', 'space_dn.png', 'space_rt.png', 'space_lf.png']
            const materialArray = skyboxImagepaths.map((image) => {
                let texture = new THREE.TextureLoader().load(image);
                return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
            });
            return materialArray;
        }

        function setSkyBox() {
            const materialArray = createMaterialArray();
            let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
            skybox = new THREE.Mesh(skyboxGeo, materialArray);
            scene.add(skybox);
        }

        function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType) {
            const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
            const loader = new THREE.TextureLoader();
            const planetTexture = loader.load(texture);
            const material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });

            const planet = new THREE.Mesh(geometry, material);

            return planet
        }

        function createRing(innerRadius) {
            let outerRadius = innerRadius - 0.1
            let thetaSegments = 600
            const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
            const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh)
            mesh.rotation.x = Math.PI / 2
            return mesh;
        }

        function createPlanetLabel(planetName) {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'planet-label';
            labelDiv.textContent = planetName;
            document.body.appendChild(labelDiv);
            return labelDiv;
        }

        // Raycaster for hover detection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredPlanet = null;
        let activeLabel = null; // To keep track of the currently shown label

        function onMouseMove(event) {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }


        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(
                85,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

            setSkyBox();
            planet_earth = loadPlanetTexture("earth_hd.jpg", 4, 100, 100, 'standard');
            planet_sun = loadPlanetTexture("sun_hd.jpg", 20, 100, 100, 'basic');
            planet_mercury = loadPlanetTexture("mercury_hd.jpg", 2, 100, 100, 'standard');
            planet_venus = loadPlanetTexture("venus_hd.jpg", 3, 100, 100, 'standard');
            planet_mars = loadPlanetTexture("mars_hd.jpg", 3.5, 100, 100, 'standard');
            planet_jupiter = loadPlanetTexture("jupiter_hd.jpg", 10, 100, 100, 'standard');
            planet_saturn = loadPlanetTexture("saturn_hd.jpg", 8, 100, 100, 'standard');
            planet_uranus = loadPlanetTexture("uranus_hd.jpg", 6, 100, 100, 'standard');
            planet_neptune = loadPlanetTexture("neptune_hd.jpg", 5, 100, 100, 'standard');


            scene.add(planet_earth); planets.earth = { mesh: planet_earth, label: createPlanetLabel("Earth") };
            scene.add(planet_sun); planets.sun = { mesh: planet_sun, label: createPlanetLabel("Sun") };
            scene.add(planet_mercury); planets.mercury = { mesh: planet_mercury, label: createPlanetLabel("Mercury") };
            scene.add(planet_venus); planets.venus = { mesh: planet_venus, label: createPlanetLabel("Venus") };
            scene.add(planet_mars); planets.mars = { mesh: planet_mars, label: createPlanetLabel("Mars") };
            scene.add(planet_jupiter); planets.jupiter = { mesh: planet_jupiter, label: createPlanetLabel("Jupiter") };
            scene.add(planet_saturn); planets.saturn = { mesh: planet_saturn, label: createPlanetLabel("Saturn") };
            scene.add(planet_uranus); planets.uranus = { mesh: planet_uranus, label: createPlanetLabel("Uranus") };
            scene.add(planet_neptune); planets.neptune = { mesh: planet_neptune, label: createPlanetLabel("Neptune") };


            const sunLight = new THREE.PointLight(0xffffff, 1, 0);
            sunLight.position.copy(planet_sun.position);
            scene.add(sunLight);

            // Rotation orbit
            createRing(mercury_orbit_radius)
            createRing(venus_orbit_radius)
            createRing(earth_orbit_radius)
            createRing(mars_orbit_radius)
            createRing(jupiter_orbit_radius)
            createRing(saturn_orbit_radius)
            createRing(uranus_orbit_radius)
            createRing(neptune_orbit_radius)

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            renderer.domElement.id = "c";
            controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 12;
            controls.maxDistance = 1000;

            camera.position.z = 100;

            // Speed control sliders
            document.getElementById('mercurySpeed').addEventListener('input', (event) => {
                mercury_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('venusSpeed').addEventListener('input', (event) => {
                venus_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('earthSpeed').addEventListener('input', (event) => {
                earth_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('marsSpeed').addEventListener('input', (event) => {
                mars_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('jupiterSpeed').addEventListener('input', (event) => {
                jupiter_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('saturnSpeed').addEventListener('input', (event) => {
                saturn_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('uranusSpeed').addEventListener('input', (event) => {
                uranus_revolution_speed = parseFloat(event.target.value);
            });
            document.getElementById('neptuneSpeed').addEventListener('input', (event) => {
                neptune_revolution_speed = parseFloat(event.target.value);
            });

            // Dark/Light Mode Toggle
            const darkModeToggle = document.getElementById('darkModeToggle');
            const modeText = document.getElementById('modeText');
            darkModeToggle.addEventListener('change', () => {
                document.body.classList.toggle('light-mode', !darkModeToggle.checked);
                modeText.textContent = darkModeToggle.checked ? 'Dark Mode' : 'Light Mode';
            });
           
            document.body.classList.toggle('light-mode', !darkModeToggle.checked);
            modeText.textContent = darkModeToggle.checked ? 'Dark Mode' : 'Light Mode';


            // Pause/Resume Button
            const pauseResumeBtn = document.getElementById('pauseResumeBtn');
            pauseResumeBtn.addEventListener('click', () => {
                animationPaused = !animationPaused;
                if (animationPaused) {
                    cancelAnimationFrame(animationFrameId);
                    pauseResumeBtn.textContent = "Resume Animation";
                } else {
                    animate(performance.now()); // Restart animation from current time
                    pauseResumeBtn.textContent = "Pause Animation";
                }
            });

            // Event listener for mouse movement on the canvas for planet labels
            renderer.domElement.addEventListener('mousemove', onMouseMove);
        }


        function planetRevolver(time, speed, planet, orbitRadius, planetName) {
            let orbitSpeedMultiplier = 0.001;
            const planetAngle = time * orbitSpeedMultiplier * speed;
            planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
            planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
        }

        // Function to update label positions
        function updatePlanetLabels() {
            for (const key in planets) {
                if (planets.hasOwnProperty(key)) {
                    const planet = planets[key].mesh;
                    const label = planets[key].label;

                    const vector = new THREE.Vector3();
                    planet.getWorldPosition(vector);

                    vector.project(camera);

                    // Convert to screen coordinates
                    const x = (vector.x * .5 + .5) * window.innerWidth;
                    const y = (vector.y * -.5 + .5) * window.innerHeight;

                    label.style.left = `${x}px`;
                    label.style.top = `${y}px`;
                }
            }
        }


        function animate(time) {
            if (!animationPaused) {
                animationFrameId = requestAnimationFrame(animate);

                // Rotate the planets
                const rotationSpeed = 0.005;
                planet_earth.rotation.y += rotationSpeed;
                planet_sun.rotation.y += rotationSpeed;
                planet_mercury.rotation.y += rotationSpeed;
                planet_venus.rotation.y += rotationSpeed;
                planet_mars.rotation.y += rotationSpeed;
                planet_jupiter.rotation.y += rotationSpeed;
                planet_saturn.rotation.y += rotationSpeed;
                planet_uranus.rotation.y += rotationSpeed;
                planet_neptune.rotation.y += rotationSpeed;

                // Use the dynamically updated revolution speeds
                planetRevolver(time, mercury_revolution_speed, planet_mercury, mercury_orbit_radius, 'mercury')
                planetRevolver(time, venus_revolution_speed, planet_venus, venus_orbit_radius, 'venus')
                planetRevolver(time, earth_revolution_speed, planet_earth, earth_orbit_radius, 'earth')
                planetRevolver(time, mars_revolution_speed, planet_mars, mars_orbit_radius, 'mars')
                planetRevolver(time, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius, 'jupiter')
                planetRevolver(time, saturn_revolution_speed, planet_saturn, saturn_orbit_radius, 'saturn')
                planetRevolver(time, uranus_revolution_speed, planet_uranus, uranus_orbit_radius, 'uranus')
                planetRevolver(time, neptune_revolution_speed, planet_neptune, neptune_orbit_radius, 'neptune')

            }

            updatePlanetLabels();


            // Check for hovered planets
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(Object.values(planets).map(p => p.mesh));

            if (intersects.length > 0) {
                if (hoveredPlanet != intersects[0].object) {
                    // New planet hovered
                    if (hoveredPlanet && activeLabel) {
                        activeLabel.classList.remove('show'); 
                    }
                    hoveredPlanet = intersects[0].object;
                    const currentPlanetKey = Object.keys(planets).find(key => planets[key].mesh === hoveredPlanet);
                    if (currentPlanetKey) {
                        activeLabel = planets[currentPlanetKey].label;
                        activeLabel.classList.add('show');
                    }
                }
            } else {
                // No planet hovered
                if (hoveredPlanet && activeLabel) {
                    activeLabel.classList.remove('show');
                }
                hoveredPlanet = null;
                activeLabel = null;
            }


            controls.update();
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            // Ensure labels are re-positioned on resize
            updatePlanetLabels();
        }

        window.addEventListener("resize", onWindowResize, false);
        window.addEventListener('mouseout', () => { // Hide label if mouse leaves the window
            if (hoveredPlanet && activeLabel) {
                activeLabel.classList.remove('show');
            }
            hoveredPlanet = null;
            activeLabel = null;
        });




        init();
        animate(0);
