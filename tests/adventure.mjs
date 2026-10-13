import assert from 'node:assert/strict';
import {designatedFishingSpots,rangedTrace,balanceHardEnemies,hardStrikeDamage,hardHealthMultiplier} from '../server/adventure-core.js';
import {world} from '../server/realm-core.js';
import {RPG_WEAPONS} from '../server/rpg-core.js';
for(const seed of [1,42,83912,2147483646,239])for(let ch=0;ch<5;ch++){
 const g=world(seed,ch),spots=designatedFishingSpots(g);assert(spots.length>=1&&spots.length<=3,'Every realm has designated banks');assert.deepEqual(designatedFishingSpots(g),spots,'Spots are stable');
 for(const p of spots){assert.equal(g.tiles[Math.floor(p.y/32)][Math.floor(p.x/32)],0);assert.equal(g.tiles[Math.floor(p.waterY/32)][Math.floor(p.waterX/32)],2);assert(Math.hypot(p.x-p.waterX,p.y-p.waterY)<=32);assert(!g.items.some(i=>Math.hypot(p.x-i.x,p.y-i.y)<55));}
 for(let i=0;i<spots.length;i++)for(let j=i+1;j<spots.length;j++)assert(Math.hypot(spots[i].x-spots[j].x,spots[i].y-spots[j].y)>240);
}
const p={x:0,y:0,face:0},near={x:100,y:0,hp:5,type:'wolf'},far={x:200,y:0,hp:5,type:'wolf'},off={x:50,y:45,hp:5,type:'wolf'};
assert.equal(rangedTrace(p,[far,off,near],300,()=>false).enemy,near,'Only first target along the shot is hit');
assert.equal(rangedTrace(p,[near],300,x=>x>=40).enemy,null,'Cover blocks shots');
assert.equal(rangedTrace(p,[near,far],300,()=>false,e=>e===near).enemy,null,'Shielded boss blocks shot');
assert.equal(rangedTrace(p,[near],70,()=>false).enemy,null,'Range is enforced');
assert.equal(rangedTrace(p,[off],300,()=>false).enemy,null,'Off-axis enemies are not hit');
const g={enemies:[{hp:3,maxHp:6},{hp:0,maxHp:5}]};balanceHardEnemies(g,true,10);assert(g.enemies[0].maxHp>6);const snapshot=JSON.stringify(g);balanceHardEnemies(g,true,10);assert.equal(JSON.stringify(g),snapshot);assert.equal(g.enemies[1].hp,0);balanceHardEnemies(g,false,10);assert.equal(g.enemies[0].maxHp,6);assert.equal(g.enemies[1].hp,0);
assert(hardHealthMultiplier(10)>hardHealthMultiplier(1));assert(hardHealthMultiplier(100000)<=3.5);assert.equal(hardStrikeDamage(false,17),4);assert(hardStrikeDamage(true,17)<17);assert(hardStrikeDamage(false,100000)<100000*.2,'High-level damage stays proportional');
assert.equal(RPG_WEAPONS.bow.ranged,true);assert.equal(RPG_WEAPONS.crossbow.ranged,true);assert(RPG_WEAPONS.crossbow.cooldown>RPG_WEAPONS.bow.cooldown);
console.log('PASS: 25 stable fishing maps, spaced accessible banks, cover/range/single-target shots, shield blocking, idempotent Hard scaling, no enemy resurrection, bounded damage and distinct ranged weapons.');
// Exercise the actual input/attack runtime, including charge and multiplayer dispatch.
const {default:vm}=await import('node:vm');const {readFileSync}=await import('node:fs');
const buttons=new Map(),button=id=>{if(!buttons.has(id))buttons.set(id,{style:{setProperty(){}},setAttribute(){}});return buttons.get(id)};
const a={x:144,y:48,hp:20,maxHp:20,type:'wolf'},b={x:244,y:48,hp:20,maxHp:20,type:'wolf'};let dispatch;
const c={console,Math,performance:{now:()=>1000},s:{seed:1,player:{x:48,y:48,face:0},tiles:Array.from({length:8},()=>Array(20).fill(0)),items:[],enemies:[a,b]},paused:false,cooldown:0,guarding:false,swordCharging:false,attack:0,hitNumbers:[],team:{inGame:false},equippedWeapon:()=>RPG_WEAPONS.bow,rpgStats:()=>({range:0,attackRate:0,level:1}),selectedEnemy:()=>a,bossShielded:()=>false,storyObstacles:()=>[],scenicObstacles:()=>[],weaponDamage:()=>3,registerDefeat(){},rpgRecovery:()=>1,rangedTrace,balanceHardEnemies,slash(){},spinSlash(){},updateAction(){},paintKeeperEquipment(){},draw(){},monsterAim:()=>0,update(){},mediumMode:()=>false,hardMode:()=>false,tone(){},haptic(){},checkStage(){},save(){},roomEvent:(action,args)=>{dispatch={action,args}},$:button,view:{},SPIN_CHARGE:.9,swordCharge:0};
const ctx=vm.createContext(c);vm.runInContext(readFileSync('public/ranged.js','utf8'),ctx);c.slash();assert.equal(a.hp,17);assert.equal(b.hp,20);assert(c.cooldown>0);c.slash();assert.equal(a.hp,17,'Reload prevents duplicate hits');c.cooldown=0;c.spinSlash();assert.equal(a.hp,12,'Charged arrow gains two damage');
c.cooldown=0;c.s.tiles[1][3]=1;c.slash();assert.equal(a.hp,12,'Actual client shot respects cover');c.s.tiles[1][3]=0;c.cooldown=0;c.team.inGame=true;c.spinSlash();assert.equal(dispatch.action,'attack');assert.equal(dispatch.args.charged,true);assert.equal(a.hp,12,'Room damage is applied by the server');c.updateAction();assert.equal(button('slash').textContent,'➶ Shoot');
console.log('PASS: live ranged input, reload, charged damage, no cleave, cover blocking, multiplayer dispatch and Shoot button.');
