'use strict';
let magicTrayOpen=false;try{if(localStorage.getItem('zenwreath-map-visible')==null)miniMapVisible=false}catch(e){}
const magicLauncher=document.createElement('button');magicLauncher.id='magicLauncher';magicLauncher.textContent='✦ Magic';magicLauncher.setAttribute('aria-label','Open spells. Heal, Burst and Boost cost magic.');magicLauncher.setAttribute('aria-expanded','false');magicLauncher.setAttribute('aria-controls','magicTray');
spellBar.id='magicTray';spellBar.hidden=true;document.querySelector('.world').append(spellBar);
const touchMove=document.createElement('div');touchMove.className='touchMove';$('joystick').before(touchMove);touchMove.append($('joystick'));touchMove.append(magicLauncher);
// Keep the same Magic control in the right-thumb dock only while portrait.
const magicDockPortrait=matchMedia('(orientation: portrait)');
function placeMagicLauncher(){const host=magicDockPortrait.matches?document.querySelector('.actions'):touchMove;if(host&&magicLauncher.parentElement!==host)host.append(magicLauncher)}
placeMagicLauncher();magicDockPortrait.addEventListener('change',placeMagicLauncher);
function setMagicTray(open){magicTrayOpen=!!open;spellBar.hidden=!magicTrayOpen;magicLauncher.setAttribute('aria-expanded',String(magicTrayOpen));magicLauncher.classList.toggle('selected',magicTrayOpen)}
magicLauncher.onclick=()=>{if(!paused&&s)setMagicTray(!magicTrayOpen)};
const touchCast=castSpell;castSpell=function(key){const eligible=s&&!paused&&!s.complete&&SPELLS[key]&&!spellPending&&magicState()[key]<=0&&manaState().points>=SPELLS[key].cost;touchCast(key);if(eligible)setMagicTray(false)};
const touchShow=show;show=function(...args){setMagicTray(false);return touchShow(...args)};
// Keep map access beside Menu. The former toolbar lives in the menu now.
document.querySelector('.toplinks').append(mapButton);
$('dash').onclick=()=>{if(stickInput.x||stickInput.y)s.player.face=Math.atan2(stickInput.y,stickInput.x);dash()};
mainMenu=function(){appDialog('menu','ZENWREATH','Take a moment.','Your quest is paused and saved.',[['▶ Back to game',returnToGame,true]],'<div class="touchMenu">'+[['map','🗺','Map'],['look','🧑','Character'],['cafe','☕','Café'],['music','♫','Forest Flute'],['friends','👥','Friends'],['cards','✧','Postcards'],['journal','♡','Journal'],['settings','⚙','Settings']].map(([id,icon,label])=>'<button id="touch-menu-'+id+'"><span>'+icon+'</span>'+label+'</button>').join('')+'</div><p class="small">'+(s?'Health '+s.player.hp+'/'+maxHealth()+' · Magic '+manaState().points+'/'+maxMana()+' · '+s.gems+' light':'A little adventure is waiting.')+'</p><button class="wide" id="touchHome">⌂ Village welcome</button>');const actions={map:()=>adventureMap(),look:()=>{characterEditor(mainMenu);const b=document.createElement('button');b.textContent='Birthday class';b.onclick=birthdayClassMenu;$('buttons').append(b)},cafe:()=>s?cafeMenu():startCoffeeBreak(),music:ocarina,friends:friends,cards:postcardAlbum,journal:()=>gentleMode()?kidHelp():appDialog('journal','YOUR JOURNAL','Adventure & wellbeing.','Choose what you want to see.',[['Quest journal',journal,true],['Wellbeing',wellbeingMenu],['Back',mainMenu]]),settings:playSettings};for(const [id,fn]of Object.entries(actions))$('touch-menu-'+id).onclick=fn;$('touchHome').onclick=home;save();};
$('menu').onclick=()=>mainMenu();moreHome=mainMenu;menu=mainMenu;
const touchHome=home;home=function(){touchHome();const more=Array.from($('buttons').children).find(b=>b.textContent==='More');if(more)more.onclick=mainMenu};
const touchReadout=updateCombatReadout;updateCombatReadout=function(){touchReadout();guardButton.style.setProperty('--stamina',Math.max(0,Math.min(1,stamina/rpgStats().stamina)));guardButton.setAttribute('aria-label','Hold Guard to block attacks in front. Stamina '+Math.round(stamina)+' out of '+rpgStats().stamina)};
$('game').setAttribute('aria-label','Drag the joystick to move. Tap Attack to slash. Hold and release for a spin attack. Use appears near doors and objects. Tap Magic for spells. Tap clear ground to walk.');
const touchClose=close;close=function(){touchClose();resizeGame()};
resizeGame();
