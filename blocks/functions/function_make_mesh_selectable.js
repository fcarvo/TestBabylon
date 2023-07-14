
//|| MAKE MESH SELECTABLE |||| MAKE MESH SELECTABLE |||| MAKE MESH SELECTABLE |||| MAKE MESH SELECTABLE |||| MAKE MESH SELECTABLE ||
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