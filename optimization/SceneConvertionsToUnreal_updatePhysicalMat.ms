
fn create_set_physical_material nd = (
	local name_texture = substituteString nd.name "_LowPoly" ""
	local name_texture_filePath = name_texture + "_COMPLETE.jpg"

	local curTexPath = @"C:\Users\vinicius.horaguti\OneDrive - Accenture\Documents\POC WEBGL\cenas\Nova pasta\5ec6bc3880e1ac000160d532_MAXSCRIPT_SCENE_JOB_1688420270\texturas_baked\"

	local CurBitmap = openBitMap (curTexPath + name_texture_filePath)

	local CurBitmapTexture = Bitmaptexture()
	CurBitmapTexture.name = (name_texture + "_Bitmap")
	CurBitmapTexture.Coordinates.mapChannel = 2
	CurBitmapTexture.bitmap = CurBitmap

	local newPhysicalMat = PhysicalMaterial()
	newPhysicalMat.name = (name_texture + "_Material")
	newPhysicalMat.base_color_map = CurBitmapTexture

	showTextureMap newPhysicalMat on
	nd.mat = newPhysicalMat

)

fn update_bake_materials = (
	for nd in $DecoraOptimizedProdutcs do (
		print nd
		create_set_physical_material nd
	)
)

update_bake_materials()