import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/postprocessing/UnrealBloomPass.js';

// ==================================================
// SCENE
// ==================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1115); // Neutral dark backdrop

// ==================================================
// CAMERA
// ==================================================

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// ==================================================
// RENDERER
// ==================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Neutral Color Management
renderer.outputEncoding = THREE.sRGBEncoding;

// Neutral Tone Mapping Settings
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

// ==================================================
// SHADOWS
// ==================================================

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ==================================================
// ADD RENDERER TO PAGE
// ==================================================

document.getElementById("bgmodel").appendChild(renderer.domElement);

// ==================================================
// POST-PROCESSING (BLOOM)
// ==================================================

const composer = new EffectComposer(renderer);

// 1. Base Render Pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 2. Unreal Bloom Pass Config (Strength, Radius, Threshold)
const bloomResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
const bloomStrength = 0.6;  // Bloom intensity (keep subtle for realistic glow)
const bloomRadius = 0.4;     // Spread of glow
const bloomThreshold = 0.5; // Minimum brightness required to trigger bloom

const bloomPass = new UnrealBloomPass(bloomResolution, bloomStrength, bloomRadius, bloomThreshold);
composer.addPass(bloomPass);

// ==================================================
// NATURAL LIGHTING (NO TINT)
// ==================================================

// Soft neutral ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Neutral Key Light (Pure White)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(5, 10, 8);
keyLight.castShadow = true;

// Shadow settings
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 100;
keyLight.shadow.camera.left = -20;
keyLight.shadow.camera.right = 20;
keyLight.shadow.camera.top = 20;
keyLight.shadow.camera.bottom = -20;
keyLight.shadow.bias = -0.0001;
keyLight.shadow.normalBias = 0.02;

scene.add(keyLight);

// Neutral Fill Light (Cool daylight white)
const fillLight = new THREE.DirectionalLight(0xf0f5ff, 0.6);
fillLight.position.set(-5, 4, -5);
scene.add(fillLight);

// ==================================================
// MODEL LOADER
// ==================================================

const loader = new GLTFLoader();

loader.load(
    "./model.glb",
    function (gltf) {
        console.log("MODEL LOADED");
        const model = gltf.scene;
        scene.add(model);

        // Center Model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Model Materials + Shadows
        model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;

                if (object.material) {
                    const materials = Array.isArray(object.material)
                        ? object.material
                        : [object.material];

                    materials.forEach(function (material) {
                        if (material.map) {
                            material.map.encoding = THREE.sRGBEncoding;
                            material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        }
                        if (material.emissiveMap) {
                            material.emissiveMap.encoding = THREE.sRGBEncoding;
                        }
                        material.needsUpdate = true;
                    });
                }
            }
        });

        setCameraInstant(frames[0]);

        const loading = document.getElementById("loading");
        if (loading) {
            loading.classList.add("hidden");
        }

        console.log("CAMERA READY");
    },
    function (xhr) {
        if (xhr.total) {
            const percent = ((xhr.loaded / xhr.total) * 100).toFixed(1);
            console.log("Loading:", percent + "%");
        }
    },
    function (error) {
        console.error("GLB ERROR:", error);
    }
);

// ==================================================
// CAMERA FRAMES
// ==================================================

const frames = [
    {
        position: new THREE.Vector3(-3.1972768701412115, -1.3275247453910206, 8.649635473538925),
        quaternion: new THREE.Quaternion(0.0074657628633064185, -0.08738593490243021, -0.0006549265313713702, 0.9961463405731789),
        fov: 45
    },
    {
        position: new THREE.Vector3(2.765190459202525, -0.4643657368253321, -1.9576740951919933),
        quaternion: new THREE.Quaternion(0.004775818708250562, -0.2994238310382006, 0.0014987772004272685, -0.9541070771296986),
        fov: 45
    },
    {
        position: new THREE.Vector3(2.0645339563592255, -2.9519728033455617, -0.6698172572937408),
        quaternion: new THREE.Quaternion(0.029682214638328226, 0.14532475009037885, -0.004361850269488515, -0.9889290456891029),
        fov: 45
    },
    {
        position: new THREE.Vector3(1.6130040726138288, -3.251527788505073, -0.6613161064131393),
        quaternion: new THREE.Quaternion(0.0035020141148071646, 0.7144897610033867, -0.003576405117158, -0.6996279916097503),
        fov: 45
    }
];

// ==================================================
// CAMERA ANIMATION STATE
// ==================================================

let currentFrame = 0;
let isAnimating = false;
let animationStartTime = 0;
let animationDuration = 1800;

const animationStartPosition = new THREE.Vector3();
const animationStartQuaternion = new THREE.Quaternion();
let animationStartFov = 45;

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setCameraInstant(frame) {
    camera.position.copy(frame.position);
    camera.quaternion.copy(frame.quaternion);
    camera.fov = frame.fov;
    camera.updateProjectionMatrix();
}

function moveToFrame(index) {
    if (!frames[index]) return;
    if (index === currentFrame && !isAnimating) return;

    animationStartPosition.copy(camera.position);
    animationStartQuaternion.copy(camera.quaternion);
    animationStartFov = camera.fov;

    currentFrame = index;
    animationStartTime = performance.now();
    isAnimating = true;

    document.querySelectorAll(".menu-button").forEach(function (button) {
        button.classList.remove("active");
    });

    const activeButton = document.querySelector(`.menu-button[data-frame="${index}"]`);
    if (activeButton) activeButton.classList.add("active");

    updateInformation(index);
}

function animateCamera() {
    if (!isAnimating) return;

    const now = performance.now();
    let progress = Math.min((now - animationStartTime) / animationDuration, 1);
    const eased = easeInOutCubic(progress);
    const targetFrame = frames[currentFrame];

    camera.position.lerpVectors(animationStartPosition, targetFrame.position, eased);
    THREE.Quaternion.slerp(animationStartQuaternion, targetFrame.quaternion, camera.quaternion, eased);
    camera.fov = THREE.MathUtils.lerp(animationStartFov, targetFrame.fov, eased);
    camera.updateProjectionMatrix();

    if (progress >= 1) {
        camera.position.copy(targetFrame.position);
        camera.quaternion.copy(targetFrame.quaternion);
        camera.fov = targetFrame.fov;
        camera.updateProjectionMatrix();
        isAnimating = false;
    }
}

// ==================================================
// MENU & INFORMATION
// ==================================================

const menuButtons = document.querySelectorAll(".menu-button");
menuButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const index = Number(button.dataset.frame);
        moveToFrame(index);
    });
});

const information = [
    { number: "01", title: "ABOUT", description: "Welcome to my portfolio." },
    { number: "02", title: "PROJECTS", description: "A collection of my work and projects." },
    { number: "03", title: "SKILLS", description: "Technologies, tools and skills I work with." },
    { number: "04", title: "CONTACT", description: "Let's build something together." }
];

function updateInformation(index) {
    const data = information[index];
    if (!data) return;

    const numberElement = document.getElementById("info-number");
    const titleElement = document.getElementById("info-title");
    const descriptionElement = document.getElementById("info-description");

    if (numberElement) numberElement.textContent = data.number;
    if (titleElement) titleElement.textContent = data.title;
    if (descriptionElement) descriptionElement.textContent = data.description;
}

// ==================================================
// RESIZE HANDLER
// ==================================================

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update Post-Processing Composer Size
    composer.setSize(window.innerWidth, window.innerHeight);
});
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// ==================================================
// RENDER LOOP
// ==================================================

function animate() {
    requestAnimationFrame(animate);
    animateCamera();

    // Render through Composer instead of standard Renderer
    composer.render();
}

// ==================================================
// START
// ==================================================

animate();
updateInformation(0);