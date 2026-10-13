import * as THREE from 'three';

const source=document.getElementById('game');
const host=source?.parentElement;
let renderer,scene,camera,material,texture,mesh,ready=false,failed=false,lastWidth=0,lastHeight=0,frameSamples=[];

const vertexShader=`
 varying vec2 vUv;
 void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}
`;
const fragmentShader=`
 uniform sampler2D tScene;
 uniform vec2 resolution;
 uniform float time;
 uniform float strength;
 uniform float ao;
 varying vec2 vUv;
 vec3 sampleScene(vec2 uv){return texture2D(tScene,uv).rgb;}
 void main(){
   float shade=smoothstep(.05,.95,vUv.y);
   vec3 tint=mix(vec3(.98,.72,.34),vec3(.16,.34,.42),shade);
   float edge=smoothstep(.34,.76,distance(vUv,vec2(.5)));
   float sun=pow(max(0.0,1.0-distance(vUv,vec2(.2,.08))*1.25),3.0);
   float alpha=.025+edge*(ao>.5?.075:.045)+sun*strength*.055;
   gl_FragColor=vec4(mix(tint,vec3(.035,.075,.09),edge*.78),alpha);
 }
`;

function init(){
 if(ready||failed||!source||!host)return;
 try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'high-performance',premultipliedAlpha:false});
   renderer.domElement.className='zen-three-output';renderer.domElement.setAttribute('aria-hidden','true');
   renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.setClearColor(0x000000,0);
   scene=new THREE.Scene();camera=new THREE.Camera();
   texture=new THREE.CanvasTexture(source);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
   material=new THREE.ShaderMaterial({uniforms:{tScene:{value:texture},resolution:{value:new THREE.Vector2(1,1)},time:{value:0},strength:{value:.55},ao:{value:0}},vertexShader,fragmentShader,depthTest:false,depthWrite:false,toneMapped:false});
   mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);scene.add(mesh);host.insertBefore(renderer.domElement,source.nextSibling);ready=true;
 }catch(error){failed=true;console.warn('ZenWreath GPU finishing unavailable; using canvas fallback.',error)}
}
function resize(preset){const rect=source.getBoundingClientRect();if(rect.width<1||rect.height<1)return false;const w=Math.max(1,source.width||Math.round(rect.width)),h=Math.max(1,source.height||Math.round(rect.height));if(w!==lastWidth||h!==lastHeight){lastWidth=w;lastHeight=h;renderer.setPixelRatio(1);renderer.setSize(w,h,false);material.uniforms.resolution.value.set(w,h)}return true}
function render(input,state={}){init();if(!ready||!resize(state.preset))return;const post=state.preset?.post!==false;renderer.domElement.hidden=!post;source.style.opacity='';if(!post)return;const started=performance.now();material.uniforms.time.value=state.time||0;material.uniforms.strength.value=state.preset&&state.preset.ao?0.62:0.42;material.uniforms.ao.value=state.preset?.ao?1:0;renderer.render(scene,camera);frameSamples.push(performance.now()-started);if(frameSamples.length>120)frameSamples.shift()}
function dispose(){if(!ready)return;texture.dispose();material.dispose();mesh.geometry.dispose();renderer.dispose();renderer.domElement.remove();source.style.opacity='';ready=false}
window.ZenWreathThree={render,dispose,version:THREE.REVISION,metrics:()=>({renderer:'Three.js r'+THREE.REVISION,preset:window.zenGraphicsTier?.()||'unknown',samples:frameSamples.length,averageGpuSubmitMs:frameSamples.length?frameSamples.reduce((a,b)=>a+b,0)/frameSamples.length:0,drawCalls:renderer?.info.render.calls||0,triangles:renderer?.info.render.triangles||0,width:lastWidth,height:lastHeight})};
window.addEventListener('pagehide',dispose,{once:true});
window.addEventListener('zen-graphics-change',()=>{if(ready){lastWidth=lastHeight=0}});
