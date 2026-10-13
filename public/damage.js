'use strict';
// This combat fix starts in Standard once; Peaceful remains an explicit option.
try{if(localStorage.getItem('zenwreath-damage-v41')!=='on'){gentlePlay=false;localStorage.setItem('zenwreath-gentle','0');localStorage.setItem('zenwreath-damage-v41','on');applyGentleUI()}}catch(e){gentlePlay=false}
const damageSpeed=monsterSpeed;monsterSpeed=function(e,d){if(team.inGame&&!team.room?.host)return 0;return damageSpeed(e,d)};
const protectionBadge=document.createElement('div');protectionBadge.id='protectionBadge';protectionBadge.className='protectionBadge';protectionBadge.hidden=true;document.querySelector('.world').append(protectionBadge);
function updateProtection(){if(!s){protectionBadge.hidden=true;return}const shelter=cozySafe(s.player),peace=gentleMode();protectionBadge.hidden=!(peace||shelter);protectionBadge.textContent=peace?'Peaceful · no damage':shelter?'Safe camp · no damage':'';protectionBadge.title=peace?'Choose Standard in Menu → Settings to take combat damage.':'Leave the camp shelter to enter combat.'}
const protectedUpdate=update;update=function(){protectedUpdate();updateProtection()};
const protectedTick=tickBosses;tickBosses=function(dt){protectedTick(dt);updateProtection()};
