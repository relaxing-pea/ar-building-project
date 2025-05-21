// Debugging setup
console.log("Initializing AR...");

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Add temporary axis helper (debugging)
scene.add(new THREE.AxesHelper(1));

// Model loading
const loader = new THREE.GLTFLoader();
let modelLoaded = false;

console.log("Loading 3D model...");
loader.load(
    'building.glb',
    (gltf) => {
        console.log("Model loaded successfully!");
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);
        modelLoaded = true;
        
        // Position model in front of camera
        model.position.set(0, 0, -2);
    },
    undefined,
    (error) => {
        console.error("Model failed to load:", error);
        alert("Error loading 3D model. Check console for details.");
    }
);

// AR Button handler
document.getElementById('ar-button').addEventListener('click', async () => {
    console.log("AR button clicked");
    
    if (!navigator.xr) {
        alert("WebXR not available. Try Chrome on Android or Safari on iOS 15+ with WebXR enabled.");
        return;
    }

    try {
        console.log("Requesting AR session...");
        const session = await navigator.xr.requestSession('immersive-ar');
        console.log("AR session started");
        
        renderer.xr.setSession(session);
        document.getElementById('ar-button').textContent = "AR Active";
        document.getElementById('ar-button').style.background = "#4CAF50";
        
        // Add reticle for placement
        const reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        
        // Handle controller input
        session.addEventListener('select', () => {
            if (modelLoaded && reticle.visible) {
                const modelClone = scene.children.find(child => child.isGroup).clone();
                modelClone.position.setFromMatrixPosition(reticle.matrix);
                scene.add(modelClone);
            }
        });

    } catch (error) {
        console.error("AR session failed:", error);
        alert("Couldn't start AR: " + error.message);
    }
});

// Animation loop
function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
