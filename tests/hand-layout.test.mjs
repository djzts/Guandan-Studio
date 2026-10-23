import test from 'node:test';
import assert from 'node:assert/strict';
import {rankStacks,arrangementSections} from '../src/hand-layout.js';
import {deck,recognize} from '../src/engine.js';

test('every selection of an eight-card rank preserves visible headers and selected foreground',()=>{
  const cards=deck().filter(c=>c.rank===4);
  for(let mask=0;mask<256;mask++){
    const selected=new Set(cards.filter((c,i)=>mask&(1<<i)).map(c=>c.id));
    const [stack]=rankStacks(cards,selected);
    assert.equal(new Set(stack.slots.map(s=>s.card.id)).size,8);
    let reachedSelection=false;
    stack.slots.forEach((slot,i)=>{
      if(selected.has(slot.card.id))reachedSelection=true;
      else assert.equal(reachedSelection,false,'unselected card must not cover a selected card');
      if(i){assert.ok(slot.offset-stack.slots[i-1].offset>=32);assert.ok(slot.layer>stack.slots[i-1].layer);}
    });
    assert.equal(stack.extraHeight,stack.slots.at(-1).offset);
  }
});
test('deselecting restores natural order and different ranks keep their column order',()=>{
  const cards=deck().filter(c=>[4,5].includes(c.rank)).slice(0,6);
  const baseline=rankStacks(cards);
  rankStacks(cards,new Set([cards[0].id,cards.at(-1).id]));
  assert.deepEqual(rankStacks(cards,new Set()),baseline);
  assert.deepEqual(baseline.map(s=>s.slots[0].card.rank),[4,5]);
});
test('consecutive manual groups stay left while remaining cards retain rank stacks',()=>{
  const cards=deck().filter(c=>[4,5,8].includes(c.rank));
  const fullHouse=recognize([...cards.filter(c=>c.rank===4).slice(0,3),...cards.filter(c=>c.rank===5).slice(0,2)],7).find(g=>g.type==='fullHouse');
  const pair=recognize(cards.filter(c=>c.rank===8).slice(0,2),7).find(g=>g.type==='pair');
  for(const groups of [[fullHouse],[fullHouse,pair]]){
    const sections=arrangementSections(cards,groups);
    assert.equal(sections.grouped.length,groups.length);
    const displayed=[...sections.grouped.flatMap(({group})=>group.cards),...rankStacks(sections.remaining).flatMap(s=>s.slots.map(x=>x.card))];
    assert.equal(displayed.length,cards.length);assert.equal(new Set(displayed.map(c=>c.id)).size,cards.length);
    assert.ok(rankStacks(sections.remaining).some(s=>s.slots.length>1));
  }
  assert.equal(arrangementSections(cards,[pair]).remaining.length,cards.length-2,'dismantled full house returns to loose cards');
});
test('automatic singleton groups remain loose; visible group controls keep original indices',()=>{
  const cards=deck().filter(c=>c.rank===6).slice(0,4);
  const single=recognize([cards[0]],7)[0],pair=recognize(cards.slice(1,3),7).find(g=>g.type==='pair');
  const sections=arrangementSections(cards,[single,pair]);
  assert.equal(sections.grouped[0].index,1);assert.deepEqual(sections.remaining,[cards[0],cards[3]]);
  assert.equal(arrangementSections(cards,[single,pair],[single.key]).grouped.length,2);
});
