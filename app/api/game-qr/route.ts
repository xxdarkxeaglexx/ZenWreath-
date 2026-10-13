import qrcode from 'qrcode-generator';
export const dynamic='force-dynamic';
export async function GET(){
 const qr=qrcode(0,'M');qr.addData('https://lantern-grove.xxdarkxeaglexx.chatgpt.site/');qr.make();
 return new Response(qr.createSvgTag({cellSize:6,margin:24,scalable:true}),{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=3600'}});
}
