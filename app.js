// 1. Initialize scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. Add test cube (green, 0.5m size)
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
cube.visible = false;
scene.add(cube);

// 3. AR session management
let arSession = null;

async function startAR() {
    try {
        // Check WebXR support
        if (!navigator.xr) {
            throw new Error("WebXR not available");
        }
        
        // Request AR session
        document.getElementById('status').textContent = "Starting AR...";
        arSession = await navigator.xr.requestSession('immersive-ar');
        
        // Set up session
        renderer.xr.setSession(arSession);
        document.getElementById('ar-button').textContent = "Place Cube";
        document.getElementById('status').textContent = "Move your phone around";
        
        // Session end handler
        arSession.addEventListener('end', () => {
            cube.visible = false;
            document.getElementById('ar-button').textContent = "Start AR";
            document.getElementById('status').textContent = "AR session ended";
        });
        
    } catch (error) {
        document.getElementById('status').textContent = "Error: " + error.message;
        console.error("AR error:", error);
    }
}

// 4. Place cube function
function placeCube() {
    if (!cube.visible) {
        // Position cube 1 meter in front of camera
        camera.getWorldDirection(cube.position);
        cube.position.multiplyScalar(1).add(camera.position);
        cube.visible = true;
        document.getElementById('ar-button').textContent = "Cube Placed";
        document.getElementById('status').textContent = "Walk around the cube!";
    }
}

// 5. Button click handler
document.getElementById('ar-button').addEventListener('click', () => {
    if (!renderer.xr.isPresenting) {
        startAR();
    } else if (!cube.visible) {
        placeCube();
    }
});

// 6. Animation loop
function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
animate();

// 7. Handle screen resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debug info
console.log("AR Test Initialized");
console.log("WebXR supported:", !!navigator.xr);
