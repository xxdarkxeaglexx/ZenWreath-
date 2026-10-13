export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const q=await searchParams;const friend=typeof q?.friend==='string'&&/^[A-F0-9]{24}$/.test(q.friend)?q.friend:'';
 const rawRoom=typeof q?.room==='string'?q.room.trim().toUpperCase():'';
 const room=/^[A-Z2-9]{8}$/.test(rawRoom)?rawRoom:'';
 const beta=q?.beta==='volunteer'||q?.beta==='dakota'?q.beta:'';
 const params=new URLSearchParams();if(room)params.set('room',room);else if(friend)params.set('friend',friend);if(beta)params.set('beta',beta);if(q?.play==='1')params.set('play','1');
 return <iframe title="ZenWreath adventure" src={'/game.html'+(params.size?'?'+params.toString():'')} style={{border:0,width:'100%',height:'100dvh',display:'block'}} allowFullScreen allow="fullscreen; clipboard-write; autoplay; web-share" />;
}
