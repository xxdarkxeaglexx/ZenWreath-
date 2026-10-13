'use strict';
// Native Touch Events back up Pointer Events, including embedded mobile browsers.
let nativeStickId=null,nativeAttackId=null,nativeGuardId=null,nativeCanvasTouch=null,lastNativeTap=-1000;
const touchById=(event,id)=>Array.from(event.touches||[]).find(t=>t.identifier===id);
const changedTouch=(event,id)=>Array.from(event.changedTouches||[]).some(t=>t.identifier===id);
function suppressTouch(event){if(event.cancelable!==false)event.preventDefault()}
const joystick=$('joystick');
joystick.addEventListener('touchstart',event=>{if(paused||!s||!joystickEnabled||nativeStickId!==null)return;const t=event.changedTouches[0];nativeStickId=t.identifier;suppressTouch(event);stickPointer='touch-'+t.identifier;setStick(t)},{passive:false});
joystick.addEventListener('touchmove',event=>{const t=touchById(event,nativeStickId);if(!t||paused)return;suppressTouch(event);stickPointer='touch-'+t.identifier;setStick(t)},{passive:false});
function releaseNativeStick(event){if(nativeStickId===null||!changedTouch(event,nativeStickId))return;suppressTouch(event);releaseStick({pointerId:stickPointer});nativeStickId=null}
for(const type of ['touchend','touchcancel'])window.addEventListener(type,releaseNativeStick,{passive:false});
$('slash').addEventListener('touchstart',event=>{if(paused||!s||nativeAttackId!==null)return;const t=event.changedTouches[0];nativeAttackId=t.identifier;suppressTouch(event);attackPointer='attack-touch-'+t.identifier;if(!attackHeld)beginAttackCharge()},{passive:false});
function releaseNativeAttack(event){if(nativeAttackId===null||!changedTouch(event,nativeAttackId))return;suppressTouch(event);releaseAttack({pointerId:attackPointer,type:event.type});targetRoute=[];nativeAttackId=null}
for(const type of ['touchend','touchcancel'])window.addEventListener(type,releaseNativeAttack,{passive:false});
guardButton.addEventListener('touchstart',event=>{if(paused||!s||gentleMode()||nativeGuardId!==null)return;const t=event.changedTouches[0];nativeGuardId=t.identifier;suppressTouch(event);if(!guarding)guardButton.onpointerdown({pointerId:'guard-touch-'+t.identifier,preventDefault(){}});if(guarding)guardPointer='guard-touch-'+t.identifier},{passive:false});
function releaseNativeGuard(event){if(nativeGuardId===null||!changedTouch(event,nativeGuardId))return;suppressTouch(event);stopGuard();nativeGuardId=null}
for(const type of ['touchend','touchcancel'])window.addEventListener(type,releaseNativeGuard,{passive:false});
function touchWalk(point){const rect=canvas.getBoundingClientRect();path=routeTo((point.clientX-rect.left)/view.zoom+view.left,(point.clientY-rect.top)/(view.zoom*renderPitch())+view.top);if(!path.length)toast('Tap open ground to walk, or drag the left joystick.')}
canvas.addEventListener('touchstart',event=>{if(paused||!s||nativeCanvasTouch)return;const t=event.changedTouches[0];suppressTouch(event);tapStart=null;nativeCanvasTouch={id:t.identifier,x:t.clientX,y:t.clientY,moved:false,enemy:enemyAtTouch(t)};if(nativeCanvasTouch.enemy>=0){if(targetTimer!==null)clearTimeout(targetTimer);targetFinger='world-touch-'+t.identifier;acquireTarget(nativeCanvasTouch.enemy);targetTimer=setTimeout(()=>{targetTimer=null;if(nativeCanvasTouch&&targetFinger!==null)beginTargetHold(targetIndex)},180)}},{passive:false});
canvas.addEventListener('touchmove',event=>{if(!nativeCanvasTouch)return;const t=touchById(event,nativeCanvasTouch.id);if(!t)return;suppressTouch(event);if(Math.hypot(t.clientX-nativeCanvasTouch.x,t.clientY-nativeCanvasTouch.y)>15)nativeCanvasTouch.moved=true;if(nativeCanvasTouch.enemy>=0){const next=enemyAtTouch(t);if(next>=0)acquireTarget(next)}},{passive:false});
function releaseCanvasTouch(event,cancelled=false){if(!nativeCanvasTouch||!changedTouch(event,nativeCanvasTouch.id))return;suppressTouch(event);const t=Array.from(event.changedTouches).find(t=>t.identifier===nativeCanvasTouch.id),start=nativeCanvasTouch;nativeCanvasTouch=null;lastNativeTap=Date.now();if(start.enemy>=0)endTargetHold();else if(!cancelled&&!start.moved&&!paused){tapStart=null;touchWalk(t)}}
canvas.addEventListener('touchend',event=>releaseCanvasTouch(event),{passive:false});canvas.addEventListener('touchcancel',event=>releaseCanvasTouch(event,true),{passive:false});
// Some in-app surfaces deliver a click without a complete pointer sequence.
canvas.addEventListener('click',event=>{if(paused||!s||Date.now()-lastNativeTap<500||event.detail===0)return;const enemy=enemyAtTouch(event);if(enemy>=0){acquireTarget(enemy);return}touchWalk(event)});
const nativeReset=resetInput;resetInput=function(){nativeReset();nativeStickId=nativeAttackId=nativeGuardId=null;nativeCanvasTouch=null};
const resumeTouch=document.createElement('button');resumeTouch.className='resumeTouch';resumeTouch.textContent='▶ Resume adventure';resumeTouch.hidden=true;resumeTouch.onclick=()=>{resetInput();close()};document.querySelector('.world').append(resumeTouch);
const nativeUpdate=update;update=function(){nativeUpdate();resumeTouch.hidden=!s||s.complete||!paused||$('modal').open};
resizeGame();update();
