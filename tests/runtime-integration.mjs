import vm from 'node:vm';import {readFileSync} from 'node:fs';import {webcrypto} from 'node:crypto';import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';import {readdirSync,mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
const {build}=await import('esbuild');const output=mkdtempSync(tmpdir()+'/zen-runtime-');await build({entryPoints:['server/rooms.ts','server/grove.ts'],bundle:true,platform:'node',format:'esm',outdir:output,outExtension:{'.js':'.mjs'},logLevel:'error'});const {handleRooms}=await import(pathToFileURL(output+'/rooms.mjs'));const {handleGrove}=await import(pathToFileURL(output+'/grove.mjs'));
const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));const db={prepare(sql){return{bind(...args){const q=sqlite.prepare(sql),p=args.map(x=>x??null);return{first:async()=>q.get(...p)||null,all:async()=>({results:q.all(...p)}),run:async()=>({meta:{changes:Number(q.run(...p).changes)}})}}}}};
async function apiFor(id,path,options={}){const request=new Request('https://game.test'+path,options);return (path==='/api/rooms'?handleRooms:handleGrove)(request,{userId:id},db)}
for(const id of ['host','guest'])await apiFor(id,'/api/grove',{method:'POST',body:JSON.stringify({action:'profile',name:id,avatar:'fox',timezone:'UTC'})});
function runtime(id,search=''){
const nodes=new Map(),timers=[],frames=[],storage=new Map();
const noop=()=>{};const ctx=new Proxy({measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),getImageData:()=>({data:new Uint8ClampedArray(4)}),canvas:{width:800,height:400}}, {get:(o,k)=>k in o?o[k]:noop});
function node(id=''){return {id,style:{setProperty:noop,removeProperty:noop},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},children:[],get firstChild(){return node()},get firstElementChild(){return node()},get lastElementChild(){return node()},get parentElement(){return node()},get parentNode(){return node()},get options(){return[]},width:800,height:400,clientWidth:800,clientHeight:400,offsetWidth:800,offsetHeight:400,open:false,hidden:false,value:'',textContent:'',innerHTML:'',append:noop,appendChild:noop,prepend:noop,after:noop,before:noop,remove:noop,insertBefore:noop,replaceChildren:noop,removeAttribute:noop,setAttribute:noop,getAttribute:()=>null,addEventListener:noop,removeEventListener:noop,getBoundingClientRect:()=>({left:0,top:0,width:800,height:400}),getContext:()=>ctx,querySelector:sel=>el(id+sel),querySelectorAll:()=>[],showModal(){this.open=true},close(){this.open=false},focus:noop,click:noop,contains:()=>false,toDataURL:()=>'',setPointerCapture:noop,releasePointerCapture:noop};}function el(id){if(!nodes.has(id))nodes.set(id,node(id));return nodes.get(id)}
const document={getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:()=>node(),body:node(),head:node(),documentElement:node(),addEventListener:noop,hidden:false};
const c=vm.createContext({console,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem:noop,removeItem:noop},navigator:{},location:{search,protocol:'http:',href:'https://game.test/?room=RW32HC37'},URL,URLSearchParams,AbortController,structuredClone,crypto:webcrypto,performance:{now:()=>0},setInterval:(f,ms)=>timers.push({f,ms}),setTimeout:()=>0,clearTimeout:noop,requestAnimationFrame:f=>frames.push(f),matchMedia:()=>({matches:false,addEventListener:noop}),getComputedStyle:()=>({getPropertyValue:()=>'',display:'block'}),devicePixelRatio:1,innerWidth:800,innerHeight:400,addEventListener:noop,Image:class{},Path2D:class{},ResizeObserver:class{observe(){}},fetch:(path,options)=>apiFor(id,path,options)});c.window=c;c.screen={orientation:{}};
const html=readFileSync('public/game.html','utf8');for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){const src=m[1].match(/src="([^"]+)"/);const name=src?src[1].split('/').pop():'inline';if(name==='boot.js')continue;try{vm.runInContext(src?readFileSync('public/'+name,'utf8'):m[2],c,{filename:name});}catch(e){console.error('LOAD',name,e);process.exit(1)}}
return {c,storage,timers,el,run:code=>vm.runInContext(code,c)};}

const host=runtime('host');host.run(`termsAccepted=true;s=world(2035966005,0);s.rpg={...normalizeRPG({xp:400,owned:['blade','bow'],weapon:'bow'}),version:2};s.gems=80;`);await host.run('refreshAccount()');await host.run('inviteIntoMyRealm()');assert(host.run('team.inGame'),'Host enters current realm');const code=host.run('team.room.code');
const guest=runtime('guest','?room='+code);guest.run(`termsAccepted=true;s=world(123,0);s.rpg={...normalizeRPG({xp:950,owned:['blade','spear'],weapon:'spear',inventory:{owned:['briarplate'],armor:'briarplate'}}),version:2};s.gems=45;`);await guest.run('refreshAccount()');await guest.run('multiplayer()');assert(guest.run('team.inGame'),'Link enters running realm');assert.equal(guest.run('rpgState().xp'),950);assert.equal(guest.run('rpgState().weapon'),'spear');assert.equal(guest.run('inventoryState().armor'),'briarplate');
for(const client of [host,guest]){await client.run(`roomEvent('tick')`);client.run('draw()');assert.equal(client.run('team.room.players.length'),2);assert(client.run('team.room.players.every(p=>p.online)'));}
const snapshot=guest.run('JSON.stringify(team.room)');guest.run(`applyRoom({...JSON.parse(${JSON.stringify(snapshot)}),version:-1,game:{}})`);assert.equal(guest.run('rpgState().xp'),950,'Stale replies ignored by every hook');
// Run actual render/update and server travel for every area; both clients follow.
for(const area of ['shop','outdoor','inn','outdoor','dungeon','outdoor']){
 host.run(`if(${JSON.stringify(area)}!=='outdoor'){const b=s.buildings.find(b=>b.id===${JSON.stringify(area)});s.player.x=b.x;s.player.y=b.y+44}else{const p=typeof dungeonExit==='function'&&s.area==='dungeon'?dungeonExit(s):{x:144,y:320};s.player.x=p.x;s.player.y=p.y}`);
 const result=await host.run(`roomEvent('travel',{destination:${JSON.stringify(area)}})`);assert(result, 'travel '+area);assert.equal(host.run('s.area'),area);await guest.run(`roomEvent('tick')`);assert.equal(guest.run('s.area'),area);host.run('draw()');guest.run('draw()');
}
const expectedXP=guest.run('rpgState().xp')+120;guest.run(`earnXP(120,'runtime-reward');save()`);assert.equal(guest.run('rpgState().xp'),expectedXP);assert.equal(JSON.parse(guest.storage.get(guest.run('KEY'))).rpg.xp,expectedXP);await guest.run('leaveTeam()');assert.equal(guest.run('s.seed'),123);assert.equal(guest.run('rpgState().xp'),expectedXP);assert.equal(guest.run('inventoryState().armor'),'briarplate');
host.run('s.crystals=2;save()');assert.equal(JSON.parse(host.storage.get(host.run('KEY'))).crystals,2,'Host saves current realm during party');await host.run('leaveTeam()');assert.equal(host.run('s.crystals'),2);
// Load all five realms at both combat difficulties through the combined renderer.
for(const ch of [0,1,2,3,4])for(const difficulty of ['medium','hard'])host.run(`s=world(9281,${ch});changeDifficulty('${difficulty}');update();draw();`);
const fresh=runtime('guest','?room='+code);fresh.run('termsAccepted=true;gentlePlay=true;');await fresh.run('refreshAccount()');fresh.run(readFileSync('public/boot.js','utf8'));for(let i=0;i<15;i++)await new Promise(setImmediate);assert(fresh.run('team.inGame'),'Startup invite works with Peaceful preference and restored account');assert(fresh.run(`rpgState().xp>=${expectedXP}`),'New client restores earned cloud XP');
console.log('PASS: all shipped scripts load together; two real server-backed client runtimes create/join/render/tick/travel/leave; own XP and armor persist; stale replies ignored; host live saves preserved; all five realms render at both difficulties; startup invite restores cloud character. DOM and canvas are mocked, not a browser playthrough.');

// User-visible recovery paths, including pasted invites before authentication.
const recovery=runtime('guest');recovery.run('termsAccepted=true;');await recovery.run(`joinRealmLink('${code}')`);assert(recovery.el('extra').innerHTML.includes(encodeURIComponent('/?room='+code)),'Pasted room survives sign-in');await recovery.run('refreshAccount()');recovery.c.fetch=async()=>new Response(JSON.stringify({error:'This room has expired.'}),{status:404,headers:{'Content-Type':'application/json'}});await recovery.run(`joinRealmLink('${code}')`);assert.equal(recovery.el('dialogTitle').textContent,'This invite has expired.');assert.equal(recovery.run('joiningRealmLink'),false,'Failure releases join lock');recovery.c.fetch=(path,options)=>apiFor('guest',path,options);await recovery.run(`joinRealmLink('${code}')`);assert(recovery.run('team.inGame'),'Retry succeeds after reconnect');recovery.run('syncQuest()');assert(recovery.run('team.inGame'),'Cloud switch blocked during party');
console.log('PASS: pasted-invite sign-in return, visible expired-room message, retry after failure, and cloud-switch guard.');

const priorRoom=recovery.run('team.room.code');sqlite.prepare('UPDATE rooms SET expires=0 WHERE code=?').run(priorRoom);await recovery.run('inviteIntoMyRealm()');assert(recovery.run('team.inGame'));assert.notEqual(recovery.run('team.room.code'),priorRoom,'Expired party replaced when host asks to invite again');console.log('PASS: expired room can be replaced with a fresh current-realm invite.');

// Lightweight movement synchronization and authoritative shared magic events.
const linkedCode=recovery.run('team.room.code');await host.run(`joinRealmLink('${linkedCode}')`);assert(host.run('team.inGame'));
let liveNow=1000;host.c.performance.now=()=>liveNow;recovery.c.performance.now=()=>liveNow;
recovery.run('paused=false;');host.run('paused=false;');await recovery.run('quantumPoll()');await host.run('quantumPoll()');
const otherId=host.run('team.room.players.find(p=>!p.self).id');const oldX=host.run(`quantumPeers.get('${otherId}').to.x`);
recovery.run('s.player.x+=20;');liveNow+=300;await recovery.run('quantumPoll()');await host.run('quantumPoll()');
assert.equal(host.run(`quantumPeers.get('${otherId}').to.x`),oldX+20,'Position updates reach teammate without a full-world tick');
liveNow+=60;const halfway=host.run(`quantumPose(quantumPeers.get('${otherId}').to).x`);assert(halfway>oldX&&halfway<oldX+20,'Remote motion interpolates between samples');
liveNow+=60;assert.equal(host.run(`quantumPose(quantumPeers.get('${otherId}').to).x`),oldX+20);
const heal=await recovery.run("roomEvent('spell',{spell:'heal'})");assert(heal);assert.equal(heal.game.liveEvents.at(-1).kind,'heal');liveNow+=200;await host.run('quantumPoll()');assert(host.run("quantumEffects.some(e=>e.kind==='heal')"),'Teammate sees accepted heal at caster location');const count=host.run('quantumEffects.length');host.c.duplicate=heal;host.run('quantumReceive(duplicate);quantumReceive(duplicate)');assert.equal(host.run('quantumEffects.length'),count,'No repeated magic after duplicate snapshots');host.run('draw()');recovery.run('draw()');
const presence=await (await apiFor('host','/api/rooms',{method:'POST',body:JSON.stringify({action:'presence',code:linkedCode,scene:host.run('quantumKey()')})})).json();assert(!('game'in presence),'Presence omits the full map');assert(presence.players.length===2);assert(presence.events.some(e=>e.kind==='heal'));
const unauthorized=await handleRooms(new Request('https://game.test/api/rooms',{method:'POST',body:JSON.stringify({action:'presence',code:linkedCode})}),null,db);assert.equal(unauthorized.status,401);
console.log('PASS: lightweight presence delivers movement to a second client, smooth interpolation reaches the destination, accepted magic appears once for both players, full map omitted, and anonymous access rejected.');

// An action queued before the latest presence must not rewind the shared player.
const delayed=recovery.run("payload('tick')");recovery.run('s.player.x+=12');liveNow+=300;await recovery.run('quantumPoll()');
const freshPosition=sqlite.prepare('SELECT x FROM members WHERE room=? AND user_id=?').get(linkedCode,'guest').x;
recovery.c.delayed=delayed;await recovery.run('roomAPI(delayed)');
assert.equal(sqlite.prepare('SELECT x FROM members WHERE room=? AND user_id=?').get(linkedCode,'guest').x,freshPosition,'Delayed full snapshots cannot overwrite newer presence positions');
// Prediction is short and bounded, rather than letting a disconnected player run forever.
liveNow+=300;await host.run('quantumPoll()');liveNow+=220;
const bounded=host.run(`quantumPose(quantumPeers.get('${otherId}').to).x`);liveNow+=3000;
assert.equal(host.run(`quantumPose(quantumPeers.get('${otherId}').to).x`),bounded,'Prediction stops after 100ms');
console.log('PASS: delayed tick cannot rewind presence; motion prediction stops during packet loss.');

// Reject blocked or malformed movement without changing the saved position.
const roomState=JSON.parse(sqlite.prepare('SELECT state FROM rooms WHERE code=?').get(linkedCode).state);
let wall;
for(let y=1;y<roomState.tiles.length-1&&!wall;y++)for(let x=1;x<roomState.tiles[y].length-1;x++)if(roomState.tiles[y][x]===1){wall={x:x*32+16,y:y*32+16,face:0};break}
assert(wall,'Fixture has an interior solid tile');
const beforeInvalid=sqlite.prepare('SELECT x,y FROM members WHERE room=? AND user_id=?').get(linkedCode,'host');
const blocked=await apiFor('host','/api/rooms',{method:'POST',body:JSON.stringify({action:'presence',code:linkedCode,scene:host.run('quantumKey()'),pose:wall,active:true})});
assert.equal(blocked.status,400,'Presence cannot place a player inside a wall');
assert.deepEqual(sqlite.prepare('SELECT x,y FROM members WHERE room=? AND user_id=?').get(linkedCode,'host'),beforeInvalid);
assert.equal((await apiFor('host','/api/rooms',{method:'POST',body:'[]'})).status,400);
console.log('PASS: server rejects solid-wall positions and array payloads without moving the player.');
