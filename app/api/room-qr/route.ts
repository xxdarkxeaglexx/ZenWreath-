import { env } from 'cloudflare:workers';
import qrcode from 'qrcode-generator';
import { getChatGPTUser } from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return new Response('Sign in first',{status:401});
 const code=new URL(request.url).searchParams.get('code')||'';if(!/^[A-Z2-9]{8}$/.test(code))return new Response('Invalid room',{status:400});
 const member=await env.DB!.prepare('SELECT m.user_id FROM members m JOIN rooms r ON r.code=m.room WHERE m.room=? AND m.user_id=? AND r.expires>?').bind(code,user.userId,Date.now()).first();if(!member)return new Response('Join this room first',{status:403});
 const qr=qrcode(0,'M');qr.addData('https://lantern-grove.xxdarkxeaglexx.chatgpt.site/?room='+code);qr.make();
 return new Response(qr.createSvgTag({cellSize:6,margin:24,scalable:true}),{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store'}});
}
