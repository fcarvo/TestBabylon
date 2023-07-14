
//||CREATE SCENE CAMERA FP ||||CREATE SCENE CAMERA FP ||||CREATE SCENE CAMERA FP ||||CREATE SCENE CAMERA FP ||||CREATE SCENE CAMERA FP ||
function create_scene_camera_fp(scene, canvas) {
  var camera = new BABYLON.FreeCamera(
    "C1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.keysUp = [87];
  camera.keysDown = [83];
  camera.keysLeft = [65];
  camera.keysRight = [68];
  camera.inertia = 0.2;
  camera.fov = 0.8;
  camera.minZ = 0;
  camera.angularSensibility = 400;
  camera.speed = 1;
  camera.checkCollisions = true;
  camera.ellipsoid = new BABYLON.Vector3(0.25, 0.5, 0.25);
  camera._needMoveForGravity = false;

  camera.parent = scene.player;

  scene.activeCamera = camera;
  scene.activeCamera.name = "C1";
}