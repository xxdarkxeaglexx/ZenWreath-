import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import {RPG_CLASSES,RPG_WEAPONS,rpgBuild,rpgLevel,normalizeRPG} from '../server/rpg-core.js';
import {mapFor,world} from '../server/realm-core.js';
const html=readFileSync('public/game.html','utf8');
for(const file of readdirSync('public').filter(f=>f.endsWith('.js')))new vm.Script(readFileSync('public/'+file,'utf8'),{filename:file});
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
assert.equal(Object.keys(RPG_CLASSES).length,12);
assert.equal(new Set(Object.values(RPG_CLASSES).map(c=>JSON.stringify(c.base))).size,12);
assert.equal(Object.keys(RPG_WEAPONS).length,19);
for(const [key,c] of Object.entries(RPG_CLASSES)){
 const base=rpgBuild(key,{xp:0,trees:{[key]:c.nodes.map(n=>n.id)}});assert.equal(base.unlocked.length,0);
 assert.equal(c.nodes.length,6);assert.equal(new Set(c.nodes.map(n=>n.name)).size,6);
 const max=rpgBuild(key,{xp:3630,trees:{[key]:c.nodes.map(n=>n.id)}});assert.equal(max.unlocked.length,6);assert.equal(max.points,5);assert(max.health>base.health);assert(max.damage>=base.damage);
 const skipped=rpgBuild(key,{xp:3630,trees:{[key]:[c.nodes[2].id]}});assert.equal(skipped.unlocked.length,0);
 const early=rpgBuild(key,{xp:30,trees:{[key]:[c.nodes[0].id,c.nodes[3].id]}});assert.equal(early.unlocked.length,1);
}
assert.equal(rpgLevel(29),1);assert.equal(rpgLevel(30),2);assert.equal(rpgLevel(270),4);assert.equal(rpgLevel(1080),7);
assert.equal(normalizeRPG({weapon:'bad',xp:-1}).weapon,'blade');
// Client and server generate identical waterways and traversable quest routes.
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const start=source.indexOf('function realmRng'),end=source.indexOf('function chapter');
const ctx=vm.createContext({s:null,maxHealth:()=>5});vm.runInContext(readFileSync('public/enemy-rules.js','utf8'),ctx);vm.runInContext(source.slice(start,end),ctx);
for(const seed of [1,42,83912,2147483646])for(let ch=0;ch<5;ch++){
 const m=mapFor(seed,ch),g=world(seed,ch),client=vm.runInContext(`world(${seed},${ch})`,ctx);
 assert.equal(JSON.stringify(client.tiles),JSON.stringify(g.tiles));assert.equal(JSON.stringify(client.buildings),JSON.stringify(g.buildings));assert(m.tiles.flat().filter(t=>t===2).length>10);
 const q=[[Math.floor(g.player.x/32),Math.floor(g.player.y/32)]],seen=new Set([q[0].join(',')]);
 for(let i=0;i<q.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const p=[q[i][0]+dx,q[i][1]+dy];if(g.tiles[p[1]]?.[p[0]]===0&&!seen.has(p.join(','))){seen.add(p.join(','));q.push(p)}}
 for(const p of [...g.items,...g.buildings,Object.values(g.landmarks)[0],g.landmarks.shrine])assert(seen.has([Math.floor(p.x/32),Math.floor(p.y/32)].join(',')),'Quest destination reachable');
}
// Runtime checks with controlled DOM adapters; no browser layout is asserted here.
const elements=new Map(),nodes=[];function element(id=''){if(elements.has(id))return elements.get(id);const e={id,hidden:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},append(){},prepend(){},textContent:'',set innerHTML(value){this._html=value;for(const m of value.matchAll(/data-(rpgtab|weapon|upgrade|mastery)="([^"]+)"/g)){const b=element('data-'+m[1]+'-'+m[2]);b.dataset[m[1]]=m[2];nodes.push(b)}},get innerHTML(){return this._html||''}};elements.set(id,e);return e}
let saved=0,baseUpdates=0;
const c={console,Math,Date,Map,Set,Object,shieldEquipped:()=>true,toggleShield(){},s:{version:1,seed:1,chapter:0,area:'outdoor',sword:false,upgrades:{},gems:100,player:{x:0,y:0,face:0,hp:5},enemies:[],items:[],magic:{heal:0,burst:0,boost:0,boostTime:0},mana:{points:20}},keeperClass:'aries',CLASS_BOOK:{aries:{name:'Vanguard',icon:'♈'}},paused:false,spellPending:false,guarding:false,swordCharging:false,cooldown:0,attack:0,combo:0,comboLeft:0,attackHeld:false,stamina:100,hitNumbers:[],invincible:0,team:{inGame:false},SPELLS:{heal:{cost:6,wait:12}},document:{createElement:()=>element(),querySelector:()=>element('container'),querySelectorAll:selector=>nodes.filter(n=>n.dataset[selector.slice(6,-1)])},$:element,registerDefeat(){},update(){baseUpdates++},move(){},weaponDamage(){},healPlayer(){},damageBurst(){},selectedEnemy:()=>null,faceHit(){},facingHit:(p,e,range)=>Math.hypot(e.x-p.x,e.y-p.y)<range,bossShielded:()=>false,checkStage(){},tone(){},haptic(){},toast(){},save(){saved++},magicState(){return c.s.magic},manaState(){return c.s.mana},payload:()=>({}),applyRoom(){},targetingKey:()=> '1:0:outdoor',enterTeam(){},castSpell(key){c.s.mana.points-=6;c.s.magic[key]=12},maxHealth:()=>vm.runInContext('rpgStats().health',context),maxMana:()=>vm.runInContext('rpgStats().mana',context),mainMenu(){},appDialog(mode,label,title,text,buttons,body){nodes.length=0;element('extra').innerHTML=body},returnToGame(){},birthdayClassMenu(){},paintKeeperEquipment(){},depthGround:()=>[],outsideWorld:()=>false,groveChime(){},sound:false,equippedWeapon(){}};
const context=vm.createContext(c);vm.runInContext(readFileSync('public/rpg-rules.js','utf8'),context);vm.runInContext(readFileSync('public/rpg.js','utf8'),context);
assert.equal(c.maxHealth(),7);
c.s.items=[{type:'crystal',taken:false}];c.update();c.s.items[0].taken=true;c.update();assert.equal(c.s.rpg.xp,15);c.update();assert.equal(c.s.rpg.xp,15);
c.s.enemies=[{x:125,y:0,hp:8,type:'thorn'}];c.s.rpg.owned.push('spear');c.s.rpg.weapon='spear';c.slash();assert(c.s.enemies[0].hp<8,'Spear hits beyond blade range');
c.cooldown=0;c.s.rpg.weapon='daggers';c.s.enemies[0].hp=8;c.slash();assert.equal(c.s.enemies[0].hp,8,'Daggers cannot hit distant enemy');
c.s.rpg.xp=1080;c.playerStatsMenu('tree');const upgrade=nodes.find(n=>n.dataset.upgrade==='aries-0');upgrade.onclick();assert.equal(c.s.rpg.trees.aries.length,1);assert.equal(vm.runInContext('rpgStats().damage',context),5);
c.playerStatsMenu('gear');const hammer=nodes.find(n=>n.dataset.weapon==='hammer');await hammer.onclick();assert.equal(c.s.gems,82);assert.equal(c.s.rpg.weapon,'hammer');await hammer.onclick();assert.equal(c.s.gems,82,'Owned weapons are not bought twice');
c.s.player.hp=1;c.healPlayer();assert.equal(c.s.player.hp,5);c.castSpell('heal');assert(c.s.magic.heal>0);assert(saved>0);
// Magic toggling contains no resize request; overlay does not contribute to layout.
assert(!readFileSync('public/touch-ui.js','utf8').match(/function setMagicTray[^\n]*resizeGame/));assert(readFileSync('public/touch-ui.css','utf8').includes('body .world .spellBar{position:absolute'));
console.log('PASS: scripts, 12 classes, upgrade prerequisites, 8 weapons, XP persistence, purchase/equip, heal/spells, 20 client/server maps, waterways and reachable objectives, stable Magic tray contract.');

// Shield and simplified menu wiring, exercised through the final runtime overrides.
const store=new Map();c.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};c.myLook={shield:'wreath'};c.currentLook=()=>c.myLook;c.lookPending=false;c.saveLookLocally=()=>store.set('look',JSON.stringify(c.myLook));c.syncLook=()=>Promise.resolve();let guardCalls=0;c.guardButton=element('guard');c.guardButton.onpointerdown=()=>{guardCalls++;c.guarding=true};c.stopGuard=()=>{c.guarding=false};c.DEPTH_PALETTES=Array.from({length:5},()=>({}));c.treeCrowns=new Map();c.paintKeeperDetails=()=>{};c.depthTree=()=>{};c.depthBuilding=()=>{};c.draw=()=>{};c.settings=()=>{};c.everydaySettings=()=>{};c.home=()=>{};c.questBoard=()=>{};
vm.runInContext(readFileSync('public/polish.js','utf8'),context);
c.guardButton.onpointerdown({});assert.equal(guardCalls,1);c.toggleShield();assert.equal(c.myLook.shield,'none');assert.equal(c.guarding,false);assert.equal(c.guardButton.disabled,true);c.guardButton.onpointerdown({});assert.equal(guardCalls,1,'Unequipped shield cannot guard');assert.equal(c.payload('tick').guarding,false);c.toggleShield();assert.equal(c.myLook.shield,'wreath');assert.equal(c.guardButton.disabled,false);assert.equal(JSON.parse(store.get('look')).shield,'wreath');
assert.equal((vm.runInContext("calmCards([['adventure','Adventure','a'],['character','Adventurer','b'],['friends','Together','c'],['sound','Sound','d'],['journal','Journal','e'],['settings','Settings','f']])",context).match(/<button /g)||[]).length,6);
c.realms=Array.from({length:5},()=>({name:'Mosswood'}));c.syncQuest=()=>{};c.exportSave=()=>{};c.profile=()=>{};c.privacyMenu=()=>{};c.installApp=()=>{};c.applyControlChoice=()=>{};c.joystickEnabled=true;c.haptics=false;c.gentleMode=()=>false;c.changeDifficulty=()=>true;c.status=()=>{};c.calmSettings();assert.equal(typeof element('calmCloud').onclick,'function');element('calmJoystick').checked=false;element('calmJoystick').onchange();assert.equal(store.get('zenwreath-joystick'),'off');
console.log('PASS: shield toggle persistence, disabled Guard, room payload, six menu choices and settings actions.');
const {cleanAppearance}=await import('../server/grove.ts');
const wardrobe=readFileSync('public/everyday.js','utf8'),looksContext=vm.createContext({});vm.runInContext(wardrobe.slice(0,wardrobe.indexOf('let myLook')),looksContext);const look=vm.runInContext("safeLook({shield:'none'})",looksContext);assert.equal(look.shield,'none');assert.equal(cleanAppearance(JSON.parse(JSON.stringify(look))).shield,'none');
// Rendering uses an empty off-hand rather than a hidden shield when unequipped.
const equipmentSource=wardrobe.slice(wardrobe.indexOf('function keeperWeaponPose'),wardrobe.indexOf('function saveLookLocally'));
const paintContext=vm.createContext({lookColor:()=> '#b4ad8f'});vm.runInContext(equipmentSource,paintContext);let shieldShapes=0;
const painter=new Proxy({ellipse(){shieldShapes++}}, {get:(o,k)=>o[k]||(()=>{})});paintContext.c=painter;paintContext.look={kind:'human',skin:'peach',outfit:'forest',shield:'none',weapon:'leaf'};vm.runInContext("paintKeeperEquipment(c,look,'front',0,{})",paintContext);assert.equal(shieldShapes,1,'Empty hand has one small ellipse');shieldShapes=0;paintContext.look.shield='wood';vm.runInContext("paintKeeperEquipment(c,look,'front',0,{})",paintContext);assert.equal(shieldShapes,2,'Equipped buckler has two shield ellipses');
console.log('PASS: browser/server appearance accepts no shield and renders an empty off-hand.');
// Front face ornament is never painted in side or rear views.
const fixedWardrobe=readFileSync('public/everyday.js','utf8');
const directions=vm.createContext({lookColor:()=> '#c4b58e'});vm.runInContext(fixedWardrobe.slice(fixedWardrobe.indexOf('function keeperWeaponPose'),fixedWardrobe.indexOf('function saveLookLocally')),directions);
let ornaments=0,radii=[];const facingPainter=new Proxy({arc(){ornaments++},ellipse(x,y,rx){radii.push(rx)}},{get:(o,k)=>o[k]||(()=>{})});directions.c=facingPainter;directions.look={kind:'human',skin:'peach',outfit:'forest',shield:'wreath',weapon:'leaf'};
for(const dir of ['front','back','left','right']){ornaments=0;radii=[];vm.runInContext(`paintKeeperShield(c,look,'${dir}',1,{guard:.8})`,directions);assert.equal(ornaments,dir==='front'?1:0);if(dir==='left'||dir==='right')assert(radii.every(r=>r<3),'Side shield is thin');}
// Equipment pass skips the rear shield because it belongs behind the body.
let shieldPasses=0;directions.paintKeeperShield=()=>{shieldPasses++};vm.runInContext("paintKeeperEquipment(c,look,'back',1,{})",directions);assert.equal(shieldPasses,0);vm.runInContext("paintKeeperEquipment(c,look,'front',1,{})",directions);assert.equal(shieldPasses,1);
const frontBodyStart=fixedWardrobe.indexOf("if(dir==='front'){",fixedWardrobe.indexOf('function paintKeeper(c,'));const rearPass=fixedWardrobe.indexOf("if(dir==='back'&&pose.equipment!==false){paintKeeperEquipment",fixedWardrobe.indexOf('function paintKeeper(c,'));assert(rearPass>=0&&rearPass<frontBodyStart,'Rear shield is painted before the torso');
console.log('PASS: four shield views, edge-on profiles, rear shield occlusion and guarding orientation.');
const {storyStoneBounds,storyObstacles,storyEntry,STONE_CHRONICLES}=await import('../server/story-core.js');
assert.equal(STONE_CHRONICLES.flat().length,15);assert.equal(new Set(STONE_CHRONICLES.flat().map(e=>e.text)).size,15);
for(let ch=0;ch<5;ch++)for(const lore of [3,7,11]){const entry=storyEntry(ch,{lore});assert(entry.title&&entry.text&&entry.hint);assert.equal(entry.key,ch+':'+Math.floor(lore/4));}
const obstacle={x:160,y:160,discovery:'lore',lore:3,type:'chest',taken:false};assert.equal(storyObstacles([obstacle],'outdoor').length,1);obstacle.taken=true;assert.equal(storyObstacles([obstacle],'outdoor').length,1,'Read stones remain solid');assert.equal(storyObstacles([obstacle],'shop').length,0);
// Run actual movement, body collision and repair against the new shared footprints.
const currentHTML=readFileSync('public/game.html','utf8'),movement=currentHTML.match(/<script>([\s\S]*?)<\/script>/)[1],collisionStart=movement.indexOf('function scenicObstacles'),collisionEnd=movement.indexOf('function slash',collisionStart);
const physical=vm.createContext({s:{player:{x:112,y:160},area:'outdoor',items:[obstacle],tiles:Array.from({length:12},()=>Array(12).fill(0))},T:32,worldWidth:()=>384,worldHeight:()=>384,outsideWorld:()=>true,campPoint:()=>({x:1000,y:1000}),shrinePoint:()=>({x:1500,y:1500}),buildingAt:()=>null,velocity:{x:0,y:0},path:[],playerWalking:false,storyObstacles});
vm.runInContext(movement.slice(collisionStart,collisionEnd),physical);
vm.runInContext('move(180,0)',physical);assert(physical.s.player.x<137,'A fast move cannot cross the left face');
physical.s.player={x:160,y:125};vm.runInContext('move(0,160)',physical);assert(physical.s.player.y<144,'Cannot cross the upper face');
physical.s.player={x:160,y:190};vm.runInContext('move(0,-160)',physical);assert(physical.s.player.y>176,'Cannot cross the lower face');
physical.s.player={x:160,y:160};vm.runInContext('resolveBuildingOverlap()',physical);assert.equal(physical.s.player.y,storyStoneBounds(obstacle).approach.y,'Old saves are repaired beside the stone');
// Read reward, journal persistence and re-reading are idempotent.
c.s.items=[{...obstacle,taken:false}];c.s.area='outdoor';c.s.chapter=0;c.s.player.x=160;c.s.player.y=192;c.s.gems=0;c.s.rpg.xp=0;c.s.rpg.rewarded=[];c.s.stoneJournal=[];c.outsideWorld=()=>true;c.nearestAction=()=>null;c.interact=()=>{};c.close=()=>{};c.updateAction=()=>{};c.routeTo=(x,y)=>[{x,y}];c.resolveBuildingOverlap=()=>{};c.quietJournal=()=>{};c.boardTasks=()=>[];c.MAP_ICONS={};c.mapMarkers=()=>[];c.mapAreaData=()=>c.s;c.depthChest=()=>{};c.escapeHTML=s=>s;let lastButtons;
c.appDialog=(mode,label,title,text,buttons,body)=>{lastButtons=buttons};
vm.runInContext(readFileSync('public/story-rules.js','utf8'),context);vm.runInContext(readFileSync('public/stories.js','utf8'),context);
c.readStoryStone(c.s.items[0]);await lastButtons[0][1]();assert.equal(c.s.gems,5);assert.equal(c.s.rpg.xp,20);assert.equal(c.s.stoneJournal[0],'0:0');c.readStoryStone(c.s.items[0]);await lastButtons[0][1]();assert.equal(c.s.gems,5);assert.equal(c.s.rpg.xp,20,'Re-reading does not farm XP');
const approach=c.routeTo(160,135)[0];assert.equal(approach.y,192,'Tap on stone artwork routes to readable approach');
console.log('PASS: 15 unique inscriptions, story hints, collision on all movement speeds, read stones stay solid, old save repair, one-time XP/light, journal and tap routing.');
const {rpgProgress,rpgMasteryNodes,rpgRecovery}=await import('../server/rpg-core.js');
for(const level of [13,100,1000,100000]){const xp=30*(level-1)**2;assert.equal(rpgLevel(xp),level);assert.equal(normalizeRPG({xp}).xp,xp,'XP is not capped');const b=rpgBuild('aries',{xp});assert(b.health>=level);assert(b.damage>=Math.floor((level-1)/3)+2);assert.equal(rpgProgress(xp).fraction,0);const near=rpgProgress(30*level**2-1);assert(near.fraction>.99&&near.fraction<1);}
for(const [key,book] of Object.entries(RPG_CLASSES)){const raw={xp:30*999**2,trees:{[key]:book.nodes.map(n=>n.id)},mastery:{[key]:Object.fromEntries(book.nodes.map(n=>[n.id,100]))}};const stats=rpgBuild(key,raw);assert.equal(stats.masterySpent,600);assert.equal(stats.points,393);assert(stats.health>book.base.health);const next=rpgMasteryNodes(key,raw);assert(next.every(n=>n.rank===101&&n.ready));for(const rate of [stats.attackRate,stats.spellRate,stats.dashRate])assert(rpgRecovery(rate)>0);const longer=rpgBuild(key,{...raw,xp:30*9999**2});assert(longer.health>stats.health&&longer.damage>stats.damage);}
const {ENEMY_BOOK,WILD_ENEMIES,upgradeEnemyRoster}=await import('../server/enemy-core.js');assert.equal(WILD_ENEMIES.length,10);for(const chapter of [0,1,2,3,4]){const g=world(42,chapter);assert(['wolf','toad','shroom'].every(type=>g.enemies.some(e=>e.type===type)));}
const legacy={enemies:Array.from({length:30},(_,i)=>({type:i%7===2?'thorn':'wisp',name:'Wisp',x:i*32,y:200,hp:i===7?0:1,maxHp:2})),areas:{}};upgradeEnemyRoster(legacy);assert.equal(legacy.enemies[7].type,'wolf');assert.equal(legacy.enemies[7].hp,0,'Migration does not revive enemies');assert.equal(legacy.enemies[2].type,'thorn','Sword quest knights remain');const snapshot=JSON.stringify(legacy);upgradeEnemyRoster(legacy);assert.equal(JSON.stringify(legacy),snapshot);
// Exercise every drawing path with a recording context and reject invalid geometry.
const gradient={addColorStop(){}};let paintCommands=0;
const renderCtx=new Proxy({createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(obj,key)=>obj[key]||((...args)=>{paintCommands++;if(['ellipse','arc','moveTo','lineTo','fillRect','translate','scale'].includes(key))for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),'Finite drawing geometry');})});
Object.assign(c,{ctx:renderCtx,anim:1.3,CREATURES:{},enemyReach:e=>ENEMY_BOOK[e.type]?.reach||110,depthShadow(){},depthGlow(){},depthOrb(){},depthSolid(){},depthShade:(color)=>color,depthEllipse:(...args)=>renderCtx.ellipse(...args.slice(0,4),0,0,Math.PI*2),circle:(x,y,r)=>renderCtx.arc(x,y,r,0,Math.PI*2),depthPoly:points=>points.forEach(p=>renderCtx.lineTo(...p)),depthCaption(){},upright:(x,y,fn)=>fn(),enemyHealthFraction:e=>e.hp/e.maxHp});vm.runInContext(readFileSync('public/enemy-rules.js','utf8'),context);vm.runInContext(readFileSync('public/bestiary.js','utf8'),context);
vm.runInContext(readFileSync('public/natural-enemies.js','utf8'),context);
for(const type of WILD_ENEMIES)for(const phase of ['chase','windup','recover'])c.depthEnemy({type,name:ENEMY_BOOK[type].name,x:200,y:200,hp:ENEMY_BOOK[type].hp,maxHp:ENEMY_BOOK[type].hp,phase:1,tactic:{phase,angle:0}});
for(let ch=0;ch<5;ch++){c.s.chapter=ch;c.depthEnemy({type:'boss',name:ch===0?'Briarheart':'Guardian',x:200,y:200,hp:20,maxHp:20,phase:1,tactic:{phase:'windup',angle:0}})}assert(paintCommands>500);
// HUD includes an exact, accessible XP gauge below magic and above currency.
const resourceSource=readFileSync('public/expansion.js','utf8');vm.runInContext(resourceSource.slice(resourceSource.indexOf('function updateResources'),resourceSource.indexOf('const resourceGauges')),context);c.s.rpg.xp=30*99**2+150;c.updateResources();const hud=element('resourceGauges').innerHTML;assert(hud.includes('Experience to level 101'));assert(hud.indexOf('aria-label="Magic"')<hud.indexOf('xpLabel'));assert(hud.indexOf('xpLabel')<hud.indexOf('lightGauge'));assert(hud.includes('150 / 5970 XP'));
console.log('PASS: levels through 100000, uncapped XP and growing stats, all 12 continuing mastery trees, positive cooldowns, 3 new species, safe save migration, all 10 enemy and 5 boss render paths, XP HUD placement and values.');

// Continuing upgrade UI spends one point and persists the next repeatable rank.
c.leaveTeam=async()=>{};c.spinSlash=()=>{};c.spinLeft=0;c.s.rpg.xp=30*19**2;c.s.rpg.trees.aries=RPG_CLASSES.aries.nodes.map(n=>n.id);c.s.rpg.mastery={};c.appDialog=(mode,label,title,text,buttons,body)=>{nodes.length=0;element('extra').innerHTML=body||'';lastButtons=buttons};
vm.runInContext(readFileSync('public/endless.js','utf8'),context);const beforeMastery=vm.runInContext('rpgStats().points',context);c.playerStatsMenu('tree');const rank=nodes.find(n=>n.dataset.mastery==='aries-0');assert(rank&&typeof rank.onclick==='function');rank.onclick();assert.equal(c.s.rpg.mastery.aries['aries-0'],1);assert.equal(vm.runInContext('rpgStats().points',context),beforeMastery-1);assert(nodes.find(n=>n.dataset.mastery==='aries-0'));
// Starting another quest preserves progression instead of resetting character level.
const gameScript=currentHTML.match(/<script>([\s\S]*?)<\/script>/)[1],newStart=gameScript.indexOf('function newGame'),newEnd=gameScript.indexOf('function worldWidth',newStart);const continuing={s:{rpg:{xp:123456,mastery:{aries:{'aries-0':10}}},stars:2,total:3},Math,chapter(){},close(){},paused:true};const continuance=vm.createContext(continuing);vm.runInContext(gameScript.slice(newStart,newEnd),continuance);continuing.newGame();assert.equal(continuing.s.rpg.xp,123456);assert.equal(continuing.s.rpg.mastery.aries['aries-0'],10);
console.log('PASS: continuing mastery UI, rank spending/persistence and character progression retained in new adventures.');
