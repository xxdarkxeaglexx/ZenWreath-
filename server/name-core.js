import {ENEMY_BOOK} from './enemy-core.js';
export const CAST_NAMES={luma:'Pella Wickstitch',bram:'Hobb Rattlepin',orin:'Veyr Hushwing'};
export const GUARDIAN_NAMES=['Harrowtine','Nacrecoil','Orrusk the Hollow Bell','Veliscreed','Caldrath'];
export const VAULT_NAMES=['Knucklewarren','Brinespire Sump','Bellscar Underworks','Veil Ossuary','Last Ember Keep'];
export function renameWorldCast(game){if(!game)return;const rename=area=>{if(!area)return;for(const e of area.enemies||[])if(e.type==='boss')e.name=GUARDIAN_NAMES[game.chapter];else if(ENEMY_BOOK[e.type])e.name=ENEMY_BOOK[e.type].name;for(const n of area.npcs||[])if(CAST_NAMES[n.id])n.name=CAST_NAMES[n.id];if(area.dungeon)area.dungeon.name=VAULT_NAMES[game.chapter];};rename(game);for(const area of Object.values(game.areas||{}))rename(area);for(const b of game.buildings||[]){if(b.id==='shop')b.name='Hobb Rattlepin’s shop';else if(b.id==='inn')b.name='Veyr Hushwing’s inn';else if(b.id==='dungeon')b.name=VAULT_NAMES[game.chapter];}}
