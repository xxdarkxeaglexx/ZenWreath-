import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {normalizeRPG,normalizeInventory,RPG_WEAPONS,REALM_GEAR,gearReward,gearUpgradeCost,rpgBuild} from '../server/rpg-core.js';
const a=normalizeRPG({});assert(a.inventory);assert.deepEqual(a.inventory.materials,[0,0,0,0,0]);
assert.deepEqual(normalizeInventory({materials:[-3,NaN,Infinity,4.2],upgrades:{blade:-4}}).materials,[0,0,0,4,0]);
assert.equal(new Set(REALM_GEAR.map(r=>r.legendary)).size,5);
for(let realm=0;realm<5;realm++){
 const st=normalizeRPG();gearReward(st,realm,'boss:'+realm,'boss');assert(st.owned.includes(REALM_GEAR[realm].legendary));assert.equal(st.inventory.materials[realm],5);assert.equal(gearReward(st,realm,'boss:'+realm,'boss'),false);assert.equal(st.inventory.materials[realm],5);
 assert.equal(st.owned.includes('sawblade'),realm===2);assert.equal(RPG_WEAPONS[REALM_GEAR[realm].legendary].realm,realm);
 const restored=normalizeRPG(JSON.parse(JSON.stringify(st)));assert(restored.owned.includes(REALM_GEAR[realm].legendary));
}
gearReward(a,0,'chest','chest');assert.equal(a.inventory.counts.tea,1);assert.equal(a.inventory.materials[0],3);gearReward(a,0,'chest','chest');assert.equal(a.inventory.counts.tea,1);
a.inventory.upgrades.blade=3;assert.equal(rpgBuild(null,a).weapon.damage,3);a.inventory.owned=['oakvest','rivercharm'];a.inventory.armor='oakvest';a.inventory.charm='rivercharm';a.inventory.upgrades.oakvest=2;a.inventory.upgrades.rivercharm=2;assert.equal(rpgBuild(null,a).health,9);assert.equal(rpgBuild(null,a).mana,28);
assert.equal(gearUpgradeCost(a,'sawblade').realm,2);assert.equal(gearUpgradeCost(a,'blade').light,26);
const c=vm.createContext({});vm.runInContext(readFileSync('public/rpg-rules.js','utf8'),c);for(const sign of [null,'aries','pisces'])assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(rpgBuild('+JSON.stringify(sign)+','+JSON.stringify(a)+'))',c)),rpgBuild(sign,a));
// Execute the browser inventory hooks and ensure awards persist only once.
const elements=new Map();const el=k=>{if(!elements.has(k))elements.set(k,{append(){},prepend(){},setAttribute(){},textContent:''});return elements.get(k)};
let saves=0,body='';Object.assign(c,{s:{seed:42,chapter:2,area:'dungeon',gems:50,rpg:normalizeRPG(),player:{hp:5},items:[{type:'chest',taken:true}],enemies:[{type:'boss',hp:0}],bossDown:true},team:{inGame:false},rpgState:()=>c.s.rpg,keeperClass:null,rpgStats:()=>rpgBuild(null,c.s.rpg),equippedWeapon:()=>rpgBuild(null,c.s.rpg).weapon,registerDefeat(){},update(){},save(){saves++},payload:()=>({rpg:c.s.rpg}),applyRoom(){},updateResources(){},toast(){},appDialog:(...args)=>body=args[5],returnToGame(){},playerStatsMenu(){},mainMenu(){},shop(){},paintKeeperEquipment(){},$:el,document:{createElement:()=>el('new'),querySelector:()=>el('grid'),querySelectorAll:()=>[]},escapeHTML:x=>x,hardMode:()=>false,shieldEquipped:()=>false,REALM_GEAR,RPG_WEAPONS});vm.runInContext(readFileSync('public/inventory.js','utf8'),c);assert.equal(saves,1);c.update();assert.equal(saves,1);assert(c.s.rpg.owned.includes('sawblade'));c.inventoryMenu('relics');assert(body.includes('Sungear Saw Blade'));c.inventoryMenu('supplies');assert(body.includes('Brass Fragment'));c.inventoryMenu('equipment');assert(body.includes('Oakweave Vest'));
console.log('PASS: five exclusive legendary rewards; deduplicated material/supply loot; upgraded combat stats; save migration; client/server parity; inventory menus and persistence.');

const war=normalizeRPG({owned:['dreadpike'],weapon:'dreadpike',inventory:{owned:['dreadplate','warseal'],armor:'dreadplate',charm:'warseal'}});assert.equal(rpgBuild(null,war).health,9);assert.equal(rpgBuild(null,war).burst,2);assert.equal(rpgBuild(null,war).weapon.range,162);assert.equal(normalizeRPG(JSON.parse(JSON.stringify(war))).inventory.armor,'dreadplate');c.inventoryMenu('equipment');assert(body.includes('Hard Mode forge'));c.hardMode=()=>true;c.inventoryMenu('equipment');assert(body.includes('Buy · 64'));
