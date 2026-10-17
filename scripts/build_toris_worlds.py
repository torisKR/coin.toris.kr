"""Editable, deterministic Blender 5.1 dioramas. No downloaded/generated meshes.

blender --background --python scripts/build_toris_worlds.py -- --symbol PEBR --preview
blender --background --python scripts/build_toris_worlds.py
Also callable through the official Blender Lab MCP: import this module; main().
"""
from __future__ import annotations
import argparse
import json
import math
import random
import sys
from pathlib import Path
import bpy
import bmesh
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/worlds'
BLENDS = ROOT / 'assets/blender'
ART = ROOT / 'artifacts/rebuild'
FPS = 30
PALETTES = {'PEBR': (0.69, 0.79, 0.59), 'YETI': (0.58, 0.75, 0.87), 'XMASR': (0.018, 0.035, 0.08)}


def reset_scene():
    if getattr(bpy.context, 'object', None) and bpy.context.view_layer.objects.active.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for blocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.actions, bpy.data.images, bpy.data.cameras, bpy.data.lights):
        for block in list(blocks):
            if not block.users:
                blocks.remove(block)
    bpy.context.scene.world = bpy.data.worlds.new('Studio environment')
    bpy.context.preferences.filepaths.save_version = 0


def texture(kind):
    """Bake repeatable surface height to a tangent normal texture, usable in glTF.

    Evaluate the authored weave/grain/granular height field once; no procedural
    Blender-only nodes remain in the web material. All maps are 512 square.
    """
    name = f'{kind} baked normal'
    if name in bpy.data.images:
        return bpy.data.images[name]
    n = 512
    y, x = np.mgrid[0:n, 0:n] / n
    rng = np.random.default_rng(41)
    if kind == 'Woven linen':
        h = 0.35 * np.sin(x * math.tau * 64) + 0.35 * np.sin(y * math.tau * 64)
    elif kind == 'Rattan grain':
        h = 0.32 * np.sin((x * 38 + np.sin(y * math.tau * 3) * .3) * math.tau) + rng.random((n,n)) * .12
    elif kind == 'Brushed alloy':
        h = rng.random((n, 1)) * np.ones((1,n)) * .18 + rng.random((n,n)) * .04
    elif kind == 'Fur fibres':
        h = .15*np.sin((x*90 + .35*np.sin(y*math.tau*6))*math.tau) + rng.random((n,n))*.025
    elif kind == 'Golf dimples':
        u, v = (x * 18) % 1 - .5, (y * 18) % 1 - .5
        h = -.45 * np.maximum(0, 1 - (u*u+v*v)/.13) ** 2
    else:
        h = rng.random((n,n)) * .12
    dx = (np.roll(h,-1,1) - np.roll(h,1,1)) * .65
    dy = (np.roll(h,-1,0) - np.roll(h,1,0)) * .65
    normal = np.stack((-dx,-dy,np.ones_like(dx)),axis=-1)
    normal /= np.linalg.norm(normal,axis=-1,keepdims=True)
    rgba = np.concatenate((normal*.5+.5,np.ones((n,n,1))),axis=-1).astype(np.float32)
    img = bpy.data.images.new(name,width=n,height=n,alpha=False)
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = str(OUT / 'textures' / f'{kind.lower().replace(" ","-")}-normal.png')
    img.file_format = 'PNG'
    img.save()
    img.pack()
    return img


def mat(name, color, rough=.45, metal=0., detail=None, emission=0.):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color,1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color,1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*color,1)
        bsdf.inputs['Emission Strength'].default_value = emission
    if detail:
        tex = m.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image = texture(detail)
        normal = m.node_tree.nodes.new('ShaderNodeNormalMap')
        normal.inputs['Strength'].default_value = .26 if detail != 'Golf dimples' else .8
        m.node_tree.links.new(tex.outputs['Color'],normal.inputs['Color'])
        m.node_tree.links.new(normal.outputs['Normal'],bsdf.inputs['Normal'])
    return m


def finish(obj,name,m,parent=None,loc=None,scale=None,rot=None):
    obj.name=name
    if m: obj.data.materials.append(m)
    obj.parent=parent
    if loc is not None: obj.location=loc
    if scale is not None: obj.scale=scale
    if rot is not None: obj.rotation_euler=rot
    if obj.type=='MESH':
        for p in obj.data.polygons: p.use_smooth=True
    return obj


def empty(name,loc=(0,0,0),parent=None):
    obj=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(obj)
    return finish(obj,name,None,parent,loc)


def sphere(name,m,loc,scale,parent=None,segments=24,rings=16,rot=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings)
    return finish(bpy.context.view_layer.objects.active,name,m,parent,loc,scale,rot)


def box(name,m,loc,scale,parent=None,bevel=.1,rot=None):
    bpy.ops.mesh.primitive_cube_add()
    obj=finish(bpy.context.view_layer.objects.active,name,m,parent,loc,scale,rot)
    # Bevel in physical dimensions, rather than distorted object scale.
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=obj.modifiers.new('Rounded joinery','BEVEL'); mod.width=bevel; mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def cyl(name,m,loc,radius,depth,parent=None,rot=None,vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth)
    return finish(bpy.context.view_layer.objects.active,name,m,parent,loc,None,rot)


def tube(name,m,points,radius,parent=None,cyclic=False,resolution=3):
    curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'
    curve.bevel_depth=radius; curve.bevel_resolution=2; curve.resolution_u=resolution
    s=curve.splines.new('POLY'); s.points.add(len(points)-1)
    for p,co in zip(s.points,points): p.co=(*co,1)
    s.use_cyclic_u=cyclic
    obj=bpy.data.objects.new(name,curve); bpy.context.collection.objects.link(obj)
    finish(obj,name,m,parent)
    bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    return obj


def ring(name,m,loc,radius,thickness,parent=None,rot=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius,minor_radius=thickness,major_segments=48,minor_segments=8)
    return finish(bpy.context.view_layer.objects.active,name,m,parent,loc,None,rot)


def lathe(name,m,profile,parent=None,loc=(0,0,0),segments=64):
    vs=[(r*math.cos(i*math.tau/segments),r*math.sin(i*math.tau/segments),z) for r,z in profile for i in range(segments)]
    fs=[]
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            fs.append((a,b,b+segments,a+segments))
    fs += [tuple(reversed(range(segments))),tuple((len(profile)-1)*segments+i for i in range(segments))]
    obj=mesh(name,m,vs,fs,parent,loc)
    uv=obj.data.uv_layers.new(name='Surface UV')
    for p in obj.data.polygons:
        for li in p.loop_indices:
            idx=obj.data.loops[li].vertex_index
            uv.data[li].uv=((idx%segments)/segments,(idx//segments)/(len(profile)-1))
    return obj


def mesh(name,m,vs,fs,parent=None,loc=(0,0,0)):
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update()
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
    return finish(obj,name,m,parent,loc)


def crown(parent,gold,z=4.07):
    pivot=empty('Crown',(0,0,z),parent)
    n=80;vs=[]
    for layer in range(4):
        for i in range(n):
            t=i*math.tau/n
            h=.17+.43*(.5+.5*math.cos(5*t))**1.5
            r=(.53 if layer%2==0 else .47)+(0 if layer<2 else .10)
            vs.append((r*math.sin(t),r*math.cos(t),0 if layer<2 else h))
    fs=[]
    for i in range(n):
        j=(i+1)%n
        fs.extend([(i,j,j+2*n,i+2*n),(i+n,i+3*n,j+3*n,j+n),(i+2*n,j+2*n,j+3*n,i+3*n),(i,i+n,j+n,j)])
    mesh('Five scalloped gold crown',gold,vs,fs,pivot)
    ring('Rolled crown rim',gold,(0,0,.03),.53,.045,pivot)
    for i in range(5):
        t=i*math.tau/5
        sphere(f'Crown finial {i}',gold,(.62*math.sin(t),.62*math.cos(t),.63),(.08,)*3,pivot,16,10)
    return pivot


def smile(parent,dark,ivory,z=2.94,width=.63,y=-1.14):
    def band(name,m,w,top,bottom,depth):
        vs=[];steps=20
        for curve in (top,bottom):
            for i in range(steps+1):
                t=-1+2*i/steps
                vs.append((t*w,y+depth+.08*t*t,z+curve(t)))
        return mesh(name,m,vs,[(i,i+1,i+steps+2,i+steps+1) for i in range(steps)],parent)
    band('Smile dark outline',dark,width,lambda t:.06+.13*t*t,lambda t:-.23+.42*t*t,0)
    band('Curved ivory teeth',ivory,width*.94,lambda t:.035+.14*t*t,lambda t:-.17+.33*t*t,-.015)
    for i,x in enumerate((-.4,-.2,0,.2,.4)):
        t=x/width
        tube(f'Tooth seam {i}',dark,[(x,y-.024+.08*t*t,z-.16+.33*t*t),(x,y-.025+.08*t*t,z+.03+.14*t*t)],.008,parent)


def glasses(parent,dark,lens,silver):
    for side in (-1,1):
        x=side*.53
        box(f'Sunglass lens {side}',lens,(x,-1.015,3.48),(.48,.075,.30),parent,.18,rot=(0,side*-.09,side*-.035))
        pts=[]
        for cx,cz,start in ((.30,.15,0),(-.30,.15,90),(-.30,-.15,180),(.30,-.15,270)):
            for k in range(7):
                t=math.radians(start+k*15)
                pts.append((x+cx+.18*math.cos(t),-1.10,3.48+cz+.16*math.sin(t)))
        tube(f'Thick acetate frame {side}',dark,pts,.046,parent,True)
        tube(f'Sunglass temple {side}',dark,[(side*1.02,-1.04,3.58),(side*1.19,-.55,3.57),(side*1.15,.10,3.44)],.055,parent)
        sphere(f'Frame rivet {side}',silver,(side*.94,-1.15,3.65),(.028,.015,.015),parent,12,8)
    tube('Glasses bridge',dark,[(-.12,-1.105,3.53),(0,-1.13,3.58),(.12,-1.105,3.53)],.05,parent)


def world(symbol):
    root=empty('WorldRoot');env=empty('WorldEnvironment',parent=root)
    base=mat('Diorama edge',{'PEBR':(.14,.24,.12),'YETI':(.20,.36,.46),'XMASR':(.035,.06,.12)}[symbol],.6)
    ground=mat('Garden turf' if symbol=='PEBR' else 'Soft granular snow',(.24,.43,.13) if symbol=='PEBR' else (.83,.91,.97),.88,detail='Snow grain')
    cyl('World plinth',base,(0,0,-.27),3.05,.36,env,vertices=96)
    cyl('Ground surface',ground,(0,0,-.06),2.96,.13,env,vertices=96)
    return root,env


def plant(env,leaf,wood,x,y,scale=1.):
    pot=mat(f'Terracotta {x}',(.40,.23,.13),.82)
    lathe('Garden planter',pot,[(.26,0),(.35,.50),(.39,.52),(.39,.59),(.32,.59),(.29,.50)],env,(x,y,0),32)
    for i in range(8):
        t=i*2.4
        start=Vector((x,y,.48));end=Vector((x+math.sin(t)*.36*scale,y+math.cos(t)*.32*scale,.9+(i%3)*.25*scale))
        tube('Plant stem',wood,[start,end],.018,env)
        obj=sphere('Sculpted garden leaf',leaf,end,(.16*scale,.055*scale,.35*scale),env,16,10)
        obj.rotation_euler=(Vector((math.sin(t),math.cos(t),.8))).to_track_quat('Z','Y').to_euler()


def chair(env,wood,linen):
    # Continuous bent frame, vertical canes and horizontal woven courses.
    box('Linen seat cushion',linen,(0,.22,.63),(1.26,.80,.19),env,.22)
    box('Linen back cushion',linen,(0,.77,1.63),(1.24,.20,.91),env,.23,rot=(math.radians(7),0,0))
    for z in (0.38,.49):
        tube('Rattan seat perimeter',wood,[(1.37*math.cos(t),.18+.91*math.sin(t),z) for t in np.linspace(0,math.tau,72)],.06,env,True)
    for x in (-1.28,1.28):
        tube('Curved chair arm',wood,[(x,-.73,.39),(x,-.91,1.16),(x,-.72,1.51),(x,.58,1.54),(x,.95,1.15)],.075,env)
        for y in (-.48,.69):
            tube('Chair splayed leg',wood,[(x*.88,y,.42),(x*1.09,y+.15,.02)],.105,env)
        for j in range(11):
            y=-.60+j*.125
            tube('Woven chair vertical cane',wood,[(x,y,.54),(x+.015,y,1.40)],.022,env)
        for j in range(8):
            z=.58+j*.095
            tube('Woven chair horizontal course',wood,[(x+.027*math.sin(k*math.pi/2),-.64+k*.065,z) for k in range(22)],.021,env)
    tube('Rounded chair back frame',wood,[(-1.32,.84,.55),(-1.32,.99,2.25),(-1.10,1.05,2.53),(0,1.08,2.63),(1.10,1.05,2.53),(1.32,.99,2.25),(1.32,.84,.55)],.085,env)


def build_pebr():
    root,env=world('PEBR');char=empty('CharacterRoot',parent=root)
    green=mat('Lime soft vinyl',(.24,.53,.045),.42,detail='Vinyl grain')
    cream=mat('Warm cream muzzle and belly',(.91,.84,.43),.60)
    dark=mat('Forest acetate and paw pads',(.018,.055,.025),.27)
    lens=mat('Smoky polarized lenses',(.032,.046,.034),.16,.48)
    gold=mat('Polished warm gold',(.90,.55,.075),.23,.84)
    silver=mat('Acetate rivets',(.68,.72,.63),.22,.8)
    teeth=mat('Ivory teeth',(.97,.95,.83),.32)
    wood=mat('Honey rattan',(.43,.235,.085),.58,detail='Rattan grain')
    linen=mat('Linen upholstery',(.72,.66,.47),.92,detail='Woven linen')
    leaf=mat('Garden foliage',(.075,.27,.045),.67)
    chair(env,wood,linen)
    sphere('Pear shaped seated torso',green,(0,.02,1.71),(1.17,.80,1.18),char,32,24)
    sphere('Cream belly',cream,(0,-.692,1.58),(.84,.18,.90),char,32,20)
    sphere('Head into shoulders',green,(0,-.01,3.12),(1.23,.90,1.02),char,40,28)
    sphere('Cream cheek silhouette',cream,(0,-.74,2.96),(.99,.30,.55),char,32,20)
    smile(char,dark,teeth)
    for side in (-1,1):
        sphere(f'Round ear {side}',green,(side*.92,.015,3.83),(.40,.25,.43),char)
        sphere(f'Ear inset {side}',dark,(side*.92,-.205,3.85),(.245,.045,.27),char)
        sphere(f'Muzzle lobe {side}',cream,(side*.22,-.99,3.17),(.32,.18,.24),char)
        sphere(f'Seated thigh {side}',green,(side*.79,-.40,.91),(.61,.65,.57),char)
        sphere(f'Forward foot {side}',green,(side*.82,-.97,.59),(.51,.48,.54),char)
        sphere(f'Cream sole {side}',cream,(side*.82,-1.382,.60),(.39,.075,.44),char)
        sphere(f'Central paw pad {side}',dark,(side*.82,-1.459,.47),(.22,.025,.24),char,20,12)
        for j in range(3):
            sphere(f'Toe pad {side} {j}',dark,(side*.82+(j-1)*.19,-1.46,.83-abs(j-1)*.06),(.077,.025,.10),char,16,10)
    sphere('Rounded forest nose',dark,(0,-1.205,3.31),(.20,.13,.135),char)
    for x in (-.07,.07): sphere('Nose nostril',dark,(x,-1.32,3.28),(.034,.018,.024),char,12,8)
    glasses(char,dark,lens,silver);crown(char,gold,4.0)
    sphere('Resting shoulder',green,(-.97,.00,2.23),(.48,.46,.54),char)
    sphere('Resting forearm',green,(-1.16,-.46,1.87),(.41,.48,.38),char)
    sphere('Resting paw',green,(-1.13,-.81,1.69),(.38,.25,.29),char)
    for j in range(3): sphere('Resting fingers',green,(-1.35+j*.19,-.97,1.61),(.13,.15,.17),char,16,10)
    arm=empty('CoffeeArm',(1.00,-.04,2.30),char)
    sphere('Connected upper arm',green,(.17,-.02,-.08),(.43,.41,.48),arm)
    sphere('Lifted forearm',green,(.43,-.33,.14),(.32,.37,.48),arm,rot=(0,-.48,0))
    sphere('Cup supporting palm',green,(.60,-.58,.45),(.29,.25,.27),arm)
    ceramic=mat('Glazed ivory porcelain',(.94,.91,.78),.23)
    coffee=mat('Roasted coffee',(.065,.021,.007),.22)
    cup=empty('CupInHand',(.49,-.77,.53),arm)
    lathe('Porcelain cup wall',ceramic,[(.19,0),(.24,.025),(.31,.15),(.34,.42),(.34,.47),(.30,.47),(.29,.17),(.17,.06)],cup)
    ring('Cup porcelain lip',ceramic,(0,0,.47),.321,.021,cup)
    cyl('Coffee surface',coffee,(0,0,.432),.295,.018,cup)
    handle=ring('Cup closed handle',ceramic,(.35,0,.25),.145,.043,cup,(math.pi/2,0,0))
    for j in range(3): sphere('Fingers around handle',green,(.89,-.76,.67+j*.105),(.12,.13,.087),arm,16,10)
    sphere('Thumb on cup handle',green,(.75,-.93,.86),(.14,.12,.10),arm,16,10)
    wrist=empty('CoffeeWrist',(.60,-.58,.45),arm)
    for obj in list(arm.children):
        if obj.name.startswith(('Cup supporting palm','Fingers around handle','Thumb on cup handle','CupInHand')):
            obj.parent=wrist;obj.location-=wrist.location
    # Cafe table with saucer and a leafy flowering planter.
    table=empty('Cafe table',(2.06,-.12,0),env)
    cyl('Cast iron table foot',dark,(0,0,.10),.42,.12,table)
    cyl('Cast iron pedestal',dark,(0,0,.68),.075,1.12,table)
    cyl('Wood table edge',wood,(0,0,1.25),.70,.14,table)
    cyl('Wood tabletop',wood,(0,0,1.33),.68,.04,table)
    lathe('Coffee saucer',ceramic,[(.04,0),(.23,0),(.32,.045),(.33,.065),(.27,.05),(.12,.02)],table,(-.18,-.22,1.36),40)
    plant(env,leaf,wood,-2.10,.52,.85);plant(env,leaf,wood,1.85,1.30,.72)
    for i in range(10):
        t=i*2.4;x=math.sin(t)*2.5;y=math.cos(t)*2.1
        sphere('Garden moss',leaf,(x,y,.04),(.27,.23,.12),env,12,8)
    return root,env,char,{'arm':arm,'wrist':wrist}


def fur_tufts(parent,m,center,scale,count,seed):
    rng=random.Random(seed)
    for i in range(count):
        u=rng.uniform(-1,1);t=rng.uniform(0,math.tau);r=math.sqrt(1-u*u)
        normal=Vector((r*math.cos(t),r*math.sin(t),u))
        if normal.y < -.25 and abs(normal.x) < .82:
            continue
        # Fine clumps follow the silhouette without thousands of hair curves.
        p=Vector(center)+Vector((normal.x*scale[0],normal.y*scale[1],normal.z*scale[2]))*.91
        tuft=sphere('Layered fur lock',m,p,(rng.uniform(.13,.19),.10,rng.uniform(.24,.35)),parent,10,6)
        for vertex in tuft.data.vertices:
            if vertex.co.z < 0:
                vertex.co.x *= 1 + vertex.co.z * .8
                vertex.co.y *= 1 + vertex.co.z * .8
        direction=Vector((normal.x*.35,normal.y*.35,-.95+normal.z*.2))
        tuft.rotation_euler=direction.to_track_quat('Z','Y').to_euler()


def build_yeti():
    root,env=world('YETI');char=empty('CharacterRoot',parent=root)
    fur=mat('Snow white fur',(.86,.91,.96),.86,detail='Fur fibres')
    skin=mat('Warm mauve skin',(.49,.31,.25),.61)
    dark=mat('Deep brow and mouth',(.028,.025,.03),.5)
    white=mat('Eyes ivory',(.95,.97,1),.28)
    gold=mat('Yeti crown gold',(.91,.56,.075),.24,.82)
    silver=mat('Brushed golf steel',(.54,.64,.72),.24,.91,detail='Brushed alloy')
    grip=mat('Charcoal wrapped grip',(.026,.035,.04),.75,detail='Woven linen')
    green=mat('Lime dimpled golf ball',(.28,.78,.022),.42,detail='Golf dimples')
    sphere('Heavy fur torso',fur,(0,.0,1.62),(1.17,.77,1.31),char,32,24)
    sphere('Yeti head',fur,(0,.0,3.17),(1.05,.78,1.02),char,32,24)
    fur_tufts(char,fur,(0,0,1.62),(1.17,.77,1.31),140,51)
    fur_tufts(char,fur,(0,0,3.17),(1.05,.78,1.02),110,61)
    sphere('Warm muzzle',skin,(0,-.74,2.99),(.68,.18,.46),char)
    for side in (-1,1):
        sphere('Eye socket',skin,(side*.40,-.67,3.48),(.38,.16,.39),char)
        sphere('Dark eye rim',dark,(side*.40,-.805,3.48),(.32,.075,.31),char)
        sphere('Expressive eye white',white,(side*.40,-.87,3.51),(.265,.05,.265),char)
        sphere('Brown iris',dark,(side*.36,-.922,3.52),(.125,.028,.14),char,20,12)
        sphere('Eye glint',white,(side*.36-.028,-.949,3.57),(.035,.012,.035),char,12,8)
        sphere('Angled furry brow',fur,(side*.39,-.905,3.77),(.40,.13,.13),char,rot=(0,side*-.25,0))
        sphere('Sturdy thigh',fur,(side*.70,.02,.61),(.55,.55,.68),char)
        sphere('Heavy foot',fur,(side*.72,-.29,.24),(.53,.65,.29),char)
        fur_tufts(char,fur,(side*.7,.02,.64),(.52,.53,.65),22,40+side)
        for j in range(4): sphere('Bare rounded toe',skin,(side*.72+(j-1.5)*.205,-.82,.17),(.12,.18,.14),char,16,10)
    sphere('Broad nose',skin,(0,-.97,3.30),(.25,.12,.14),char)
    for x in (-.11,.11): sphere('Nostril',dark,(x,-1.07,3.29),(.05,.022,.031),char,12,8)
    tube('Determined curved mouth',dark,[(-.49,-.91,2.92),(-.28,-.947,3.01),(0,-.96,3.05),(.28,-.947,3.01),(.49,-.91,2.92)],.024,char)
    crown(char,gold,4.04)
    for side in (-1,1):
        sphere('Broad fur shoulder',fur,(side*.98,.0,2.25),(.51,.48,.67),char)
    arm=empty('GolfArm',(1.02,-.02,2.17),char)
    sphere('Golf forearm',fur,(.24,-.26,-.35),(.37,.41,.60),arm,rot=(.2,-.4,0))
    sphere('Golf palm',skin,(.28,-.60,-.64),(.27,.25,.31),arm)
    club=empty('ClubInHand',(.27,-.60,-.70),arm)
    # Shaft runs through the palm; the sole rests adjacent to the ball.
    tube('Steel golf shaft',silver,[(0,0,.36),(-.55,-.24,-1.23)],.035,club)
    tube('Wrapped golf grip',grip,[(0,0,.40),(-.15,-.065,-.04)],.061,club)
    box('Grooved iron head',silver,(-.67,-.29,-1.26),(.25,.11,.13),club,.075,rot=(0,-.15,0))
    for j in range(4):
        tube('Iron face groove',dark,[(-.86,-.412,-1.33+j*.047),(-.49,-.412,-1.33+j*.047)],.009,club)
    for j in range(4): sphere('Fingers gripping club',skin,(.27,-.79,-.48-j*.10),(.25,.12,.069),arm,16,10)
    sphere('Club thumb',skin,(.09,-.72,-.48),(.12,.12,.20),arm,16,10)
    sphere('Free furry forearm',fur,(-1.14,-.30,1.72),(.40,.45,.55),char)
    sphere('Free hand',skin,(-1.10,-.66,1.46),(.28,.23,.29),char)
    putting=mat('Winter putting turf',(.085,.28,.15),.9,detail='Woven linen')
    cyl('Putting circle',putting,(0,-.35,.025),2.24,.055,env,vertices=80)
    ball=sphere('ActionBall',green,(.28,-1.02,.21),(.19,)*3,env)
    snow=mat('Snow banks',(.89,.95,1),.92,detail='Snow grain')
    ice=mat('Icy stone',(.22,.38,.47),.45)
    for i in range(13):
        t=i*math.tau/13
        sphere('Snow capped boundary',snow,(math.sin(t)*2.60,math.cos(t)*2.45,.12),(.51,.43,.22),env,16,10)
    pole=cyl('Putting flagpole',silver,(-1.81,-.90,.67),.021,1.30,env,vertices=16)
    mesh('Red golf flag',mat('Flag red',(.65,.025,.018),.8),[(0,0,0),(0,0,-.34),(.53,0,-.17)],[(0,1,2)],env,(-1.81,-.90,1.31))
    for i in (-1,1):
        x=i*2.0;y=1.25
        cyl('Snow pine trunk',ice,(x,y,.44),.07,.8,env,vertices=16)
        for j in range(3):
            lathe('Snow pine tier',snow,[(.55-j*.10,.45+j*.38),(.025,1.45+j*.33)],env,(x,y,0),24)
    return root,env,char,{'arm':arm,'ball':ball}


def ribbon(name,m,points,width,parent):
    vs=[]
    for i,p in enumerate(points):
        p=Vector(p)
        tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])
        side=Vector((tangent.z,0,-tangent.x)).normalized()*width/2
        vs.extend([tuple(p-side),tuple(p+side)])
    obj=mesh(name,m,vs,[(2*i,2*i+1,2*i+3,2*i+2) for i in range(len(points)-1)],parent)
    mod=obj.modifiers.new('Satin ribbon thickness','SOLIDIFY');mod.thickness=.022
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def build_xmasr():
    root,env=world('XMASR');char=empty('CharacterRoot',(0,0,.24),root)
    silver=mat('Brushed rocket alloy',(.58,.67,.76),.27,.88,detail='Brushed alloy')
    gold=mat('Champagne gold fittings',(.82,.47,.09),.24,.84)
    dark=mat('Nozzle graphite',(.024,.035,.045),.38,.68)
    red=mat('Crimson satin',(.52,.015,.025),.30,.12,detail='Woven linen')
    green=mat('Evergreen satin',(.018,.26,.045),.32,.1,detail='Woven linen')
    body=lathe('Ogive rocket hull',silver,[(.40,.55),(.53,.72),(.61,1.2),(.64,2.0),(.62,2.9),(.57,3.5),(.47,3.95),(.31,4.36),(.12,4.64),(.005,4.80)],char)
    for z,r in ((.74,.53),(1.08,.60),(3.47,.57)):
        ring('Hull reinforcement band',gold,(0,0,z),r,.035,char)
    for i in range(10):
        t=i*math.tau/10
        tube('Hull panel seam',dark,[(r*math.sin(t),r*math.cos(t),z) for r,z in ((.535,.80),(.615,1.5),(.638,2),(.618,2.9),(.568,3.44))],.008,char)
        for z,r in ((.92,.574),(3.40,.58)):
            sphere('Hull rivet',gold,(r*math.sin(t),r*math.cos(t),z),(.021,)*3,char,10,6)
    # Curved extruded fins, with a continuous join into the lower hull.
    for i in range(3):
        t=i*math.tau/3
        pivot=empty('Rocket fin',parent=char);pivot.rotation_euler.z=t
        profile=[(.46,.57),(.57,1.76),(.77,1.55),(1.04,.75),(1.10,.32),(.87,.34)]
        vs=[(x,y,z) for y in (-.075,.075) for x,z in profile]
        fs=[tuple(reversed(range(6))),tuple(range(6,12))]+[(j,(j+1)%6,(j+1)%6+6,j+6) for j in range(6)]
        fin=mesh('Swept alloy fin',silver,vs,fs,pivot)
        mod=fin.modifiers.new('Fin softened edge','BEVEL');mod.width=.05;mod.segments=3
        bpy.context.view_layer.objects.active=fin;bpy.ops.object.modifier_apply(modifier=mod.name)
    lathe('Bell nozzle',dark,[(.35,.79),(.28,.47),(.43,.21),(.46,.18),(.36,.18),(.23,.44)],char)
    ring('Nozzle gold rim',gold,(0,0,.20),.42,.035,char)
    # Faceted raised star with a gold edge and central bevel peak.
    pts=[]
    for i in range(10):
        t=math.pi/2+i*math.pi/5;r=.52 if i%2==0 else .23
        pts.append((r*math.cos(t),-.56,4.0+r*math.sin(t)))
    vs=pts+[(0,-.76,4.0)]
    star=mesh('Raised five point star',gold,vs,[(i,(i+1)%10,10) for i in range(10)],char)
    for p in star.data.polygons:p.use_smooth=False
    cord=mat('Holiday cable',(.025,.055,.026),.6)
    points=[]
    for i in range(181):
        z=.94+i/180*2.65;t=i/180*math.tau*4.25;r=.65 if z<2.9 else .64-(z-2.9)*.15
        points.append((math.sin(t)*r,math.cos(t)*r,z))
    tube('Continuous spiral light cable',cord,points,.018,char)
    lights=empty('HolidayLights',parent=char)
    bulbm=[mat('Ruby bulbs',(.85,.02,.018),.22,emission=2),mat('Emerald bulbs',(.015,.8,.13),.22,emission=2),mat('Amber bulbs',(.95,.44,.01),.22,emission=2),mat('Ice bulbs',(.04,.4,.95),.22,emission=2)]
    for i in range(44):
        p=Vector(points[round(i/43*180)])
        sphere('Connected holiday bulb',bulbm[i%4],p,(.052,.052,.074),lights,12,8)
    for side,m in ((-1,red),(1,green)):
        knot=empty('Satin bow',(side*.79,-.22,1.05),char)
        sphere('Bow central knot',m,(0,0,0),(.13,.12,.13),knot,16,10)
        for s in (-1,1):
            # Open ribbon loops with volume, not solid spheres.
            ribbon('Folded satin ribbon loop',m,[(s*(.24-.23*math.cos(t)),.08*math.sin(t),.09+.18*math.sin(t)) for t in np.linspace(-math.pi/2,math.tau-math.pi/2,33)],.13,knot)
        ribbon('Long satin ribbon tail',m,[(side*(.05+.28*t*t),.09*math.sin(t*4),-.04-.80*t) for t in np.linspace(0,1,24)],.19,knot)
    flame=empty('Ignition',(0,0,.15),char)
    orange=mat('Ignition amber',(.95,.16,.008),.35,emission=4)
    core=mat('Ignition hot core',(1,.7,.12),.3,emission=5)
    lathe('Outer ignition plume',orange,[(.015,-1.12),(.16,-.63),(.28,-.30),(.22,0)],flame,segments=32)
    lathe('White hot plume',core,[(.01,-.89),(.11,-.42),(.16,0)],flame,segments=32)
    flame.scale=(.001,)*3
    cyl('Raised launch pad',dark,(0,0,.12),1.72,.26,env,vertices=80)
    ring('Launch pad brass perimeter',gold,(0,0,.26),1.67,.035,env)
    snow=mat('Fresh launch snow',(.80,.88,.97),.92,detail='Snow grain')
    for i in range(12):
        t=i*math.tau/12
        x=2.3*math.sin(t);y=2.3*math.cos(t)
        cyl('Runway lamp post',dark,(x,y,.20),.045,.37,env,vertices=12)
        sphere('Runway amber glass',bulbm[2],(x,y,.41),(.075,.075,.10),env,12,8)
        sphere('Snow drift',snow,(x*.97,y*.97,.045),(.43,.34,.14),env,16,10)
    for side in (-1,1):
        x=side*2.1;y=1.1
        for j in range(3):lathe('Snow covered fir',snow,[(.55-j*.11,.15+j*.35),(.02,1.12+j*.31)],env,(x,y,0),24)
        box('Gift box',red if side<0 else green,(side*2.02,-.80,.20),(.28,.25,.20),env,.025)
        box('Gift gold ribbon',gold,(side*2.02,-.80,.409),(.045,.255,.01),env,.005)
    return root,env,char,{'flame':flame,'lights':lights}


def clip(obj,name,channels,length):
    """One NLA track per public clip name; Blender's glTF exporter merges by name."""
    obj.animation_data_create();obj.animation_data.action=None
    rest={prop:tuple(getattr(obj,prop)) for prop in channels}
    for prop,keys in channels.items():
        for frame,value in keys:
            setattr(obj,prop,value);obj.keyframe_insert(data_path=prop,frame=frame)
    action=obj.animation_data.action;action.name=f'{obj.name}_{name}'
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for kp in fc.keyframe_points:
                        kp.interpolation='BEZIER';kp.handle_left_type='AUTO_CLAMPED';kp.handle_right_type='AUTO_CLAMPED'
    obj.animation_data.action=None
    track=obj.animation_data.nla_tracks.new();track.name=name
    strip=track.strips.new(action.name,0,action);strip.action_frame_start=0;strip.action_frame_end=length
    strip.frame_start=0;strip.frame_end=length;strip.extrapolation='NOTHING'
    for prop,value in rest.items():setattr(obj,prop,value)


def animations(symbol,char,parts):
    scene=bpy.context.scene;scene.render.fps=FPS;scene.frame_start=0;scene.frame_end=96
    base=tuple(char.location);scale=tuple(char.scale)
    clip(char,'Idle',{'scale':[(0,scale),(48,(1.008,1.006,1.012)),(96,scale)],'location':[(0,base),(48,(base[0],base[1],base[2]+.012)),(96,base)]},96)
    length={'PEBR':60,'YETI':72,'XMASR':90}[symbol]
    if symbol=='PEBR':
        clip(parts['arm'],'Action',{'rotation_euler':[(0,(0,0,0)),(9,(0,.08,-.03)),(25,(0,-.43,-.08)),(36,(0,-.38,-.045)),(46,(0,-.45,-.07)),(60,(0,0,0))]},length)
        clip(parts['wrist'],'Action',{'rotation_euler':[(0,(0,0,0)),(9,(0,-.08,0)),(25,(0,.43,0)),(36,(0,.38,0)),(46,(0,.45,0)),(60,(0,0,0))]},length)
        clip(char,'Action',{'rotation_euler':[(0,(0,0,0)),(12,(0,.025,0)),(30,(0,-.035,-.025)),(60,(0,0,0))]},length)
    elif symbol=='YETI':
        clip(parts['arm'],'Action',{'rotation_euler':[(0,(0,0,0)),(18,(.1,-.20,-.42)),(25,(.12,-.30,-.48)),(35,(-.08,.70,.40)),(45,(0,.90,.53)),(56,(0,.35,.20)),(72,(0,0,0))]},length)
        clip(char,'Action',{'rotation_euler':[(0,(0,0,0)),(23,(0,-.045,-.10)),(37,(0,.035,.09)),(53,(0,0,.03)),(72,(0,0,0))]},length)
        b=tuple(parts['ball'].location)
        clip(parts['ball'],'Action',{'location':[(0,b),(32,b),(43,(-1.1,-1.20,.29)),(54,(-1.85,-.93,.21)),(60,(-1.85,-.93,.21)),(72,b)],'scale':[(0,(.19,)*3),(60,(.19,)*3),(65,(.001,)*3),(68,(.001,)*3),(72,(.19,)*3)]},length)
    else:
        clip(char,'Action',{'location':[(0,base),(17,(0,0,base[2]-.035)),(31,base),(55,(0,0,base[2]+1.0)),(67,(0,0,base[2]+1.12)),(90,base)],'rotation_euler':[(0,(0,0,0)),(20,(0,.018,0)),(28,(0,-.018,0)),(40,(0,.012,0)),(60,(0,0,0)),(90,(0,0,0))]},length)
        clip(parts['flame'],'Action',{'scale':[(0,(.001,)*3),(16,(.001,)*3),(24,(.42,.42,.32)),(36,(1,1,.65)),(55,(1,1,1)),(67,(.8,.8,.7)),(83,(.001,)*3),(90,(.001,)*3)]},length)
        for i,bulb in enumerate(parts['lights'].children):
            base_scale=tuple(bulb.scale);pulse=tuple(v*1.18 for v in base_scale);offset=i%3*2
            clip(bulb,'Action',{'scale':[(0,base_scale),(6+offset,pulse),(12+offset,base_scale),(18+offset,pulse),(30,base_scale),(90,base_scale)]},length)
    scene.frame_set(0)


def setup_render(symbol,root):
    scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE'
    scene.eevee.taa_render_samples=64
    scene.render.resolution_x=1200;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
    scene.render.film_transparent=False
    scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
    scene.world.use_nodes=True
    bg=scene.world.node_tree.nodes.get('Background');bg.inputs['Color'].default_value=(*PALETTES[symbol],1);bg.inputs['Strength'].default_value=.45
    bpy.ops.object.camera_add(location=(5.3,-12,6.3))
    cam=bpy.context.view_layer.objects.active;cam.name='RenderCamera';scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=7.5
    target=Vector((0,0,2.1 if symbol=='XMASR' else 1.9))
    cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    for name,energy,color,loc,size in [('Key softbox',1000,(1,.86,.67),(-3,-4,7),5),('Fill softbox',700,(.69,.84,1),(4,-2,5),4),('Rim softbox',1150,(.8,.92,1),(1,4,7),3)]:
        bpy.ops.object.light_add(type='AREA',location=loc)
        light=bpy.context.view_layer.objects.active;light.name=name;light.data.energy=energy;light.data.color=color;light.data.shape='DISK';light.data.size=size
        light.rotation_euler=(Vector((0,0,2))-light.location).to_track_quat('-Z','Y').to_euler()
    return cam


def render(path,size=1200,transparent=False):
    scene=bpy.context.scene
    scene.render.resolution_x=size;scene.render.resolution_y=size;scene.render.film_transparent=transparent
    scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)


def export_world(symbol,preview=False):
    reset_scene()
    root,env,char,parts={'PEBR':build_pebr,'YETI':build_yeti,'XMASR':build_xmasr}[symbol]()
    animations(symbol,char,parts)
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH' or obj.data.uv_layers:
            continue
        if not any(m and any(n.type == 'TEX_IMAGE' for n in m.node_tree.nodes) for m in obj.data.materials):
            continue
        uv=obj.data.uv_layers.new(name='Baked surface UV')
        coords=np.array([v.co[:] for v in obj.data.vertices]);low=coords.min(axis=0);span=np.maximum(coords.max(axis=0)-low,.001)
        for poly in obj.data.polygons:
            axis=int(np.argmax(np.abs(poly.normal)));axes=[i for i in range(3) if i != axis]
            for li in poly.loop_indices:
                vertex=obj.data.loops[li].vertex_index
                uv.data[li].uv=tuple(((coords[vertex]-low)/span)[axes])
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and any(len(p.vertices)>4 for p in obj.data.polygons):
            bm=bmesh.new();bm.from_mesh(obj.data)
            bmesh.ops.triangulate(bm,faces=[f for f in bm.faces if len(f.verts)>4])
            bm.to_mesh(obj.data);bm.free();obj.data.update()
    cam=setup_render(symbol,root)
    scene=bpy.context.scene
    bpy.context.view_layer.update()
    if preview:
        render(ART / f'{symbol.lower()}-preview.png',720)
        bpy.ops.wm.save_as_mainfile(filepath=str(ART/f'{symbol.lower()}-preview.blend'))
        return
    scene.render.filepath=str(OUT/f'{symbol.lower()}-poster.png')
    scene.render.film_transparent=True
    # Preserve cameras, lights, unhidden environment, materials and both NLA clips.
    bpy.ops.wm.save_as_mainfile(filepath=str(BLENDS/f'{symbol.lower()}-world.blend'))
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [root,*root.children_recursive]:obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(OUT/f'{symbol.lower()}-world.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=True,export_animation_mode='NLA_TRACKS',export_frame_range=False,export_force_sampling=True,export_anim_slide_to_zero=True,export_image_format='AUTO',export_extras=True,export_tangents=True)
    render(OUT/f'{symbol.lower()}-poster.png', transparent=True)
    # Every pose is rendered from the same animated character. Recursively hide
    # environment children; hiding the parent empty alone does not hide meshes.
    for obj in [env,*env.children_recursive]:obj.hide_render=True
    cam.data.ortho_scale=6.5 if symbol=='XMASR' else 6.0
    for index,(frame,turn) in enumerate(((0,-.18),(0,0),({'PEBR':30,'YETI':38,'XMASR':52}[symbol],.12)),1):
        scene.frame_set(frame);root.rotation_euler.z=turn
        render(OUT/'poses'/f'{symbol.lower()}-{index}.png',1080,True)
    for obj in [env,*env.children_recursive]:obj.hide_render=False
    root.rotation_euler.z=0;scene.frame_set(0)
    print('WORLD_COMPLETE',symbol,flush=True)


def main(argv=None):
    parser=argparse.ArgumentParser();parser.add_argument('--symbol',choices=['PEBR','YETI','XMASR']);parser.add_argument('--preview',action='store_true')
    args=parser.parse_args(argv if argv is not None else (sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []))
    for folder in (OUT,OUT/'poses',OUT/'textures',BLENDS,ART):folder.mkdir(parents=True,exist_ok=True)
    for symbol in ([args.symbol] if args.symbol else ['PEBR','YETI','XMASR']):export_world(symbol,args.preview)

if __name__=='__main__':main()
