type DB={prepare:(sql:string)=>any,batch:(queries:any[])=>Promise<any>};
type User={userId:string,email:string}|null;
const OWNER='xxdarkxeaglexx@gmail.com';
const json=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleBeta(request:Request,user:User,db:DB,reportHash?:string){
 try{
 if(request.method==='GET'){
 let allowed=user?.email.toLowerCase()===OWNER;
 const access=request.headers.get('X-Beta-Report-Access');
 if(!allowed&&!user&&access&&reportHash){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(access)))).map(n=>n.toString(16).padStart(2,'0')).join('');allowed=hash===reportHash;}
 if(!allowed)return json({error:'Only the game owner can view beta reports.'},403);
 const stats=await db.prepare(`SELECT COUNT(*) testers, SUM(CASE WHEN role='volunteer' THEN 1 ELSE 0 END) volunteers, SUM(CASE WHEN role='dakota' THEN 1 ELSE 0 END) dakota_invites, MIN(first_seen) tracking_since FROM beta_testers`).first();
 const sessions=await db.prepare('SELECT COUNT(*) sessions, COALESCE(SUM(active_seconds),0) active_seconds FROM beta_sessions').first();
 const ratings=await db.prepare('SELECT COUNT(*) responses, AVG(rating) average_rating FROM beta_feedback').first();
 const testers=await db.prepare(`SELECT t.*, (SELECT COUNT(*) FROM beta_sessions s WHERE s.tester_id=t.id) sessions, (SELECT COALESCE(SUM(active_seconds),0) FROM beta_sessions s WHERE s.tester_id=t.id) active_seconds FROM beta_testers t ORDER BY last_seen DESC LIMIT 500`).all();
 const activity=await db.prepare('SELECT s.id,s.started,s.last_seen,s.active_seconds,s.snapshot,t.name,t.role FROM beta_sessions s JOIN beta_testers t ON t.id=s.tester_id ORDER BY s.last_seen DESC LIMIT 200').all();
 const feedback=await db.prepare('SELECT f.*,t.name,t.role FROM beta_feedback f JOIN beta_testers t ON t.id=f.tester_id ORDER BY f.created DESC LIMIT 500').all();
 return json({stats:{...stats,...sessions,...ratings},testers:testers.results,activity:activity.results.map((s:any)=>({...s,snapshot:s.snapshot?JSON.parse(s.snapshot):null,online:s.last_seen>Date.now()-45000})),feedback:feedback.results,generatedAt:new Date().toISOString(),note:'Signed-in account count; anonymous testers counted per browser. Multiple browsers may count the same person more than once. Session time counts visible, unpaused gameplay in intervals up to 30 seconds. Dakota links do not verify identity.'});
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Use the game to submit.'},403);
 const raw=await request.text();if(raw.length>8000)return json({error:'Submission too large.'},400);const b=JSON.parse(raw);
 if(!b||b.website||!['volunteer','dakota'].includes(b.role)||!['start','heartbeat','feedback'].includes(b.action)||typeof b.device!=='string'||!/^[a-f0-9-]{36}$/.test(b.device)||typeof b.session!=='string'||!/^[a-f0-9-]{36}$/.test(b.session))return json({error:'Invalid beta submission.'},400);
 if(b.termsVersion!=='2026-10-12'||b.accepted!==true)return json({error:'Accept the terms and beta agreement first.'},400);
 if(b.trackingVersion!=='2026-10-12-beta-tracking-v2')return json({error:'Review the updated beta monitoring notice.'},400);
 const clean:any={};const state=b.snapshot;if(state&&typeof state==='object'&&!Array.isArray(state)){for(const key of ['status','realm','area','class','weapon','difficulty'])if(typeof state[key]==='string')clean[key]=state[key].slice(0,80);for(const key of ['level','health','magic','gems','x','y','crystals','defeated'])if(typeof state[key]==='number'&&Number.isFinite(state[key])&&Math.abs(state[key])<=1e15)clean[key]=state[key];for(const key of ['shrine','complete','multiplayer'])clean[key]=state[key]===true;}const snapshot=JSON.stringify(clean);
 const id=user?'user:'+user.userId:'device:'+b.device,now=Date.now();
 const name=typeof b.name==='string'?b.name.trim().slice(0,30):'Beta adventurer';
 if(b.action==='start'){
 await db.batch([db.prepare(`INSERT INTO beta_testers(id,user_id,name,role,terms_version,accepted_at,first_seen,last_seen) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,role=excluded.role,last_seen=excluded.last_seen`).bind(id,user?.userId||null,name||'Beta adventurer',b.role,b.termsVersion,now,now,now),db.prepare('INSERT INTO beta_sessions(id,tester_id,started,last_seen,active_seconds,snapshot) VALUES(?,?,?,?,0,?) ON CONFLICT(id) DO NOTHING').bind(b.session,id,now,now,snapshot)]);
 return json({saved:true});
 }
 const session=await db.prepare('SELECT last_seen FROM beta_sessions WHERE id=? AND tester_id=?').bind(b.session,id).first();if(!session)return json({error:'Start your beta session first.'},409);
 if(b.action==='heartbeat'){
 const elapsed=Math.min(30,Math.max(0,Math.floor((now-session.last_seen)/1000)));const seconds=b.active===true?elapsed:0;
 await db.batch([db.prepare('UPDATE beta_sessions SET active_seconds=active_seconds+?,last_seen=?,snapshot=? WHERE id=? AND tester_id=?').bind(seconds,now,snapshot,b.session,id),db.prepare('UPDATE beta_testers SET last_seen=?,name=? WHERE id=?').bind(now,name||'Beta adventurer',id)]);return json({saved:true});
 }
 if(!Number.isInteger(b.rating)||b.rating<1||b.rating>5||typeof b.message!=='string'||b.message.trim().length<3||b.message.length>2000||!['opinion','bug','idea'].includes(b.category))return json({error:'Choose a rating and write 3–2000 characters.'},400);
 const recent=await db.prepare('SELECT COUNT(*) n FROM beta_feedback WHERE tester_id=? AND created>?').bind(id,now-3600000).first();if(recent.n>=5)return json({error:'Please wait before sending more feedback.'},429);
 const feedbackId=crypto.randomUUID();await db.prepare('INSERT INTO beta_feedback(id,tester_id,rating,category,message,created) VALUES(?,?,?,?,?,?)').bind(feedbackId,id,b.rating,b.category,b.message.trim(),now).run();return json({saved:true,reference:feedbackId});
 }catch{return json({error:'Could not save beta data. Please try again.'},500)}
}
