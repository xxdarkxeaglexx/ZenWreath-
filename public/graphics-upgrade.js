'use strict';
// Cozy-fantasy rendering layer. This only decorates the established canvas
// renderer: simulation, collisions, controls, saves and multiplayer stay intact.
const GRAPHICS_KEY='zenwreath-graphics-v1';
const GRAPHICS_PRESETS={
 low:{name:'Low',dpr:1,vegetation:.38,particles:10,post:false,ao:false,shadow:.55},
 medium:{name:'Medium',dpr:1.5,vegetation:.68,particles:22,post:true,ao:false,shadow:.78},
 high:{name:'High',dpr:2.25,vegetation:1,particles:42,post:true,ao:true,shadow:1}
};
let graphicsTier='medium';
try{const saved=localStorage.getItem(GRAPHICS_KEY);if(GRAPHICS_PRESETS[saved])graphicsTier=saved;else if(!matchMedia('(pointer:coarse)').matches)graphicsTier='high'}catch{}
function graphicsPreset(){return GRAPHICS_PRESETS[graphicsTier]}
window.zenGraphicsPreset=graphicsPreset;
window.zenGraphicsTier=()=>graphicsTier;

const upgradedDPR=displayPixelRatio;
displayPixelRatio=function(width,height,native=window.devicePixelRatio||1){const p=graphicsPreset(),budget=graphicsTier==='low'?2600000:graphicsTier==='medium'?4600000:8000000;return Math.min(p.dpr,native,Math.sqrt(budget/Math.max(1,width*height)),upgradedDPR(width,height,native))};

function setGraphicsTier(tier){if(!GRAPHICS_PRESETS[tier])return;graphicsTier=tier;try{localStorage.setItem(GRAPHICS_KEY,tier)}catch{}window.dispatchEvent(new CustomEvent('zen-graphics-change',{detail:graphicsPreset()}));resizeGame();}

const upgradedSettings=calmSettings;
calmSettings=function(){upgradedSettings();const block=document.createElement('details');block.className='calmDetails graphicsSettings';block.open=true;block.innerHTML='<summary>Visual quality</summary><label>Preset<select id="graphicsPreset"><option value="low">Low · battery saver</option><option value="medium">Medium · mobile default</option><option value="high">High · richer light & detail</option></select></label><p class="small">Adjusts resolution, contact shadows, vegetation, sparks and GPU color finishing. Medium is the conservative phone default. Changes save on this device.</p>';$('extra').append(block);$('graphicsPreset').value=graphicsTier;$('graphicsPreset').onchange=()=>setGraphicsTier($('graphicsPreset').value)};

function hash01(x,y,seed){let n=Math.imul(x+17,374761393)^Math.imul(y+31,668265263)^(seed|0);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295}
function clearTownDetail(x,y){if(!s||!outsideWorld())return false;const points=[campPoint(),s.landmarks?.cafe,s.landmarks?.board,...(s.buildings||[])].filter(Boolean);return points.every(p=>Math.hypot(x-p.x,y-p.y)>48)}
function paintMeadowDetail(map,ch,seed){if(!outsideWorld())return;const p=graphicsPreset(),step=p.vegetation>.9?1:p.vegetation>.5?2:3,left=Math.max(0,Math.floor(view.left/32)-1),right=Math.min(map[0].length,Math.ceil((view.left+view.width/view.zoom)/32)+1),top=Math.max(0,Math.floor(view.top/32)-1),bottom=Math.min(map.length,Math.ceil((view.top+view.height/(view.zoom*renderPitch()))/32)+1),palette=DEPTH_PALETTES[ch];ctx.save();ctx.lineCap='round';for(let y=top;y<bottom;y+=step)for(let x=left;x<right;x+=step){if(map[y][x]!==0)continue;const r=hash01(x,y,seed),xx=x*32+6+r*21,yy=y*32+10+hash01(y,x,seed+91)*17;if(!clearTownDetail(xx,yy))continue;const wind=Math.sin(anim*1.25+x*.71+y*.43)*2.2;ctx.strokeStyle=(r>.48?palette.leafLight:palette.leaf)+'8c';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+wind*.3,yy-5,xx+wind,yy-10-r*5);ctx.moveTo(xx+3,yy);ctx.quadraticCurveTo(xx+wind*.2+2,yy-4,xx+wind*.65+1,yy-8);ctx.stroke();if(r>.78){const flower=['#f5d8a6','#d4e8cb','#e4b8d0','#b9dce3'][(x+y+ch)%4];ctx.fillStyle=flower;for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.arc(xx+Math.cos(a)*2,yy-11+Math.sin(a)*2,1.4,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#e8c46e';ctx.fillRect(xx-.6,yy-11.6,1.2,1.2)}else if(r<.12){ctx.fillStyle='#30453d99';ctx.beginPath();ctx.ellipse(xx,yy-1,3+r*12,1.6,.2,0,Math.PI*2);ctx.fill()}}ctx.restore()}

const upgradedGround=depthGround;
depthGround=function(map,ch,seed){const props=upgradedGround(map,ch,seed);paintMeadowDetail(map,ch,seed);return props};

// Resolve nearby world labels into a few vertical lanes. This keeps NPC names,
// shop captions and interaction labels readable without changing hit targets.
let graphicsLabels=[];
const upgradedCaption=depthCaption;
depthCaption=function(text,x,y,...args){const zoom=view.zoom||1,pitch=renderPitch(),sx=(x-view.left)*zoom,baseY=(y-view.top)*zoom*pitch,w=Math.max(34,String(text).length*5.8);let chosen=null;for(const offset of[0,-12,-24,-36]){const box={left:sx-w/2,right:sx+w/2,top:baseY+offset-11,bottom:baseY+offset+3};if(!graphicsLabels.some(other=>box.left<other.right&&box.right>other.left&&box.top<other.bottom&&box.bottom>other.top)){chosen={box,offset};break}}if(!chosen)return;graphicsLabels.push(chosen.box);upgradedCaption(text,x,y+chosen.offset/(zoom*pitch),...args)};

function paintFireAtmosphere(){if(!s||!outsideWorld())return;const p=campPoint(),quality=graphicsPreset(),count=quality.particles;ctx.save();const glow=ctx.createRadialGradient(p.x,p.y-8,3,p.x,p.y-8,70);glow.addColorStop(0,'#ffd58a42');glow.addColorStop(.32,'#f6a85020');glow.addColorStop(1,'#e17b3600');ctx.globalCompositeOperation='screen';ctx.fillStyle=glow;ctx.fillRect(p.x-72,p.y-80,144,110);for(let i=0;i<count;i++){const life=(anim*(.35+(i%5)*.035)+hash01(i,17,s.seed)*2)%1,x=p.x+(hash01(i,8,s.seed)-.5)*(8+life*28)+Math.sin(anim*2+i)*2,y=p.y-12-life*(24+hash01(i,4,s.seed)*35),a=(1-life)*.72;ctx.globalAlpha=a;ctx.fillStyle=i%4?'#f5b85f':'#fff0b0';ctx.beginPath();ctx.arc(x,y,Math.max(.45,1.5-life),0,Math.PI*2);ctx.fill()}ctx.globalAlpha=.12;ctx.fillStyle='#c8d6cb';for(let i=0;i<4;i++){const life=(anim*.08+i*.24)%1;ctx.beginPath();ctx.arc(p.x+Math.sin(anim*.5+i)*8,p.y-34-life*48,8+life*13,0,Math.PI*2);ctx.fill()}ctx.restore()}

const upgradedDraw=draw;
draw=function(){graphicsLabels.length=0;upgradedDraw();paintFireAtmosphere();if(window.ZenWreathThree)window.ZenWreathThree.render(canvas,{time:anim,chapter:s?.chapter||0,preset:graphicsPreset()})};

const graphicsStyle=document.createElement('style');graphicsStyle.textContent=`
.world{isolation:isolate;background:#10272b;border-color:#d5c9987a;box-shadow:0 24px 70px #06121888,inset 0 1px #fff3d744}
.world>.zen-three-output{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit}
.world>#game{position:relative;z-index:0}.world>.hud,.world>.toast,.world>.targetNotice,.world>#resourceGauges,.world>.protectionBadge{z-index:2}
.panel,dialog{background:linear-gradient(145deg,#19332eea,#10262bea);border-color:#beaF7a55;box-shadow:inset 0 1px #f3e7c514,0 16px 45px #07151b50}
button{border-color:#8fac926d;box-shadow:inset 0 1px #fff2d014}.primary{box-shadow:inset 0 1px #fff7df80,0 4px 13px #06181655}
.toast{backdrop-filter:blur(8px);box-shadow:0 8px 28px #06141a66}.graphicsSettings select{min-height:44px}
@media(orientation:landscape) and (max-height:600px){.shell{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}.controls{padding-bottom:max(6px,env(safe-area-inset-bottom))}}
`;document.head.append(graphicsStyle);
