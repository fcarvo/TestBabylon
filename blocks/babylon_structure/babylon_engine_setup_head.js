
//|| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD |||| HEAD ||
export const setupScene = async function (scene, canvas) {
  //mainSkuList = mainsSku;
  mainScene = scene;
  mainCanvas = canvas;

  var validNavigator = (window && window.navigator) || navigator;
  var userAgent = validNavigator.userAgent;
  isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  scene.collisionsEnabled = true;

  // listas para as categorias de modelos
  scene.scene_structure = [];
  scene.products = [];
  scene.selected_product = null;

  var hemis_light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
  hemis_light.intensity = 2;

  let glb_uri = "./resources/glb/";
  let scene_uri = "./resources/scene/";

  /*for (var i = 0; i < mainsSku.length; i++) {
    await load_glb(
      scene,
      canvas,
      mainsSku[i].glb_uri,
      mainsSku[i].fileName,
      mainsSku[i].position,
      mainsSku[i].rotation,
      mainsSku[i].scale,
      scene.products,
      mainsSku[i].selectable,
      mainsSku[i].sku,
      mainsSku[i].isMain
    );
  }*/

