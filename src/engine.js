export const VERSION = 'studio-0.1';
export const SUITS = ['S','H','C','D'];
export const SYMBOLS = {S:'♠',H:'♥',C:'♣',D:'♦',J:'★'};
export const rankName = r => ({11:'J',12:'Q',13:'K',14:'A',15:'BJ',16:'RJ'}[r] || String(r));
export const wild = (c, level) => c.suit === 'H' && c.rank === level;
export const power = (r, level) => r >= 15 ? r + 2 : r === level ? 16 : r;
export const cardPower = (c, level) => power(c.rank, level);
export function deck() {
  return [0,1].flatMap(d => [...SUITS.flatMap(suit => Array.from({length:13}, (_,i) => ({id:`${d}-${suit}-${i+2}`,rank:i+2,suit}))), ...[15,16].map(rank=>({id:`${d}-J-${rank}`,rank,suit:'J'}))]);
}
export function random(seed) {
  let n = 2166136261;
  for (const c of String(seed)) n = Math.imul(n ^ c.charCodeAt(0),16777619);
  return () => { n += 0x6D2B79F5; let t=n; t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
}
export function deal(seed, level, first=0) {
  const rng=random(seed), cards=deck();
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return {version:VERSION,seed:String(seed),level:level || 2+Math.floor(rng()*13),first,hands:[0,1,2,3].map(s=>cards.slice(s*27,s*27+27)),turn:first,lead:null,passes:[],finished:[],ended:false,log:[]};
}
export function sortCards(cards,level,ascending=false) {
  return [...cards].sort((a,b)=>(cardPower(b,level)-cardPower(a,level))*(ascending?-1:1) || SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit) || a.id.localeCompare(b.id));
}
const sequences = length => [Array.from({length},(_,i)=>i===0?14:i+1),...Array.from({length:14-length},(_,i)=>Array.from({length},(_,j)=>i+j+2))];
const templates = new Map();
function patterns(size) {
  if(templates.has(size)) return templates.get(size);
  const out=[];
  const add=(type,rank,slots,suit=null)=>out.push({type,rank,slots,suit,size});
  if(size>=2 && size<=10) for(let r=2;r<=14;r++) add(size===2?'pair':size===3?'triple':'bomb',r,Array(size).fill(r));
  if(size===2) for(const r of [15,16]) add('pair',r,[r,r]);
  if(size===4) add('jokerBomb',16,[15,15,16,16]);
  if(size===5) {
    for(let r=2;r<=14;r++) for(let p=2;p<=16;p++) if(r!==p) add('fullHouse',r,[r,r,r,p,p]);
    for(const seq of sequences(5)) {
      add('straight',seq.at(-1),seq);
      for(const suit of SUITS) add('straightFlush',seq.at(-1),seq,suit);
    }
  }
  if(size===6) {
    for(const seq of sequences(3)) add('pairs',seq.at(-1),seq.flatMap(r=>[r,r]));
    for(const seq of sequences(2)) add('triples',seq.at(-1),seq.flatMap(r=>[r,r,r]));
  }
  templates.set(size,out);return out;
}
function match(cards,level,p,limit=1) {
  const results=[],used=new Set(),assigned=[];
  const options=p.slots.map(r=>cards.filter(c=> (c.rank===r && (!p.suit||c.suit===p.suit)) || (r<15 && wild(c,level))).sort((a,b)=>Number(wild(a,level))-Number(wild(b,level))||a.id.localeCompare(b.id)));
  if(options.some(o=>!o.length))return results;
  function walk(i) {
    if(results.length>=limit)return;
    if(i===p.slots.length) {
      // Two wild cards played by themselves remain a pair of the level rank.
      if(assigned.every(a=>wild(a.card,level)) && (p.type!=='pair'||p.rank!==level))return;
      results.push({...p,cards:assigned.map(a=>a.card),assignments:assigned.filter(a=>wild(a.card,level)).map(a=>({id:a.card.id,rank:a.rank,suit:a.suit})),key:`${p.type}:${p.rank}:${p.suit||''}:${assigned.map(a=>a.card.id).sort().join(',')}`});return;
    }
    for(const c of options[i]) {
      if(used.has(c.id))continue;
      if(i && p.slots[i]===p.slots[i-1] && c.id<=assigned[i-1].card.id)continue;
      used.add(c.id);assigned.push({card:c,rank:p.slots[i],suit:p.suit||c.suit});walk(i+1);assigned.pop();used.delete(c.id);
    }
  }
  walk(0);return results;
}
export function recognize(cards,level) {
  if(!cards.length || new Set(cards.map(c=>c.id)).size!==cards.length)return [];
  if(cards.length===1)return [{type:'single',rank:cards[0].rank,size:1,cards:[...cards],assignments:[],key:`single:${cards[0].id}`}];
  return patterns(cards.length).flatMap(p=>match(cards,level,p,1));
}
export function moves(cards,level) {
  const result=cards.flatMap(c=>recognize([c],level));
  for(let n=2;n<=Math.min(10,cards.length);n++) for(const p of patterns(n)) result.push(...match(cards,level,p,1));
  return result;
}
export function flushes(cards,level,suit) {
  return patterns(5).filter(p=>p.type==='straightFlush'&&p.suit===suit).flatMap(p=>match(cards,level,p,128)).sort((a,b)=>a.assignments.length-b.assignments.length||b.rank-a.rank);
}
export function bombValue(m,level) {
  if(m.type==='jokerBomb')return 1000;
  if(m.type==='straightFlush')return 550+m.rank;
  if(m.type==='bomb')return m.size*100+power(m.rank,level);
  return 0;
}
export function beats(m,target,level) {
  if(!target)return true;
  const a=bombValue(m,level),b=bombValue(target,level);
  if(a||b)return a>b;
  if(m.type!==target.type||m.size!==target.size)return false;
  const seq=['straight','pairs','triples'];
  return (seq.includes(m.type)?m.rank:power(m.rank,level))>(seq.includes(target.type)?target.rank:power(target.rank,level));
}
export function legalMoves(state,seat=state.turn) {return moves(state.hands[seat],state.level).filter(m=>beats(m,state.lead?.move,state.level));}
export function metrics(groups,level) {
  const weak=groups.filter(g=>g.type==='single'&&power(g.rank,level)<13).length;
  const bombs=groups.filter(g=>bombValue(g,level)>0).length;
  const control=groups.filter(g=>bombValue(g,level)>0 || (['single','pair','triple','fullHouse'].includes(g.type)&&power(g.rank,level)>=14)).length;
  const spent=groups.reduce((n,g)=>n+(g.type==='single'?0:g.assignments.length),0);
  const cards=groups.reduce((n,g)=>n+g.size,0);
  const score=Math.max(0,Math.min(100,Math.round(88-groups.length*4-weak*5+control*5+bombs*3-spent*2+(27-cards)*.5)));
  return {score,groups:groups.length,weak,bombs,control,spent,cards};
}
export function arrange(cards,level,locked=[],profile='balanced') {
  const lockIds=new Set(locked.flatMap(g=>g.cards.map(c=>c.id)));
  const pool=cards.filter(c=>!lockIds.has(c.id));
  const candidates=moves(pool,level);
  const weights=profile==='speed'?{size:5,bomb:1,wild:0.5}:profile==='control'?{size:3,bomb:11,wild:2}:{size:4,bomb:6,wild:4};
  candidates.sort((a,b)=>value(b)-value(a)||a.key.localeCompare(b.key));
  function value(m){return (m.size-1)*weights.size + (bombValue(m,level)?weights.bomb:0)-m.assignments.length*weights.wild + m.cards.filter(c=>c.rank<10&&!wild(c,level)).length*.5;}
  const used=new Set(),out=[...locked];
  for(const m of candidates) if(m.cards.every(c=>!used.has(c.id))){out.push(m);m.cards.forEach(c=>used.add(c.id));}
  return out;
}
export function chooseMove(hand,level,target,context={}) {
  // Only this seat's cards and public context enter the policy.
  let opts=moves(hand,level).filter(m=>beats(m,target,level));
  if(!opts.length)return {move:null,reason:'noMove'};
  const finish=opts.find(m=>m.size===hand.length);
  if(finish)return {move:finish,reason:'finish'};
  if(target && context.partnerLeads && !context.danger)return {move:null,reason:'partner'};
  if(target && !context.danger) {
    const normal=opts.filter(m=>!bombValue(m,level));
    if(normal.length)opts=normal;
    else if(hand.length>10)return {move:null,reason:'saveBomb'};
  }
  const preferred=(context.preferred||[]).filter(g=>g.cards.every(c=>hand.some(h=>h.id===c.id)));
  const groups=arrange(hand,level,preferred),keys=new Set(groups.map(g=>g.key));
  const value=m=> (keys.has(m.key)?12:0)+m.size*(target?1:3)-power(m.rank,level)*.2-(bombValue(m,level)?(context.danger?0:12):0)-m.assignments.length*2;
  opts.sort((a,b)=>value(b)-value(a)||a.key.localeCompare(b.key));
  return {move:opts[0],reason:context.danger?'block':keys.has(opts[0].key)?'shed':'respond'};
}
export function computer(state,preferred=[]) {
  const seat=state.turn;
  return chooseMove(state.hands[seat],state.level,state.lead?.move,{preferred:seat===0?preferred:[],partnerLeads:state.lead?.seat===(seat+2)%4,danger:state.hands.some((h,s)=>s%2!==seat%2&&h.length>0&&h.length<=5)});
}
export function advance(state,move,reason='manual') {
  if(state.ended)throw new Error('ended');
  const next=structuredClone(state),seat=next.turn;
  if(move) {
    if(!move.cards.every(c=>next.hands[seat].some(h=>h.id===c.id)))throw new Error('ownership');
    const canonical=recognize(move.cards,next.level).find(m=>m.key===move.key);
    if(!canonical||!beats(canonical,next.lead?.move,next.level))throw new Error('illegal');
    move=canonical;
    next.hands[seat]=next.hands[seat].filter(c=>!move.cards.some(p=>p.id===c.id));
    next.lead={seat,move};next.passes=[];
    if(!next.hands[seat].length)next.finished.push(seat);
  } else {
    if(!next.lead)throw new Error('cannotPass');
    next.passes.push(seat);
  }
  next.log.push({seat,move,reason,remaining:next.hands[seat].length});
  if(next.finished.length>=3 || (next.finished.length===2&&next.finished[0]%2===next.finished[1]%2)){next.ended=true;return next;}
  const active=[0,1,2,3].filter(s=>next.hands[s].length);
  if(next.lead && active.filter(s=>s!==next.lead.seat).every(s=>next.passes.includes(s))) {
    const owner=next.lead.seat,partner=(owner+2)%4;
    next.turn=active.includes(owner)?owner:active.includes(partner)?partner:findNext(owner,active);
    next.lead=null;next.passes=[];
  } else next.turn=findNext(seat,active);
  return next;
}
function findNext(seat,active){for(let i=1;i<=4;i++)if(active.includes((seat+i)%4))return (seat+i)%4;throw new Error('no active seat');}
