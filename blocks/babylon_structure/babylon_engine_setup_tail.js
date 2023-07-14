
  create_scene_camera_fp(scene, canvas);

};

export const scaleUi = (canvas) => {
  setTimeout(() => {
    mainTexture.scaleTo(canvas.width, canvas.height);

  }, 0);
};