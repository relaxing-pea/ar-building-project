let scene, camera, renderer, cssRenderer, model;

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 0); // Eye-level height

    // WebGL Renderer (for 3D model)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR
    document.body.appendChild(renderer.domElement);

    // CSS3D Renderer (for labels)
    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    document.body.appendChild(cssRenderer.domElement);

    // Load 3D model (replace 'building.glb' with your model path)
    const loader = new THREE.GLTFLoader();
    loader.load(
        'building.glb',
        (gltf) => {
            model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
            scene.add(model);

            // Add labels to key parts of the building
            addLabel("Main Entrance", { x: 0, y: 2, z: -1 });
            addLabel("Clock Tower", { x: 1, y: 4, z: 0 });
            addLabel("Historical Wing", { x: -1, y: 3, z: 1 });
        },
        undefined,
        (error) => console.error("Error loading model:", error)
    );

    // Start AR on button click
    document.getElementById('ar-button').addEventListener('click', startAR);
}

function addLabel(text, position) {
    const labelDiv = document.createElement('div');
    labelDiv.textContent = text;
    labelDiv.style.color = 'white';
    labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    labelDiv.style.padding = '5px 10px';
    labelDiv.style.borderRadius = '5px';
    labelDiv.style.fontFamily = 'Arial, sans-serif';
    labelDiv.style.fontSize = '14px';
    labelDiv.style.pointerEvents = 'auto'; // Allows clicking

    // Make labels interactive
    labelDiv.addEventListener('click', () => {
        alert(`You clicked: ${text}`);
    });

    const label = new THREE.CSS3DObject(labelDiv);
    label.position.set(position.x, position.y, position.z);
    scene.add(label);
}

async function startAR() {
    if (navigator.xr) {
        try {
            const session = await navigator.xr.requestSession('immersive-ar');
            renderer.xr.setSession(session);
            session.addEventListener('end', () => window.location.reload());
        } catch (e) {
            alert("AR failed: " + e.message);
        }
    } else {
        alert("WebXR not supported. Try Chrome on Android or Safari on iOS 15+.");
    }
}

function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        cssRenderer.render(scene, camera);
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});