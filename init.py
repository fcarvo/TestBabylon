import os
from create_base import base
from utils import json_utilities
from python import build_babylon_scene

base_url = "https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/"
base_path = os.getcwd()
json_file = "C:/teste/teste_babylon/64ac3d90a08cef00086a7dce_MAXSCRIPT_SCENE_JOB/json_input.json"



# ler json
#convertes posicao em
# abrir a cena

# with open('blocks/head.html') as f:
#     head = f.read()
#     f.close
# with open('blocks/babylonScripts') as f:
#     babylonScripts = f.read()
#     f.close
# with open('blocks/preBody') as f:
#     preBody = f.read()
#     f.close
# with open('blocks/body.html') as f:
#     body = f.read()
#     f.close
# with open('blocks/tail.html') as f:
#     tail = f.read()
#     f.close
#
# base.function_array.append(head)
# base.function_array.append(babylonScripts)
# base.function_array.append(preBody)
# base.function_array.append(body)
#
# #new_mesh = base.import_mesh(base, "https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/301069834.glb", selected_products[0]['pivot']['x'], selected_products[0]['pivot']['y'], selected_products[0]['pivot']['z'])
# #base.function_array.append(new_mesh)
# new_hdr = base.create_default_skybox(base, "https://static-files-prod.s3.sa-east-1.amazonaws.com/teste-babylon/HDR_029_Cloudy_Ref.hdr")
# base.function_array.append(new_hdr)
#
# base.function_array.append(tail)
#
# base.build_file(base, base.function_array)
#


# build_babylon_scene.init_build()
build_babylon_scene.init_java_build()