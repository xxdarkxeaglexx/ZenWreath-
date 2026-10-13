import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{style:{},classList:{add(){},remove(){}},setAttribute(){},addEventListener(){},append(){},firstChild:{},open:true});return elements.get(id)}
let clock=0,xp=0,saved=0,talked=0,generic=0,shown=0;
const storage=new Map(),math=Object.create(Math);math.random=()=>.1;
const c={console,Math:math,s:{seed:1,chapter:0,area:'outdoor',tiles:[[0,0,0],[0,0,2],[0,0,0]],player:{x:48,y:48},enemies:[],gems:0},paused:false,team:{inGame:false},toastTime:5,$:el,document:{body:{classList:{add(){},remove(){}}},addEventListener(){},createElement:()=>el('created'),hidden:false},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>clock},requestAnimationFrame:()=>1,cancelAnimationFrame(){},outsideWorld:()=>c.s.area==='outdoor',interact:()=>generic++,nearestAction:()=>null,smartAction(){},show:()=>shown++,talkNPC:()=>talked++,adventureMenu(){},depthGround:()=>[],toast(){},appDialog(mode,label,title,text,buttons){c.show();el('modal').open=true;el('buttons').firstChild={onclick:buttons[0][1]};el('calmClose')},returnToGame(){el('modal').open=false},save:()=>saved++,earnXP:n=>xp+=n,updateResources(){},haptic(){},tone(){},anim:0};
c.MAP_ICONS={};c.mapMarkers=()=>[];c.mapAreaData=()=>c.s;
const ctx=vm.createContext(c);vm.runInContext(readFileSync('public/adventure-rules.js','utf8'),ctx);const spot=c.designatedFishingSpots(c.s)[0];Object.assign(c.s.player,{x:spot.x,y:spot.y});vm.runInContext(readFileSync('public/fishing.js','utf8'),ctx);
assert.equal(c.nearestAction().kind,'fish');
c.s.enemies=[{x:50,y:50,hp:1}];assert.equal(c.nearestAction(),null,'Nearby enemies prevent fishing');c.s.enemies=[];
c.fishingMenu();c.castFishing();assert(el('buttons').firstChild.disabled);c.reelFishing();assert.equal(xp,0,'No reward before bite');
clock=2800;c.fishingTick(clock);assert.equal(el('buttons').firstChild.disabled,false);c.reelFishing();assert.equal(xp,8);assert.equal(c.s.gems,2);assert.equal(c.fishingLog().total,1);c.reelFishing();assert.equal(xp,8,'A catch can only be rewarded once');
clock=4000;c.castFishing();clock=10000;c.fishingTick(clock);assert.equal(xp,8,'Expired bite gives no reward');assert.equal(el('buttons').firstChild.disabled,false);
c.team.inGame=true;c.castFishing();clock=13000;c.fishingTick(clock);c.reelFishing();assert.equal(xp,16);assert.equal(c.s.gems,2,'Personal fishing leaves shared light unchanged');assert.equal(c.fishingLog().total,2);assert(saved>0);assert(storage.has('zenwreath-fishing'));
c.nearestAction=()=>({kind:'npc',npc:{id:'orin'}});c.interact();assert.equal(talked,1);assert.equal(generic,0,'Talk button routes to NPC dialogue');
c.show();assert.equal(c.toastTime,0);assert.equal(el('toast').style.opacity,'0');assert(shown>0);
c.s.area='inn';assert.equal(c.fishingSpot(),null);c.s.area='outdoor';c.s.player.x=500;assert.equal(c.fishingSpot(),null,'Distant water cannot be fished');
console.log('PASS: shoreline detection, enemy safety, timed bite, expiry, one reward per catch, journal persistence, multiplayer personal rewards, NPC routing and notification clearing.');
