'use strict';
let appStarted=false,startupAccountReady=false,startupInviteHandled=false;
function routeStartupInvite(){if(!appStarted||!startupAccountReady||!termsAccepted||startupInviteHandled)return;startupInviteHandled=true;if(roomCode()||new URLSearchParams(location.search).get('play')==='1')multiplayer();else if(inviteCode())friends()}
function startZenWreath(){if(appStarted)return;appStarted=true;resolveBuildingOverlap();resizeGame();update();updateCamera(1);draw();if(requireTerms())welcome();$('bootCover').hidden=true;document.documentElement.removeAttribute('data-booting');last=performance.now();requestAnimationFrame(frame);refreshAccount().then(()=>{startupAccountReady=true;updateMemberBar();routeStartupInvite()}).catch(()=>{});}
startZenWreath();
