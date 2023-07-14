
//|| CREATE ENVIRONMENT |||| CREATE ENVIRONMENT |||| CREATE ENVIRONMENT |||| CREATE ENVIRONMENT |||| CREATE ENVIRONMENT |||| CREATE ENVIRONMENT ||
function create_environment(scene) {
  scene.env_blur = 0.2;

  let environment = new BABYLON.HDRCubeTexture(
    "./resources/textures/pbr_shots_environment.hdr",
    scene,
    128,
    false,
    true,
    false,
    true
  );
  scene.createDefaultSkybox(environment, true, 1000, scene.env_blur);
  scene.environmentTexture = environment;
}