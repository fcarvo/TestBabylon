var canvas = document.getElementById("renderCanvas");
var engine;
var scene;

BABYLON.ArcRotateCamera.prototype.spinTo = function (whichprop, targetval, speed, onEnd) {
	var ease = new BABYLON.CubicEase();
	ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

	if(onEnd)
		BABYLON.Animation.CreateAndStartAnimation('at4', this, whichprop, speed, 120, this[whichprop], targetval, 0, ease, onEnd);
	else
		BABYLON.Animation.CreateAndStartAnimation('at4', this, whichprop, speed, 120, this[whichprop], targetval, 0, ease);
}

BABYLON.Camera.prototype.aniLockedTarget = function (targetPos, cameraPos) {
	if (!this.lockedTarget) {
        console.log(this.target);
        this.lockedTarget = this.target;
    }
    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
	BABYLON.Animation.CreateAndStartAnimation('at5', this, 'lockedTarget', 500, 120, this.lockedTarget, targetPos, 0, ease, function(){

		scene.prevTarget = targetPos;
		//scene.activeCamera.position = cameraPos;
		BABYLON.Animation.CreateAndStartAnimation('cam', scene.activeCamera, 'position', 120, 120, scene.activeCamera.position, cameraPos, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, ease, function() {
			setTimeout(()=>scene.activeCamera.lockedTarget = null, 500);
		});
	});
}

BABYLON.Camera.prototype.makeLine = function (root, start, finish) {
    var end = finish.clone();
	BABYLON.Animation.CreateAndStartAnimation('cam', root, 'position', 30, 120, start, end, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
}

//var apiToken = '5f04776ec4ac713ee56af8bc5f04776ec4ac713ee56af8bd';

//ARRAY DE TROCA

var samsungPhones = [{
    mainImage: "./resources/glb/mockup/Wood2.jpg",
    sku: "Smartphones_VDS_01",
    glb_uri: "./resources/glb/mockup/",
    fileName: "Floor1.glb",
    position: [0, -0.02, 0],
    rotation: [0, 0, 0, 0],
    scale: [-1, 1, 1],
    objectName: 'Smartphones_VDS_kit_5',
    isMain: true,
    selectable: true,
	friendlyName: 'Galaxy S21 Ultra',
	description: 'O Samsung Galaxy S21 Ultra é um dos melhores smartphones disponíveis no mercado, com uma tela impressionante, câmeras poderosas e recursos avançados em todos os aspectos. A câmera traseira quádrupla oferece zoom óptico de até 10x e um zoom digital de até 100x, o que significa que você pode capturar imagens de objetos distantes com detalhes nítidos. A bateria de alta capacidade e os recursos de carregamento rápido e sem fio são uma adição bem-vinda.',
	url: 'https://cora.accenture.com',
  },
  {
    mainImage: "./resources/glb/mockup/Wood3.jpg",
    sku: "Smartphones_VDS_02",
    glb_uri: "./resources/glb/mockup/",
    fileName: "Floor2.glb",
    objectName: 'Smartphones_VDS_kit_2',
    position: [0, -0.02, 0],
    rotation: [0, 0, 0, 0],
    scale: [-1, 1, 1],
    isMain: true,
    selectable: true,
	friendlyName: 'Galaxy M13 128GB',
	description: 'Smartphone Samsung Galaxy M13, 128GB, 4GB, Processador Octa-Core, Bateria que dura o dia todo, Câmera Tripla Traseira de 50MP +5MP + 2MP, Selfie de 8MP, Tela Infinita de 6.6" FHD+ Dual Chip, 4 gerações de atualizações Android, 5 anos de atualizações de segurança.',
	url: 'https://cora.accenture.com',
  },
  {
      mainImage: "./resources/glb/mockup/Wood1.jpg",
      sku: "Smartphones_VDS_02",
      glb_uri: "./resources/glb/mockup/",
      fileName: "Floor3.glb",
      objectName: 'Smartphones_VDS_kit_2',
      position: [0, -0.02, 0],
      rotation: [0, 0, 0, 0],
      scale: [-1, 1, 1],
      isMain: true,
      selectable: true,
  	friendlyName: 'Galaxy M13 128GB',
  	description: 'Smartphone Samsung Galaxy M13, 128GB, 4GB, Processador Octa-Core, Bateria que dura o dia todo, Câmera Tripla Traseira de 50MP +5MP + 2MP, Selfie de 8MP, Tela Infinita de 6.6" FHD+ Dual Chip, 4 gerações de atualizações Android, 5 anos de atualizações de segurança.',
  	url: 'https://cora.accenture.com',
    },
];

var samsungPhonesOrig = JSON.parse(JSON.stringify(samsungPhones));

for(var i in samsungPhones)
	samsungPhones[i].changebleSkus = samsungPhones;

var mainsSku = [
    samsungPhones[2],
  ((samsungPhoneOrig, samsungPhones)=>{
	  var samsungPhone = JSON.parse(JSON.stringify(samsungPhoneOrig));
	  samsungPhone.parentName=samsungPhone.objectName;
	  delete(samsungPhone.objectName);
	  samsungPhone.position = [0, -0.02, 0];
	  samsungPhone.changebleSkus = samsungPhones;
	  return samsungPhone
  })(samsungPhonesOrig[2], samsungPhones),
];
//|||||||||||||||||||||||||||||||||||||||||||||||

var validNavigator = (window && window.navigator) || navigator;
var userAgent = validNavigator.userAgent;
window.isMobile = (/iPhone|iPad|iPod|Android/i.test(userAgent));
window.isIOS = !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent);

import { setupScene, scaleUi } from "./babylonEngSetup.js";

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

  setupScene(scene, canvas, mainsSku);
  //scene.debugLayer.show(); canvas.style.width = `70vw`;
  startRenderLoop(engine, scene, canvas);

  var orientationCamera = new BABYLON.DeviceOrientationCamera("orientationCamera", new BABYLON.Vector3(0, 1, 0), scene);

  orientationCamera.setEnabled(false);

  var arcCamera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
  arcCamera.attachControl(canvas, true);
  scene.arcCamera = arcCamera;
  console.log(scene.arcCamera);

  scene.onReadyObservable.add(function () 
	{
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

  var arcCamera360 = new BABYLON.ArcRotateCamera("Camera", 1.2, 1.2, 0.3, scene.prevTarget, scene);

  document.getElementById('view360').addEventListener('click', toggleAutoBehaviour);

  window.scene = scene;
};

aspectRatioCanvas();
initScene();
