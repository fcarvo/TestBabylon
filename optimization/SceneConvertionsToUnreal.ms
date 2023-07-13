


--------/////////////////////////--------
--------///////UTILS///////--------
--------/////////////////////////--------

fn update_log new_info=(
    --local log_file = undefined
    --log_path = @"C:\Decora\TestBabylon\log_file_mxs.txt" ESTA SENDO CRIADA NO PYTHON
    if doesFileExist log_path then (
        log_file = openfile log_path mode: "r+"
    )
    else(
        log_file = createfile log_path
    )
    -- log_file = createfile

    new_info += "\n"
    format new_info to: log_file
    close log_file
)

struct Utils (
	fn create_bitmap_texture filename gamma: strip_path:false = (
        if (filename == undefined) or (not doesFileExist filename) do return undefined;

        local bitmap_map = if gamma == unsupplied then (
            BitmapTexture filename:filename name:(getFilenameFile filename)
        ) else (
            BitmapTexture name:(getFilenameFile filename) bitmap:(openBitmap filename gamma:gamma)
        );

        if strip_path do bitmap_map.filename = pathconfig.stripPathToLeaf bitmap_map.filename;

        return bitmap_map;
    ),

    fn group_all_nodes nodes_list group_name parent: = (
            local group_head = Dummy name:group_name
            setGroupHead group_head true

            if parent != undefined and parent != unsupplied and isGroupHead parent do group_head.parent = parent

            for nd in nodes_list do (
                nd.parent = group_head
                setGroupMember nd true
            )

            return group_head
    ),
	
	fn create_dir output_path folder_name = (
        local new_dir = pathConfig.appendPath output_path folder_name;
        makeDir new_dir all:true;

        return new_dir;
    ),
	
	fn clear_vertex_data model_node = (
        max create mode;
        channelInfo.clearChannel model_node 0;
        channelInfo.clearChannel model_node -1;
        channelInfo.clearChannel model_node -2;
        for i=100 to 2 by -1 do channelInfo.clearChannel model_node i;
        collapseStack model_node;
    ),
	
	fn transfer_uvs product source_channel target_channel = (
        convertToMesh product;
        channelInfo.copyChannel product 3 source_channel;
        channelInfo.pasteChannel product 3 target_channel;
        collapseStack product;
    ),
	
	fn get_vray_version = (
        local vray_version = vray as string
        case of (
            (findString vray_version "Next" != undefined): return "Next"
            (findString vray_version "_5_" != undefined): return "5"
            default: "5"
        )
    ),
	
	fn png_settings use_alpha:false color_depth:#true24 = (
        pngio.settype color_depth;
        pngio.setAlpha use_alpha;
        pngio.setInterlaced false;
    )
)

Utils = Utils()

--------/////////////////////////--------
--------///////BAKE GENERAL///////--------
--------/////////////////////////--------

struct BakeGeneralFunctions (
    model_node,
    model_info,
    material_infos,
    bake_size,
    bake_dir,
    textures_paths,

    fn init_bake_dialog = (
        macros.run "Render" "BakeDialog";
        local iniFile = objExp.getIniName();
        setIniSetting iniFile "Material" "UseMapPath" "1";
        setIniSetting iniFile "Material" "MapPath" "./";
    ),
	
	fn create_projection_modifier = (
		local model_node_high_poly = getNodeByName (model_node.name + "_HighPoly")
		
		modif_projection = Projection()
		addmodifier model_node modif_projection

		modif_projection = model_node.modifiers["Projection"]
		addPModObjects #(model_node) false true objList:model_node_high_poly

		model_node.INodeBakeProjProperties.enabled = true
		model_node.INodeBakeProjProperties.useCage = false
		model_node.INodeBakeProjProperties.projectionMod = modif_projection
	),

    fn create_bake_render_elements = (
        model_node.INodeBakeProperties.removeAllBakeElements();

        local map_to_bake_complete = VRayCompleteMap();
		--create_projection_modifier()
		
		--while not keyboard.altPressed do windows.processPostedMessages()
		
        --local map_to_bake_gloss = VRayMtlReflectGlossinessBake();
        --local map_to_bake_emission = VraySelfIlluminationMap();
        --local map_to_bake_normal = VRayBumpNormalsMap();

        map_to_bake_complete.outputSzX = map_to_bake_complete.outputSzY = bake_size;
        --map_to_bake_gloss.outputSzX = map_to_bake_gloss.outputSzY = bake_size;
        --map_to_bake_emission.outputSzX = map_to_bake_emission.outputSzY = bake_size;
        --map_to_bake_normal.outputSzX = map_to_bake_normal.outputSzY = bake_size;

        map_to_bake_complete.color_mapping = false;

        map_to_bake_complete.fileType = textures_paths["path_complete"];
        --map_to_bake_gloss.fileType = textures_paths["path_roughness"];
        --map_to_bake_emission.fileType = textures_paths["path_emission"];
        --map_to_bake_normal.fileType = textures_paths["path_normal"];

        model_node.INodeBakeProperties.addBakeElement map_to_bake_complete;
        --model_node.INodeBakeProperties.addBakeElement map_to_bake_gloss;
        --model_node.INodeBakeProperties.addBakeElement map_to_bake_emission;
        --model_node.INodeBakeProperties.addBakeElement map_to_bake_normal;

        model_node.INodeBakeProperties.bakeEnabled = true;
        model_node.INodeBakeProperties.bakeChannel = 2;
        model_node.INodeBakeProperties.nDilations = 5;
    ),

    fn setup_vray_render = (
        renderers.renderDialogMode = #Production;

        local vr = renderers.current;
        vr.output_getsetsfrommax = true;
        vr.colorMapping_brightMult = 0.5;
        vr.output_on = true;
        vr.output_useram = true;
        vr.output_saveRawFile = false;
        vr.output_splitgbuffer = true;
        vr.output_splitRGB = true;
        vr.output_splitAlpha = false;
        vr.output_genpreview = true;
		fileOutGamma = 1.0

        vr.output_splitfilename = pathConfig.appendPath bake_dir "Cur_RGB.jpg";

        -- // desliga o Image Filter, Displacement e aumenta o noise threshold
        vr.filter_on = false;
        vr.twoLevel_threshold = 0.02;
        vr.twoLevel_fineSubdivs = 8;
        vr.options_displacement = false;

        --vr.gi_on = model_info[#pbr_bake_light];

        if Utils.get_vray_version() == "5" then (
            local vfb_layers = (vfbControl #getLayerMgr)[1];
            local id = amax (vfb_layers.getAllLayerIds())
            local huesat_cc = vfb_layers.createLayer id "chaos.cc.hueSatLight";
            huesat_cc.sat = 0.2;
        ) else (
            vfbControl #huesat true;
            vfbControl #huesaturationvalue 0.0 0.2 0.0;
        )
    ),

    fn rename_vray_rgb_to_diffuse = (
		--// deleta render Complete
		local cur_files_to_delete = getFiles textures_paths["path_complete"];
		deleteFile cur_files_to_delete[1]
		
		--// transforma RGB file para complete e remove o mapa do split
        local files = getFiles (pathconfig.appendPath bake_dir "*");
        for file in files do (
			
			print file
            case of (
                (findString file "RGB_color" != undefined): renameFile file textures_paths["path_complete"];
                (findString file "VRayCompleteMap" != undefined): deleteFile file;
            )
        )
    ),

    fn render_bake_mask img_mask_path = (
        local map_to_bake_mask_id = VrayCompleteMap();
        local vr = renderers.current;
        vr.output_splitgbuffer = false;
        vr.imageSampler_type = 0;
        vr.colorMapping_brightMult = 1.0;
        vr.colorMapping_adaptationOnly = 1;

        Utils.png_settings use_alpha:false color_depth:#true48;

        map_to_bake_mask_id.outputSzX = map_to_bake_mask_id.outputSzY = bake_size;
        map_to_bake_mask_id.fileType = img_mask_path;
        map_to_bake_mask_id.color_mapping = true;

        model_node.INodeBakeProperties.removeAllBakeElements();
        model_node.INodeBakeProperties.addBakeElement map_to_bake_mask_id;

        render rendertype:#bakeSelected vfb:off progressBar:true outputSize:[bake_size, bake_size];
    ),

    fn generate_metallic_map = (
        model_node.material = material_infos[#metallic_mask_material];
        render_bake_mask textures_paths["path_metallic"];
        model_node.material = material_infos[#processed_material];

    ),

    fn generate_occlusion_map = (
        model_node.material = material_infos[#occlusion_mask_material];
        render_bake_mask textures_paths["path_occlusion"];
        model_node.material = material_infos[#processed_material];
    ),

    fn generate_material_id_mask = (
        -- // transforma em multisub caso o material nao seja um
        if classof model_node.material != Multimaterial do model_node.material = Multimaterial materialList:#(model_node.material);

        -- // para cada material id, aplica um vrayLightMtl com a cor igual ao seu id
        for mat_id in model_node.material.materialIDlist do (
            model_node.material[mat_id] = vrayLightMtl color:(color mat_id mat_id mat_id) twoSided:on;
        )

        render_bake_mask textures_paths["path_mask"];
    ),

    fn call_render_bake = (
        select model_node;

        -- // IMPORTANTE: evita alguns casos de system exception na hora do render
        convertToMesh model_node;
        update model_node;
        redrawViews();

        render rendertype:#bakeSelected vfb:off progressBar:true outputSize:[bake_size, bake_size];
    ),

    fn remove_emission_from_diffuse = (
        -- // a gamma do emission deve ser 2.2 na subtracao pela maneira como ele e adicionado no glb posteriormente
        local emission_map = bitmapTexture bitmap:(openBitmap textures_paths["path_emission"] gamma:2.2);
        local diffuse_map = bitmapTexture bitmap:(openBitmap textures_paths["path_diffuse"] gamma:1.0);

        -- // subtrai o emission do diffuse
        local final_map = VRayCompTex operator:1 sourceA:diffuse_map sourceB:emission_map;

        local new_bitmap = Bitmap diffuse_map.bitmap.width diffuse_map.bitmap.height color:white filename:diffuse_map.filename;
        rendermap final_map into:new_bitmap;
        save new_bitmap gamma:1.0;
        close new_bitmap;
    ),

    fn init = (
        init_bake_dialog();

        create_bake_render_elements();
        setup_vray_render();
        call_render_bake();
        rename_vray_rgb_to_diffuse();
        --generate_metallic_map();
        --generate_occlusion_map();

        --generate_material_id_mask();

        --remove_emission_from_diffuse();

        --Utils.transfer_uvs model_node 20 1;
    )
)



--------/////////////////////////--------
--------///////MATERIAL INFO///////--------
--------/////////////////////////--------

struct MaterialInfoStruct (
    active_material,

    processed_material,

    diffuse_textured,

    reflection_textured,

    reflection_type,

    reflection_glossiness,

    refraction_type,

    opacity_textured,

    blend_type
)


struct MaterialInfo (
    material_id_infos = undefined,

    fn restore_processed_material = (
        for mat_id_info in material_id_infos do (
            for material_info in mat_id_info.material_infos do (
                replaceInstances material_info.active_material material_info.processed_material;
            )
        )
    ),

    fn replace_active_material material_info new_material = (
        replaceInstances material_info.active_material new_material;
        material_info.active_material = new_material;
    ),

    fn create_metallic_mask_material model_node = (
        for mat_id_info in material_id_infos do (
            for material_info in mat_id_info.material_infos do (
                if material_info.reflection_type == "metal" then (
                    replace_active_material material_info (vrayLightMtl name:"METAL" twoSided:true color:(color 230 230 230));
                ) else (
                    replace_active_material material_info (vrayLightMtl name:"DIELECTRIC" twoSided:true color:black);
                )
            )
        )
        return (copy model_node.material);
    ),

    fn create_occlusion_mask_material model_node = (
        for mat_id_info in material_id_infos do (
            for material_info in mat_id_info.material_infos do (
                if material_info.blend_type == "opaque" then (
                    replace_active_material material_info (vrayLightMtl name:"OCCLUDED" twoSided:true texmap:(VrayDirt subdivs:16 double_sided:true consider_same_object_only:true work_with_transparency:true ignore_invisible_objects:true));
                ) else (
                    local occlusion_map = VrayDirt subdivs:16 double_sided:true consider_same_object_only:true work_with_transparency:true ignore_invisible_objects:true;
                    local transparency_map = colorCorrection color:material_info.processed_material.refraction map:material_info.processed_material.texmap_refraction rewireMode:2;
                    replace_active_material material_info (vrayLightMtl name:"TRANSPARENT" twoSided:true opacity_multiplyColor:true work_with_transparency:true ignore_invisible_objects:true texmap:occlusion_map opacity_texmap:transparency_map);
                )

            )
        )
        return (copy model_node.material);
    ),

    fn remove_unused_maps vrmat threshold = (
        for texmap_on in (getPropNames vrmat) where MatchPattern (texmap_on as string) pattern:"texmap_*_on" do (
            local index = (findString (texmap_on as string) "_on") - 1;
            local texmap_prop = substring (texmap_on as string) 1 index;

            if not (getProperty vrmat texmap_on) do (
                setProperty vrmat texmap_prop undefined;
                setProperty vrmat texmap_on true;
            )
        )

        if vrmat.texmap_reflection_multiplier < threshold do (
            vrmat.texmap_reflection = undefined;
            vrmat.texmap_reflection_on = true;
        )

        if vrmat.texmap_refraction_multiplier < threshold do (
            vrmat.texmap_refraction = undefined;
            vrmat.texmap_refraction_on = true;
        )

        if vrmat.texmap_refractionGlossiness_multiplier < threshold do (
            vrmat.texmap_refractionGlossiness = undefined;
            vrmat.texmap_refractionGlossiness_on = true;
        )
    ),

    fn increase_contrast input_map black_limit white_limit = (
        local mix_map = Mix name:"increase_contrast" mask:input_map useCurve:true;
        mix_map.upper = white_limit / 255.;
        mix_map.lower = black_limit / 255.;
        return mix_map;
    ),

    fn adjust_vray_diffuse material_info = (
        local vrmat = material_info.active_material;

        if material_info.diffuse_textured do (
            local falloff_maps = getClassInstances falloff target:vrmat.texmap_diffuse;

            for falloff_map in falloff_maps do (
                local average_color = (falloff_map.color1 + falloff_map.color2)/2;
                falloff_map.color1 = average_color;
                falloff_map.color2 = average_color;

                if falloff_map.map1 == undefined and falloff_map.map2 != undefined do (
                    falloff_map.map1 = falloff_map.map2;
                )
                if falloff_map.map2 == undefined and falloff_map.map1 != undefined do (
                    falloff_map.map2 = falloff_map.map1;
                )
                if falloff_map.map1 != undefined and falloff_map.map2 != undefined do (
                    local average_maps = mix map1:falloff_map.map1 map2:falloff_map.map2 mixAmount:50;
                    falloff_map.map1 = average_maps;
                    falloff_map.map2 = average_maps;
                )
            )
        )
    ),

    fn adjust_vray_reflection material_info = (
        local vrmat = material_info.active_material;

        -- // corrige legacy setting que fazia o reflexo sair incorreto nos render elements
        vrmat.option_traceDiffuseAndGlossy = 1;

        vrmat.reflection_glossiness = material_info.reflection_glossiness;

        if not material_info.reflection_textured do (
            case material_info.reflection_type of (
                "matte": (
                    vrmat.reflection = (color 0 0 0);
                    vrmat.reflection_glossiness = 0.1;
                )
                "dielectric": (
                    vrmat.reflection = (color 0 0 0);
                    vrmat.reflection_fresnel = off;
                )
                "metal": (
                    -- // trata no mapa de metallic depois do bake
                )
            )
        )
    ),

    fn adjust_vray_refraction material_info = (
        local vrmat = material_info.active_material;

        case material_info.refraction_type of (
            "colored": (
                -- // trata a cor da refracao
                local refraction_color = vrmat.refraction * vrmat.refraction_fogColor;
                if vrmat.refraction_useExitColor and vrmat.refraction_exitColor.saturation > 0 do refraction_color = vrmat.refraction_exitColor;

                -- // Mistura a cor da refracao com o diffuse
                vrmat.texmap_diffuse = mix color1:vrmat.diffuse map1:vrmat.texmap_diffuse color2:refraction_color mixAmount:100 mask:(ColorCorrection color:vrmat.refraction);

                -- // Inverte a matiz da cor
                refraction_color.hue = (white - refraction_color).hue;

                -- // Modula a transparencia pelo glossiness da refracao
                refraction_color.value = refraction_color.value * vrmat.refraction_glossiness;

                -- // Limita a transparencia minima em 40%
                if refraction_color.value < 100 do refraction_color.value = 100;

                -- // Limita a saturacao e transparencia maximas
                if refraction_color.saturation > 100 do refraction_color.saturation = 100;
                if refraction_color.value > 250 do refraction_color.value = 250;

                -- // Aplica a cor na refracao para ser usada pelo RenderElement
                vrmat.refraction = refraction_color;
            )
            "textured":(
                -- // Mistura a cor e/ou textura do Fog Color com a Refracao no modo multiply
                local new_refraction = VRayCompTex operator: 3;
                new_refraction.sourceA = vrmat.texmap_refraction;
                new_refraction.sourceB = (colorCorrection color:vrmat.refraction_fogColor map:vrmat.texmap_refraction_fog);

                -- // Mistura a textura da refracao com o diffuse
                vrmat.texmap_diffuse = mix color1:vrmat.diffuse map1:vrmat.texmap_diffuse map2:new_refraction mixAmount:100 mask:vrmat.texmap_refraction;

                -- // Inverte a matiz das cores do mapa de refracao
                vrmat.texmap_refraction = ColorCorrection hueShift:180 saturation:0 rewireMode:0 map:vrmat.texmap_refraction;
            )
        )

        -- // Remove a transparencia somente apos o seu tratamento
        if material_info.refraction_type == "opaque" do (
            vrmat.texmap_refraction = undefined;
            vrmat.refraction = (color 0 0 0);
        )

        -- // TODO: A opacidade nao esta funcionando corretamente em materiais metalicos...
        -- // TODO: ...como o reflexo fica por cima da refracao, ele reduz a transparencia...
        -- // TODO: ...precisa modular o reflexo com o mapa de opacidade.
        -- // Trata a opacidade
        if material_info.opacity_textured then (
            -- // Seta o alpha source de todos bitmaps da opacidade para "None"
            local opacity_bitmaps = getClassInstances BitmapTexture target:vrmat.texmap_opacity;
            for opacity_bitmap in opacity_bitmaps where getFileNameType opacity_bitmap.filename == ".jpg" do (
                opacity_bitmap.alphaSource = 2;
            )

            -- // Cria um Composite Map com 2 layers
            local composite_map = compositeTextureMap();
            composite_map.mapEnabled.count = 2;

            -- // Aplica o mapa de refracao no layer 1
            composite_map.mapList[1] = vrmat.texmap_refraction;

            -- // Seta o uso do mapa de refracao para 100%
            vrmat.texmap_refraction_multiplier = 100;

            -- // Aplica o mapa de opacidade no layer 2 no modo aditivo, retirado tratamento de contraste por impossibilitar refracao colorida
            composite_map.mapList[2] = ColorCorrection rewireMode:2 map:vrmat.texmap_opacity;
            composite_map.opacity[2] = vrmat.texmap_opacity_multiplier;
            composite_map.blendMode[2] = 2;

            vrmat.texmap_refraction = composite_map;

            vrmat.texmap_opacity = undefined;
        )
    ),

    fn get_vray_material_info vrmat = (
        local material_info = MaterialInfoStruct();

        -- // Remove todos mapas desligados e Reflection/Refraction/Refraction_Glossiness abaixo do threshold
        remove_unused_maps vrmat 10;

        -- // Utiliza o valor do highlight glossiness se estiver sendo usado e for mais baixo que o do reflexo
        local final_glossiness = if vrmat.reflection_lockGlossiness then vrmat.reflection_glossiness else amin #(vrmat.reflection_glossiness, vrmat.hilight_glossiness);

        -- // Ajusta o glossiness caso o BRDF seja Ward
        if vrmat.brdf_type == 2 do final_glossiness = final_glossiness^2.5;

        local IOR = if vrmat.reflection_lockIOR then vrmat.refraction_ior else vrmat.reflection_ior;
        local reflection_intensity = (vrmat.reflection.value / 255) * 100;
        local fresnel_intensity = if vrmat.reflection_fresnel then ((IOR-1)/(IOR+1))^2 else 1;

        -- // Modula a intensidade do reflexo com a influencia do fresnel
        reflection_intensity = reflection_intensity * fresnel_intensity;

        -- // Validacoes para checar o tipo de material
        local textured_diffuse = vrmat.texmap_diffuse != undefined;
        local textured_reflection = vrmat.texmap_reflection != undefined;
        local textured_refraction = vrmat.texmap_refraction != undefined;
        local textured_opacity = vrmat.texmap_opacity != undefined and vrmat.texmap_opacity_on;

        local reflection_type = case of (
            -- // Matte: Se o reflexo for muito fraco, o material e considerado "matte"
            ((fresnel_intensity < 0.01) or (reflection_intensity < 1 and not textured_reflection)): (
                "matte";
            )
            -- // Dieletrico: Indiferente do diffuse ou da textura no reflexo, se o fresnel estiver ligado com um IOR baixo, e um dieletrico
            (fresnel_intensity < 0.15): (
                "dielectric";
            )
            -- // Dieletrico: Qualquer tipo de refracao
            (vrmat.refraction.value > 2 or textured_refraction): (
                "dielectric";
            )
            -- // Dieletrico: Diffuse claro ou com textura, reflexo sem textura, fraco e pouca saturacao
            ((vrmat.diffuse.value > 5 or textured_diffuse) and (not textured_reflection) and (reflection_intensity < 15 and vrmat.reflection.saturation < 20)): (
                "dielectric";
            )
            -- // Dieletrico: Diffuse branco e sem textura, reflexo sem textura e desproporcionalmente forte mas pouca saturacao
            ((vrmat.diffuse.value > 180 and not textured_diffuse) and (not textured_reflection) and (reflection_intensity >= 15 and reflection_intensity <= 35 and vrmat.reflection.saturation < 20)): (
                "dielectric";
            )

            default: "metal";
        )

        -- // Se a refracao for abaixo de 40%, classifica o material como opaco
        local refraction_type = case of (
            (vrmat.refraction_glossiness <= 0.8): "opaque";
            (vrmat.refraction.value < 100 and not textured_refraction): "opaque";
            (textured_refraction): "textured";
            default: "colored";
        )

        material_info.active_material = vrmat;
        material_info.diffuse_textured = textured_diffuse;
        material_info.reflection_textured = textured_reflection;
        material_info.reflection_glossiness = final_glossiness;

        material_info.reflection_type = reflection_type;
        material_info.refraction_type = refraction_type;

        material_info.opacity_textured = textured_opacity;

        material_info.blend_type = case of (
            (refraction_type != "opaque"): "blend";
            (refraction_type == "opaque" and textured_opacity): "cutoff";
            default: "opaque";
        )

        return material_info;
    ),

    fn collect_material_info model_node = (
        -- // copia o material para nao afetar o original que esta aplicado tambem nos kits
        model_node.material = copy model_node.material;

        -- // cria um multimaterial temporario para iterar de forma unificada pelos ids
        local multimaterial_node = if isKindOf model_node.material Multimaterial then model_node.material else Multimaterial materialList:#(model_node.material);

        local material_infos = #();

        for mat_id in multimaterial_node.materialIdList do (
            local current_material_infos = #();
            local vray_materials = getClassInstances VRayMtl target:multimaterial_node[mat_id];

            -- // se nao for um VrayMtl, classifica como dieletrico para ficar preto no metallic map e seta como nao transparente
            if vray_materials.count > 0 then (
                current_material_infos = for vrmat in vray_materials collect get_vray_material_info vrmat;
            ) else (
                local material_info = MaterialInfoStruct();
                material_info.active_material = multimaterial_node[mat_id];
                material_info.reflection_type = "dielectric";
                material_info.refraction_type = "opaque";
                material_info.blend_type = "opaque";
                append current_material_infos material_info;
            )

            -- // datapair com um array das infos de cada VrayMtl dentro do material id para materiais compostos (Ex: VrayBlend, Vray2Sided, etc)
            append material_infos (datapair mat_id:mat_id material_infos:current_material_infos);
        )

        return material_infos;
    ),

    fn not_processed_vrmat material_info = (
        local is_vrmat = isKindOf material_info.active_material VRayMtl;
        local not_processed = findString material_info.active_material.name "_processed" == undefined;
        return (is_vrmat and not_processed);
    ),

    fn remove_duplicate_ids opaque_ids transparent_ids cutoff_ids = (
        -- // caso um material id tenha mais de um vrayMtl com diferentes blending modes, preseva apenas um, na seguinte ordem: transparent, cutoff, opaque
        for id in transparent_ids do (
            if (idx = finditem cutoff_ids id) != 0 do deleteItem cutoff_ids idx;
            if (idx = finditem opaque_ids id) != 0 do deleteItem opaque_ids idx;
        )

        for id in cutoff_ids do (
            if (idx = finditem opaque_ids id) != 0 do deleteItem opaque_ids idx;
        )
    ),

    fn init_mat_infos model_node = (
        material_id_infos = collect_material_info model_node;

        local opaque_ids = #();
        local transparent_ids = #();
        local cutoff_ids = #();

        -- // trata os materiais vray
        for mat_id = 1 to material_id_infos.count do (
            for material_info in material_id_infos[mat_id].material_infos do (
                if not_processed_vrmat material_info do (
                    adjust_vray_diffuse material_info;
                    adjust_vray_reflection material_info;
                    adjust_vray_refraction material_info;
                    material_info.active_material.name += "_processed";
                )

                material_info.processed_material = copy material_info.active_material;

                case material_info.blend_type of (
                    "opaque": append opaque_ids mat_id;
                    "blend": append transparent_ids mat_id;
                    "cutoff": append cutoff_ids mat_id;
                )
            )
        )

        remove_duplicate_ids opaque_ids transparent_ids cutoff_ids;

        local metallic_mask_material = create_metallic_mask_material model_node;
        local occlusion_mask_material = create_occlusion_mask_material model_node;
        restore_processed_material();

        with printAllElements on setUserProp model_node "opaque" (makeUniqueArray opaque_ids);
        with printAllElements on setUserProp model_node "transparent" (makeUniqueArray transparent_ids);
        with printAllElements on setUserProp model_node "cutoff" (makeUniqueArray cutoff_ids);

        return (dictionary processed_material:model_node.material metallic_mask_material:metallic_mask_material occlusion_mask_material:occlusion_mask_material opaque_ids:opaque_ids transparent_ids:transparent_ids cutoff_ids:cutoff_ids);
    )

)

MaterialInfo = MaterialInfo()


--------/////////////////////////--------
--------///////BAKE MESH///////--------
--------/////////////////////////--------
	
struct BakeMesh (
	model_sku = undefined,

    fn compose_metallic_roughness textures_paths = (
        local metalness_map = Utils.create_bitmap_texture textures_paths["path_metallic"] strip_path:true;
        local roughness_map = Utils.create_bitmap_texture textures_paths["path_roughness"] strip_path:true;

        local composite_map = VRayCompTex name:(model_sku + "_METALLICROUGH") operator:0
        composite_map.sourceA = Color_Correction rewireR:10 rewireG:10 rewireB:2 map:metalness_map;
        composite_map.sourceB = Color_Correction rewireR:10 rewireG:1 rewireB:10 map:roughness_map;

        return composite_map;
    ),

    fn compose_alpha_diffuse textures_paths = (
        local diffuse_map = Utils.create_bitmap_texture textures_paths["path_diffuse"] gamma:2.2 strip_path:true;
        local alpha_map = Utils.create_bitmap_texture textures_paths["path_transparent"] gamma:0.454 strip_path:true;
        local mask_nd = Mask name:(model_sku + "_ALPHADIFFUSE") map:diffuse_map mask:alpha_map maskInverted:false;

        return mask_nd;
    ),

    fn create_default_pbr_material model_node textures_paths material_infos = (
        local pbr_material = PhysicalMaterial name:model_node.name base_color:white showInViewport:true;

        pbr_material.base_color_map = compose_alpha_diffuse textures_paths;
        pbr_material.refl_color_map = compose_metallic_roughness textures_paths;
        pbr_material.emit_color_map = Utils.create_bitmap_texture textures_paths["path_emission"] strip_path:true;
        pbr_material.bump_map = Utils.create_bitmap_texture textures_paths["path_normal"] strip_path:true;

        -- // special maps
        pbr_material.diff_rough_map = Utils.create_bitmap_texture textures_paths["path_occlusion"] strip_path:true;
        pbr_material.reflectivity_map = Utils.create_bitmap_texture textures_paths["path_specular"] strip_path:true;
        pbr_material.displacement_map = Utils.create_bitmap_texture textures_paths["path_height"] strip_path:true;
        pbr_material.coat_color_map = Utils.create_bitmap_texture textures_paths["path_mask"] strip_path:true;

        model_node.material = pbr_material;
    ),

    fn invert_map_correction map_to_invert = (
        if map_to_invert != undefined do (
            local image_bitmap = openBitmap map_to_invert gamma:1.0;

            local inverted_map = bitmapTexture bitmap:image_bitmap;
            inverted_map.output.invert = true;
            inverted_map.filtering = 2;

            local new_bitmap = Bitmap image_bitmap.width image_bitmap.height color:white filename:map_to_invert;
            rendermap inverted_map into:new_bitmap;
            save new_bitmap gamma:1.0;
            close new_bitmap;
        )
    ),

    fn clamp_colors texture_path black_limit white_limit = (
        local mix_map = Mix mask:(bitmapTexture filename:texture_path) useCurve:true;
        mix_map.upper = white_limit / 255.;
        mix_map.lower = black_limit / 255.;

        local out_bitmap = bitmap mix_map.mask.bitmap.width mix_map.mask.bitmap.height filename:texture_path;
        renderMap mix_map into:out_bitmap;
        save out_bitmap;
        close out_bitmap;
    ),

    fn setup_node_to_bake model_node = (
        model_node.renderable = true;
		model_node.castShadows = false; --ALTERADO 1007
        setUserProp model_node "VRay_GI_VisibleToReflections" false;
        setUserProp model_node "VRay_GI_VisibleToRefractions" false;
    ),

    fn create_ambient_light = (
        local light_intensity = 1.0;

        -- // Cria uma ambient light que nao gera sombra e seta o environment para os reflexos
        local ambient_light = VRayAmbientLight name:"DecoraAmbientLight" intensity:light_intensity mode:1 color:white;

        -- // Seta o environment do vray para o Reflection e Refraction filters
        local vr = renderers.current;
        vr.environment_rr_on = true;
        vr.environment_rr_color = white;
        vr.environment_rr_color_multiplier = light_intensity;

        vr.environment_refract_on = true;
        vr.environment_refract_color = black;

        return ambient_light;
    ),

    fn create_pbr_textures_paths base_name textures_dir = (
        pbr_textures = dictionary #string;
        pbr_textures["path_complete"] = pathConfig.appendPath textures_dir (base_name + "_COMPLETE.jpg");
		print "///////////"
		print pbr_textures["path_complete"]
--         pbr_textures["path_metallic"] = pathConfig.appendPath textures_dir (base_name + "_METALLIC.tif");
--         pbr_textures["path_specular"] = pathConfig.appendPath textures_dir (base_name + "_SPECULAR.tif");
--         pbr_textures["path_transparent"] = pathConfig.appendPath textures_dir (base_name + "_TRANSPARENT.tif");
--         pbr_textures["path_roughness"] = pathConfig.appendPath textures_dir (base_name + "_ROUGHNESS.tif");
--         pbr_textures["path_emission"] = pathConfig.appendPath textures_dir (base_name + "_EMISSION.tif");
--         pbr_textures["path_normal"] = pathConfig.appendPath textures_dir (base_name + "_NORMAL.tif");
--         pbr_textures["path_height"] = pathConfig.appendPath textures_dir (base_name + "_HEIGHT.tif");
--         pbr_textures["path_occlusion"] = pathConfig.appendPath textures_dir (base_name + "_OCCLUSION.tif");

--         pbr_textures["path_mask"] = pathConfig.appendPath textures_dir (base_name + "_MATERIAL_ID_MASK.png");

        return pbr_textures;
    ),

    fn load_render_preset = (
        renderPresets.LoadAll 0 (pathConfig.appendPath @"C:\Program Files (x86)\Cora\Charlie\lib\maxscript\resources" "studio/decora_render_preset.rps");
        local render_elements = maxOps.GetRenderElementMgr #Production;
        render_elements.removeallrenderelements();
    ),

    fn get_bake_functions = (
        return BakeGeneralFunctions();
    ),

    fn init_bake_mesh model_node model_info = (
        local textures_dir = Utils.create_dir maxfilepath "texturas_baked";
        local textures_paths = create_pbr_textures_paths model_node.name textures_dir;

        load_render_preset();
        --local bake_light = create_ambient_light();
        setup_node_to_bake model_node;

        local bake_functions = get_bake_functions();
        bake_functions.model_node = model_node;
        bake_functions.model_info = model_info;
        --bake_functions.material_infos = material_infos;
        bake_functions.bake_size = 256;
        bake_functions.bake_dir = textures_dir;
        bake_functions.textures_paths = textures_paths;

        --// USADO PARA LIBERAR BITMAPS E IMPEDIR TRAVAMENTOS
        freeSceneBitmaps()

        bake_functions.init();

        --invert_map_correction textures_paths["path_roughness"];
        --invert_map_correction textures_paths["path_transparent"];

        --delete bake_light;

        --Utils.clear_vertex_data model_node;
        --create_default_pbr_material model_node textures_paths material_infos;
    )
	
)

BakeMesh = BakeMesh()




--------/////////////////////////--------
--------///////UNWRAP FLATTEN MESHS///////--------
--------/////////////////////////--------


struct UnwrapSceneMeshs (
	fn get_packing_modifier = (
		local pack_modifier = if isKindOf UVPacker modifier then (
			UVPacker name:"Best_Packing";
		) else (
			unwrapMod = unwrap_UVW name:"Automatic Flatten UVs";
			unwrapMod.setMapChannel 20;
			unwrapMod.setApplyToWholeObject true;
			unwrapMod;
		)
		return pack_modifier;
	),

	fn prepare_nodes_to_pack main_model model_info = (
		local pack_modifier = get_packing_modifier();
		for nd in main_model where not isGroupHead nd and validModifier nd (poly_select()) do (
			addModifier nd pack_modifier;
		)
		local geometry_nodes = for nd in main_model where isKindOf nd geometryClass collect nd;
		return geometry_nodes[1];
	),

	fn apply_packing model_node method:2 spacing:0.003 normalized:true rotation:true fillHoles:true = (
		if isKindOf UVPacker modifier then (
			if model_node.modifiers["Best_Packing"] == undefined do addModifier model_node (UVPacker name:"Best_Packing");
			model_node.modifiers["Best_Packing"].width = 2048;
			model_node.modifiers["Best_Packing"].height = 2048;
			model_node.modifiers["Best_Packing"].padding = 4;
			model_node.modifiers["Best_Packing"].source_channel = 20;
			model_node.modifiers["Best_Packing"].channel = 2;
			model_node.modifiers["Best_Packing"].show_preview = false;
			model_node.modifiers["Best_Packing"].pack();
			-- // necessario para forcar o update do modifier ao rodar por command line
			redrawViews();
			print "force uv_packer update";
		) else (
			print "ESTOU ENTRANDO AQUI NO AUTOMATIC FLATTEN"
			model_node.modifiers["Automatic Flatten UVs"].pack method spacing normalized rotation fillHoles;
		)
	),

	fn pack_by_material_id model_node = (
		local unwrapMod = model_node.modifiers["Automatic Flatten UVs"];
		local num_ids = if classOf model_node.material == Multimaterial then model_node.material.numSubs else 1;
		for i=1 to num_ids do (
			unwrapMod.selectByMatID i;
			if (unwrapMod.getSelectedFacesByNode model_node).numberSet > 0 do (
				unwrapMod.groupCreate ("ID_" + i as string);
			)
		)
		unwrapMod.selectFacesByNode #{1..model_node.numFaces} model_node;
		apply_packing model_node rotation:false fillHoles:false;
	),

	fn packUVs_init model_node model_info attempt:1 pbr_pre_packing:false = (
		case of (
			(pbr_pre_packing): (
				model_node = prepare_nodes_to_pack model_node model_info;
				apply_packing model_node;
			)
			(attempt == 1 or attempt == 2): apply_packing model_node;
			(attempt == 3): pack_by_material_id model_node;
		)
	),

	fn add_unwrap_and_transfer_uvs model_node = (
		-- // o unwrap precisa ter o painel modify e o produto selecionados
		max modify mode;
		select model_node;

		-- // copia os uvs de input para o canal 20. OBS: o parametro "pbr_uv_channel" pega do userProp, se nao tiver e 1.
		--Utils.transfer_uvs model_node false 1;

		-- // evita crash no Flatten em alguns casos
		convertToMesh model_node;

		unwrapMod = unwrap_UVW();
		unwrapMod.setAlwaysEdit false;
		unwrapMod.setMapChannel 2;
		unwrapMod.setApplyToWholeObject true;
		unwrapMod.name = "Automatic Flatten UVs";
		unwrapMod.setDebugLevel 0;

		addModifier model_node unwrapMod;
		modPanel.setCurrentObject unwrapMod;
	),

	fn apply_box_projection model_node = (
		model_node.modifiers["Automatic Flatten UVs"].normalMap #([1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]) 0. true 0 true true;
	),

	fn apply_unwrap_modifier model_node model_info kit_idx = (
		add_unwrap_and_transfer_uvs model_node
		apply_box_projection model_node;
		packUVs_init model_node model_info;
	)
)

UnwrapSceneMeshs = UnwrapSceneMeshs()


--------/////////////////////////--------
--------///////ATTACH SCENE MESHSES///////--------
--------/////////////////////////--------

struct AttachSceneMeshes (

	fn sort_geometry_list node_list = (
        local datapair_nodes_volume = #();
        local volume_list = #();
        local sorted_nodes = #();

        for nd in node_list do (
            local node_size = (nd.max - nd.min);
            local node_volume = node_size.x * node_size.y * node_size.z;
            append datapair_nodes_volume (datapair volume:node_volume node:nd);
            appendIfUnique volume_list node_volume;
        )

        local sorted_volumes = sort volume_list;

        for volume in sorted_volumes do (

            for datapair_node in datapair_nodes_volume where datapair_node.volume == volume do append sorted_nodes datapair_node.node;
        )

        return sorted_nodes;
    ),
	
	fn fix_normals model_node = (
        max modify mode;
        addModifier model_node (Edit_Normals name:"Fix_Normals" displayLength:0);
        modPanel.setCurrentObject model_node.modifiers[#Fix_Normals];
        model_node.modifiers[#Fix_Normals].makeExplicit selection:#{1..model_node.modifiers[#Fix_Normals].GetNumNormals()};
        max create mode;
        gc();
    ),
	
	fn set_mesh_material_ids model_node mtl_id = (
        addModifier model_node (MaterialModifier materialID:mtl_id);
        collapseStack model_node;
    ),
	
	fn process_final_node attached_product = (
        if not (isKindOf attached_product.material Multimaterial) do set_mesh_material_ids attached_product 1;
        fix_normals attached_product;
        attached_product.pivot = [attached_product.center.x, attached_product.center.y, attached_product.min.z];
        resetXForm attached_product;

        --// IMPORTANTE: evita quebra de triangulos no uv do PBR
        if attached_product.modifiers["Triangulate"] == undefined do addModifier attached_product (Turn_to_Mesh name:"Triangulate" useInvisibleEdges:false)
        convertToMesh attached_product;
    ),
	
	    fn is_deletable model_node = (
        local forbidden_classes = #(Targetobject,VrayFur,LinkComposite,VRaySphere,BoxGizmo);
        local found_classes = (for forbid_class in forbidden_classes where classof model_node == forbid_class collect forbid_class).count > 0;
        local not_renderable = model_node.renderable == false or model_node.IsHidden or model_node.visibility == 0;

        return(found_classes or not_renderable);
    ),

    fn is_geometry model_node = (
        local is_geometry = false;

        if classOf model_node == LinearShape do convertToSplineShape model_node;

        if (isKindOf model_node Shape and model_node.render_renderable) do (
            model_node.render_displayRenderMesh = true;
        )

        return((isKindOf model_node Shape and model_node.render_renderable) or isKindOf model_node GeometryClass);
    ),

    fn is_pbr_light light_node keep_lights = (
        return(keep_lights and isKindOf light_node VrayLight and light_node.on and not light_node.invisible)
    ),
	
	fn get_nodes_list product_node keep_lights = (
        local to_delete_items = #();
        local geometry_nodes = #();
        local light_nodes = #();

        for model_node in product_node where not isGroupHead model_node do (
            maxOps.collapseNodeTo model_node 1 true;
            case of (
                (is_deletable model_node): appendIfUnique to_delete_items model_node;
                (is_geometry model_node): appendIfUnique geometry_nodes model_node;
                (is_pbr_light model_node keep_lights): appendIfUnique light_nodes model_node;
                default: appendIfUnique to_delete_items model_node;
            )
        )

        for light_node in light_nodes do (
            local converted_light = create_light_mesh light_node;
            if converted_light.light_mesh != undefined do appendIfUnique geometry_nodes converted_light.light_mesh;
        )

        explodeGroup product_node;

        -- // trata caso tenha TargetObject que e apagado junto com a luz
        for delete_node in to_delete_items where isValidNode delete_node do (
            delete delete_node;
        )

        convertToPoly geometry_nodes;

        return(datapair geometry_nodes:geometry_nodes light_nodes:light_nodes);
    ),
	
	fn fast_attach nodes = (
        local index = 1;
        while nodes.count > 1 do (
            if classOf nodes[index] != Editable_Poly do convertToPoly nodes[index];
            polyop.attach nodes[index] nodes[index+1];
            deleteItem nodes (index+1);
            index += 1;
            if (index + 1) > nodes.count then index = 1;
        )

        return nodes[1];
    ),
	
	fn get_attached_node geometry_nodes model_name = (
        -- // cria um poly vazio para fazer o attach final. utiliza um Edit Poly para preservar normais
        local attached_product = convertToPoly (Editable_Mesh name:model_name);

        max modify mode;
        addModifier attached_product (Edit_Poly name:"Edit_Poly_Attach");
        modPanel.setCurrentObject attached_product.modifiers[#Edit_Poly_Attach];
        attached_product.modifiers[#Edit_Poly_Attach].attach (fast_attach geometry_nodes);

        return(attached_product);
    ),
	
	fn get_simplify_ratio product optimize_idx = (
        local simplify_faces_percentage_list = #(1, 0.512, 0.256, 0.128, 0.064, 0.032, 0.014, 0.013, 0.012, 0.011)

        if (optimize_idx == undefined) do (
            local num_faces = product.numFaces
            local idx_percentage = case of (
                (num_faces <= 20000): idx_percentage = 1
                (num_faces >= 20000 and num_faces < 30000): 2
                (num_faces >= 30000 and num_faces < 65000): 3
                (num_faces >= 65000 and num_faces < 120000): 4
                (num_faces >= 120000 and num_faces < 225000): 5
                (num_faces >= 225000 and num_faces < 450000): 6
                (num_faces >= 450000 and num_faces < 850000): 7
                (num_faces >= 850000 and num_faces < 1200000): 8
                (num_faces >= 1200000 and num_faces < 2000000): 9
                (num_faces >= 2000000): 10
            )
            return (datapair idx_percentage:idx_percentage percent:(simplify_faces_percentage_list[idx_percentage]))
        )
        return (datapair idx_percentage:optimize_idx percent:(simplify_faces_percentage_list[optimize_idx]))
    ),
	
	fn set_pro_optimizer_simplify product input_adjust_optimize = (
        local pro_optimizer_mod = ProOptimizer()

        addModifier product pro_optimizer_mod

        pro_optimizer_mod.Calculate = true
        redrawviews()

        local simplify_percentage = get_simplify_ratio product input_adjust_optimize
        local simplify_percentage_proop = simplify_percentage.percent * 100

        pro_optimizer_mod.VertexPercent = simplify_percentage_proop

        pro_optimizer_mod.LockMat = false
        pro_optimizer_mod.KeepUV = true
        pro_optimizer_mod.KeepNormals = true
        pro_optimizer_mod.NormalThreshold = 20

        pro_optimizer_mod.MergePoints = true

        local before_process = product.numFaces
        if simplify_percentage_proop < 100 do pro_optimizer_mod.Calculate = true
        local after_process = product.numFaces

        convertTo product Editable_Poly
    ),

	fn fix_attach_meshs = (
	    update_log "fix_attach_meshs"
		local products_to_process = #()
		for nd in $DecoraGeneralProducts.children do (
			if isGroupHead nd.children[1] then (
				append products_to_process nd.children[1]
			)else(
				append products_to_process nd
			)
		)
		
		local products_processed = #()
		local optimized_processed = #()
		for nd in products_to_process do (
		    update_log ("working on " + nd.name)
			model_node = nd
			model_name = model_node.name
			nodes_list = get_nodes_list model_node false
			size_sorted_nodes = sort_geometry_list nodes_list.geometry_nodes
			product_node = get_attached_node size_sorted_nodes model_name

			process_final_node product_node

			local copy_node = (copy product_node)
			set_pro_optimizer_simplify copy_node undefined
			
			--// rename High Poly
			product_node.name = copy_node.name + "_HighPoly"
			
			--// desabilita render do highPoly para nao atrapalhar bakeShell
			product_node.renderable = false


			--// INIT PROCESSO DE UNWRAP
			update_log ("INIT PROCESSO DE UNWRAP")
			model_info = (Dictionary pbr_flatten:false pbr_polycount:false pbr_keep_light:false pbr_bake_light:false pbr_uv_channel:false pbr_animated:false)
			UnwrapSceneMeshs.apply_unwrap_modifier copy_node model_info 1
			convertToPoly copy_node
			
			--// INIT PROCESSO DE BAKE
			update_log ("INIT PROCESSO DE BAKE")
			--material_infos = MaterialInfo.init_mat_infos copy_node
			BakeMesh.model_sku = copy_node.name
			BakeMesh.init_bake_mesh copy_node model_info
			
			product_node.renderable = true
			
			--// rename Low Poly
			copy_node.name = copy_node.name + "_LowPoly"
			copy_node.isHidden = true
			
			append products_processed product_node
			append optimized_processed (copy_node)
			update_log ("DONE")
		)

		Utils.group_all_nodes optimized_processed "DecoraOptimizedProdutcs"
		Utils.group_all_nodes products_processed "DecoraProcessedProdutcs"
		
	)
)

--------/////////////////////////--------
--------///////SCENE PREPAIR///////--------
--------/////////////////////////--------

struct ScenePrepair (
	fn delete_lights = (
		if $DecoraEnvLights != undefined do delete $DecoraEnvLights
		delete cameras
	),
	
	fn fix_bsps_mat = (
		local default_mat = $DecoraWalls.children[1].mat
		
		for nd in $DecoraWalls.children do nd.mat = default_mat
		for nd in $DecoraBSP.children do nd.mat = default_mat
		$DecoraFloors.children[1].mat = default_mat
		$DecoraCeilings.children[1].mat = default_mat
	),
	
	fn scene_prepair_init = (
		--delete_lights()
		fix_bsps_mat()
	)
)

ScenePrepair = ScenePrepair()

fn create_set_physical_material nd = (
	local name_texture = substituteString nd.name "_LowPoly" ""
	local name_texture_filePath = name_texture + "_COMPLETE.jpg"

	local curTexPath = pathConfig.appendPath (pathConfig.removePathLeaf scene_path) "texturas_baked"

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

fn export_glb nd =
(
    
)

fn update_bake_materials_and_export = (
    update_log "update_bake_materials"
	setGroupOpen $DecoraOptimizedProdutcs true

    local glb_data_path = pathConfig.appendPath (pathConfig.appendPath maxfilepath "glbs") "glb_data_filec.txt"
	local glb_data_file = undefined

	if not doesFileExist glb_data_path then (
		glb_data_file = createfile glb_data_path
	)
	else (
		glb_data_file = openFile glb_data_path
	)

	for nd = 1 to $DecoraOptimizedProdutcs.children.count do (
		obj =  $DecoraOptimizedProdutcs.children[nd]
	    obj_info = obj.name + ":" + (obj.pos as string) + ":" + (obj.rotation as string) + "\n"

        format obj_info to:glb_data_file

		print $DecoraOptimizedProdutcs.children[nd]
		update_log $DecoraOptimizedProdutcs.children[nd].name
		create_set_physical_material $DecoraOptimizedProdutcs.children[nd]
		select $DecoraOptimizedProdutcs.children[nd]
        --export_glb $DecoraOptimizedProdutcs.children[nd]
		
		update_log ("exporting glb " + $DecoraOptimizedProdutcs.children[nd].name)
	
		local output_Path = pathConfig.appendPath (pathConfig.appendPath maxfilepath "glbs") ($DecoraOptimizedProdutcs.children[nd].name + ".glb") -- Destination folder.

        if not doesFileExist (pathConfig.appendPath maxfilepath "glbs") do makeDir (pathConfig.appendPath maxfilepath "glbs")

		Assembly = dotNetClass "System.Reflection.Assembly"
		-- UPDATE YOUR PATH TO BABYLON DLL
		Assembly.loadfrom "C:/Program Files/Autodesk/3ds Max 2022/bin/assemblies/Max2Babylon.dll"
		maxScriptManager = dotNetObject "Max2Babylon.MaxScriptManager"

		-- OUTPUT PATH
		param = maxScriptManager.InitParameters Output_Path

		-- PARAMETERS
		param.enableKHRTextureTransform = true
		param.writeTextures = true
		param.overwriteTextures = true
		param.exportAnimations = true
		param.exportOnlySelected = true
		param.exportMaterials = true
		param.autoSaveSceneFile = false
		param.outputFormat = "glb"
		param.txtQuality = 100
		param.exportAnimations = false

		maxScriptManager.Export param --true -- <-- Uncomment to enable logging
		update_log ("DONE")
		nd += 1
	)
	close glb_data_file
	print "DONE"
)

fn open_scene = (
    --global scene_path =  @"C:/teste/teste_babylon/64ac3a0ea08cef00086a7dba_MAXSCRIPT_SCENE_JOB_1689020845/212602_working.max"

    loadMaxFile scene_path quiet:true
    update_log ("scene open")
)





--------/////////////////////////--------
--------///////INIT FUNCTIONS///////--------
--------/////////////////////////--------

--ScenePrepair.scene_prepair_init()
-- open_scene()
-- AttachSceneMeshes = AttachSceneMeshes()
-- AttachSceneMeshes.fix_attach_meshs()
update_bake_materials_and_export()
--
-- curTexPath como um path global preenchida pelo python no init
-- scene_path como um path global preenchida pelo python no init
