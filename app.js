// Debugging flag
const DEBUG = true;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Debug: Add axis helper
if (DEBUG) scene.add(new THREE.AxesHelper(1));

// AR variables
let model;
let currentSession = null;
const controller = renderer.xr.getController(0);
controller.addEventListener('select', onSelect);
scene.add(controller);

// Load model - REPLACE WITH YOUR MODEL PATH
const loader = new THREE.GLTFLoader();
loader.load(
    'building.glb', 
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.visible = false;
        scene.add(model);
        if (DEBUG) console.log("3D model loaded successfully");
    },
    undefined,
    (error) => {
        console.error("Model loading error:", error);
        // Fallback cube if model fails to load
        model = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        scene.add(model);
        model.visible = false;
    }
);

// Start AR session
async function startAR() {
    if (!navigator.xr) {
        alert("WebXR not supported. Try Chrome on Android or Safari on iOS 15+.");
        return;
    }

    try {
        const session = await navigator.xr.requestSession('immersive-ar');
        currentSession = session;
        renderer.xr.setSession(session);
        
        session.addEventListener('end', () => {
            if (DEBUG) console.log("AR session ended");
            currentSession = null;
        });

        if (DEBUG) console.log("AR session started successfully");
        
    } catch (error) {
        console.error("AR session error:", error);
        alert("Failed to start AR: " + error.message);
    }
}

// Place model function
function placeModel() {
    if (!model || !renderer.xr.isPresenting) return;
    
    // Place model 1 meter in front of camera
    camera.getWorldDirection(model.position);
    model.position.multiplyScalar(1).add(camera.position);
    model.visible = true;
    
    document.getElementById('ar-button').textContent = "Model Placed";
    document.getElementById('ar-button').style.background = "#4CAF50";
    if (DEBUG) console.log("Model placed at:", model.position);
}

// Controller select handler
function onSelect() {
    if (!model.visible) placeModel();
}

// Button click handler
document.getElementById('ar-button').addEventListener('click', async () => {
    if (DEBUG) console.log("Place Model button clicked");
    
    if (model?.visible) return; // Already placed
    
    if (!renderer.xr.isPresenting) {
        await startAR();
    } else {
        placeModel();
    }
});

// Animation loop
function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
animate();

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debug info
if (DEBUG) {
    console.log("WebXR supported:", !!navigator.xr);
    console.log("Initialization complete");
}
