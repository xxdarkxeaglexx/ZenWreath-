'use strict';
function hardBossEnraged(e){return e.type==='boss'&&e.hp>0&&e.hp<e.maxHp*.5}
// No hidden hits: at least 0.75 seconds of windup, and a recovery opening.
const challengeWindup=enemyWindup,challengeRecovery=enemyRecovery;
enemyWindup=function(e){if(!hardMode())return challengeWindup(e);return Math.max(.75,rapidWindup(e)*(hardBossEnraged(e)?.67:.78))};
enemyRecovery=function(e){if(!hardMode())return challengeRecovery(e);return Math.max(.7,rapidRecovery(e)*(hardBossEnraged(e)?.65:.8))};
function challengeTarget(e){return combatTargets().filter(p=>!cozySafe(p)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0]}
const measuredSpeed=monsterSpeed;monsterSpeed=function(e,d){if(!hardMode()||bossShielded(e)||team.inGame&&!team.room?.host)return measuredSpeed(e,d);const target=challengeTarget(e);if(!target)return measuredSpeed(e,d);const distance=Math.hypot(target.x-e.x,target.y-e.y),phase=e.tactic?.phase;
 if(phase==='recover')return 0;
 // The final part of the telegraphed strike closes distance along its locked aim.
 if(phase==='windup'){if(!['wolf','thorn','spriggan','boss'].includes(e.type))return 0;return e.tactic.left<=.22&&e.tactic.left>.04?(e.type==='boss'?180:200):0}
 if(distance<360){const base=ENEMY_BOOK[e.type]?.speed||(e.type==='boss'?46:45);return base*(e.type==='boss'?(hardBossEnraged(e)?2.25:1.75):['wolf','moth','spriggan'].includes(e.type)?1.8:1.55)*((e.slowUntil||0)>Date.now()?(e.type==='boss'?.7:.4):1)}return measuredSpeed(e,d)};
const measuredAim=monsterAim;monsterAim=function(e,d){if(!hardMode())return measuredAim(e,d);if(e.tactic?.phase==='windup')return e.tactic.angle;const target=challengeTarget(e);if(!target)return measuredAim(e,d);const distance=Math.hypot(target.x-e.x,target.y-e.y);if(distance>=360)return measuredAim(e,d);const angle=Math.atan2(target.y-e.y,target.x-e.x),index=s.enemies.indexOf(e);const routed=hardRouteDirection(e,target);if(routed!==null)return routed;return angle+(distance>enemyReach(e)+25&&distance<250&&e.type!=='boss'?(index%2?1:-1)*.32:0)};
// Bosses signal their second phase without covering the playfield with a message.
const challengeEnemy=depthEnemy;depthEnemy=function(e){challengeEnemy(e);if(hardMode()&&hardBossEnraged(e))depthCaption('ENRAGED',e.x,e.y-143)};

const hardPaths=new WeakMap();
function hardRouteDirection(e,target){const distance=Math.hypot(target.x-e.x,target.y-e.y);let blocked=false;for(let d=16;d<distance;d+=16){const f=d/distance;if(solid(e.x+(target.x-e.x)*f,e.y+(target.y-e.y)*f)){blocked=true;break}}if(!blocked)return null;const key=s.seed+':'+s.chapter+':'+s.area+':'+Math.floor(target.x/32)+':'+Math.floor(target.y/32);let cached=hardPaths.get(e);if(!cached||cached.key!==key||s.chapterTime-cached.at>.6){cached={key,at:s.chapterTime,path:realmPath(s.tiles,[Math.floor(e.x/32),Math.floor(e.y/32)],[Math.floor(target.x/32),Math.floor(target.y/32)]).slice(1)};hardPaths.set(e,cached)}while(cached.path.length&&Math.hypot(cached.path[0].x-e.x,cached.path[0].y-e.y)<12)cached.path.shift();const next=cached.path[0];return next?Math.atan2(next.y-e.y,next.x-e.x):null}
