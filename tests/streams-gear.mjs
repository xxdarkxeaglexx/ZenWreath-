import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const events=[];
const painter=new Proxy({fillRect(){events.push('body')},arc(){events.push('head')}},{get:(o,k)=>o[k]||(()=>{})});
const wardrobe=readFileSync('public/everyday.js','utf8'),start=wardrobe.indexOf('function paintKeeper(c,'),end=wardrobe.indexOf('function paintLeafPin',start);
const c={safeLook:x=>x,keeperDirection:x=>x,lookColor:()=> '#8a9b7c',paintKeeperFront(){events.push('front')},paintKeeperDetails(){events.push('details')},paintKeeperShield(){events.push('shield')},paintKeeperEquipment(){events.push('weapon')},c:painter};
const ctx=vm.createContext(c);vm.runInContext(wardrobe.slice(start,end),ctx);
const look={kind:'human',skin:'peach',hair:'dark',outfit:'forest',style:'bob',accessory:'cape'};
for(const weapon of ['hammer','spear','staff','bow','crossbow'])for(const dir of ['back','front','left','right']){events.length=0;c.paintKeeper(painter,look,dir,1,{equipment:true,rpgWeapon:weapon});assert.equal(events.filter(e=>e==='weapon').length,1,'Weapon drawn once');if(dir==='back'){assert(events.indexOf('weapon')<events.indexOf('body'),'Rear weapon under torso');assert(events.indexOf('weapon')<events.indexOf('head'),'Rear weapon under head');assert(events.indexOf('shield')<events.indexOf('body'),'Rear shield remains occluded')}else assert(events.indexOf('weapon')>events.indexOf('details'),'Visible equipment follows body');}
events.length=0;c.paintKeeper(painter,look,'back',0,{equipment:false});assert(!events.includes('weapon'));
const gradients={addColorStop(){}};let fills=0,strokes=0,clips=0;
const waterCanvas=new Proxy({createLinearGradient:()=>gradients,fill(){fills++},stroke(){strokes++},clip(){clips++}}, {get:(o,k)=>o[k]||((...args)=>{for(const x of args)if(typeof x==='number')assert(Number.isFinite(x),'Finite water geometry')})});
const d={console,Math,WeakMap,Map,s:null,ctx:waterCanvas,anim:2,view:{left:0,top:0,width:1500,height:1000,zoom:1},DEPTH_PITCH:1,DEPTH_PALETTES:[{bank:'#657a55',ground:'#789471',water:'#437c8a',leaf:'#557b44'}],depthShade:x=>x,depthGround:()=>[],outsideWorld:()=>true};
const waterCtx=vm.createContext(d);vm.runInContext(readFileSync('public/streams.js','utf8'),waterCtx);
const map=Array.from({length:20},(_,y)=>Array.from({length:30},(_,x)=>x>3&&x<18&&y>3&&y<16?2:0));map[8][8]=0;map[8][9]=0;
const loops=d.waterContours(map);assert.equal(loops.length,2,'Lake and dry island have separate contours');assert.equal(d.waterContours(map),loops,'Coastline is cached');assert(loops.every(l=>l.length>=4));d.paintNaturalWater(map,0,42);assert(fills>0);assert(strokes>0);assert.equal(clips,1,'Ripples clip to real water');d.paintNaturalWater(Array.from({length:5},()=>Array(5).fill(0)),0,42);assert.equal(clips,1,'No water is drawn on land-only maps');
assert(!readFileSync('public/rpg.js','utf8').includes('paintNaturalStreams'),'Detached overlay removed');
console.log('PASS: rear equipment occlusion, cached closed lake/island coastlines, clipped animated water, no decorative water on dry land.');
