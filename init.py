from create_base import base

base_url = "https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/"

head = ""
babylonScripts = ""
preBody = ""
body = ""
tail = ""


with open('blocks/head.html') as f:
    head = f.read()
    f.close
with open('blocks/babylonScripts') as f:
    babylonScripts = f.read()
    f.close
with open('blocks/preBody') as f:
    preBody = f.read()
    f.close
with open('blocks/body.html') as f:
    body = f.read()
    f.close
with open('blocks/tail.html') as f:
    tail = f.read()
    f.close

base.function_array.append(head)
base.function_array.append(babylonScripts)
base.function_array.append(preBody)
base.function_array.append(body)

new_mesh = base.import_mesh(base, "https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/301069834.glb")
base.function_array.append(new_mesh)
new_hdr = base.create_default_skybox(base, "https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/HDR_029_Cloudy_Ref.hdr")
base.function_array.append(new_hdr)

base.function_array.append(tail)

base.build_file(base, base.function_array)

