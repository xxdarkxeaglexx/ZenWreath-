const ENEMY_BOOK={
 wisp:{name:'Wickdrift',hp:2,speed:45,reach:55,windup:1.25,recovery:1.2,color:'#bed9df',tip:'Wait for its glow, then sidestep the drifting strike.'},
 slime:{name:'Siltgell',hp:3,speed:28,reach:55,windup:1.5,recovery:1.5,color:'#70bca0',tip:'A soft, slow lunge. Dodge away, then come back to strike.'},
 thorn:{name:'Burrhelm',hp:4,speed:37,reach:75,windup:1.5,recovery:1.4,color:'#96ada3',tip:'Watch its raised blade. Counter after the downward slash.'},
 beetle:{name:'Ruskcarapace',hp:6,speed:25,reach:65,windup:1.6,recovery:1.7,color:'#718b59',tip:'Slow, sturdy, and easy to dodge. Strike after its headbutt.'},
 moth:{name:'Fleckveil',hp:2,speed:60,reach:55,windup:1,recovery:1.15,color:'#ceaa88',tip:'Circles before diving. Dodge sideways as its wings fold.'},
 spriggan:{name:'Knuckleroot',hp:4,speed:64,reach:85,windup:1.5,recovery:1.6,color:'#887353',tip:'Closes quickly, then roots in place before striking.'},
 crab:{name:'Clackshell',hp:5,speed:33,reach:70,windup:1.35,recovery:1.5,color:'#799aa2',tip:'Wait for the claw warning, then counter.'},
 wolf:{name:'Grayscruff',hp:5,speed:67,reach:70,windup:1.15,recovery:1.45,color:'#819788',tip:'A quick bite with a clear pause. Dodge sideways, then counter.'},
 toad:{name:'Brackcroak',hp:5,speed:38,reach:80,windup:1.65,recovery:1.8,color:'#91a56b',tip:'Its throat swells before a hopping slam. Move beyond the orange circle.'},
 shroom:{name:'Puffmorrow',hp:4,speed:24,reach:92,windup:1.9,recovery:1.8,color:'#ba957c',tip:'The cap brightens before a spore pulse. Leave the orange circle, then return.'}
};
const WILD_ENEMIES=Object.keys(ENEMY_BOOK);
function upgradeEnemyRoster(game){if(!game)return;const lists=[game,...Object.values(game.areas||{})];for(const area of lists){if(area.faunaVersion===2)continue;for(let i=0;i<(area.enemies||[]).length;i++){const e=area.enemies[i];if(e.type==='boss'||e.type==='thorn')continue;const type={7:'wolf',8:'toad',9:'shroom'}[i%10];if(!type||!ENEMY_BOOK[e.type])continue;const oldMax=e.maxHp||ENEMY_BOOK[e.type].hp,fraction=Math.max(0,Math.min(1,e.hp/oldMax));e.type=type;e.name=ENEMY_BOOK[type].name;e.maxHp=ENEMY_BOOK[type].hp;e.hp=fraction===0?0:Math.max(1,Math.round(fraction*e.maxHp));}area.faunaVersion=2}game.faunaVersion=2}
