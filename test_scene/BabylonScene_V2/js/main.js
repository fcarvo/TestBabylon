/*
var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };

var player;
var mapSize = 80;
var mouseSensitivity = 0.0002;
var keys = { letft: false, right: false, forward: false, back: false, };

// Converts from radians to degrees.
Math.degrees = function (radians) {
    return radians * 180 / Math.PI;
};

*/
/* Cedric https://forum.babylonjs.com/t/rotate-mesh-with-camera-attached-to-bone/23601/14?u=naznarok *//*

var mouseMove = function (e) {
    deltaTime = engine.getDeltaTime();

    var movementX = e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX ||
        0;

    var movementY = e.movementY ||
        e.mozMovementY ||
        e.webkitMovementY ||
        0;

    player.rotation.x += movementY * deltaTime * mouseSensitivity;
    player.rotation.y -= movementX * deltaTime * mouseSensitivity;
}

function setupPointerLock() {
    // register the callback when a pointerlock event occurs
    document.addEventListener('pointerlockchange', changeCallback, false);
    document.addEventListener('mozpointerlockchange', changeCallback, false);
    document.addEventListener('webkitpointerlockchange', changeCallback, false);

    // when element is clicked, we're going to request a
    // pointerlock
    canvas.onclick = function () {
        canvas.requestPointerLock =
            canvas.requestPointerLock ||
            canvas.mozRequestPointerLock ||
            canvas.webkitRequestPointerLock
            ;

        // Ask the browser to lock the pointer)
        canvas.requestPointerLock();
    };
}

function changeCallback(e) {
    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas ||
        document.webkitPointerLockElement === canvas
    ) {
        // we've got a pointerlock for our element, add a mouselistener
        document.addEventListener("mousemove", mouseMove, false);
        document.addEventListener("mousedown", mouseMove, false);
        document.addEventListener("mouseup", mouseMove, false);
    } else {
        // pointer lock is no longer active, remove the callback
        document.removeEventListener("mousemove", mouseMove, false);
        document.removeEventListener("mousedown", mouseMove, false);
        document.removeEventListener("mouseup", mouseMove, false);
    }
};

var delayCreateScene = function () {
    engine.enableOfflineSupport = false;
    engine.displayLoadingUI();
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    scene.useRightHandedSystem = true;
    scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 1.0;

    // Ground material
    var mat1 = new BABYLON.StandardMaterial("mat0", scene);
    mat1.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/HADnUQr.png", scene);
    mat1.diffuseTexture.uScale = mapSize;
    mat1.diffuseTexture.vScale = mapSize;
    mat1.specularColor = BABYLON.Color3.Black();
    mat1.emissiveColor = BABYLON.Color3.White();

    */
/*  Box material
        2DO: material (instance) https://forum.babylonjs.com/t/shader-material-doesnt-work-with-instances/793/14 *//*

    var mat2 = new BABYLON.StandardMaterial("mat0", scene);
    mat2.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/HADnUQr.png", scene);
    mat2.specularColor = BABYLON.Color3.Black();
    mat2.emissiveColor = BABYLON.Color3.White();

    // Skybox material
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/studio010_cube.hdr", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    // Ground
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { height: mapSize, width: mapSize, subdivisions: 4 }, scene);
    ground.material = mat1;

    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    skybox.material = skyboxMaterial;

    //create sphere to show camera (head) position
    var head = BABYLON.MeshBuilder.CreateSphere("dummyCam", { diameter: 0.05 }, scene, true);
    head.material = new BABYLON.StandardMaterial("mat", scene);
    head.material.diffuseColor = new BABYLON.Color3(2, 0, 0);

    //  Generate box instance
    var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.isVisible = false;
    box.material = mat2;

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for (var index = 0; index < mapSize / 2; index++) {
        var newInstance = box.createInstance('i' + index);
        newInstance.position = new BABYLON.Vector3(getRandomIntInclusive(-mapSize / 2, mapSize / 2), 0.5, getRandomIntInclusive(-mapSize / 2, mapSize / 2));
    }

    player = new BABYLON.TransformNode("player", scene);

    // First person camera
    var fpsCamera = new BABYLON.UniversalCamera("FPS", new BABYLON.Vector3(0, 0, 0), scene);

    // Third person camera
    var tpsCamera = new BABYLON.ArcRotateCamera("TPS_camera", 0, Math.PI / 2, 1.5, new BABYLON.Vector3(0, 0.85, 0), scene);

    scene.activeCameras.push(fpsCamera);
    setupPointerLock();

    //UI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('Ui');
    var crosschair = BABYLON.GUI.Button.CreateImageOnlyButton("b1", "https://dl.dropbox.com/s/q37l562ms3u9sd6/circle.svg")
    crosschair.image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    crosschair.width = "24px";
    crosschair.height = "24px";
    crosschair.color = "transparent"
    advancedTexture.addControl(crosschair);

    var fpsMesh = BABYLON.SceneLoader.ImportMesh("", "https://dl.dropbox.com/s/wbia4zetn1bdeze/", "arms_assault_rifle_02.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        var fpsMesh = newMeshes[0];
        var skeleton = skeletons[0];
        var cameraNode = scene.getNodeByName('camera');

        //Get animation
        const aim_fire_pose = scene.getAnimationGroupByName("aim_fire_pose");
        const idle = scene.getAnimationGroupByName("idle");
        const walk = scene.getAnimationGroupByName("walk");

        var utilLayer = new BABYLON.UtilityLayerRenderer(scene);
        var gizmo1 = new BABYLON.PositionGizmo(utilLayer);
        var gizmo2 = new BABYLON.PositionGizmo(utilLayer);
        var gizmo3 = new BABYLON.PositionGizmo(utilLayer);

        // Gizmo to camera
        gizmo1.attachedMesh = fpsCamera;
        // gizmo2.attachedMesh = fpsMesh;

        // Hide unused attachments
        scene.getMeshByName("knife").setEnabled(false);
        scene.getMeshByName("assault_rifle_02_iron_sights").setEnabled(false);
        scene.getMeshByName("bullet").setEnabled(false);
        scene.getMeshByName("scope_01").setEnabled(false);
        scene.getMeshByName("scope_02").setEnabled(false);
        scene.getNodeByName("scope_03").setEnabled(false);
        scene.getNodeByName("silencer").setEnabled(false);

        fpsCamera.minZ = 0.0001;
        tpsCamera.minZ = 0.0001;
        player.parent = cameraNode;
        head.parent = cameraNode;
        fpsMesh.rotation = player.rotation;
        fpsCamera.parent = cameraNode;

        //Play animation
        idle.start(true, 1.0, idle.from, idle.to, false);
        // walk.start(true, 1.0, walk.from, walk.to, false);
        // aim_fire_pose.start(true, 1.0, aim_fire_pose.from, aim_fire_pose.to, false);

        // Event listener for mouse keys
        canvas.addEventListener("pointerup", function () { });
        canvas.addEventListener("pointerdown", function () {

            console.log('click');
            var bullet = BABYLON.Mesh.CreateSphere('bullet', 3, 0.3, scene);
            var startPos = fpsMesh.position;

            bullet.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);
            bullet.material = new BABYLON.StandardMaterial('texture1', scene);
            bullet.material.diffuseColor = new BABYLON.Color3(2, 0, 0);

            var invView = new BABYLON.Matrix();
            fpsCamera.getViewMatrix().invertToRef(invView);
            var direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, -1), invView);
            direction.normalize();

            scene.registerBeforeRender(function () {
                bullet.position.addInPlace(direction);
            });

        });

        */
/* https://www.babylonjs-playground.com/#1RHSYU#1 *//*

        fpsMesh.update = function () {

            //2DO: remove this by updating model in blender
            fpsMesh.position.y = 1;

            if (keys.left) {
                var left = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.1, 0, 0), BABYLON.Matrix.RotationY(fpsMesh.rotation.y));
                fpsMesh.position.addInPlace(left);
            }
            if (keys.right) {
                var right = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.1, 0, 0), BABYLON.Matrix.RotationY(fpsMesh.rotation.y));
                fpsMesh.position.addInPlace(right);
            }
            if (keys.forward) {
                var forward = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0.1), BABYLON.Matrix.RotationY(fpsMesh.rotation.y));
                fpsMesh.position.addInPlace(forward);
            }
            if (keys.back) {
                var back = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, -0.1), BABYLON.Matrix.RotationY(fpsMesh.rotation.y));
                fpsMesh.position.addInPlace(back);
            }

            forward = null;
        }

        // Event listener for WASD movement keys
        window.addEventListener("keydown", handleKeyDown, false);
        window.addEventListener("keyup", handleKeyUp, false);

        function handleKeyDown(evt) {

            if (evt.keyCode == 65) {//A
                keys.left = true;
                console.log('A: ' + keys.left);
                walk.start(true, 1.0, walk.from, walk.to, false);
            }
            if (evt.keyCode == 68) {//D
                keys.right = true;
                console.log('D: ' + keys.right);
                walk.start(true, 1.0, walk.from, walk.to, false);
            }
            if (evt.keyCode == 87) {//W
                keys.forward = true;
                console.log('W: ' + keys.forward);
                walk.start(true, 1.0, walk.from, walk.to, false);
            }
            if (evt.keyCode == 83) {//S
                keys.back = true;
                console.log('S: ' + keys.back);
                walk.start(true, 1.0, walk.from, walk.to, false);
            }
        }

        function handleKeyUp(evt) {

            if (evt.keyCode == 65) {//A
                keys.left = false;
                if (!Object.values(keys).includes(true)) { walk.stop() };
            }
            if (evt.keyCode == 68) {//D
                keys.right = false;
                if (!Object.values(keys).includes(true)) { walk.stop() };
            }
            if (evt.keyCode == 87) {//W
                keys.forward = false;
                if (!Object.values(keys).includes(true)) { walk.stop() };
            }
            if (evt.keyCode == 83) {//S
                keys.back = false;
                if (!Object.values(keys).includes(true)) { walk.stop() };
            }
            if (evt.keyCode == 83) {//S
                keys.reload = false;
                if (!Object.values(keys).includes(true)) { walk.stop() };
            }

        }

        engine.runRenderLoop(function () {
            if (fpsMesh != null) {
                fpsMesh.update();
            }
        });
        engine.hideLoadingUI();
    });

    // Debug layer
    scene.debugLayer.show({
        embedMode: true,
    });

    return scene;
};

window.initFunction = async function() {
        var asyncEngineCreation = async function() {
            try {
            return createDefaultEngine();
            } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
            }
        }

        engine = await asyncEngineCreation();
    if (!engine) throw 'oie!! engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = delayCreateScene();
};

initFunction().then(() => {sceneToRender = scene
});
*/
