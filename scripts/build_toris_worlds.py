"""Build the editable Toris Coin Blender worlds and web-ready GLB assets.

Run with:
  blender --background --python scripts/build_toris_worlds.py

The script intentionally uses only Blender primitives so every asset can be
regenerated and edited without downloading third-party models.
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "worlds"
POSES = OUT / "poses"
BLENDS = ROOT / "assets" / "blender"


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.materials,
        bpy.data.curves,
        bpy.data.meshes,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(datablocks):
            datablocks.remove(block)


def material(name, color, roughness=0.45, metallic=0.0, emission=None):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = 3.5
    return mat


def finish(obj, name, mat, parent=None, scale=None, location=None, rotation=None):
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    if scale:
        obj.scale = scale
    if location:
        obj.location = location
    if rotation:
        obj.rotation_euler = rotation
    bpy.ops.object.shade_smooth()
    return obj


def sphere(name, mat, location, scale, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20)
    return finish(bpy.context.object, name, mat, parent, scale, location)


def cube(name, mat, location, scale, parent=None, bevel=0.08, rotation=None):
    bpy.ops.mesh.primitive_cube_add()
    obj = finish(bpy.context.object, name, mat, parent, scale, location, rotation)
    if bevel:
        mod = obj.modifiers.new("Soft edges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    return obj


def cylinder(name, mat, location, radius, depth, parent=None, rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth)
    return finish(bpy.context.object, name, mat, parent, None, location, rotation)


def cone(name, mat, location, radius1, radius2, depth, parent=None, rotation=None):
    bpy.ops.mesh.primitive_cone_add(
        vertices=48, radius1=radius1, radius2=radius2, depth=depth
    )
    return finish(bpy.context.object, name, mat, parent, None, location, rotation)


def torus(name, mat, location, major, minor, parent=None, rotation=None):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, major_segments=48, minor_segments=12
    )
    return finish(bpy.context.object, name, mat, parent, None, location, rotation)


def empty(name, location=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.parent = parent
    return obj


def star(name, mat, location, size, depth, parent=None):
    vertices = []
    for z in (-depth / 2, depth / 2):
        for i in range(10):
            angle = math.pi / 2 + i * math.pi / 5
            radius = size if i % 2 == 0 else size * 0.44
            vertices.append((math.cos(angle) * radius, 0 + z, math.sin(angle) * radius))
    faces = []
    faces.append(tuple(range(10)))
    faces.append(tuple(range(10, 20)))
    for i in range(10):
        faces.append((i, (i + 1) % 10, (i + 1) % 10 + 10, i + 10))
    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.location = location
    obj.parent = parent
    return obj


def crown(parent, gold, location=(0, 0, 2.35), scale=1.0):
    pivot = empty("Crown", location, parent)
    cylinder("CrownBand", gold, (0, 0, 0), 0.48 * scale, 0.18 * scale, pivot)
    for i, x in enumerate((-0.34, 0, 0.34)):
        cone(
            f"CrownPoint{i}",
            gold,
            (x * scale, 0, 0.34 * scale),
            0.16 * scale,
            0.04 * scale,
            0.62 * scale,
            pivot,
        )
        sphere(
            f"CrownBall{i}",
            gold,
            (x * scale, 0, 0.68 * scale),
            (0.075 * scale,) * 3,
            pivot,
        )
    return pivot


def glasses(parent, dark, lens, y=-0.65, z=1.65, scale=1.0):
    for side in (-1, 1):
        cube(
            f"Lens{side}",
            lens,
            (side * 0.38 * scale, y, z),
            (0.34 * scale, 0.07 * scale, 0.23 * scale),
            parent,
            bevel=0.12 * scale,
        )
    cube("GlassesBridge", dark, (0, y, z), (0.16, 0.08, 0.05), parent, bevel=0.03)


def add_common_world(theme):
    root = empty("WorldRoot")
    env = empty("WorldEnvironment", parent=root)
    palette = {
        "PEBR": ((0.18, 0.35, 0.20), (0.57, 0.77, 0.45)),
        "YETI": ((0.30, 0.52, 0.68), (0.88, 0.95, 1.0)),
        "XMASR": ((0.08, 0.16, 0.32), (0.28, 0.48, 0.73)),
    }[theme]
    base = material(f"{theme} Base", palette[0], 0.55)
    top = material(f"{theme} Ground", palette[1], 0.62)
    cylinder("WorldPlinth", base, (0, 0, -1.58), 2.75, 0.32, env)
    cylinder("WorldGround", top, (0, 0, -1.39), 2.62, 0.10, env)
    return root, env


def build_pebr():
    root, env = add_common_world("PEBR")
    char = empty("CharacterRoot", (0, 0, -0.03), root)
    green = material("PEBR Lime Vinyl", (0.49, 0.76, 0.28), 0.34)
    cream = material("PEBR Cream", (0.92, 0.86, 0.61), 0.58)
    dark = material("PEBR Charcoal", (0.025, 0.045, 0.035), 0.24)
    lens = material("PEBR Glasses", (0.06, 0.12, 0.10), 0.16, 0.25)
    gold = material("Collection Gold", (0.95, 0.61, 0.12), 0.24, 0.72)
    ceramic = material("Coffee Ceramic", (0.91, 0.90, 0.83), 0.28)
    coffee = material("Coffee", (0.17, 0.065, 0.02), 0.36)
    sphere("Body", green, (0, 0, -0.05), (1.02, 0.72, 1.08), char)
    sphere("Belly", cream, (0, -0.66, -0.20), (0.64, 0.10, 0.67), char)
    sphere("Head", green, (0, 0, 1.18), (1.02, 0.78, 0.90), char)
    sphere("Muzzle", cream, (0, -0.71, 0.99), (0.56, 0.18, 0.38), char)
    for side in (-1, 1):
        sphere(f"Ear{side}", green, (side * 0.75, 0, 1.72), (0.34,) * 3, char)
        sphere(f"Leg{side}", green, (side * 0.62, -0.05, -0.89), (0.45, 0.48, 0.46), char)
        sphere(f"Arm{side}", green, (side * 0.90, -0.03, 0.15), (0.34, 0.34, 0.66), char)
    sphere("Nose", dark, (0, -0.92, 1.13), (0.17, 0.10, 0.12), char)
    glasses(char, dark, lens, y=-0.76, z=1.49)
    crown(char, gold, (0, 0, 2.12), 0.9)
    action = empty("ActionPivot", (0.92, -0.08, 0.38), char)
    cup = cylinder("CoffeeCup", ceramic, (0, -0.48, 0.32), 0.30, 0.46, action)
    torus("CupHandle", ceramic, (0.29, -0.48, 0.32), 0.16, 0.055, action, (math.pi / 2, 0, 0))
    cylinder("CoffeeSurface", coffee, (0, -0.48, 0.56), 0.24, 0.025, action)
    # Garden lounge cues
    wood = material("Garden Wood", (0.33, 0.17, 0.07), 0.67)
    leaf = material("Garden Leaves", (0.12, 0.40, 0.16), 0.70)
    cylinder("CafeTableTop", wood, (1.75, 0.65, -0.42), 0.65, 0.12, env)
    cylinder("CafeTableLeg", wood, (1.75, 0.65, -0.95), 0.10, 0.95, env)
    for i, x in enumerate((-2.0, -1.55, 1.45, 2.10)):
        sphere(f"GardenBush{i}", leaf, (x, 0.55 + (i % 2) * 0.45, -0.95), (0.55, 0.45, 0.55), env)
    return root, env, action


def build_yeti():
    root, env = add_common_world("YETI")
    char = empty("CharacterRoot", (0, 0, -0.04), root)
    white = material("YETI Snow Vinyl", (0.91, 0.94, 0.95), 0.75)
    face = material("YETI Face", (0.70, 0.55, 0.48), 0.55)
    dark = material("YETI Charcoal", (0.035, 0.045, 0.055), 0.30)
    silver = material("Golf Club", (0.48, 0.56, 0.60), 0.22, 0.82)
    green = material("Golf Ball", (0.37, 0.83, 0.28), 0.48)
    gold = material("Collection Gold", (0.95, 0.61, 0.12), 0.24, 0.72)
    sphere("Body", white, (0, 0, -0.02), (1.08, 0.76, 1.13), char)
    sphere("Head", white, (0, 0, 1.22), (1.02, 0.76, 0.86), char)
    sphere("Face", face, (0, -0.72, 1.13), (0.60, 0.16, 0.46), char)
    for side in (-1, 1):
        sphere(f"Brow{side}", white, (side * 0.30, -0.88, 1.49), (0.34, 0.08, 0.10), char)
        sphere(f"Eye{side}", dark, (side * 0.27, -0.90, 1.36), (0.08, 0.05, 0.10), char)
        sphere(f"Leg{side}", white, (side * 0.60, -0.02, -0.91), (0.49, 0.50, 0.45), char)
        sphere(f"Arm{side}", white, (side * 0.91, -0.04, 0.16), (0.35, 0.36, 0.68), char)
    cube("Mouth", dark, (0, -0.90, 0.92), (0.28, 0.04, 0.035), char, bevel=0.03)
    crown(char, gold, (0, 0, 2.15), 0.9)
    action = empty("ActionPivot", (0.86, -0.12, 0.40), char)
    shaft = cylinder("GolfClubShaft", silver, (0.20, -0.30, 0.05), 0.045, 2.5, action, (0, 0, -0.32))
    cube("GolfClubHead", silver, (0.60, -0.30, -1.12), (0.28, 0.12, 0.11), action, bevel=0.05, rotation=(0, 0, -0.32))
    sphere("ActionBall", green, (-0.58, -0.62, -1.18), (0.18,) * 3, char)
    snow = material("Snow Banks", (0.94, 0.98, 1.0), 0.88)
    ice = material("Icy Putting Green", (0.24, 0.59, 0.50), 0.72)
    cylinder("PuttingGreen", ice, (0, 0, -1.31), 1.65, 0.08, env)
    for i, x in enumerate((-2.0, -1.35, 1.45, 2.05)):
        sphere(f"SnowBank{i}", snow, (x, 0.60 + (i % 2) * 0.38, -1.02), (0.70, 0.48, 0.50), env)
    return root, env, action


def build_xmasr():
    root, env = add_common_world("XMASR")
    rocket = empty("CharacterRoot", (0, 0, -0.10), root)
    silver = material("Rocket Silver", (0.60, 0.67, 0.73), 0.20, 0.82)
    dark = material("Launch Charcoal", (0.05, 0.07, 0.10), 0.34, 0.35)
    gold = material("Collection Gold", (0.95, 0.61, 0.12), 0.24, 0.72)
    red = material("Ribbon Red", (0.68, 0.05, 0.055), 0.32)
    green = material("Ribbon Green", (0.06, 0.43, 0.18), 0.36)
    flame = material("Ignition", (1.0, 0.30, 0.02), 0.20, emission=(1.0, 0.13, 0.01))
    cylinder("RocketBody", silver, (0, 0, 0.30), 0.66, 2.95, rocket)
    cone("RocketNose", silver, (0, 0, 2.05), 0.66, 0, 1.20, rocket)
    for side in (-1, 1):
        cube(f"Fin{side}", silver, (side * 0.72, 0, -0.80), (0.38, 0.14, 0.62), rocket, bevel=0.10, rotation=(0, side * 0.05, side * 0.25))
    star("RocketStar", gold, (0, -0.69, 2.15), 0.42, 0.12, rocket)
    for i in range(14):
        angle = i * 0.82
        z = -0.85 + i * 0.20
        color = [red, green, gold][i % 3]
        sphere(f"HolidayBulb{i}", color, (math.sin(angle) * 0.69, math.cos(angle) * 0.69, z), (0.085,) * 3, rocket)
    # Ribbon knots and tails, kept geometric and readable.
    for side, color in ((-1, red), (1, green)):
        sphere(f"RibbonKnot{side}", color, (side * 0.70, -0.20, -0.55), (0.18, 0.10, 0.15), rocket)
        cube(f"RibbonTail{side}", color, (side * 0.82, -0.18, -0.88), (0.13, 0.06, 0.43), rocket, bevel=0.04, rotation=(0, side * 0.28, side * 0.18))
    action = rocket
    cone("IgnitionFlame", flame, (0, 0, -1.78), 0.42, 0.04, 1.08, rocket)
    runway = material("Runway", (0.09, 0.12, 0.18), 0.40, 0.28)
    snow = material("Launch Snow", (0.88, 0.94, 1.0), 0.84)
    cylinder("LaunchPad", runway, (0, 0, -1.26), 1.65, 0.18, env)
    for i in range(8):
        angle = i * math.tau / 8
        sphere(f"RunwayLight{i}", gold, (math.sin(angle) * 2.05, math.cos(angle) * 2.05, -1.14), (0.10,) * 3, env)
    for i, x in enumerate((-2.0, -1.45, 1.45, 2.0)):
        sphere(f"SnowBank{i}", snow, (x, 0.68 + (i % 2) * 0.35, -1.02), (0.65, 0.44, 0.48), env)
    return root, env, action


def setup_render(symbol):
    scene = bpy.context.scene
    # Blender 5 exposes the current EEVEE renderer under BLENDER_EEVEE.
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.image_settings.color_depth = "8"
    scene.world.color = {
        "PEBR": (0.62, 0.79, 0.50),
        "YETI": (0.42, 0.65, 0.88),
        "XMASR": (0.025, 0.055, 0.14),
    }[symbol]
    bpy.ops.object.camera_add(location=(0, -9.7, 2.0))
    camera = bpy.context.object
    camera.name = "RenderCamera"
    scene.camera = camera
    target = Vector((0, 0, 0.45))
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 56
    for name, kind, energy, color, location in (
        ("Key", "AREA", 1150, (1.0, 0.82, 0.64), (4.5, -4.0, 6.0)),
        ("Fill", "AREA", 850, (0.55, 0.78, 1.0), (-4.5, -2.0, 3.0)),
        ("Rim", "AREA", 1050, (0.55, 1.0, 0.80), (1.0, 3.0, 5.5)),
    ):
        bpy.ops.object.light_add(type=kind, location=location)
        light = bpy.context.object
        light.name = name
        light.data.energy = energy
        light.data.color = color
        light.data.shape = "DISK"
        light.data.size = 4.0
        light.rotation_euler = (target - light.location).to_track_quat("-Z", "Y").to_euler()
    return camera


def export_world(symbol, builder):
    reset_scene()
    root, env, action = builder()
    camera = setup_render(symbol)
    scene = bpy.context.scene
    scene.render.filepath = str(OUT / f"{symbol.lower()}-poster.png")
    bpy.ops.render.render(write_still=True)
    # Camera and lamps are for the poster only. The web viewer supplies its own.
    for obj in [o for o in list(scene.objects) if o.type in {"CAMERA", "LIGHT"}]:
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLENDS / f"{symbol.lower()}-world.blend"))
    bpy.ops.export_scene.gltf(
        filepath=str(OUT / f"{symbol.lower()}-world.glb"),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
    )
    # Transparent pose renders use the exact same geometry and material setup.
    setup_render(symbol)
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
    scene.render.film_transparent = True
    env.hide_render = True
    for index, turn in enumerate((-0.32, 0.0, 0.32), 1):
        root.rotation_euler[2] = turn
        if symbol == "PEBR":
            action.rotation_euler[0] = (-0.35, -0.72, -0.48)[index - 1]
        elif symbol == "YETI":
            action.rotation_euler[1] = (-0.30, 0.0, 0.42)[index - 1]
        else:
            root.location[2] = (0.0, 0.16, 0.34)[index - 1]
        scene.render.filepath = str(POSES / f"{symbol.lower()}-{index}.png")
        bpy.ops.render.render(write_still=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    POSES.mkdir(parents=True, exist_ok=True)
    BLENDS.mkdir(parents=True, exist_ok=True)
    export_world("PEBR", build_pebr)
    export_world("YETI", build_yeti)
    export_world("XMASR", build_xmasr)
    print(f"Built Toris Coin world assets in {OUT}")


if __name__ == "__main__":
    main()
