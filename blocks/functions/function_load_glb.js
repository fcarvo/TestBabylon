
//|| LOAD GLB |||| LOAD GLB |||| LOAD GLB |||| LOAD GLB |||| LOAD GLB |||| LOAD GLB |||| LOAD GLB |||| LOAD GLB |||| LOAD GLB ||
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