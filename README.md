# Guandan Studio · 掼蛋研习室

A bilingual, browser-local Guandan hand arrangement lab. Deal, arrange, compare alternatives, play one action at a time, and replay the same hand.

中英文掼蛋理牌练习器：自动发牌、手动组牌、红心配牌、同花顺提示、基础电脑对局和分支复盘。

**Website / 网站:** https://djzts.github.io/Guandan-Studio/

## Run locally / 本地运行

Requires Node.js 22 or later. No dependency installation is needed.

```sh
node scripts/serve.mjs
# http://127.0.0.1:4173
node --test tests/*.test.mjs
node scripts/build.mjs
```

The static build goes to `dist/`. GitHub Actions tests and deploys pushes to `main`. Configure GitHub Pages to use **GitHub Actions** as its source.

## Features / 功能

- Chinese/English UI with persistent preferences.
- Stacked rank display, manual grouping, lock/unlock, undo/redo, three suggested arrangements.
- Both heart-level wild cards, explicit assignments, natural and assisted straight-flush hints.
- Independent hand visibility with no hidden-card access in computer decisions.
- Legal manual play, basic computer play, step/run/pause controls.
- Transparent heuristic evaluation, 12 contextual teaching notes, public action explanations.
- Reproducible deal links, local history, branching retries, and restart.
- Responsive desktop/mobile layout; no accounts, backend, or model API needed.

## Documentation / 文档

- [V0.2 release notes / 版本说明](V0.2-RELEASE.md)
- [GitHub Release v0.2.0](https://github.com/djzts/Guandan-Studio/releases/tag/v0.2.0)

- [规则与限制 / Rules and limitations](RULES.md)
- [V0.1 中文方案](V0.1-PLAN.zh-CN.md)
- [V0.1 English plan](V0.1-PLAN.en.md)

This is a V0.2 practice tool. Scores are heuristic references, not calibrated win probabilities. Computer play is a basic deterministic policy, and arrangement suggestions are not exhaustive optima. Local persistence is limited to the current browser. Full-match leveling and tribute are outside this release.
