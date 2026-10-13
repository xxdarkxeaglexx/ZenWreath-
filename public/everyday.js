'use strict';
const LOOK_OPTIONS={
 kind:[['human','Human'],['fox','Fox'],['owl','Owl'],['bear','Bear'],['sprite','Sprite']],
 skin:[['peach','Peach','#e8c79c'],['tan','Tan','#c8956b'],['brown','Brown','#916341'],['deep','Deep brown','#594033'],['honey','Honey','#deb477'],['rose','Rose','#dbada7'],['olive','Olive','#ad9569'],['umber','Umber','#735144']],
 hair:[['chestnut','Chestnut','#654536'],['dark','Black','#292c31'],['gold','Gold','#d5b76e'],['silver','Silver','#c7ccd0'],['copper','Copper','#bd784b'],['cream','Cream','#ede0bd'],['auburn','Auburn','#965344'],['teal','Teal','#548c89'],['lavender','Lavender','#a497bd']],
 style:[['short','Short'],['bob','Bob'],['braid','Braid'],['curls','Curls'],['bun','Bun'],['swept','Side swept'],['none','No hair']],
 outfit:[['forest','Fern','#79aa89'],['ocean','Ocean','#709dac'],['amber','Amber','#d3ad70'],['plum','Plum','#a78daf'],['rose','Rose','#c58d99'],['slate','Slate','#8897a1'],['cream','Linen','#e2d6b4'],['rust','Rust','#bd795f'],['night','Midnight','#4b596e'],['mint','Mint','#9bc4ad']],
 garment:[['coat','Travel coat'],['vest','Trail vest'],['apron','Café apron'],['knit','Cozy knit']],
 accent:[['gold','Honey','#e1bf77'],['teal','Lake','#65a5a0'],['rose','Berry','#c58a98'],['cream','Ivory','#eee0bc'],['slate','Slate','#7e8a9d']],
 accessory:[['beret','Rounded cap'],['cape','Short cape'],['flower','Flower'],['scarf','Scarf'],['goggles','Goggles'],['satchel','Satchel'],['leaf','Leaf pin'],['none','None']],
 boots:[['brown','Walnut','#655042'],['dark','Charcoal','#363d40'],['sand','Sand','#bda47c'],['berry','Berry','#875568']],
 eyes:[['dark','Dark','#24383a'],['hazel','Hazel','#786042'],['blue','Blue','#4e85a8'],['green','Green','#527958']],
 weapon:[['leaf','Leaf blade'],['brass','Brass blade'],['moon','Moonsteel blade']],
 shield:[['none','No shield'],['wreath','Wreath buckler'],['wood','Oak buckler'],['petal','Petal guard']]
};
const DEFAULT_LOOK={kind:'human',skin:'peach',hair:'chestnut',style:'short',outfit:'amber',garment:'coat',accent:'teal',accessory:'beret',boots:'brown',eyes:'dark',weapon:'leaf',shield:'wreath'};
function safeLook(value,fallback=DEFAULT_LOOK){let out={...DEFAULT_LOOK,...fallback};if(value&&typeof value==='object'&&!Array.isArray(value))for(let key of Object.keys(LOOK_OPTIONS)){const v=key==='accessory'&&value[key]==='hood'?'beret':value[key];if(LOOK_OPTIONS[key].some(o=>o[0]===v))out[key]=v}return out}
let myLook={...DEFAULT_LOOK},lookStored=false,lookPending=false;
try{const raw=localStorage.getItem('zenwreath-look');if(raw){myLook=safeLook(JSON.parse(raw));lookStored=true}lookPending=localStorage.getItem('zenwreath-look-pending')==='1'}catch(e){}
function currentLook(){return myLook}
function peerLook(peer){return safeLook(peer.appearance,{...DEFAULT_LOOK,kind:LOOK_OPTIONS.kind.some(o=>o[0]===peer.avatar)?peer.avatar:'human'})}
function lookColor(group,key){return LOOK_OPTIONS[group].find(o=>o[0]===key)?.[2]||'#79aa89'}
function paintKeeperFront(c,value,face=0,stride=0,equipment=true){const look=safeLook(value),skin=lookColor('skin',look.skin),hair=lookColor('hair',look.hair),cloth=lookColor('outfit',look.outfit);const dot=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()},rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)},tri=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 if(look.kind==='fox'){tri([[7,3],[23,-1],[22,9],[10,14]],hair);tri([[20,0],[23,-1],[22,9],[18,8]],'#fff0d2')}if(look.kind==='owl'){tri([[-9,-4],[-16,1],[-12,11],[-7,6]],hair);tri([[9,-4],[16,1],[12,11],[7,6]],hair)}
 if(look.accessory==='cape'){tri([[-8,-6],[-13,14],[13,14],[8,-6]],cloth);rect(-9,4,18,3,'#172f3555')}
 rect(-6,8+stride,5,6,'#514634');rect(2,8-stride,5,6,'#514634');rect(-9,-5,18,15,cloth);if(!equipment){rect(-10,-3,3,9,skin);rect(8,-3,3,9,skin)};rect(-9,2,18,3,'#e3d4a0');rect(-2,1,4,5,'#a28a56');
 if(look.kind==='fox'){tri([[-9,-14],[-10,-27],[-1,-19]],hair);tri([[1,-19],[9,-27],[9,-14]],hair);dot(0,-12,9,hair);rect(-5,-10,10,6,skin);dot(0,-10,1.4,'#24333a')}
 else if(look.kind==='owl'){tri([[-10,-16],[-11,-27],[-3,-20]],hair);tri([[3,-20],[11,-27],[10,-16]],hair);dot(0,-13,11,hair);dot(-5,-13,5,'#fff0d2');dot(5,-13,5,'#fff0d2');tri([[-3,-8],[3,-8],[0,-3]],'#e4bf70')}
 else if(look.kind==='bear'){dot(-8,-23,5,hair);dot(8,-23,5,hair);dot(-8,-23,2.5,skin);dot(8,-23,2.5,skin);dot(0,-12,11,hair);dot(0,-7,5,skin);dot(0,-9,2,'#233439');rect(-1,-7,2,3,'#233439')}
 else{dot(0,-12,8,skin);if(look.kind==='sprite'){tri([[-7,-11],[-13,-17],[-8,-5]],skin);tri([[7,-11],[13,-17],[8,-5]],skin)}if(look.style!=='none'){rect(-8,-20,16,6,hair);if(look.style==='bob'){rect(-9,-17,4,13,hair);rect(6,-17,4,13,hair)}if(look.style==='braid'){rect(6,-17,3,13,hair);dot(7,-2,2.3,hair);dot(7,2,2.1,hair);dot(7,6,1.8,hair)}}}
 const eyes=(['fox','bear'].includes(look.kind)&&look.hair==='dark')||(['human','sprite'].includes(look.kind)&&look.skin==='deep')?'#eadcaa':'#233439';dot(look.kind==='owl'?-5:-4,-13,look.kind==='owl'?2:1.4,eyes);dot(look.kind==='owl'?5:4,-13,look.kind==='owl'?2:1.4,eyes);
 if(look.accessory==='flower'){dot(-7,-21,3,'#efc7bd');dot(-10,-18,3,'#efc7bd');dot(-5,-17,3,'#efc7bd');dot(-7,-18,2,'#efd78e')}
}
// World angles: right=0, down=PI/2, left=PI, up=-PI/2.
function keeperDirection(face=Math.PI/2){if(!Number.isFinite(face))face=Math.PI/2;const x=Math.cos(face),y=Math.sin(face);return Math.abs(y)>=Math.abs(x)?(y<0?'back':'front'):(x<0?'left':'right')}
function paintKeeper(c,value,face=Math.PI/2,stride=0,pose={}){
 const look=safeLook(value),dir=keeperDirection(face),skin=lookColor('skin',look.skin),hair=lookColor('hair',look.hair),cloth=lookColor('outfit',look.outfit),animal=['fox','owl','bear'].includes(look.kind),fur=animal?hair:skin;
 const dot=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()},rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)},poly=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 c.save();c.translate(0,-Math.abs(stride)*.65);
 // A shield held ahead of an away-facing keeper is occluded by the torso.
 if(dir==='back'&&pose.equipment!==false){paintKeeperEquipment(c,look,dir,stride,pose);paintKeeperShield(c,look,dir,stride,pose);}
 if(dir==='front'){
  paintKeeperFront(c,look,face,stride,pose.equipment!==false)
 }else if(dir==='back'){
  // Weapon, ears, shoulders, and tunic are behind the hair/cape from this view.
  if(look.kind==='fox'){poly([[-5,5],[16,6],[21,14],[8,17]],hair);poly([[16,6],[21,14],[15,15]],'#fff0d2')}
  rect(-6,8+stride,5,6,'#514634');rect(2,8-stride,5,6,'#514634');
  rect(-9,-5,18,15,cloth);if(pose.equipment===false){rect(-11,-3-stride,4,9,fur);rect(7,-3+stride,4,9,fur)};rect(-9,2,18,3,'#b5a16f');rect(-1,-4,2,12,'#173b3444');
  if(look.kind==='bear'){dot(-8,-23,5,hair);dot(8,-23,5,hair)}
  if(['fox','owl'].includes(look.kind)){poly([[-9,-14],[-10,-27],[-1,-19]],hair);poly([[1,-19],[9,-27],[9,-14]],hair)}
  dot(0,-12,animal?11:8,animal||look.style!=='none'?hair:skin);
  if(!animal&&look.style==='bob')rect(-9,-17,18,13,hair);
  if(!animal&&look.style==='braid'){rect(-8,-20,16,8,hair);for(let i=0;i<5;i++)dot(0,-9+i*4,2.6-i*.22,hair);rect(-2,8,4,2,'#d6b870')}

   if(look.accessory==='flower'){dot(-8,-20,3,'#efc7bd');dot(-5,-18,3,'#efc7bd');dot(-7,-19,1.8,'#efd78e')}
 }else{
  // One actual profile, mirrored for left. Face and nose point with travel.
  if(dir==='left')c.scale(-1,1);
  if(look.accessory==='cape'){poly([[-5,-6],[-14,13],[-2,15],[3,-4]],cloth);poly([[-5,-4],[-11,12],[-7,13]],'#173b3444')}
  if(look.kind==='fox'){poly([[-5,4],[-19,3],[-23,11],[-9,15]],hair);poly([[-19,3],[-23,11],[-18,12]],'#fff0d2')}
  rect(-5,8-stride,5,6,'#383c32');rect(0,8+stride,5,6,'#514634');rect(-6,-5,12,15,cloth);rect(-6,2,12,3,'#e3d4a0');rect(3,1,3,5,'#a28a56');
  dot(0,-12,animal?10:8,fur);
  if(look.kind==='bear'){dot(-4,-23,5,hair);dot(-4,-23,2.5,skin);dot(7,-8,5,skin);dot(11,-10,1.7,'#233439')}
  else if(look.kind==='fox'){poly([[-7,-16],[-5,-28],[2,-18]],hair);poly([[4,-14],[14,-9],[5,-5]],skin);dot(13,-9,1.6,'#233439')}
  else if(look.kind==='owl'){poly([[-8,-17],[-7,-27],[0,-19]],hair);dot(4,-13,5,'#fff0d2');poly([[9,-10],[14,-7],[9,-5]],'#e4bf70');poly([[-5,-3],[-9,7],[1,10],[4,-2]],hair)}
  else{poly([[6,-14],[11,-10],[7,-8]],skin);rect(4,-5,3,3,skin);if(look.style!=='none'){rect(-8,-20,13,6,hair);rect(-8,-17,5,10,hair);if(look.style==='bob')rect(-8,-15,6,13,hair);if(look.style==='braid')for(let i=0;i<5;i++)dot(-7,-7+i*4,2.3-i*.2,hair)}if(look.kind==='sprite')poly([[-3,-12],[-11,-17],[-5,-6]],skin)}
  dot(look.kind==='owl'?5:6,-13,look.kind==='owl'?2:1.4,skin==='#594033'||hair==='#292c31'?'#eadcaa':'#233439');
  if(look.accessory==='flower'){dot(-5,-21,3,'#efc7bd');dot(-8,-18,3,'#efc7bd');dot(-4,-18,2,'#efd78e')}
  if(pose.equipment===false)rect(0,-3+stride*.6,4,9,fur);
 }
 paintKeeperDetails(c,look,dir,stride);
 // The back cape covers the rear torso, never the boots or the face.
 if(dir==='back'&&look.accessory==='cape'){
  const sway=stride*.35;
  poly([[-8,-4],[-11+sway,10],[sway,12],[11+sway,10],[8,-4]],cloth);
  poly([[-6,-3],[-8+sway,9],[-5+sway,10],[-3,-3]],'#ffffff18');
  poly([[4,-3],[6+sway,10],[10+sway,9],[7,-3]],'#16382e44');
 }

 if(pose.equipment!==false&&dir!=='back')paintKeeperEquipment(c,look,dir,stride,pose);
 c.restore();
}
function paintLeafPin(c,x=-6,y=-21){c.save();c.translate(x,y);c.rotate(-.45);const shade=c.createLinearGradient(-5,0,5,-5);shade.addColorStop(0,'#547b47');shade.addColorStop(.55,'#91b574');shade.addColorStop(1,'#c4d69b');c.fillStyle=shade;c.beginPath();c.moveTo(-4,5);c.bezierCurveTo(-9,0,-6,-6,3,-10);c.bezierCurveTo(8,-3,5,2,-4,5);c.closePath();c.fill();c.strokeStyle='#395b38';c.lineWidth=.6;c.stroke();c.strokeStyle='#e1e7b2';c.lineWidth=.65;c.beginPath();c.moveTo(-6,8);c.lineTo(2,-8);c.moveTo(-2,2);c.lineTo(-6,-1);c.moveTo(-.5,-1);c.lineTo(4,-2);c.moveTo(1,-4);c.lineTo(-2,-6);c.stroke();c.restore()}
function paintKeeperDetails(c,look,dir,stride){
 const side=dir==='left'||dir==='right',back=dir==='back',animal=['fox','owl','bear'].includes(look.kind),cloth=lookColor('outfit',look.outfit),trim=lookColor('accent',look.accent),hair=lookColor('hair',look.hair),boots=lookColor('boots',look.boots),eye=lookColor('eyes',look.eyes);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)},dot=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()};c.save();
 if(side){rect(-5,8-stride,5,6,boots);rect(0,8+stride,5,6,boots)}else{rect(-6,8+stride,5,6,boots);rect(2,8-stride,5,6,boots)}
 const x=side?-6:-9,w=side?12:18;
 if(look.garment==='coat'){const fabric=c.createLinearGradient(x,-5,x+w,12);fabric.addColorStop(0,cloth);fabric.addColorStop(.45,depthShade(cloth,15));fabric.addColorStop(1,depthShade(cloth,-23));c.fillStyle=fabric;c.beginPath();c.moveTo(x+3,-5);c.quadraticCurveTo(x-1,-2,x+1,3);c.lineTo(x,11);c.quadraticCurveTo(x+w/2,14,x+w,11);c.lineTo(x+w-2,2);c.quadraticCurveTo(x+w+1,-2,x+w-3,-5);c.closePath();c.fill();if(!back){rect(side?2:-1,-5,2,17,trim);dot(side?2:1,0,.8,trim);dot(side?2:1,4,.8,trim);dot(side?2:1,8,.8,trim)}}
 if(look.garment==='vest'){rect(x,-5,w,12,trim);rect(side?-2:-5,-4,side?5:10,12,cloth)}
 if(look.garment==='apron'&&!back){rect(side?-2:-6,-3,side?7:12,15,trim);rect(side?0:-4,4,side?4:8,4,cloth)}
 if(look.garment==='knit'){for(let i=0;i<3;i++)rect(x,-3+i*5,w,1,trim)}
 if(!animal&&['curls','bun','swept'].includes(look.style)){if(look.style==='curls'){for(let i=0;i<5;i++)dot(-7+i*3,-20+(i%2)*2,3,hair);dot(-8,-15,3,hair);if(!side)dot(8,-15,3,hair)}if(look.style==='bun'){dot(back?0:-5,-24,4,hair);rect(-8,-20,side?12:16,5,hair)}if(look.style==='swept'){rect(-8,-21,side?12:16,6,hair);for(let i=0;i<4;i++)rect(-8+i*3,-17,3,5-i,hair)}}
 if(!back){const skin=lookColor('skin',look.skin);if(!animal){c.fillStyle=depthShade(skin,13);c.beginPath();c.ellipse(side?3:-2,-10,side?2.2:3,2,0,0,Math.PI*2);c.fill();c.strokeStyle=depthShade(skin,-38);c.lineWidth=.6;c.beginPath();c.moveTo(side?7:0,-13);c.lineTo(side?9:1,-10);c.lineTo(side?7:-1,-9);c.stroke();c.strokeStyle='#8e5e5280';c.beginPath();c.moveTo(side?5:-2,-6.5);c.quadraticCurveTo(side?7:0,-5.6,side?8:2,-6.5);c.stroke();c.strokeStyle=hair;c.lineWidth=.85;for(const ex of side?[5]:[-4,4]){c.beginPath();c.moveTo(ex-1.6,-16);c.quadraticCurveTo(ex,-16.6,ex+1.6,-16);c.stroke()}}}
 if(!back){if(side)dot(look.kind==='owl'?5:6,-13,look.kind==='owl'?2:1.4,eye);else{dot(look.kind==='owl'?-5:-4,-13,look.kind==='owl'?2:1.4,eye);dot(look.kind==='owl'?5:4,-13,look.kind==='owl'?2:1.4,eye)}}
 if(look.accessory==='beret'){c.fillStyle=trim;c.beginPath();c.ellipse(side?-2:0,-23,side?9:11,5,-.15,0,Math.PI*2);c.fill();rect(-8,-21,side?13:16,3,cloth);rect(0,-29,2,3,trim)}
 if(look.accessory==='scarf'){rect(side?-6:-9,-6,side?12:18,4,trim);rect(side?-6:5,-2,4,12,trim)}
 if(look.accessory==='goggles'){rect(-8,-21,side?13:16,2,trim);if(!back){for(const gx of side?[5]:[-4,4]){dot(gx,-13,3.5,trim);dot(gx,-13,2.4,'#a9d5db');rect(gx-1,-15,1,2,'#eff9ea')}}}
 if(look.accessory==='satchel'){c.strokeStyle=trim;c.lineWidth=2;c.beginPath();c.moveTo(-6,-5);c.lineTo(6,8);c.stroke();rect(side?-9:-12,4,7,9,'#866149');rect(side?-9:-12,4,7,3,trim)}
 if(look.accessory==='leaf')paintLeafPin(c)
 c.restore()
}
// Both weapons move from an arm joint and stay attached to their hand.
function keeperWeaponPose(dir,stride,pose={}){
 const guard=Math.max(0,Math.min(1,pose.guard||0)),swing=Math.max(0,Math.min(1,pose.swing||0)),active=pose.attacking===true;
 const side=dir==='left'||dir==='right',back=dir==='back';
 const shoulder={x:back?-6:side?1:8,y:back?2:-3};
 const arm=active?(-1.4+swing*2.9):(guard?-.45:stride*.07);
 const hand={x:shoulder.x+Math.sin(arm)*8,y:shoulder.y+Math.cos(arm)*8};
 return {guard,swing,active,side,back,shoulder,hand,bladeAngle:typeof pose.spin==='number'?pose.spin*Math.PI*2:active?(-1.8+swing*3.6):(side?.32:back?.08:.24)};
}
function paintKeeperEquipment(c,look,dir,stride,pose){
 const p=keeperWeaponPose(dir,stride,pose),skin=lookColor(['fox','owl','bear'].includes(look.kind)?'hair':'skin',['fox','owl','bear'].includes(look.kind)?look.hair:look.skin),cloth=lookColor('outfit',look.outfit);
 const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 // Rear-facing sword arm uses the opposite visible shoulder.
 c.strokeStyle=skin;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(p.shoulder.x,p.shoulder.y);c.lineTo(p.hand.x,p.hand.y);c.stroke();c.strokeStyle=cloth;c.lineWidth=5;c.beginPath();c.moveTo(p.shoulder.x,p.shoulder.y);c.lineTo((p.shoulder.x+p.hand.x)/2,(p.shoulder.y+p.hand.y)/2);c.stroke();
 c.save();c.translate(p.hand.x,p.hand.y);c.rotate(p.bladeAngle);
 const blade=pose.relic?'#ffe9a9':look.weapon==='brass'?'#d9b571':look.weapon==='moon'?'#b4c4e5':'#b6d6bd',len=pose.relic?25:22;
 if(!pose.hideBlade){
 if(p.active){c.strokeStyle='#f8efb966';c.lineWidth=3;c.beginPath();c.arc(0,0,len,-Math.PI/2-.55,-Math.PI/2+.22);c.stroke()}
 poly([[-2,-6],[-2,-len],[0,-len-4],[2,-len],[2,-6]],blade);
 c.fillStyle='#ffffffbb';c.fillRect(-1,-len,1,len-6);c.fillStyle='#7d9caa';c.fillRect(1,-len,1,len-6);
 c.fillStyle='#d8b66b';c.fillRect(-6,-6,12,3);c.fillStyle='#644c36';c.fillRect(-1.5,-3,3,7);c.fillStyle='#e5c57e';c.fillRect(-2,4,4,2);
 }
 c.fillStyle=skin;c.beginPath();c.arc(0,0,2.9,0,Math.PI*2);c.fill();c.restore();
 // Empty off-hand when the shield is unequipped.
 if(look.shield==='none'){c.strokeStyle=cloth;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(p.side?-2:(p.back?8:-8),-2);c.lineTo(p.side?-4:-10,6+stride*.25);c.stroke();c.fillStyle=skin;c.beginPath();c.ellipse(p.side?-4:-10,9+stride*.25,2,2.8,0,0,Math.PI*2);c.fill();return}
 // Front and side shields are in front of the visible arm. Rear shields were
 // already painted before the torso, so do not repaint them over the body.
 if(!p.back)paintKeeperShield(c,look,dir,stride,pose);
}
function paintKeeperShield(c,look,dir,stride=0,pose={}){
 if(look.shield==='none')return;
 const p=keeperWeaponPose(dir,stride,pose),cloth=lookColor('outfit',look.outfit),edge=lookColor('accent',look.accent),face=look.shield==='wood'?'#8e6f4d':look.shield==='petal'?'#b38495':'#476e66';
 const sx=p.side?7:p.back?7:-9,sy=(p.back?3:8)-p.guard*12;
 c.save();c.strokeStyle=cloth;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(p.side?-2:p.back?8:-8,-2);c.lineTo(sx,sy);c.stroke();c.translate(sx,sy);
 if(p.side){
  // Profile view: only the rounded thickness of the rim, never its face motif.
  c.rotate((1-p.guard)*-.12);c.fillStyle='#344d44';c.beginPath();c.ellipse(0,1,2.7,9,0,0,Math.PI*2);c.fill();c.strokeStyle=edge;c.lineWidth=1.1;c.beginPath();c.ellipse(-.5,1,2.2,8.2,0,0,Math.PI*2);c.stroke();
 }else if(p.back){
  // The plain inner backing is behind the body and head in the paint order.
  c.rotate((1-p.guard)*.15);c.fillStyle='#344d44';c.beginPath();c.ellipse(0,1,7.5,8.5,0,0,Math.PI*2);c.fill();c.strokeStyle='#849481';c.lineWidth=.8;c.stroke();c.strokeStyle='#253d36';c.lineWidth=2;c.beginPath();c.moveTo(-2,-2);c.lineTo(2,4);c.stroke();
 }else{
  c.rotate((1-p.guard)*-.2);c.fillStyle=edge;c.beginPath();c.ellipse(0,1,8,9,0,0,Math.PI*2);c.fill();c.fillStyle=face;c.beginPath();c.ellipse(0,1,6,7,0,0,Math.PI*2);c.fill();c.strokeStyle='#eee0bc';c.lineWidth=1.1;c.beginPath();if(look.shield==='wood'){c.moveTo(-2,-4);c.lineTo(-2,6);c.moveTo(2,-4);c.lineTo(2,6)}else if(look.shield==='petal'){c.ellipse(0,0,2,4,.5,0,Math.PI*2);c.ellipse(0,0,2,4,-.5,0,Math.PI*2)}else c.arc(0,1,3.8,.3,Math.PI*1.85);c.stroke();
 }
 c.restore();
}

function saveLookLocally(){try{localStorage.setItem('zenwreath-look',JSON.stringify(myLook));localStorage.setItem('zenwreath-look-pending',lookPending?'1':'0')}catch(e){}lookStored=true}
let lookSyncQueue=Promise.resolve();
function syncLook(){lookSyncQueue=lookSyncQueue.catch(()=>{}).then(async()=>{if(!account?.profile||!lookPending)return;const snapshot=JSON.stringify(myLook);account=await api({action:'appearance',appearance:JSON.parse(snapshot)});lookPending=JSON.stringify(myLook)!==snapshot;saveLookLocally();updateMemberBar()});return lookSyncQueue;}
const lookRefresh=refreshAccount;refreshAccount=async function(){let data=await lookRefresh();if(data?.profile){if(lookPending||(lookStored&&!data.profile.appearance)){lookPending=true;saveLookLocally();try{await syncLook();data=account}catch(e){}}else{myLook=peerLook(data.profile);if(data.profile.appearance){saveLookLocally()}else if(lookStored){try{myLook=safeLook(JSON.parse(localStorage.getItem('zenwreath-look')))}catch(e){}}}}return data};
let lookDraft=null,lookPreviewFace=Math.PI/2;
function drawLookPreview(){const target=$('lookPreview');if(!target)return;const c=target.getContext('2d');if(!c)return;c.clearRect(0,0,240,160);const sky=c.createLinearGradient(0,0,0,160);sky.addColorStop(0,'#294b40');sky.addColorStop(1,'#17352d');c.fillStyle=sky;c.fillRect(0,0,240,160);c.save();c.translate(120,109);c.scale(3,3);c.fillStyle='#0a211f55';c.beginPath();c.ellipse(0,15,15,5,0,0,Math.PI*2);c.fill();paintKeeper(c,lookDraft,lookPreviewFace,0,{equipment:true});c.restore()}
function updateLookControls(){const animal=['fox','owl','bear'].includes(lookDraft.kind);$('look-style').disabled=animal;$('look-style').title=animal?'Hair styles apply to humans and sprites.':'';for(const key of Object.keys(LOOK_OPTIONS))$('look-'+key).value=lookDraft[key]}
function characterEditor(back=moreHome){lookDraft={...myLook};lookPreviewFace=Math.PI/2;const groups={body:{label:'Body',fields:{kind:'Character',skin:'Skin / face',hair:'Hair / fur color',style:'Hair style',eyes:'Eyes'}},clothes:{label:'Outfit',fields:{garment:'Clothing style',outfit:'Clothing color',accent:'Accent color',accessory:'Accessory',boots:'Boots'}},gear:{label:'Gear',fields:{weapon:'Sword finish',shield:'Shield / no shield'}}};
 appDialog('character','MY CHARACTER','Make it yours.','Choose a look. The preview updates as you go.',[['Save look',async()=>{const button=$('buttons').firstChild;button.disabled=true;myLook=safeLook(lookDraft);lookPending=true;saveLookLocally();try{await syncLook();back();status(account?.profile?'Look saved to your profile.':'Look saved on this phone.')}catch(e){$('lookMessage').textContent='Saved on this phone. Sync will retry when you reconnect.'}finally{button.disabled=false}},true],['Cancel',back]],'<div class="wardrobePreview"><canvas id="lookPreview" class="lookPreview" width="240" height="160" aria-label="Live character preview"></canvas><div class="lookTurns" role="group" aria-label="Preview direction">'+['Front','Left','Back','Right'].map((v,i)=>'<button id="look-turn-'+i+'" aria-pressed="'+(i===0)+'">'+v+'</button>').join('')+'</div></div><div class="lookTabs" role="tablist" aria-label="Customization category">'+Object.entries(groups).map(([key,g],i)=>'<button role="tab" id="look-tab-'+key+'" aria-controls="look-panel-'+key+'" aria-selected="'+(i===0)+'" tabindex="'+(i===0?0:-1)+'">'+g.label+'</button>').join('')+'</div>'+Object.entries(groups).map(([key,g],i)=>'<div role="tabpanel" aria-labelledby="look-tab-'+key+'" id="look-panel-'+key+'" class="lookFields" '+(i?'hidden':'')+'>'+Object.entries(g.fields).map(([k,label])=>'<label>'+label+'<select id="look-'+k+'">'+LOOK_OPTIONS[k].map(([v,name])=>'<option value="'+v+'">'+name+'</option>').join('')+'</select></label>').join('')+'</div>').join('')+'<div class="lookExtras"><button id="lookShuffle">Surprise me</button><button id="lookReset">Undo changes</button></div><p class="small" id="lookMessage" role="status">'+(account?.profile?'Your saved look appears to friends and teammates.':'Saves on this phone. No sign-in needed.')+'</p>');
 const tabs=Object.keys(groups),selectTab=key=>{for(const k of tabs){$('look-panel-'+k).hidden=k!==key;$('look-tab-'+k).setAttribute('aria-selected',String(k===key));$('look-tab-'+k).setAttribute('tabindex',k===key?'0':'-1')}};
 for(const key of tabs){$('look-tab-'+key).onclick=()=>selectTab(key);$('look-tab-'+key).onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(tabs.indexOf(key)+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;selectTab(tabs[next]);$('look-tab-'+tabs[next]).focus()}}
 for(const key of Object.keys(LOOK_OPTIONS))$('look-'+key).onchange=()=>{lookDraft[key]=$('look-'+key).value;updateLookControls();drawLookPreview()};
 [Math.PI/2,Math.PI,-Math.PI/2,0].forEach((face,i)=>$('look-turn-'+i).onclick=()=>{lookPreviewFace=face;for(let j=0;j<4;j++)$('look-turn-'+j).setAttribute('aria-pressed',String(j===i));drawLookPreview()});
 $('lookShuffle').onclick=()=>{for(const [k,choices] of Object.entries(LOOK_OPTIONS))lookDraft[k]=choices[Math.floor(Math.random()*choices.length)][0];updateLookControls();drawLookPreview()};$('lookReset').onclick=()=>{lookDraft={...myLook};updateLookControls();drawLookPreview()};updateLookControls();drawLookPreview()
}
// The base world paints the complete chosen look; skip the old face overlay.
drawKeeper=function(){};
profile=function(next=home){if(!account?.signedIn){authGate(next);return}const p=account.profile;appDialog('profile','MY PROFILE','What should friends call you?','Your nickname and saved look appear to friends. Your journal stays private.',[['Save',async()=>{const button=$('buttons').firstChild;button.disabled=true;try{account=await api({action:'profile',name:$('profileName').value,avatar:myLook.kind,share:$('profileShare').checked,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Chicago'});lookPending=true;saveLookLocally();await syncLook();if(!account.game)cloudReady=true;updateMemberBar();next()}catch(e){$('appMessage').textContent=e.message}finally{button.disabled=false}},true],['Back',moreHome]],'<label>Nickname<input id="profileName" maxlength="30" value="'+escapeHTML(p?.name||'')+'" placeholder="Your name or nickname"></label><details><summary>Sharing preferences</summary><label class="checkLabel"><input id="profileShare" type="checkbox"> Show weekly points to accepted friends</label></details><p id="appMessage" class="small" role="status"></p>');$('profileShare').checked=!!p?.share};
function returnToGame(){if(s)close();else home()}
function mainMenu(){appDialog('menu','ZENWREATH','What would you like to do?','Choose one. You can return to your game anytime.',[['▶ Back to game',returnToGame,true]],'<div class="everydayGrid"><button id="menuLook">🧑 My character</button><button id="menuMusic">♫ Forest Flute</button><button id="menuFriends">👥 Friends</button><button id="menuCare">♡ My wellbeing</button><button id="menuStory">✧ Story & progress</button><button id="menuSettings">⚙ Settings</button></div>');const actions={menuLook:()=>characterEditor(),menuMusic:ocarina,menuFriends:friends,menuCare:wellbeingMenu,menuStory:storyMenu,menuSettings:everydaySettings};for(const[id,fn]of Object.entries(actions))$(id).onclick=fn;}
moreHome=mainMenu;menu=mainMenu;$('menu').onclick=mainMenu;
function wellbeingMenu(){appDialog('wellbeing','MY WELLBEING','A little care for today.','Your check-ins are private. Small actions earn points without pressure.',[['Today’s check-in',health,true],['Small actions',habits],['Calming break',wave],['Back',mainMenu]])}
function storyMenu(){appDialog('story','STORY & PROGRESS','Restore the village light.','Find three crystals, calm four wisps, and solve the shrine. Then return to camp.',[['Quest journal',()=>s?journal():characters(),true],['Characters & story',characters],['Village progress',village],['Back',mainMenu]])}
function everydaySettings(){appDialog('settings','SETTINGS','Keep it simple.','Adjust sound, your profile, or your saved game.',[['Sound',()=>audioSettings(everydaySettings),true],['My profile',()=>profile(everydaySettings)],['Birthday class',birthdayClassMenu],['Install on my phone',installApp],['Back',mainMenu]],'<details><summary>Saved games & more</summary><div class="settingsList"><button id="settingsSync">Save across devices</button><button id="settingsExport">Export saved game</button><button id="settingsImport">Import saved game</button><button id="settingsNew">Start a new solo game</button><button id="settingsHelp">Support & safety</button></div></details>');$('settingsSync').onclick=syncQuest;$('settingsExport').onclick=exportSave;$('settingsImport').onclick=()=>$('file').click();$('settingsHelp').onclick=support;$('settingsNew').onclick=()=>show('NEW GAME','Start a new quest?','This replaces your current solo quest. Export it first if you want to keep it.',[['Keep playing',returnToGame,true],['Export current game',exportSave],['Start new game',()=>{if(team.inGame){lobby();status('Leave your shared room before starting a solo game.');return}newGame();close()}]]);}
function playOcarinaNote(note){const changed=!sound||volume===0;unlockAudio();sound=true;if(volume===0)volume=.65;groveChime(NOTES[note],.45);$('audioStatus').textContent=team.room?'Playing · friends with sound on can hear you.':'Playing. If it’s quiet, raise your phone’s media volume.';if(team.room)roomEvent('note',{note});if(changed)saveAudio().catch(()=>{});}
ocarina=function(){appDialog('ocarina','FOREST FLUTE','Tap a note.','Make your own little tune.',[['▶ Play a tune',()=>{unlockAudio();sound=true;if(volume===0)volume=.65;melody();saveAudio().catch(()=>{})},true],['Back',returnToGame]],'<div class="noteGrid">'+['Do','Re','Mi','Fa','Sol','La','Ti','Do↑'].map((label,n)=>'<button data-note="'+n+'" aria-label="Play '+label+'">'+label+'</button>').join('')+'</div><label class="ocarinaVolume">Volume<input id="ocarinaVolume" type="range" min="0" max="100" value="'+Math.round(volume*100)+'" aria-label="Forest Flute volume"></label><p id="audioStatus" class="small" role="status">Use your phone’s media volume too.</p>');document.querySelectorAll('[data-note]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b._played=true;playOcarinaNote(Number(b.dataset.note))};b.onclick=e=>{if(b._played&&e?.detail!==0){b._played=false;return}b._played=false;playOcarinaNote(Number(b.dataset.note))};b.onpointercancel=()=>{b._played=false}});$('ocarinaVolume').oninput=()=>{volume=Number($('ocarinaVolume').value)/100};$('ocarinaVolume').onchange=()=>saveAudio().catch(()=>{$('audioStatus').textContent='Volume saved on this phone.'});};
audioSettings=function(back=mainMenu){appDialog('audio','SOUND','Sound, your way.','Sound starts after your first tap.',[['Save',async()=>{sound=$('soundEnabled').checked;volume=Number($('audioVolume').value)/100;unlockAudio();try{await saveAudio();back();status('Sound settings saved.')}catch(e){$('audioStatus').textContent='Saved on this phone. Profile sync is unavailable.'}},true],['Back',back]],'<label class="checkLabel"><input id="soundEnabled" type="checkbox"> Sound on</label><label>Volume<input id="audioVolume" type="range" min="0" max="100" value="'+Math.round(volume*100)+'"></label><p id="audioStatus" class="small" role="status"></p>');$('soundEnabled').checked=sound;};settings=everydaySettings;$('directOcarina').onclick=ocarina;
const simpleHome=home;home=function(){simpleHome();const button=document.createElement('button');button.textContent='🧑 My character';button.onclick=()=>characterEditor(home);$('buttons').append(button)};
const originalShow=show;show=function(label,title,text,buttons,html=''){const plain=buttons.map(([label,fn,primary])=>[label==='Village'||label==='Village home'||label==='Back to village'?'Back':label,fn,primary]);$('modal').classList.remove('easyHome');originalShow(label,title,text,plain,html);};

friends=function(){if(authGate(friends))return;const p=account.profile,link=APP_URL+'/?friend='+p.code;appDialog('friends','FRIENDS','Your circle.','Invite someone, or accept a friend request. Your journal stays private.',[['Invite a friend',()=>sharePanel('friend',link,friends),true],['Refresh',async()=>{await refreshAccount();friends()}],['Back',mainMenu]],'<label>Have a friend’s invite?<input id="friendCode" value="'+escapeHTML(inviteCode()===p.code?'':inviteCode())+'" placeholder="Paste their link or code" autocapitalize="characters"></label><button id="sendFriend" class="wide">Add friend</button><p id="appMessage" class="small" role="status"></p><div id="friendList">'+((account.friends||[]).length?account.friends.map(f=>'<div class="friendRow"><div><strong>'+faces[f.avatar]+' '+escapeHTML(f.name)+'</strong><div class="friendStatus">'+escapeHTML(classLabel(f.class))+'</div><div class="friendStatus">'+(f.status==='pending'?(f.incoming?'Wants to be your friend':'Request sent'):(f.weekly===null?'Points private':f.weekly+' points this week'))+'</div></div><div class="friendActions">'+(f.status==='pending'&&f.incoming?'<button data-friend="'+escapeHTML(f.id)+'" data-answer="accept">Accept</button><button data-friend="'+escapeHTML(f.id)+'" data-answer="decline">Decline</button>':'<button data-friend="'+escapeHTML(f.id)+'" data-answer="remove">'+(f.status==='pending'?'Cancel':'Remove')+'</button>')+'</div></div>').join(''):'<p class="small">No friends yet. Tap Invite a friend to get started.</p>')+'</div><details><summary>Weekly points</summary><p class="small">Weekly points are visible only when a player turns on sharing. Change yours in Settings → My profile → Sharing preferences.</p></details>');$('sendFriend').onclick=async()=>{const button=$('sendFriend');button.disabled=true;try{let input=$('friendCode').value.trim(),code=input.toUpperCase();if(input.includes('://'))code=new URL(input).searchParams.get('friend')?.toUpperCase()||'';account=await api({action:'friend',code});friends();$('appMessage').textContent='Request sent. Your friend can accept it.'}catch(e){$('appMessage').textContent=e.message}finally{button.disabled=false}};document.querySelectorAll('[data-friend]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{account=await api({action:b.dataset.answer,id:b.dataset.friend});friends()}catch(e){b.disabled=false;$('appMessage').textContent=e.message}});};
const everydayHealth=health;health=function(){everydayHealth();if(activeTab!=='health')return;const grid=document.querySelector('.healthGrid');if(!grid)return;const fields=Array.from(grid.children||[]);if(fields.length>2){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Optional: sleep, water, smoking & drinks';details.append(summary);for(const field of fields.slice(2))details.append(field);grid.after(details)}const clear=$('clearHealth');if(clear){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Manage my journal';details.append(summary);clear.before(details);details.append(clear)}};

window.addEventListener('online',()=>refreshAccount());
