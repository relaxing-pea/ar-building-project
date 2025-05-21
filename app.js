// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// AR variables
let model, hitTestSource = null;
let modelPlaced = false;
const controller = renderer.xr.getController(0);
scene.add(controller);

// Load model
const loader = new THREE.GLTFLoader();
loader.load(
    'building.glb',
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.visible = false; // Hide until placed
        scene.add(model);
    },
    undefined,
    (error) => console.error("Model error:", error)
);

// AR session start
async function startAR() {
    if (!navigator.xr) {
        alert("WebXR unavailable. Try Chrome on Android or Safari iOS 15+.");
        return;
    }

    const session = await navigator.xr.requestSession('immersive-ar');
    session.addEventListener('end', resetAR);
    renderer.xr.setSession(session);
    
    // Setup hit testing (surface detection)
    const space = await session.requestReferenceSpace('viewer');
    hitTestSource = await session.requestHitTestSource({ space });
}

// Place model function
function placeModel(position) {
    if (!model || modelPlaced) return;
    
    model.position.copy(position);
    model.visible = true;
    modelPlaced = true;
    
    document.getElementById('ar-button').classList.add('placed');
    document.getElementById('ar-button').textContent = "Model Placed";
    document.getElementById('instructions').textContent = "Move around to view";
}

// Main AR loop
function animate() {
    renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame || !model) return;
        
        // Surface detection
        if (!modelPlaced && hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const pose = hitTestResults[0].getPose(renderer.xr.getReferenceSpace());
                controller.position.set(0, 0, -0.3); // Visual indicator
                if (modelPlaced === false) {
                    placeModel(pose.transform.position);
                }
            }
        }
        
        renderer.render(scene, camera);
    });
}

// Reset function
function resetAR() {
    modelPlaced = false;
    if (model) model.visible = false;
    document.getElementById('ar-button').classList.remove('placed');
    document.getElementById('ar-button').textContent = "Place Model";
    document.getElementById('instructions').textContent = "Move your phone to detect surfaces";
}

// Button handler
document.getElementById('ar-button').addEventListener('click', () => {
    if (modelPlaced) return;
    startAR();
});

// Start animation
animate();

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
