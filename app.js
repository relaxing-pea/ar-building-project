// Detect if iOS and WebXR is not enabled
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
let webXRSupported = false;

// Check WebXR support
if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        webXRSupported = supported;
        if (!supported && isIOS) showARjsFallback();
    });
} else if (isIOS) {
    showARjsFallback();
}

// WebXR setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load model
const loader = new THREE.GLTFLoader();
loader.load(
    'building.glb',
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);
    },
    undefined,
    (error) => console.error("Model failed to load:", error)
);

// Start AR
document.getElementById('ar-button').addEventListener('click', () => {
    if (webXRSupported) startWebXR();
    else if (isIOS) showARjsFallback();
    else alert("AR not supported on your device.");
});

async function startWebXR() {
    try {
        const session = await navigator.xr.requestSession('immersive-ar');
        renderer.xr.setSession(session);
        session.addEventListener('end', () => window.location.reload());
    } catch (e) {
        alert("WebXR failed: " + e.message);
    }
}

function showARjsFallback() {
    document.getElementById('ar-button').style.display = 'none';
    document.getElementById('ar-fallback').style.display = 'block';
    alert("Point your camera at a Hiro marker to view the model.");
}

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
