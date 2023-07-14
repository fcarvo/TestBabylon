import os
import subprocess

scene_id = "212602"
base_dir = "C:\Decora\TestBabylon"
log_file = os.path.join(base_dir, "log_file.txt")
call_script = "C:\Decora\TestBabylon\call_script.ms"

def update_log (log_info):
    #if os.path.exists(log_file_path):
    with open(log_file, 'a') as f:
        f.write(log_info + "\n")


# EX: 3dsmaxbatch call_script_path.ms -v 5 -listenerLog "PASTA_DO_PROCESSO\mxslistener.log"
CALL_3DSMAX_BATCH = '3dsmax.exe  -U MAXScript  ' + '{} -v 5 -listenerLog ' + '"{}"'
command_list = []

def run(cmd, shell=False):
    process = subprocess.Popen(
        cmd, bufsize=1, stdin=open(os.devnull), stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, shell=shell)

    stdout, stderr = process.communicate()

def init_build():
    update_log("[PROCESS INIT]")

    optimization_script = os.path.join(base_dir, "optimization\SceneConvertionsToUnreal.ms")

    #command_list.append("global log_path = @\"C:\Decora\TestBabylon\log_file_mxs.txt\"")
    #command_list.append("global scene_path = \"C:/Decora/TestBabylon/test_scene/212602_working.max\"")

    with open(call_script, 'a') as f:
        f.write("global log_path = @\"C:\Decora\TestBabylon\log_file_mxs.txt\"\n")
        f.write("global scene_path = \"C:/Decora/TestBabylon/test_scene/212602_working.max\"\n")
        f.write("filein \"C:/Decora/TestBabylon/optimization/SceneConvertionsToUnreal.ms\"\n")
    command_list.append(CALL_3DSMAX_BATCH.format(call_script, log_file))

    for cmd in command_list:
        print(cmd)
        run(cmd)

def create_folder_structure(base_folder_path):
    if not os.path.exists(base_folder_path):
        os.makedirs(base_folder_path)
        os.makedirs(os.path.join(base_folder_path, "js"))
        os.makedirs(os.path.join(base_folder_path, "resources"))

def create_block(block_path, block_place):
    with open(block_path, 'r') as f:
        block_content = f.read()
        f.close()
    with open(block_place, 'w') as block_file:
        block_file.write(block_content)
        block_file.close()

def get_block_content(block_path):
    with open(block_path, 'r') as f:
        block_content = f.read()
    f.close()
    return block_content

def create_babylon_engine_setup(function_list, output_path):
    final_js = ""
    final_js += get_block_content("./blocks/babylon_structure/babylon_engine_setup_vars.js")
    for func in function_list:
        final_js += get_block_content(func)
    final_js += get_block_content("./blocks/babylon_structure/babylon_engine_setup_head.js")
    final_js += get_block_content("./blocks/babylon_structure/babylon_engine_setup_tail.js")

    with open(output_path, 'w') as f:
        f.write(final_js)

def init_java_build():
    base_folder_path = os.path.join(base_dir, scene_id)
    
    create_folder_structure(base_folder_path)

    js_path = os.path.join(base_folder_path, "js")

    function_list = [
        "blocks/functions/function_create_environment.js",
        "blocks/functions/function_load_glb.js",
        "blocks/functions/function_make_mesh_selectable.js"
    ]

    create_block(os.path.join(base_dir, "blocks\index.html"), os.path.join(base_folder_path, "index.html") )
    create_block(os.path.join(base_dir, "blocks\\babylon_structure\\init_babylon.js"), os.path.join(js_path, "init_babylon.js") )
    create_babylon_engine_setup(function_list, os.path.join(js_path, "babylon_engine_setup_head.js"))
    #create_block(os.path.join(base_dir, "blocks\\babylon_structure\\babylon_engine_setup_head.js"), os.path.join(js_path, "babylon_engine_setup_head.js") )
    block_list = [

    ]
