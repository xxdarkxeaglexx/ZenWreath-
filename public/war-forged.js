'use strict';
// Decorations remain inside the existing combat silhouettes. Materials are cached.
function warPlate(c,points,color,trim){faunaShape(c,points,color,'shell');faunaLine(c,[...points,points[0]],trim,.7)}
function warStud(c,x,y,trim){c.fillStyle=trim;c.beginPath();c.arc(x,y,.8,0,Math.PI*2);c.fill()}
function warCrest(c,x,y,trim){faunaLine(c,[[x,y-4],[x+3,y],[x,y+4],[x-3,y],[x,y-4]],trim,.8);warStud(c,x,y,trim)}
function warEnemyFit(c,type,realm,hard){
 const trim=['#bba975','#9acac8','#d5ae65','#bba0d2','#ddc07d'][realm],metal=hard?'#39414b':'#626c60',cloth=hard?'#513744':'#586253';
 if(type==='thorn'||type==='spriggan'){
  const tall=type==='spriggan',y=tall?-48:-35;
  warPlate(c,[[-10,y],[-6,y-3],[7,y-3],[11,y],[8,y+18],[-8,y+18]],metal,trim);
  for(const side of[-1,1]){warPlate(c,[[side*8,y],[side*18,y-3],[side*21,y+5],[side*10,y+7]],metal,trim);if(hard)warPlate(c,[[side*13,y-1],[side*17,y-9],[side*19,y+1]],'#adb3a1',trim);}
  for(let i=0;i<3;i++)faunaLine(c,[[-7,y+7+i*3],[7,y+7+i*3]],'#1b2835',.8);
  warCrest(c,0,y+7,trim);faunaLine(c,[[-8,y+19],[8,y+19]],'#ac8060',2);
  for(const side of[-1,1]){warPlate(c,[[side*2,y+20],[side*9,y+20],[side*12,y+30],[side*3,y+28]],cloth,trim);warStud(c,side*7,y+2,trim)}
 }else if(['wolf','beetle','crab','toad'].includes(type)){
  const wolf=type==='wolf',y=wolf?-23:type==='beetle'?-29:-23;
  warPlate(c,[[-12,y-4],[0,y-7],[12,y-3],[10,y+5],[-10,y+5]],metal,trim);
  for(let i=-1;i<=1;i++){faunaLine(c,[[i*6,y-3],[i*6,y+4]],trim,.7);warStud(c,i*6,y,trim)}
  if(hard)for(const x of[-9,0,9])warPlate(c,[[x-2,y-5],[x,y-12],[x+3,y-4]],'#8d938c',trim);
  if(wolf){faunaLine(c,[[13,-31],[15,-18],[20,-16]],'#aa805f',2);for(let i=0;i<3;i++)faunaLine(c,[[19+i,-36],[22+i,-30]],'#cabaa2',.45)}
 }else if(type==='shroom'){
  warPlate(c,[[-8,-20],[8,-20],[11,-1],[-10,-1]],cloth,trim);warCrest(c,0,-13,trim);faunaLine(c,[[-8,-5],[8,-5]],'#a27a5b',2);
  for(const side of[-1,1])warPlate(c,[[side*9,-25],[side*19,-29],[side*16,-21]],metal,trim);
 }else if(type==='moth'){
  for(const side of[-1,1]){faunaLine(c,[[side*6,-36],[side*21,-44],[side*30,-27]],trim,1);for(let i=0;i<3;i++)warStud(c,side*(12+i*6),-34+i*3,trim)}warPlate(c,[[-3,-31],[3,-31],[4,-13],[0,-9],[-4,-13]],metal,trim);
 }else if(type==='wisp'){
  for(const side of[-1,1])warPlate(c,[[side*2,-33],[side*7,-36],[side*8,-24],[side*3,-25]],metal,trim);warCrest(c,0,-18,trim);
 }else if(type==='slime'){
  warPlate(c,[[-13,-22],[-9,-29],[-5,-23],[0,-30],[5,-23],[10,-28],[14,-21],[11,-18],[-10,-18]],metal,trim);warCrest(c,0,-23,trim);
 }
 // Small scars and rivets read as surface detail, rather than screen-wide effects.
 if(hard){faunaLine(c,[[-5,-21],[-2,-18],[1,-20]],'#bfa88e',.65);warStud(c,-7,-17,trim)}
}
const warWild=paintWildEnemy;paintWildEnemy=function(e){warWild(e);const hard=hardMode(),realm=s.chapter;ctx.save();if(e.type==='wolf'&&Math.cos(Math.atan2(s.player.y-e.y,s.player.x-e.x))<0)ctx.scale(-1,1);faunaStamp('war:'+e.type+':'+realm+':'+hard,c=>warEnemyFit(c,e.type,realm,hard),[-48,-104,96,124]);ctx.restore()};
const warBoss=paintRealmBoss;paintRealmBoss=function(e){warBoss(e);const hard=hardMode(),realm=s.chapter;faunaStamp('warboss:'+realm+':'+hard,c=>{const trim=REALM_GEAR[realm].color,metal=hard?'#343b49':'#6c766b';if(realm===1){for(let i=0;i<5;i++)warPlate(c,[[-64+i*19,-22],[-61+i*19,-32],[-56+i*19,-25]],metal,trim);warCrest(c,37,-38,trim)}else{const y=[-69,0,-76,-51,-60][realm];for(const side of[-1,1]){warPlate(c,[[side*12,y],[side*28,y-5],[side*35,y+8],[side*17,y+12]],metal,trim);if(hard)warPlate(c,[[side*23,y-2],[side*30,y-16],[side*34,y+2]],'#909484',trim)}warPlate(c,[[-13,y+12],[0,y+7],[13,y+12],[9,y+29],[0,y+34],[-9,y+29]],metal,trim);warCrest(c,0,y+20,trim);for(let i=0;i<3;i++)faunaLine(c,[[-8,y+17+i*4],[8,y+17+i*4]],trim,.7)}},[-96,-140,192,164]);if(hard){const y=realm===1?-37:[-59,0,-98,-59,-68][realm];ctx.save();ctx.globalAlpha=.6+Math.sin(anim*3+(e.phase||0))*.2;faunaLine(ctx,[[-7,y],[7,y]],'#e5b079',1);ctx.restore()}};
// Equipped armor is painted on the torso, using the existing facing and limb layers.
const warKeeper=paintKeeperDetails;paintKeeperDetails=function(c,look,dir,stride){warKeeper(c,look,dir,stride);if(!s)return;const inv=typeof visualKeeperGear!=='undefined'?visualKeeperGear.inventory:inventoryState(),item=INVENTORY_ITEMS[inv.armor];if(!item?.visual||!inv.owned.includes(inv.armor))return;const side=dir==='left'||dir==='right',w=side?5:9,trim=item.visual==='eclipse'?'#c0acd6':item.visual==='corsair'?'#b6d8d4':'#d0ad78';c.save();const g=c.createLinearGradient(-w,-4,w,12);g.addColorStop(0,depthShade(item.color,28));g.addColorStop(.45,item.color);g.addColorStop(1,depthShade(item.color,-22));c.fillStyle=g;faunaPath(c,[[-w,-4],[w,-4],[w-1,11],[-w+1,11]]);c.fill();for(let i=0;i<3;i++)faunaLine(c,[[-w+2,1+i*3],[w-2,1+i*3]],trim+'90',.6);for(const sign of[-1,1]){warPlate(c,[[sign*w,-4],[sign*(w+4),-3],[sign*(w+3),1],[sign*(w-1),0]],item.color,trim);if(item.visual==='dread')warPlate(c,[[sign*(w+1),-4],[sign*(w+3),-8],[sign*(w+4),-2]],'#7e8491',trim)}faunaLine(c,[[-w,9],[w,9]],'#8d6850',2);if(dir!=='back')warCrest(c,0,2,trim);else faunaLine(c,[[0,-3],[0,7]],trim,.8);c.restore()};
const warEquipment=paintKeeperEquipment;paintKeeperEquipment=function(c,look,dir,stride,pose={}){warEquipment(c,look,dir,stride,pose);const key=typeof visualKeeperGear!=='undefined'?visualKeeperGear.weaponKey:rpgStats().weaponKey;if(!['dreadpike','eclipsemaul'].includes(key))return;const joint=keeperWeaponPose(dir,stride,pose);c.save();c.translate(joint.hand.x,joint.hand.y);c.rotate(joint.bladeAngle);if(key==='dreadpike'){warPlate(c,[[0,-42],[9,-33],[5,-23],[2,-29],[-4,-29]],'#394453','#dcac75');faunaLine(c,[[0,-38],[0,-29]],'#edbd7d',1)}else{warPlate(c,[[-10,-31],[9,-31],[12,-26],[8,-18],[-9,-19]],'#3f3c52','#bba3d0');warCrest(c,0,-25,'#d3b8e4')}c.restore()};
