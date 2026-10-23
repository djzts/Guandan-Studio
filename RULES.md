# Studio 0.2 rules / 规则

This is the explicit practice ruleset implemented by Guandan Studio, not a claim of tournament certification. Independent deals only; tribute and leveling are outside V0.2.

本页定义网站实际采用的练习规则；不代表赛事认证。V0.2 为独立单局，不含进还贡和升级赛程。

## Cards / 牌张

- Two decks, 108 physical cards, 27 per player; opposite seats partner. 两副牌，108 张，四人各 27 张，对坐为队友。
- Red joker > black joker > level rank > A through 2. 大王 > 小王 > 级牌 > A 至 2。
- Each of the two heart-level cards is wild. It can replace a non-joker card within a combination. Alone it retains its level rank; two wild cards alone are a level pair. 两张红心级牌均为配牌，可在组合中替代非王牌；单出按级牌，两张配牌单独作对按级牌对子。
- Natural copies remain distinct physical cards. Wild assignments are recorded when played. 两副相同牌按独立实体处理；出牌记录保留配牌声明。

## Patterns / 牌型

Singles, pairs, triples, full houses (triple plus pair), five-card straights, three consecutive pairs, two consecutive triples, matching-rank bombs of 4–10 cards, five-card straight flushes, and all four jokers.

单张、对子、三张、三带二、五张顺子、三连对、钢板、4–10 张同点数炸弹、五张同花顺、四王炸。

- Ordinary responses must match type and size. Full houses compare the triple, ignoring the pair. A natural same-color joker pair can be carried in a full house; wilds cannot impersonate jokers. 普通牌须同牌型同张数，三带二只比三张；自然同色王对子允许作为所带对子，配牌不能代王。
- Sequence ranks use natural order even at the level rank. Ace can be low or high: A2345 through TJQKA; AA2233 through QQKKAA; AAA222 through KKKAAA. No wraparound such as QKA23. 连续牌型中的级牌按自然点数，A 可低可高，不得绕接。
- Bomb order: four cards < five cards < straight flush < six or more cards < four jokers. Same-size matching bombs compare rank (level rank is elevated); straight flushes compare natural high rank. 炸弹大小：四张 < 五张 < 同花顺 < 六张及以上 < 四王。同张数炸按点数比较（级牌提升），同花顺按自然顺序。

## Play / 出牌

Seats proceed counterclockwise: player → right opponent → partner → left opponent. A fresh leader must play. Players may pass even if they can beat a play. A player who passed may respond again after another player raises. Once all other active seats pass, the last player leads; if out, their active partner leads. If that partner is also out, the next active seat leads (normally the deal is already over).

按玩家 → 右对手 → 对家 → 左对手的逆时针顺序行动。领出不能不出；能压也可以选择不出。其他人压牌后，先前不出的玩家仍可跟牌。其余在场玩家全部不出后，最后出牌者重新领出，已出完则由在场对家接风。

End when teammates finish first and second, or when three seats finish. The team of the first finisher wins. This practice app displays exact remaining counts at all times. 两名队友首先出完，或三人出完时结束；头游所在队获胜。练习器始终公开准确剩牌数。

## Evaluation and computer limits / 评价与电脑限制

The score is a transparent baseline, not a win rate: clamp `88 − 4×groups − 5×weak singles + 5×control groups + 3×bombs − 2×committed wilds + 0.5×cards shed` to 0–100. Weak singles rank below K; control groups are bombs or A-and-higher singles, pairs, triples, or full houses. Compare only arrangements of the same remaining hand. Weights have not been validated against expert play.

参考分为透明基础启发式，不是胜率：将上述公式限制在 0–100。弱单为低于 K 的普通单牌；控制组为炸弹或 A 及以上的单、对、三张、三带二。仅比较同一剩余手牌的理法，权重尚未通过专家对局验证。

Suggestions use deterministic greedy candidate selection with three weight profiles. They are not exhaustive optima. Straight-flush discovery enumerates physical-card candidates. Expensive analysis runs in a worker. A basic computer uses its own cards and public lead/count information only; display visibility does not change its access. Animation delays do not encode card information.

参考方案使用三套权重的确定性贪心选择，并非穷尽最优解。同花顺枚举实体牌候选；分析在后台线程运行。基础电脑仅用自己的牌及公开牌权、剩牌信息；显示开关不改变权限；动画速度不传递牌型信息。

Local history retains up to three prior branches across reloads. Deal links reproduce initial deals, not the current action history. Full deals reside in the browser; hidden-hand practice is self-directed, not an anti-cheat competition mode.

本地保存最近三个历史分支。分享链接复现初始牌局，不包含当前出牌过程。完整牌局在浏览器中，暗牌模式用于自律练习。

## References / 参考

- [Southeast University published two-deck competition rules / 东南大学公开两副牌比赛规则](https://xxgk.seu.edu.cn/_upload/article/files/44/c8/f455e1d04d2a998e40454931740a/4f853bb4-29b9-45dc-9c56-7627ed4c9726.pdf)
- [Guandan overview / 掼蛋概述](https://en.wikipedia.org/wiki/Guandan)
- [Strategy maxims supplied by the user / 用户提供的口诀来源](https://zhuanlan.zhihu.com/p/660084172)

References inform the rules and teaching; the explicit choices above govern this app. 资料用于参考，网站以本页明确约定为准。
