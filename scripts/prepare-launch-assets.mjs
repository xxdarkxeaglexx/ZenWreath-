import {mkdir,copyFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const page=await readFile(new URL('../public/game.html',import.meta.url),'utf8');
const paths=[...new Set([...page.matchAll(/(?:src|href)="(\/launch\/v\d+\/[^"?]+)"/g)].map(m=>m[1]))];
for(const path of paths){const target=new URL('../public'+path,import.meta.url);await mkdir(new URL('.',target),{recursive:true});await copyFile(new URL('../public/'+path.split('/').at(-1),import.meta.url),target);}
for(const name of ['graphics-upgrade.js']){
 const target=new URL('../public/launch/v84/'+name,import.meta.url);
 await copyFile(new URL('../public/'+name,import.meta.url),target);
}
await build({entryPoints:[fileURLToPath(new URL('../public/three-renderer.mjs',import.meta.url))],bundle:true,format:'iife',platform:'browser',target:['safari16'],minify:true,outfile:fileURLToPath(new URL('../public/launch/v84/three-renderer.bundle.js',import.meta.url)),logLevel:'silent'});
console.log('Prepared '+paths.length+' versioned launch assets.');
