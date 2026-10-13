import {realmTilesValid} from './realm-invite-core.js';
export function cleanAppearance(v:any){const allowed:Record<string,string[]>={"kind":["human","fox","owl","bear","sprite"],"skin":["peach","tan","brown","deep","honey","rose","olive","umber"],"hair":["chestnut","dark","gold","silver","copper","cream","auburn","teal","lavender"],"style":["short","bob","braid","curls","bun","swept","none"],"outfit":["forest","ocean","amber","plum","rose","slate","cream","rust","night","mint"],"garment":["coat","vest","apron","knit"],"accent":["gold","teal","rose","cream","slate"],"accessory":["beret","cape","flower","scarf","goggles","satchel","leaf","none"],"boots":["brown","dark","sand","berry"],"eyes":["dark","hazel","blue","green"],"weapon":["leaf","brass","moon"],"shield":["none","wreath","wood","petal"]};const defaults:Record<string,string>={"garment":"coat","accent":"teal","boots":"brown","eyes":"dark","weapon":"leaf","shield":"wreath"};if(!v||typeof v!=='object'||Array.isArray(v))return null;let look:Record<string,string>={};for(const [key,choices] of Object.entries(allowed)){const value=key==='accessory'&&v[key]==='hood'?'beret':v[key]??defaults[key];if(typeof value!=='string'||!choices.includes(value))return null;look[key]=value}return look}
function readAppearance(value:string|null){if(!value)return null;try{return cleanAppearance(JSON.parse(value))}catch{return null}}
export function zodiacFor(month:number,day:number){const lengths=[31,29,31,30,31,30,31,31,30,31,30,31];if(!Number.isInteger(month)||!Number.isInteger(day)||month<1||month>12||day<1||day>lengths[month-1])return null;const n=month*100+day;const ends=[119,218,320,419,520,620,722,822,922,1022,1121,1221];return ['capricorn','aquarius','pisces','aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius'][ends.findIndex(end=>n<=end)]||'capricorn'}
export const HABITS:Record<string,number>={water:5,meal:5,move:10,calm:5,connect:10,rest:5};
type User={userId:string};
type DB={prepare:(s:string)=>any,batch:(s:any[])=>Promise<any>};
const json=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const fail=(message:string,status=400):never=>{throw {message,status}};
const now=()=>new Date().toISOString();
export function localDay(tz:string){return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export function pairKey(a:string,b:string){return [a,b].sort().join('|')}
export function checkData(v:any){
 const n=(k:string,min:number,max:number)=>{if(v[k]===null||v[k]===undefined||v[k]==='')return null;if(typeof v[k]!=='number'||!Number.isFinite(v[k])||v[k]<min||v[k]>max)fail('Please check the '+k+' value.');return v[k]};
 return {mood:n('mood',1,5),craving:n('craving',0,10),sleep:n('sleep',0,24),water:n('water',0,100),cigarettes:n('cigarettes',0,200),drinks:n('drinks',0,100),note:typeof v.note==='string'?v.note.trim().slice(0,500):''};
}
async function points(db:DB,id:string,since='0000-00-00'){
 const p=await db.prepare(`SELECT COALESCE((SELECT SUM(points) FROM habits WHERE user_id=? AND day>=?),0)+COALESCE((SELECT COUNT(*)*10 FROM checkins WHERE user_id=? AND day>=?),0)+COALESCE((SELECT SUM(points) FROM quests WHERE user_id=? AND day>=?),0) AS points`).bind(id,since,id,since,id,since).first();return Number(p?.points||0);
}
async function state(db:DB,id:string){
 const profile=await db.prepare('SELECT code,name,avatar,share,timezone,sound,volume,class,appearance FROM profiles WHERE user_id=?').bind(id).first();if(!profile)return{signedIn:true,profile:null};
 const day=localDay(profile.timezone),week=new Date(day+'T12:00:00Z');week.setUTCDate(week.getUTCDate()-6);const since=week.toISOString().slice(0,10);
 const entries=await db.prepare('SELECT day,data FROM checkins WHERE user_id=? ORDER BY day DESC LIMIT 14').bind(id).all();
 const done=await db.prepare('SELECT action,points FROM habits WHERE user_id=? AND day=?').bind(id,day).all();
 const relations=await db.prepare(`SELECT f.pair,f.requester,f.status,CASE WHEN f.a=? THEN f.b ELSE f.a END AS friend_id,p.name,p.avatar,p.share,p.class,p.appearance FROM friendships f JOIN profiles p ON p.user_id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE (f.a=? OR f.b=?) AND f.status IN ('pending','accepted') ORDER BY f.created DESC`).bind(id,id,id,id).all();
 const friends=[];
 for(const f of relations.results||[]){const live=f.status==='accepted'?await db.prepare("SELECT m.room,r.status FROM members m JOIN rooms r ON r.code=m.room WHERE m.user_id=? AND m.seen>? AND r.expires>? AND r.status IN ('lobby','playing') ORDER BY m.seen DESC LIMIT 1").bind(f.friend_id,Date.now()-30000,Date.now()).first():null;friends.push({id:f.pair,online:!!live,roomCode:live?.room||null,name:f.name,avatar:f.avatar,class:f.class,appearance:readAppearance(f.appearance),status:f.status,incoming:f.requester!==id,weekly:f.status==='accepted'&&f.share?await points(db,f.friend_id,since):null})}
 const save=await db.prepare('SELECT data,updated FROM saves WHERE user_id=?').bind(id).first();
 return{signedIn:true,profile:{...profile,appearance:readAppearance(profile.appearance)},day,points:await points(db,id),weekly:await points(db,id,since),entries:(entries.results||[]).map((e:any)=>({day:e.day,...JSON.parse(e.data)})),habits:done.results||[],friends,game:save?{data:JSON.parse(save.data),updated:save.updated}:null};
}
export async function handleGrove(request:Request,user:User|null,db:DB){
 try{
 if(!user){if(request.method==='GET')return json({signedIn:false,profile:null});return json({error:'Sign in to save a profile and connect with friends.'},401)}
 const id=user.userId;
 if(request.method==='GET')return json(await state(db,id));
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)fail('This request must come from the game.',403);
 const raw=await request.text();if(raw.length>256000)fail('That update is too large.');let body:any;try{body=JSON.parse(raw)}catch{fail('Please send a valid update.')}
 if(!body||typeof body!=='object'||Array.isArray(body))fail('Invalid update.');
 if(body.action==='deleteAccount'){
 if(body.confirm!=='DELETE')fail('Confirm deletion by typing DELETE.');
 await db.batch([
 db.prepare('DELETE FROM rooms WHERE host=? OR code IN (SELECT room FROM members WHERE user_id=?)').bind(id,id),
 db.prepare('DELETE FROM members WHERE user_id=? OR room NOT IN (SELECT code FROM rooms)').bind(id),
 db.prepare('DELETE FROM friendships WHERE a=? OR b=?').bind(id,id),
 ...['checkins','habits','quests','saves','profiles'].map(table=>db.prepare('DELETE FROM '+table+' WHERE user_id=?').bind(id)),
 db.prepare('DELETE FROM support_requests WHERE user_id=?').bind(id),
 db.prepare('DELETE FROM beta_feedback WHERE tester_id=?').bind('user:'+id),
 db.prepare('DELETE FROM beta_sessions WHERE tester_id=?').bind('user:'+id),
 db.prepare('DELETE FROM beta_testers WHERE user_id=?').bind(id)
 ]);
 return json({deleted:true,signedIn:true,profile:null});
 }
 if(body.action==='profile'){
 const name=typeof body.name==='string'?body.name.trim():'';if(name.length<1||name.length>30)fail('Choose a nickname between 1 and 30 characters.');
 const avatar=['human','fox','owl','bear','sprite'].includes(body.avatar)?body.avatar:'fox';let timezone=typeof body.timezone==='string'?body.timezone:'America/Chicago';try{localDay(timezone)}catch{fail('Choose a valid time zone.')}
 const code=Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
 await db.prepare('INSERT INTO profiles(user_id,code,name,avatar,share,timezone,created) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,avatar=excluded.avatar,share=excluded.share,timezone=excluded.timezone').bind(id,code,name,avatar,body.share===true?1:0,timezone,now()).run();
 return json(await state(db,id));
 }
 const profile=await db.prepare('SELECT code,name,timezone FROM profiles WHERE user_id=?').bind(id).first();if(!profile)fail('Create your adventurer profile first.',409);
 if(body.action==='appearance'){const look=cleanAppearance(body.appearance);if(!look)return json({error:'Choose one of the available character options.'},400);await db.prepare('UPDATE profiles SET appearance=?,avatar=? WHERE user_id=?').bind(JSON.stringify(look),look.kind,id).run();return json(await state(db,id));}
 if(body.action==='class'){const sign=zodiacFor(body.month,body.day);if(!sign)fail('Choose a valid birthday month and day.');await db.prepare('UPDATE profiles SET class=? WHERE user_id=?').bind(sign,id).run();return json(await state(db,id));}
 const day=localDay(profile.timezone);
 if(body.action==='checkin'){
 const data=checkData(body.data||{});
 if(Object.values(data).every(v=>v===null||v===''))fail('Enter at least one check-in value.');
 await db.prepare('INSERT INTO checkins(user_id,day,data,updated) VALUES(?,?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET data=excluded.data,updated=excluded.updated').bind(id,day,JSON.stringify(data),now()).run();
 }else if(body.action==='habit'){
 if(!Object.hasOwn(HABITS,body.habit))fail('Unknown small action.');
 await db.prepare('INSERT OR IGNORE INTO habits(user_id,day,action,points) VALUES(?,?,?,?)').bind(id,day,body.habit,HABITS[body.habit]).run();
 }else if(body.action==='quest'){
 if(typeof body.run!=='string'||!/^\d{1,12}$/.test(body.run)||!Number.isInteger(body.seconds)||body.seconds<60||body.seconds>900||!['restored','session'].includes(body.outcome))fail('Finish a quest before collecting its points.');
 await db.prepare(`INSERT OR IGNORE INTO quests(user_id,run,day,points,seconds,outcome) SELECT ?,?,?,25,?,? WHERE (SELECT COUNT(*) FROM quests WHERE user_id=? AND day=?)<3`).bind(id,body.run,day,body.seconds,body.outcome,id,day).run();
 }else if(body.action==='save'){
 const g=body.game;if(!g||g.version!==1||!Number.isInteger(g.seed)||!g.player||!realmTilesValid(g.tiles))fail('Invalid quest save.');
 const data=JSON.stringify(g);if(data.length>240000)fail('Quest save is too large.');
 await db.prepare('INSERT INTO saves(user_id,data,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,updated=excluded.updated').bind(id,data,now()).run();return json({saved:true,updated:now()});
 }else if(body.action==='friend'){
 if(typeof body.code!=='string'||! /^[A-F0-9]{24}$/.test(body.code))fail('Paste a complete friend invite code.');
 const other=await db.prepare('SELECT user_id FROM profiles WHERE code=?').bind(body.code).first();if(!other)fail('That invite code was not found.',404);if(other.user_id===id)fail('That is your own invite. Share it with a friend.');
 const count=await db.prepare(`SELECT COUNT(*) AS n FROM friendships WHERE (a=? OR b=?) AND status IN ('pending','accepted')`).bind(id,id).first();if(count.n>=25)fail('Your circle is full. Remove an invite before adding more.');
 const pair=pairKey(id,other.user_id),existing=await db.prepare('SELECT status FROM friendships WHERE pair=?').bind(pair).first();if(existing&&['declined','blocked'].includes(existing.status))fail('This invitation is not available.');
 const [a,b]=[id,other.user_id].sort();await db.prepare('INSERT OR IGNORE INTO friendships(pair,a,b,requester,status,created) VALUES(?,?,?,?,?,?)').bind(pair,a,b,id,'pending',now()).run();
 }else if(['accept','decline','remove'].includes(body.action)){
 const f=await db.prepare('SELECT * FROM friendships WHERE pair=? AND (a=? OR b=?)').bind(String(body.id||''),id,id).first();if(!f)fail('Friend request not found.',404);
 if(body.action==='accept'||body.action==='decline'){if(f.requester===id||f.status!=='pending')fail('Only the invited player can answer this request.',403);await db.prepare('UPDATE friendships SET status=? WHERE pair=?').bind(body.action==='accept'?'accepted':'declined',f.pair).run()}
 else await db.prepare('DELETE FROM friendships WHERE pair=?').bind(f.pair).run();
 }else if(body.action==='audio'){
 if(typeof body.sound!=='boolean'||!Number.isInteger(body.volume)||body.volume<0||body.volume>100)fail('Choose a valid sound level.');
 await db.prepare('UPDATE profiles SET sound=?,volume=? WHERE user_id=?').bind(body.sound?1:0,body.volume,id).run();
 }else if(body.action==='deleteHealth'){
 await db.prepare('DELETE FROM checkins WHERE user_id=?').bind(id).run();
 }else fail('Unknown update.');
 return json(await state(db,id));
 }catch(e:any){return json({error:e?.status?e.message:'Could not save that update. Please try again.'},e?.status||500)}
}
