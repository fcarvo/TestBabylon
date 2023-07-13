class base:
    file_path = "teste.html"
    
    function_array = []

    def send_to_file(self, function_array):
        finalstring = ""
        with open (self.file_path, 'w') as f:
            for fun in function_array:
                for line in fun:
                    finalstring += line
            f.write(finalstring)

    def build_file(self, function_array):
        self.send_to_file(self, function_array)
# https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/301069834.glb

    def import_mesh(self, url, x, y, z):
        cmd = f'\n\tobj = await BABYLON.SceneLoader.AppendAsync(\"{url}\", undefined, scene, undefined, \".glb\");\n\t obj.position.x = {x};\n\t obj.position.x = {y};\n\t obj.position.x = {z};'
        return cmd
    
    def create_default_skybox(self, url):
        cmd = f'\n\tvar hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(\"{url}\", scene);\nvar currentSkybox = scene.createDefaultSkybox(hdrTexture, true);\n'
        return cmd
    
