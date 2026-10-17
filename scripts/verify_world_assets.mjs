import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.env.PEPEBEAR_QA_TOOLS || '/tmp/pepebear-qa','package.json'));
const validator = require('gltf-validator');
const sharp = require('sharp');
const results=[];
for(const [symbol,duration] of [['pebr',2],['yeti',2.4],['xmasr',3]]) {
 const file=`public/worlds/${symbol}-world.glb`;
 const bytes=fs.readFileSync(file);
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 const triangles=gltf.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0);
 assert.ok(bytes.length<=5_000_000,`${symbol} size`);
 assert.ok(triangles<=120_000,`${symbol} triangles`);
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),['Action','Idle']);
 const action=gltf.animations.find(a=>a.name==='Action');
 assert.ok(Math.abs(Math.max(...action.samplers.map(s=>gltf.accessors[s.input].max[0]))-duration)<.001);
 const validation=await validator.validateBytes(new Uint8Array(bytes),{uri:file,maxIssues:10000});
 assert.equal(validation.issues.numErrors,0,JSON.stringify(validation.issues.messages));
 assert.equal(validation.issues.numWarnings,0,JSON.stringify(validation.issues.messages.filter(m=>m.severity<2)));
 const binaryStart=20+bytes.readUInt32LE(12)+8;
 for (const clip of gltf.animations) for (const sampler of clip.samplers) {
   const accessor=gltf.accessors[sampler.output];
   const view=gltf.bufferViews[accessor.bufferView];
   const components={VEC3:3,VEC4:4}[accessor.type];
   assert.ok(components,`${symbol} supported animation values`);
   const offset=binaryStart+(view.byteOffset??0)+(accessor.byteOffset??0);
   const stride=view.byteStride??components*4;
   for (let i=0;i<components;i++) {
     assert.ok(Math.abs(bytes.readFloatLE(offset+i*4)-bytes.readFloatLE(offset+(accessor.count-1)*stride+i*4))<.00001,`${symbol} ${clip.name} returns to its starting pose`);
   }
 }

 for (const img of gltf.images ?? []) {
   const view=gltf.bufferViews[img.bufferView];
   const meta=await sharp(bytes.subarray(binaryStart+(view.byteOffset??0),binaryStart+(view.byteOffset??0)+view.byteLength)).metadata();
   assert.ok(meta.width<=2048&&meta.height<=2048,`${symbol} texture dimensions`);
 }
 for (let i=1;i<=3;i++) {
   const image=await sharp(`public/worlds/poses/${symbol}-${i}.png`).metadata();
   assert.equal(image.width,1080);assert.equal(image.height,1080);assert.ok(image.hasAlpha);
   const stats=await sharp(`public/worlds/poses/${symbol}-${i}.png`).stats();
   assert.equal(stats.channels[3].min,0);assert.equal(stats.channels[3].max,255);
 }
 // A cup/club is an actual descendant of its animated arm, including the fingers.
 const armName=symbol==='pebr'?'CoffeeArm':'GolfArm';
 const arm=gltf.nodes.findIndex(n=>n.name===armName);
 const descendants=(index)=>[index,...(gltf.nodes[index].children??[]).flatMap(descendants)];
 if(symbol!=='xmasr') {
   const names=descendants(arm).map(i=>gltf.nodes[i].name);
   assert.ok(names.some(n=>n===(symbol==='pebr'?'CupInHand':'ClubInHand')));
   assert.ok(action.channels.some(c=>c.target.node===arm),'arm is animated');
 }
 results.push({symbol,bytes:bytes.length,triangles,clips:gltf.animations.map(a=>({name:a.name,channels:a.channels.length,duration:Math.max(...a.samplers.map(s=>gltf.accessors[s.input].max[0]))})),validation:{errors:validation.issues.numErrors,warnings:validation.issues.numWarnings,messages:validation.issues.messages.filter(m=>m.severity<2)}});
}
fs.mkdirSync('artifacts/rebuild',{recursive:true});
fs.writeFileSync('artifacts/rebuild/assets-qa.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
