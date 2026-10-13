import {mkdir,copyFile,readFile} from 'node:fs/promises';
const page=await readFile(new URL('../public/game.html',import.meta.url),'utf8');
const paths=[...new Set([...page.matchAll(/(?:src|href)="(\/launch\/v\d+\/[^"?]+)"/g)].map(m=>m[1]))];
for(const path of paths){const target=new URL('../public'+path,import.meta.url);await mkdir(new URL('.',target),{recursive:true});await copyFile(new URL('../public/'+path.split('/').at(-1),import.meta.url),target);}
console.log('Prepared '+paths.length+' versioned launch assets.');
