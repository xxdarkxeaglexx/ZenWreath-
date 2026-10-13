// Physical footprint matches the painted 32 × 18 ground slab, not its height.
function storyStoneBounds(item){return {id:'story-stone',x:item.x,y:item.y,left:item.x-16,right:item.x+16,top:item.y-9,bottom:item.y+9,approach:{x:item.x,y:item.y+32}}}
function storyObstacles(items,area='outdoor'){return area==='outdoor'||!area?(items||[]).filter(i=>i.discovery==='lore').map(storyStoneBounds):[]}
function storyStoneSlot(item){return Math.max(0,Math.min(2,Math.floor((Number(item.lore)||0)/4)))}
function storyStoneKey(chapter,item){return chapter+':'+storyStoneSlot(item)}
const STONE_CHRONICLES=[
 [
  {title:'The first lantern',text:'Before the paths had names, a keeper hung one lantern above a cold campfire. Its light did not chase the night away. It simply made room for travelers to find one another.',hint:'The campfire restores your health. Return there when the realm’s tasks are complete.'},
  {title:'What the Unlit took',text:'The Unlit did not steal the flame all at once. It scattered the lantern’s pieces through the grove, where small acts of courage would be needed to find them again.',hint:'Gather three crystals, help or defeat six creatures, and light the shrine to restore this realm.'},
  {title:'Pella Wickstitch’s promise',text:'Pella Wickstitch stayed when the lantern went dark. “Someone must keep the kettle warm,” she said. “Coming home should always feel possible.”',hint:'Kettlehook Café offers a free brew that restores health and magic. The kettle warms between visits.'}
 ],
 [
  {title:'The listening river',text:'The river carried the old songs farther than any road. Keepers learned to listen between its ripples, where the shrine’s three-note melody waited.',hint:'The shrine shows its three-note sequence. Repeat those notes in the same order to light it.'},
  {title:'Three drops of light',text:'Each crystal holds a memory of dawn. Three together can loosen a seal that a hundred sharp blades cannot break.',hint:'Gather three crystals and light the outdoor shrine before facing the sealed dungeon guardian.'},
  {title:'A bridge, not a wall',text:'Hobb Rattlepin built the first bridge from fallen branches. He kept a place at his counter for anyone whose journey needed a little help.',hint:'Hobb Rattlepin’s shop sells healing tea, a stronger edge, and a charm that shortens spell recovery.'}
 ],
 [
  {title:'The blade that waited',text:'The Dawnblade was set into stone by a keeper who feared that strength without patience would break more than it mended. Three thorn-bound sentinels were left to test those who sought it.',hint:'Defeat three Burrhelms in this quest, then pull the Dawnblade from its stone in Bellscar Works.'},
  {title:'Reading the warning',text:'The citadel’s guards once trained by listening to the pause before a strike. The smallest opening was often enough.',hint:'Orange attack warnings give you time to dodge. Strike while an enemy is recovering.'},
  {title:'The inner gate',text:'The ruin’s deepest door bears no lock. Its guardian answers only to the light returned to the shrine outside.',hint:'Enter the dungeon after restoring the outdoor shrine. The realm’s boss waits inside.'}
 ],
 [
  {title:'Veyr Hushwing’s quiet watch',text:'Veyr Hushwing kept watch through the longest night, counting no failures and demanding no hurry. Under the moon, a pause became another way of continuing.',hint:'Veyr Hushwing’s inn restores health. Peaceful difficulty is available in Settings whenever you want gentler exploration.'},
  {title:'A shared song',text:'When two travelers played beside the moonlit water, neither melody was quite the same. Together, the notes made a path both could follow.',hint:'Forest Flute notes can be heard by friends in your shared room when their sound is enabled.'},
  {title:'The breath between',text:'The Moonwood keepers wrote no command here, only a reminder: even a bright flame needs air.',hint:'Magic returns while you explore. Your class changes its recovery rate; check Stats before spending your last points.'}
 ],
 [
  {title:'Dawn belongs to everyone',text:'Five lantern pieces were never meant to honor one hero. Their light belonged to every hand that helped carry them home.',hint:'Shared-room quests combine your progress. Healing and Courage can support nearby teammates.'},
  {title:'Roots beneath the road',text:'The grove remembers the traveler who looked beyond the shortest path. Springs, herbs, and old stones keep small gifts for a curious eye.',hint:'Discoveries award light and XP. Read every story stone to complete these field notes.'},
  {title:'What the keeper learned',text:'At dawn the lantern burned again. The keeper found that courage had changed: it was no longer a promise to never fall, but a willingness to return.',hint:'After the guardian falls and your tasks are finished, return to camp to complete the five-realm journey.'}
 ]
];
function storyEntry(chapter,item){const ch=Math.max(0,Math.min(4,chapter)),slot=storyStoneSlot(item);return {key:storyStoneKey(ch,item),chapter:ch,slot,...STONE_CHRONICLES[ch][slot]}}
