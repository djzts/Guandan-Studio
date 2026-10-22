import test from 'node:test';
import assert from 'node:assert/strict';
import {deck,deal,recognize,flushes,beats,arrange,metrics,computer,advance,VERSION} from '../src/engine.js';
const all=deck();
const card=(rank,suit='S',copy=0)=>all.find(c=>c.rank===rank&&c.suit===suit&&c.id.startsWith(`${copy}-`));
const pick=(cards,type,level=7)=>{const m=recognize(cards,level).find(m=>m.type===type);assert.ok(m,`Expected ${type} from ${cards.map(c=>c.id)}`);return m;};
test('deal is reproducible, has 108 distinct physical cards and 27 per seat',()=>{
  const a=deal('fixture',7,2),b=deal('fixture',7,2);assert.deepEqual(a,b);assert.equal(new Set(a.hands.flat().map(c=>c.id)).size,108);assert.ok(a.hands.every(h=>h.length===27));assert.equal(a.turn,2);
});
test('wild singles are level cards; jokers cannot be impersonated',()=>{
  const w=card(7,'H');assert.equal(pick([w],'single').rank,7);
  assert.deepEqual(recognize([w,card(15,'J')],7),[]);
  assert.deepEqual(recognize([w,card(16,'J'),card(16,'J',1)],7),[]);
  const pair=recognize([w,card(7,'H',1)],7);assert.equal(pair.length,1);assert.equal(pair[0].rank,7);
});
test('both wild cards fill distinct missing ranks of a straight flush',()=>{
  const cs=[card(5),card(6),card(8),card(7,'H'),card(7,'H',1)];
  const m=pick(cs,'straightFlush');assert.equal(m.assignments.length,2);assert.equal(new Set(m.cards.map(c=>c.id)).size,5);assert.ok(m.assignments.every(a=>a.suit==='S'));
  assert.ok(flushes(cs,7,'S').length>=1);
});
test('two copies of a suited card are separate straight flush candidates',()=>{
  const cs=[card(8),card(8,'S',1),card(9),card(10),card(11),card(12)];
  const found=flushes(cs,7,'S');assert.equal(found.length,2);assert.notEqual(found[0].key,found[1].key);
});
test('same physical card cannot be used twice',()=>assert.deepEqual(recognize([card(8),card(8)],7),[]));
test('bomb hierarchy is four < five < flush < six < four jokers',()=>{
  const copies=r=>all.filter(c=>c.rank===r);
  const four=pick(copies(14).slice(0,4),'bomb');
  const five=pick(copies(2).slice(0,5),'bomb');
  const sf=pick([8,9,10,11,12].map(r=>card(r)),'straightFlush');
  const six=pick(copies(2).slice(0,6),'bomb');
  const jokers=pick(all.filter(c=>c.suit==='J'),'jokerBomb');
  for(const [a,b] of [[five,four],[sf,five],[six,sf],[jokers,six]]){assert.ok(beats(a,b,7));assert.ok(!beats(b,a,7));}
});
test('eight natural cards plus two wilds form a ten-card bomb',()=>assert.equal(pick([...all.filter(c=>c.rank===8),card(7,'H'),card(7,'H',1)],'bomb').size,10));
test('level rank remains natural inside sequences; Ace is low or high, never wraps',()=>{
  assert.ok(pick([5,6,7,8,9].map(r=>card(r)),'straight'));
  assert.ok(pick([14,2,3,4,5].map(r=>card(r)),'straight'));
  assert.ok(pick([10,11,12,13,14].map(r=>card(r)),'straight'));
  assert.deepEqual(recognize([12,13,14,2,3].map(r=>card(r)),7),[]);
  assert.ok(pick([2,3,4].flatMap(r=>[card(r),card(r,'C')]),'pairs',2));
  assert.ok(pick([14,2].flatMap(r=>[card(r),card(r,'C'),card(r,'D')]),'triples'));
});
test('full houses compare triples, and unlike normal patterns cannot beat each other',()=>{
  const a=pick([8,8,8,2,2].map((r,i)=>card(r,['S','C','D','S','C'][i])),'fullHouse');
  const b=pick([9,9,9,3,3].map((r,i)=>card(r,['S','C','D','S','C'][i])),'fullHouse');
  assert.ok(beats(b,a,7));assert.ok(!beats(pick([card(14)],'single'),a,7));
});
test('arrangements partition physical cards and honor locked groups',()=>{
  for(const seed of ['one','two','three','four']){
    const s=deal(seed,7),g=arrange(s.hands[0],7),locked=g.filter(m=>m.size>1).slice(0,1),again=arrange(s.hands[0],7,locked,'speed');
    assert.equal(new Set(again.flatMap(m=>m.cards.map(c=>c.id))).size,27);assert.equal(again.reduce((n,m)=>n+m.size,0),27);
    assert.ok(again.every(m=>recognize(m.cards,7).some(x=>x.key===m.key)));assert.ok(locked.every(m=>again.some(x=>x.key===m.key)));
    assert.deepEqual(metrics(g,7),metrics([...g].reverse(),7));
  }
});
test('lead passes to partner after the finisher is not beaten',()=>{
  let s={version:VERSION,level:7,hands:[[card(3)],[card(4),card(5)],[card(6),card(8)],[card(9),card(10)]],turn:0,lead:null,passes:[],finished:[],ended:false,log:[]};
  s=advance(s,pick(s.hands[0],'single'));s=advance(s,null);s=advance(s,null);s=advance(s,null);
  assert.equal(s.turn,2);assert.equal(s.lead,null);assert.throws(()=>advance(s,null));
});
test('a finisher can be beaten before partner inherits the lead',()=>{
  let s={version:VERSION,level:7,hands:[[card(3)],[card(4),card(5)],[card(6),card(8)],[card(9),card(10)]],turn:0,lead:null,passes:[],finished:[],ended:false,log:[]};
  s=advance(s,pick(s.hands[0],'single'));s=advance(s,pick([card(4)],'single'));s=advance(s,null);s=advance(s,null);
  assert.equal(s.turn,1);assert.equal(s.lead,null);
});
test('changing hidden cards with identical public counts does not change computer decisions',()=>{
  const s=deal('information',7),before=computer(s),other=structuredClone(s);
  [other.hands[1],other.hands[3]]=[other.hands[3],other.hands[1]];
  assert.deepEqual(computer(other),before);
});
test('100 complete simulated deals preserve cards, ownership, legality, and terminate',()=>{
  for(let seed=0;seed<100;seed++){
    let s=deal(`simulation-${seed}`,2+seed%13,seed%4),n=0;
    while(!s.ended&&n++<400){const c=computer(s);s=advance(s,c.move,c.reason);
      const ids=[...s.hands.flat(),...s.log.flatMap(e=>e.move?.cards||[])].map(c=>c.id);
      assert.equal(ids.length,108);assert.equal(new Set(ids).size,108);
    }
    assert.ok(s.ended,`seed ${seed} did not finish`);assert.ok(s.finished.length>=2);
  }
});
