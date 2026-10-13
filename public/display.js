'use strict';
let targetFPS=60,renderQuality=4,displayFrameAt=-Infinity;try{const f=Number(localStorage.getItem('zenwreath-fps'));if([30,60,120].includes(f))targetFPS=f;const q=Number(localStorage.getItem('zenwreath-quality'));if([1,1.5,2,3,4].includes(q))renderQuality=q>=2?4:q}catch(e){}
// Supersample the vector scene; bound the backing buffer for large displays.
function displayPixelRatio(width,height,native=window.devicePixelRatio||1){
 const quality=typeof renderQuality==='number'?renderQuality:4;
 const desired=quality>=4?Math.min(4,Math.max(1.5,native*1.25)):Math.min(native,quality);
 return Math.min(desired,Math.sqrt(8000000/Math.max(1,width*height)));
}
function detailTextureScale(){return Math.min(4,Math.max(2,Math.ceil(view.dpr*view.zoom)));}
function frameShouldAdvance(now){const interval=1000/targetFPS;if(!Number.isFinite(displayFrameAt)){displayFrameAt=now+interval;return true}if(now+.2<displayFrameAt)return false;displayFrameAt+=interval;if(displayFrameAt<=now)displayFrameAt=now+interval;return true}
function setDisplayFPS(value){if(![30,60,120].includes(Number(value)))return;targetFPS=Number(value);displayFrameAt=-Infinity;try{localStorage.setItem('zenwreath-fps',String(targetFPS))}catch(e){}}
const displaySettings=calmSettings;calmSettings=function(){displaySettings();const block=document.createElement('details');block.className='calmDetails';block.innerHTML='<summary>Graphics & smoothness</summary><label>Frame rate<select id="displayFPS"><option value="30">30 FPS · save battery</option><option value="60">60 FPS · balanced</option><option value="120">120 FPS · high refresh</option></select></label><label>Rendering resolution<select id="displayQuality"><option value="1">Low · fastest</option><option value="1.5">Balanced</option><option value="4">Ultra · crisp detail</option></select></label><p class="small">Frame rate is limited by your screen and device. Ultra renders extra pixels for finer textures and smoother edges. Lower resolution saves battery. Gameplay speed stays the same.</p>';$('extra').append(block);$('displayFPS').value=String(targetFPS);$('displayQuality').value=String(renderQuality);$('displayFPS').onchange=()=>setDisplayFPS($('displayFPS').value);$('displayQuality').onchange=()=>{renderQuality=Number($('displayQuality').value);try{localStorage.setItem('zenwreath-quality',String(renderQuality))}catch(e){}resizeGame()}};
resizeGame();
