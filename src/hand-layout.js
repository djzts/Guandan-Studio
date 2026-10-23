// Back-to-front order: unselected cards, then selected cards, stable within each.
// Every card exposes a 32px header; a 12px gap separates the selection.
export function rankStacks(cards, selected = new Set()) {
  const buckets = new Map();
  for (const card of cards) {
    if (!buckets.has(card.rank)) buckets.set(card.rank, []);
    buckets.get(card.rank).push(card);
  }
  return [...buckets.values()].map(bucket => {
    const back = bucket.filter(card => !selected.has(card.id));
    const front = bucket.filter(card => selected.has(card.id));
    const separated = back.length > 0 && front.length > 0;
    const slots = [...back, ...front].map((card, index) => ({
      card,
      offset: index * 32 + (separated && index >= back.length ? 12 : 0),
      layer: index + 1,
    }));
    return { slots, extraHeight: slots.at(-1).offset };
  });
}

export function arrangementSections(cards, groups, locked = []) {
  // Automatic suggestions include singleton groups for scoring, but these cards
  // still belong in the loose hand unless the player explicitly locked one.
  const grouped = groups.map((group, index) => ({ group, index }))
    .filter(({group}) => group.size > 1 || locked.includes(group.key));
  const used = new Set(grouped.flatMap(({group}) => group.cards.map(card => card.id)));
  return { grouped, remaining: cards.filter(card => !used.has(card.id)) };
}
