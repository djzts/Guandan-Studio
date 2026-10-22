import { arrange, metrics, flushes, SUITS } from './engine.js';
self.onmessage=({data})=>{
  const {id,cards,level,locked}=data;
  try {
    const candidates=['balanced','speed','control'].map(profile=>{const groups=arrange(cards,level,locked,profile);return {profile,groups,metrics:metrics(groups,level)};});
    const signature=s=>s.groups.map(g=>g.key).sort().join('|');
    const best=[...candidates].sort((a,b)=>b.metrics.score-a.metrics.score)[0];
    const efficient=[...candidates].sort((a,b)=>a.metrics.groups-b.metrics.groups||a.metrics.weak-b.metrics.weak)[0];
    const control=[...candidates].sort((a,b)=>b.metrics.control-a.metrics.control||b.metrics.bombs-a.metrics.bombs)[0];
    const seen=new Set();
    const suggestions=[{...best,profile:'balanced'},{...efficient,profile:'speed'},{...control,profile:'control'},...candidates.map(s=>({...s,profile:'alternative'}))].filter(s=>{const key=signature(s);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,3);
    const potential=locked.length?metrics(arrange(cards,level),level):best.metrics;
    self.postMessage({id,suggestions,potential,flushes:Object.fromEntries(SUITS.map(s=>[s,flushes(cards,level,s)]))});
  }catch(e){self.postMessage({id,error:e.message});}
};
