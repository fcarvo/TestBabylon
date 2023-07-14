var keys = { letft: false, right: false, forward: false, back: false };

var mainSkuList = [];
var rawCarrousel = [];
var actualCarrousel = [];
var currentPage = 1;
var maxPage;
var mainScene;
var mainCanvas;
var mainTexture;

var carrouselOb1;
var carrouselOb2;
var carrouselOb3;

var isMobile;
/*
function restore_original_materials(scene) {
  scene.sku.forEach((mesh) => (mesh.material = mesh.original_material));
}*/
/*
function remove_debug_assets(scene, canvas) {
  let cameras_2D = scene.cameras.filter(
    (mesh) => mesh.name === "view_2D_camera"
  );
  let planes_2D = scene.meshes.filter((mesh) => mesh.name === "view_2D_plane");
  let unlit_materials = scene.materials.filter(
    (mat) => mat.name === "isolate_texture"
  );

  // Deleta os assets de debug.
  unlit_materials.forEach((mat) => mat.dispose());
  planes_2D.forEach((plane) => plane.dispose());
  cameras_2D.forEach((cam) => cam.dispose());

  scene.meshes.forEach((mesh) => mesh.setEnabled(true));
  scene.textures.forEach((tx) => tx.updateSamplingMode(3));
  scene.activeCamera = scene.getCameraByName("C1");
  scene.activeCamera.attachControl(canvas, true);

  scene.view_mode.mode = "3D";
  scene.view_mode.map = "complete";
}*/
/*
function create_player(scene) {
  var player = BABYLON.MeshBuilder.CreateSphere(
    "player",
    { diameter: 0.1, segments: 6 },
    scene
  );
  player.checkCollisions = false;
  player.diameter = 0.1;
  player.speed = new BABYLON.Vector3(2.0, 2.0, 2.0);
  player.nextspeed = new BABYLON.Vector3.Zero();
  player.targetVec = 0;
  player.targetVecNorm = 0;
  player.initVec = 0;
  player.distVec = 0;

  player.isVisible = false;

  scene.player = player;
}*/

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
/*
function create_scene_camera_viewer(scene) {
  scene.cameras.forEach((cam) => cam.dispose());

  // Deleta a camera antiga e cria uma nova. Assim o proprio babylon faz o zoom extends.
  scene.createDefaultCamera(true, true, true);
  scene.activeCamera.name = "C1";

  // Ajusta o fov e compensa afastando a camera.
  scene.activeCamera.fov = 0.5;
  scene.activeCamera.radius *= 1.3;
  scene.activeCamera.inertia = 0.7;
  scene.activeCamera.panningSensibility = 4000;
  scene.activeCamera.zoomOnFactor = 1.5;

  // Rotaciona a camera para ver o modelo de frente e levemente de perspectiva. OBS: Alpha e Beta sao os eixos de rotacao X e Y.
  scene.activeCamera.alpha += Math.PI;
  scene.activeCamera.beta -= 0.25;
}*/
/*
function create_solid_color_material(scene) {
  let solid_color_material = new BABYLON.PBRMaterial("isolate_texture", scene);
  solid_color_material.metallic = 0;
  solid_color_material.roughness = 1;
  solid_color_material.transparencyMode = 0;
  solid_color_material.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  return solid_color_material;
}*/
/*
function update_environment(scene, img_env_thumb) {
  img_env_thumb.source = scene.env_uris[scene.env_idx].thumb;

  scene.getMeshByName("hdrSkyBox").dispose();

  let environment = new BABYLON.HDRCubeTexture(
    scene.env_uris[scene.env_idx].hdr,
    scene,
    128,
    false,
    true,
    false,
    true
  );
  scene.createDefaultSkybox(environment, true, 1000, scene.env_blur);
  scene.environmentTexture = environment;
}*/
//CRIA UMA LINHA EM VOLTA DA MESH
/*function set_outline(enable_outline, meshes) {
  meshes.forEach((mesh) => {
    mesh.outlineWidth = 0.006;
    mesh.outlineColor = BABYLON.Color3.Green();
    mesh.renderOutline = enable_outline;
  });
}*/
/*
function clickout_clean_product_selection(scene, canvas) {
  if (!over_ui) {
    canvas.addEventListener("click", function () {
      var pickResult = scene.pick(scene.pointerX, scene.pointerY);

      if (!pickResult.hit) {
        set_outline(false, scene.meshes);
        scene.selected_product = null;
        if (scene.btn_open_info != null) {
          scene.btn_open_info.isEnabled = false;
        }
      }
    });
  }
}*/
/*
function changeMainImage(product) {
  var mainImage = mainScene.info_tab.getChildByName("Image");
  mainImage.source = product.mainImage || product.source;
}*/
/*
function checkVisibility() {
  var left = mainScene.info_tab.getChildByName("btn_left");
  var right = mainScene.info_tab.getChildByName("btn_right");

  if (currentPage === 1) {
    left.isVisible = false;
  }

  if (currentPage === maxPage) {
    right.isVisible = false;
  }

  if (currentPage > 1) {
    left.isVisible = true;
  }

  if (currentPage < maxPage) {
    right.isVisible = true;
  }
}

function paginationCarrousel() {
  var btn_1 = mainScene.info_tab.getChildByName("change_product_button_1");
  btn_1.isVisible = false;
  var btn_2 = mainScene.info_tab.getChildByName("change_product_button_2");
  btn_2.isVisible = false;
  var btn_3 = mainScene.info_tab.getChildByName("change_product_button_3");
  btn_3.isVisible = false;

  var aux = currentPage * 3;
  var auxCurrentCarrousel = [];
  if (rawCarrousel[aux - 1]) {
    auxCurrentCarrousel.push(rawCarrousel[aux - 1]);
  }
  if (rawCarrousel[aux - 2]) {
    auxCurrentCarrousel.push(rawCarrousel[aux - 2]);
  }
  if (rawCarrousel[aux - 3]) {
    auxCurrentCarrousel.push(rawCarrousel[aux - 3]);
  }
  actualCarrousel = auxCurrentCarrousel.reverse();
  formatCarrousel();
  checkVisibility();
}

function formatCarrousel() {
  var btn_1 = mainScene.info_tab.getChildByName("change_product_button_1");
  btn_1.isVisible = false;
  var btn_2 = mainScene.info_tab.getChildByName("change_product_button_2");
  btn_2.isVisible = false;
  var btn_3 = mainScene.info_tab.getChildByName("change_product_button_3");
  btn_3.isVisible = false;

  carrouselOb1 = null;
  carrouselOb2 = null;
  carrouselOb3 = null;

  for (var i = 0; i < actualCarrousel.length; i++) {
    if (i + 1 === 1) {
      var obj1 = JSON.parse(JSON.stringify(actualCarrousel[i]));
      var image = btn_1.getChildByName("change_product_image_1");
      image.source = obj1.source;
      carrouselOb1 = obj1;
      btn_1.isVisible = true;
    } else if (i + 1 === 2) {
      var obj2 = JSON.parse(JSON.stringify(actualCarrousel[i]));
      var image = btn_2.getChildByName("change_product_image_2");
      image.source = obj2.source;
      btn_2.isVisible = true;
      carrouselOb2 = obj2;
    } else if (i + 1 === 3) {
      var obj3 = JSON.parse(JSON.stringify(actualCarrousel[i]));
      var image = btn_3.getChildByName("change_product_image_3");
      image.source = obj3.source;
      btn_3.isVisible = true;
      carrouselOb3 = obj3;
    }
  }
}

function formatRawAndFirstCarrousel(main) {
  rawCarrousel = [];

  rawCarrousel.push({
    source: main.mainImage,
    sku: main.sku,
    glb_uri: main.glb_uri,
    fileName: main.fileName,
    position: main.position,
    rotation: main.rotation,
    scale: main.scale,
    isMain: main.isMain
  });

  for (var i = 0; i < main.changebleSkus.length; i++) {
    rawCarrousel.push({
      source: main.changebleSkus[i].mainImage,
      sku: main.changebleSkus[i].sku,
      glb_uri: main.changebleSkus[i].glb_uri,
      fileName: main.changebleSkus[i].fileName,
      position: main.position,
      rotation: main.rotation,
      scale: main.scale
    });
  }

  maxPage = Math.ceil((rawCarrousel.length + 1) / 3);

  var aux = currentPage * 3;
  var auxCurrentCarrousel = [];
  if (rawCarrousel[aux - 1]) {
    auxCurrentCarrousel.push(rawCarrousel[aux - 1]);
  }
  if (rawCarrousel[aux - 2]) {
    auxCurrentCarrousel.push(rawCarrousel[aux - 2]);
  }
  if (rawCarrousel[aux - 3]) {
    auxCurrentCarrousel.push(rawCarrousel[aux - 3]);
  }
  actualCarrousel = auxCurrentCarrousel.reverse();

  var left = mainScene.info_tab.getChildByName("btn_left");
  var right = mainScene.info_tab.getChildByName("btn_right");
  left.onPointerUpObservable.add(() => {
    currentPage = currentPage - 1;
    if (currentPage === 0) {
      currentPage = 1;
    }
    paginationCarrousel();
  });

  right.onPointerUpObservable.add(() => {
    currentPage = currentPage + 1;
    if (currentPage > maxPage) {
      currentPage = maxPage;
    }
    paginationCarrousel();
  });

  var btn_1 = mainScene.info_tab.getChildByName("change_product_button_1");
  btn_1.isVisible = false;
  var btn_2 = mainScene.info_tab.getChildByName("change_product_button_2");
  btn_2.isVisible = false;
  var btn_3 = mainScene.info_tab.getChildByName("change_product_button_3");
  btn_3.isVisible = false;

  btn_1.onPointerUpObservable.add(async () => {
    if (carrouselOb1) {
      await load_glb(
        mainScene,
        mainCanvas,
        carrouselOb1.glb_uri,
        carrouselOb1.fileName,
        carrouselOb1.position,
        carrouselOb1.rotation,
        carrouselOb1.scale,
        mainScene.products,
        true,
        carrouselOb1.sku,
        carrouselOb1.isMain,
        true
      );
      changeMainImage(carrouselOb1);
    }
  });

  btn_2.onPointerUpObservable.add(async () => {
    if (carrouselOb2) {
      await load_glb(
        mainScene,
        mainCanvas,
        carrouselOb2.glb_uri,
        carrouselOb2.fileName,
        carrouselOb2.position,
        carrouselOb2.rotation,
        carrouselOb2.scale,
        mainScene.products,
        true,
        carrouselOb2.sku,
        carrouselOb2.isMain,
        true
      );
      changeMainImage(carrouselOb2);
    }
  });

  btn_3.onPointerUpObservable.add(async () => {
    if (carrouselOb3) {
      await load_glb(
        mainScene,
        mainCanvas,
        carrouselOb3.glb_uri,
        carrouselOb3.fileName,
        carrouselOb3.position,
        carrouselOb3.rotation,
        carrouselOb3.scale,
        mainScene.products,
        true,
        carrouselOb3.sku,
        carrouselOb3.isMain,
        true
      );
      changeMainImage(carrouselOb3);
    }
  });

  formatCarrousel();
  checkVisibility();
}*/

function make_mesh_selectable(
  scene,
  mesh,
  root_node,
  mesh_input_list,
  selectable
) {
  mesh.actionManager = new BABYLON.ActionManager(scene);
  mesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      function (selected_object) {
        set_outline(false, scene.meshes);

        var obj = selected_object.source;

        if (selectable) {
          set_outline(true, mesh_input_list);
          scene.selected_product = root_node;
          if (scene.btn_open_info != null) {
            scene.btn_open_info.isEnabled = true;
            scene.btn_open_info.isVisible = true;
            var main = mainSkuList.find(
              (product) => {
                if ((product.sku === root_node.sku) && root_node.isMain) {
                  return product;
                }
              }
            );
            if (main) {
              changeMainImage(main);
              formatRawAndFirstCarrousel(main);
            }
          }
        } else {
          scene.selected_product = null;
          scene.info_tab.isVisible = false;
          scene.btn_open_info.isVisible = false;
          scene.btn_open_info.left = "45%";
          scene.info_tab_open = false;
          if (scene.btn_open_info != null) {
            scene.btn_open_info.isEnabled = true;
          }
        }
      }
    )
  );
}
//ENTRA COM O ARRAY DE MESH
function load_glb(
  scene,
  canvas,
  glb_uri,
  filename,
  position,
  rotation,
  scale,
  array_to_input,
  selectable = false,
  sku,
  isMain,
  remove = false
) {
  BABYLON.SceneLoader.ImportMesh(
    "",
    glb_uri,
    filename,
    scene,
    function (result) {
      var root_node = result[0];
      root_node.position = new BABYLON.Vector3(
        position[0],
        position[1],
        position[2]
      );

      if (scale.length) {
        root_node.scaling = new BABYLON.Vector3(scale[0], scale[1], scale[2]);
      }

      var q0 = rotation[0];
      var q1 = rotation[1];
      var q2 = rotation[2];
      var q3 = rotation[3];

      // var Rx = Math.atan2(2 * (q0 * q1 + q2 * q3), 1 - 2 * (q1 * q1 + q2 * q2));
      // var Ry = (Math.asin(2 * (q0 * q2 - q3 * q1))) * -1;
      // var Rz = Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3));

      // root_node.rotation = new BABYLON.Vector3(Rx, Ry, Rz);

      root_node.rotationQuaternion = new BABYLON.Quaternion(q0, q1, q2, q3);

      root_node["sku"] = sku;
      root_node["fileName"] = filename;
      root_node["isMain"] = isMain;
      // trocar para glb_uri dinamica
      root_node["glb_uri"] =
        "https://static-files-prod.s3.sa-east-1.amazonaws.com/webgl_scene/webgl_teste/resources/glb/mockup/";
      result.forEach((mesh) => {
        mesh.checkCollisions = false;
        mesh.isPickable = true;
        make_mesh_selectable(scene, mesh, root_node, result, selectable);
      });

      array_to_input.push(root_node);
      if (remove && mainScene.selected_product) {
        mainScene.selected_product.dispose();
        var index = array_to_input.indexOf(mainScene.selected_product);
        if (index > -1) {
          array_to_input.splice(index, 1);
          mainScene.selected_product = null;
          mainScene.selected_product = root_node;
          set_outline(true, result);
        }
      }
    }
  );
}

//ENVIRONMENT
function create_env(scene) {
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
/*
async function enable_ui(){

    return advancedTexture;
});
*/

/*function open_info_tab(scene) {
  if (scene.info_tab_open) {
    if (isMobile) {
      if (window.innerWidth <= window.innerHeight) {
        scene.btn_open_info.left = "43%";
      } else {
        scene.btn_open_info.left = "41%";
      }
    } else {
      scene.btn_open_info.left = "44%";
    }
    scene.info_tab.isVisible = false;
    scene.info_tab_open = false;
  } else {
    if (isMobile) {
      if (window.innerWidth <= window.innerHeight) {
        scene.btn_open_info.left = "17%";
      } else {
        scene.btn_open_info.left = "17%";
      }
    } else {
      scene.btn_open_info.left = "20%";
    }
    scene.info_tab.isVisible = true;
    scene.info_tab_open = true;
  }
}*/
//MOVIMENT
/*function player_move_vecs(scene){
    var cam = scene.activeCamera;
    var player = scene.player;

    var click_start = null;
    var click_end = null;

    var drag = false;
    var drag_delay = 200;

    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    scene.onPointerMove = (e, pickResult) => {
        var pointer_main = null
        var pointer_mesh = null
        var mesh_child = (scene.pointer[0].getChildren()[0].getChildren());

        if (pickResult.hit && (pickResult.pickedMesh.parent.sku == "scene_navigate") && !drag) {
            mesh_child.forEach(function(mesh){
                //mesh.visibility = 1.0;
            })

            scene.pointer[0].position = pickResult.pickedPoint;
        };

        if ((pickResult.hit && (pickResult.pickedMesh.parent.sku != "scene_navigate")) || !pickResult.hit || drag) {
            mesh_child.forEach(function(mesh){
                //mesh.visibility = 0.0;
            })
        };
    };

    scene.onPointerDown = (e) => {
        drag = true;
        click_start = new Date();
    };

    scene.onPointerUp = (e, pickResult) => {
        click_end = new Date();

        var diff = click_end - click_start;
        drag = diff > drag_delay;

		if (!scene.activeCamera.useAutoRotationBehavior && e.button === 0 && !drag) {
			if (pickResult.hit && (pickResult.pickedMesh.parent.sku == "scene_navigate")) {
				var targetVec = pickResult.pickedPoint.clone();
				targetVec.y = 1.8;

				document.getElementById('prod_menu_container').classList.remove('show');
				var hl = scene.getHighlightLayerByName('customHighLight');
				hl.removeAllMeshes();

				BABYLON.Animation.CreateAndStartAnimation('cam', scene.activeCamera, 'position', 120, 120, scene.activeCamera.position, targetVec, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, ease, function() {
					setTimeout(()=>scene.activeCamera.lockedTarget = null, 500);
				});
			}
		}

        drag = false;
    };
}*/
/*

// MOVE ON CLICK
function move_camera_click(player) {
  if (player.distVec > 0) {
    player.distVec -= 0.1;
    player.translate(player.targetVecNorm, 0.1, BABYLON.Space.WORLD);
  }

  player.speed = BABYLON.Vector3.Lerp(player.speed, player.nextspeed, 0.3);
  // Turn to direction

  player.moveWithCollisions(player.speed);
}
*/


export const setupScene = async function (scene, canvas) {
  /*mainSkuList = mainsSku;*/
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

  //clickout_clean_product_selection(scene, canvas);

  create_env(scene);

  var hemis_light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
  hemis_light.intensity = 2;

  // Seta a cor do background da cena.
  scene.clearColor = new BABYLON.Color3(0.0, 0.18, 0.18);

  let glb_uri = "./resources/glb/";
  let scene_uri = "./resources/scene/";

  // importa glb da estrutura da cena
  /*let teste = await load_glb(
    scene,
    canvas,
    scene_uri,
    "Props.glb",
    [0, 0, 0],
    [0, 0, 0, 0],
    [-1, 1, 1],
    scene.scene_structure
  );*/

  // Array para importar os produtos da cena
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

  //create_player(scene);
  create_scene_camera_fp(scene, canvas);
  // await enable_ui();
/*

//MAIN UI|||||||||||||||||||||||||||||||||||||||||||
  let advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  mainTexture = advancedTexture;

  let panel = new BABYLON.GUI.StackPanel();
  panel.width = "200px";
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  advancedTexture.addControl(panel);

  //LAYOUT DO MENU
  await advancedTexture.parseFromURLAsync("./resources/ui_poc_vivo.json");

  scene.main_ui = advancedTexture.getChildren()[0];

  scene.btn_open_info = scene.main_ui.getChildByName("info_button");
  scene.info_tab = scene.main_ui.getChildByName("info_bg");
  scene.info_tab_open = false;
  scene.info_tab.isVisible = false;
  scene.btn_open_info.isVisible = false;

   //ALINHAMENTO DO BOTAO
  if (isMobile) {
    if (window.innerWidth <= window.innerHeight) {
      scene.btn_open_info.left = "43%";
      scene.btn_open_info.top = "41%";
      scene.info_tab.left = "36%";
    } else {
      scene.btn_open_info.left = "42%";
      scene.btn_open_info.top = "36%";
      scene.info_tab.left = "36%";
    }
  } else {
    scene.info_tab.left = "36%";
  }
  //DISPLAY MENU
  scene.overlayer_display = scene.main_ui.getChildByName("overlayer_display");
  scene.overlayer_display.isVisible = false;

  scene.qr_code_image = scene.main_ui.getChildByName("qr_code_image");
  scene.qr_code_image.isVisible = false;
  // Evento para abrir o qr
  var ar_qr = scene.info_tab.getChildByName("ar_qr");
  ar_qr.onPointerUpObservable.add(function (evt) {
    if (scene.selected_product) {
      var url = encodeURIComponent(
        `${scene.selected_product.glb_uri}${scene.selected_product.fileName}`
      );
      scene.qr_code_image.source = `https://chart.googleapis.com/chart?chs=512x512&cht=qr&chl=${url}`;
      scene.overlayer_display.isVisible = false;
      scene.qr_code_image.isVisible = false;
    }
  });
  // Evento para esconder o qr
  scene.overlayer_display.onPointerUpObservable.add(function (evt) {
    scene.overlayer_display.isVisible = false;
    scene.qr_code_image.isVisible = false;
  });
  // Eventos de abrir e fechar o menu.
  scene.btn_open_info.onPointerUpObservable.add(function (evt) {
    open_info_tab(scene);
  });
*/

   //player_move_vecs(scene);

//   scene.registerBeforeRender(function () {
//     move_camera_click(scene.player);
//   });
};

export const scaleUi = (canvas) => {
  setTimeout(() => {
    mainTexture.scaleTo(canvas.width, canvas.height);

    /*setTimeout(() => {
      mainTexture.scaleTo(canvas.width, canvas.height);
    }, 100);*/
  }, 0);
};
