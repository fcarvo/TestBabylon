var canvas = document.getElementById("renderCanvas");
var engine;
var scene;
var validNavigator = (window && window.navigator) || navigator;
var userAgent = validNavigator.userAgent;

window.isMobile = (/iPhone|iPad|iPod|Android/i.test(userAgent));
window.isIOS = !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent);

import { setupScene, scaleUi } from "./babylon_engine_setup.js";

var createResizeObeserver = function () {
  window.addEventListener("resize", () => {
    aspectRatioCanvas();
    engine.resize();
    scaleUi(canvas);
  });
};

var aspectRatioCanvas = function () {
  canvas.style.height = `100vh`;
  canvas.style.width = `100vw`;
};

var startRenderLoop = function (engine, scene, canvas) {
  engine.runRenderLoop(function () {
    if (scene && scene.activeCamera) {
      scene.render();
    }
  });
};

var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

var initScene = async function () {
  engine = createDefaultEngine();
  scene = new BABYLON.Scene(engine);
  new BABYLON.HighlightLayer("customHighLight", scene);

  setupScene(scene, canvas);
  startRenderLoop(engine, scene, canvas);

  scene.onReadyObservable.add(function () {
        console.log(scene.meshes.length);

        if(window.isMobile)
        {
            var camera = scene.activeCamera;
            orientationCamera.setEnabled(true);
            scene.activeCamera.detachControl();
            scene.activeCamera = orientationCamera;
            scene.activeCamera.position = camera.position;
            scene.activeCamera.setTarget(camera.getTarget());

            orientationCamera.cameraRotation.x = 0;
            orientationCamera.cameraRotation.y = 0;
            scene.activeCamera.attachControl(canvas, true);

            orientationCamera.keysUp = [-1];
            orientationCamera.keysDown = [-1];
            orientationCamera.keysLeft = [-1];
            orientationCamera.keysRight = [-1];
            orientationCamera.inertia = 0.2;
            orientationCamera.fov = 0.8;
            orientationCamera.minZ = 0;
            orientationCamera.angularSensibility = 400;
            orientationCamera.speed = 1;
        }
      }
  );

  createResizeObeserver();

  var toggleAutoBehaviour = function(skipMobile) {
	if(skipMobile !== true && document.getElementById('prod_menu_container').classList.contains('showMobile'))
	  document.getElementById('prod_menu_container').classList.remove('showMobile');

	if(!scene.activeCamera.useAutoRotationBehavior)
	{
		scene.prev360Camera = scene.activeCamera;

		defaultPipeline.addCamera(arcCamera360);
		arcCamera360.useAutoRotationBehavior = true;

		// This targets the camera to scene origin
		arcCamera360.setPosition(scene.activeCamera.position.clone());
		arcCamera360.setTarget(scene.prevTarget);

		// This attaches the camera to the canvas
		arcCamera360.attachControl(canvas, true);

		scene.activeCamera.detachControl();
		scene.activeCamera = arcCamera360;

		arcCamera360.autoRotationBehavior.idleRotationSpeed = 0.3
		arcCamera360.minZ = 0;
		arcCamera360.ellipsoid = new BABYLON.Vector3(0.25, 0.5, 0.25);

		console.log(arcCamera360);

		console.log(scene.selected_product);

		scene.selected_product.isPickable = false;

		var childMeshes = scene.selected_product.getChildMeshes();

		for(var i in childMeshes)
			childMeshes[i].isPickable = false;

		for(var i in scene.products)
			if(scene.products[i] != scene.selected_product)
				scene.products[i].setEnabled(false);

		for(var i in scene.pointer)
			scene.pointer[i].setEnabled(false);
	}
	else
	{
		defaultPipeline.removeCamera(arcCamera360);

		scene.activeCamera.detachControl();
		scene.activeCamera = scene.prev360Camera;
		scene.activeCamera.attachControl(canvas, true);

		scene.selected_product.isPickable = true;

		var childMeshes = scene.selected_product.getChildMeshes();
		scene.activeCamera.lockedTarget = null

		for(var i in childMeshes)
			childMeshes[i].isPickable = true;

		for(var i in scene.products)
			scene.products[i].setEnabled(true);

		for(var i in scene.pointer)
			scene.pointer[i].setEnabled(true);
	}
  };

  window.scene = scene;
};

aspectRatioCanvas();
initScene();
