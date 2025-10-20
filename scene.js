// Three.js Scene Setup
let scene, camera, renderer, controls;
let penguins = [];
let flowers = [];
let ground;

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // Setup camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);

    // Setup renderer
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Add a warm sunset light
    const sunsetLight = new THREE.DirectionalLight(0xffa500, 0.3);
    sunsetLight.position.set(-30, 20, -30);
    scene.add(sunsetLight);

    // Create ground
    createGround();

    // Create flowers
    createFlowers(80);

    // Create penguins
    createPenguins(8);

    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 80;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

// Create ground with grass
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);

    // Create a grass-like material
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a7c3a,
        roughness: 0.8,
        metalness: 0.2
    });

    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    // Add some randomness to the ground vertices for a natural look
    const positions = ground.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, Math.random() * 0.5);
    }
    positions.needsUpdate = true;
    ground.geometry.computeVertexNormals();

    scene.add(ground);
}

// Create a penguin using basic geometries
function createPenguin(x, z) {
    const penguin = new THREE.Group();

    // Body (main part)
    const bodyGeometry = new THREE.SphereGeometry(1, 16, 16);
    bodyGeometry.scale(1, 1.3, 0.9);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    penguin.add(body);

    // White belly
    const bellyGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    bellyGeometry.scale(0.8, 1.1, 0.6);
    const bellyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.position.set(0, 0, 0.3);
    belly.castShadow = true;
    penguin.add(belly);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.5, 0);
    head.castShadow = true;
    penguin.add(head);

    // White face
    const faceGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, 1.5, 0.35);
    face.scale.set(0.9, 1, 0.6);
    penguin.add(face);

    // Beak
    const beakGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(0, 1.5, 0.7);
    beak.rotation.x = Math.PI / 2;
    penguin.add(beak);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.6, 0.5);
    penguin.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.6, 0.5);
    penguin.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.2, 1.6, 0.58);
    penguin.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.2, 1.6, 0.58);
    penguin.add(rightPupil);

    // Flippers
    const flipperGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    flipperGeometry.scale(0.3, 1, 0.5);
    const flipperMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftFlipper = new THREE.Mesh(flipperGeometry, flipperMaterial);
    leftFlipper.position.set(-0.9, 0.3, 0);
    leftFlipper.rotation.z = -0.3;
    leftFlipper.castShadow = true;
    penguin.add(leftFlipper);

    const rightFlipper = new THREE.Mesh(flipperGeometry, flipperMaterial);
    rightFlipper.position.set(0.9, 0.3, 0);
    rightFlipper.rotation.z = 0.3;
    rightFlipper.castShadow = true;
    penguin.add(rightFlipper);

    // Feet
    const footGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    footGeometry.scale(1.2, 0.4, 1.5);
    const footMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.4, -1.2, 0.2);
    leftFoot.castShadow = true;
    penguin.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.4, -1.2, 0.2);
    rightFoot.castShadow = true;
    penguin.add(rightFoot);

    // Position the penguin
    penguin.position.set(x, 1.3, z);

    // Add animation data
    penguin.userData = {
        jumpPhase: Math.random() * Math.PI * 2,
        jumpSpeed: 0.8 + Math.random() * 0.4,
        baseY: 1.3,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        targetRotationY: Math.random() * Math.PI * 2
    };

    return penguin;
}

// Create multiple penguins
function createPenguins(count) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 8 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const penguin = createPenguin(x, z);
        scene.add(penguin);
        penguins.push(penguin);
    }
}

// Create a flower
function createFlower(x, z) {
    const flower = new THREE.Group();

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.castShadow = true;
    flower.add(stem);

    // Flower center
    const centerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.75;
    center.castShadow = true;
    flower.add(center);

    // Petals
    const petalColors = [0xff69b4, 0xff1493, 0xff6347, 0xff4500, 0xffa500, 0xffd700, 0x9370db, 0x8a2be2];
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];

    const petalGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    petalGeometry.scale(1, 0.5, 1);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: color });

    const petalCount = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < petalCount; i++) {
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        const angle = (i / petalCount) * Math.PI * 2;
        petal.position.set(
            Math.cos(angle) * 0.35,
            0.75,
            Math.sin(angle) * 0.35
        );
        petal.castShadow = true;
        flower.add(petal);
    }

    // Add some leaves
    const leafGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    leafGeometry.scale(1.5, 0.3, 0.8);
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    for (let i = 0; i < 2; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        const angle = (i / 2) * Math.PI;
        leaf.position.set(
            Math.cos(angle) * 0.3,
            0.3,
            Math.sin(angle) * 0.3
        );
        leaf.rotation.z = Math.PI / 4;
        flower.add(leaf);
    }

    // Position the flower
    flower.position.set(x, 0.75, z);
    flower.scale.setScalar(0.8 + Math.random() * 0.6);

    // Add animation data
    flower.userData = {
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.5 + Math.random() * 0.5,
        swayAmount: 0.05 + Math.random() * 0.05
    };

    return flower;
}

// Create multiple flowers
function createFlowers(count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 35;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const flower = createFlower(x, z);
        scene.add(flower);
        flowers.push(flower);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate penguins - make them jump!
    penguins.forEach((penguin, index) => {
        const data = penguin.userData;

        // Jumping motion
        const jumpHeight = Math.abs(Math.sin(time * data.jumpSpeed + data.jumpPhase)) * 3;
        penguin.position.y = data.baseY + jumpHeight;

        // Slight rotation while jumping
        penguin.rotation.x = Math.sin(time * data.jumpSpeed + data.jumpPhase) * 0.1;

        // Slowly rotate around
        penguin.rotation.y += data.rotationSpeed;

        // Flippers animation (make them flap while jumping)
        const flapAmount = Math.sin(time * data.jumpSpeed * 2 + data.jumpPhase) * 0.3;
        if (penguin.children.length > 10) {
            penguin.children[10].rotation.z = -0.3 + flapAmount; // Left flipper
            penguin.children[11].rotation.z = 0.3 - flapAmount;  // Right flipper
        }
    });

    // Animate flowers - gentle swaying
    flowers.forEach(flower => {
        const data = flower.userData;
        flower.rotation.z = Math.sin(time * data.swaySpeed + data.swayPhase) * data.swayAmount;
    });

    // Update controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
