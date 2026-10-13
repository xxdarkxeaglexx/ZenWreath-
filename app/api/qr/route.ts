import { env } from 'cloudflare:workers';
import qrcode from 'qrcode-generator';
import { getChatGPTUser } from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return new Response('Sign in first',{status:401});
 const profile=await env.DB!.prepare('SELECT code FROM profiles WHERE user_id=?').bind(user.userId).first<{code:string}>();if(!profile)return new Response('Create your profile first',{status:404});
 const qr=qrcode(0,'M');qr.addData('https://lantern-grove.xxdarkxeaglexx.chatgpt.site/?friend='+profile.code);qr.make();
 return new Response(qr.createSvgTag({cellSize:6,margin:24,scalable:true}),{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store'}});
}
