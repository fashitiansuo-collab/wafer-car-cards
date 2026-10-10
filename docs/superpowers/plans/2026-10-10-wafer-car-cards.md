# ウエハース車カード Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ウエハースの袋を破り、かじり、ウィキメディア・コモンズの車の写真のホロカードを集める縦型 SPORT 風の Web 作品を作る。

**Architecture:** 純関数(補充・抽選・保存)を `src/lib` に置いて Vitest で固め、Svelte 5 の runes の状態 1 つ(`game`)が画面を切り替える。カードは poke-holo 方式の CSS 変数駆動のレイヤーで、レア別の見た目は CSS ファイルに分ける。UI は gt-showroom-ui スキル SPORT のトークンと部品を縦向けに移植する。

**Tech Stack:** Svelte 5, Vite, TypeScript, Vitest, @fontsource(Barlow / Barlow Condensed / Noto Sans JP / JetBrains Mono), Phosphor アイコン(SVG を直接インライン)。

**Spec:** `docs/superpowers/specs/2026-10-10-wafer-car-cards-design.md`

## Global Constraints

- ストック上限 10、補充 60000ms ごとに 1、初回は 10。
- 排出の重み: C 55 / UC 25 / R 13 / UR 6 / SEC 1。
- 保存キー `wafer-cards:v1`、`v: 1`。
- カード比 63:88。C〜R は枠付き(写真窓 4:3)、UR / SEC はフルアート。
- レアの色: C `--paper-2`、UC `--green`、R `--blue`、UR `--magenta`、SEC `--yellow`。
- UI は SPORT の禁止事項に従う(角丸なし、影・UI のグラデーション・グローなし、ぼかしダイアログなし、本文 700 なし、ツールチップなし、タイル拡大なし、バウンスなし)。カード・袋・ウエハースは例外。
- UI の動き: `--ease-standard` `cubic-bezier(.2,0,0,1)`、120〜240ms。`prefers-reduced-motion` を尊重。
- 実行時に外部へ接続しない(フォント・画像・アイコンは同梱)。
- GT / Polyphony / Sony / 実在の菓子ブランドの名称・ロゴ・素材を入れない。
- 画像ライセンスは CC0 / PD / CC BY / CC BY-SA のみ。CC BY-SA は「改変あり」と表示。
- ラインナップ(車種・写真)を作者向けの報告・コミットメッセージ・計画書に書かない。コミットメッセージは「add first lineup」程度にとどめる。
- 文言は状況・結果・操作だけ。宣伝文句を書かない。

## Review Focus

1. **時計の巻き戻し / 未来の `lastRefillAt`**: 端末時刻が戻ると経過が負になる。補充はマイナスにならず、`lastRefillAt` を `now` に揃えるべき。→ Task 2 にテスト。
2. **保存データの部分破損**(`owned` が配列、`stock` が 99 や NaN): 起動できずに白画面になるのは不可。値ごとに既定値へ戻す。→ Task 4 にテスト。
3. **カード一覧にないカード id が保存にある**(第二弾以降でラインナップを変えた場合): 図鑑の数え方とガレージで無視する。→ Task 5 にテスト。
4. **ストック 0 で開封操作**: 袋は開かず、開封シーケンスへ進まない。→ Task 5 にテスト。
5. **開封途中でタブを閉じる / リロード**: ストックは開封開始時に減り、カードは抽選時に所持へ入る。抽選は開封開始時に行い保存するので、リロードしてもカードは失われない。→ Task 5 にテスト。

---

## File Structure

```
index.html
vite.config.ts            # vitest 設定も含む
src/main.ts
src/App.svelte            # 縦型の枠(9:19.5)+ 画面の切替
src/styles/tokens.css     # スキル tokens.css の :root 部分(PROLOGUE の上書きは除く)
src/styles/type.css       # スキル type.css
src/styles/app.css        # 比例縮尺、縦型の枠、フォント読み込み
src/lib/types.ts          # Rarity, Card, Save
src/lib/refill.ts
src/lib/draw.ts
src/lib/save.ts
src/lib/tilt.svelte.ts    # 入力 → バネ → CSS 変数
src/state/game.svelte.ts
src/data/cards.json       # ネタバレ
src/cards/Card.svelte
src/cards/CardBack.svelte
src/cards/rarity/base.css c.css uc.css r.css ur.css sec.css
src/open/Bag.svelte
src/open/Wafer.svelte
src/open/OpenSequence.svelte
src/ui/Header.svelte GuideBar.svelte BottomStrip.svelte Brackets.svelte TitleLockup.svelte RarityTag.svelte Icon.svelte
src/screens/Home.svelte Result.svelte Garage.svelte Detail.svelte Records.svelte DebugGallery.svelte
public/cards/*.jpg        # ネタバレ
public/fx/noise.png  public/fx/glitter.png
scripts/lineup.json       # ネタバレ: ファイル名とカード属性
scripts/fetch-commons.mjs
scripts/make-fx.mjs       # ノイズ PNG の生成
CREDITS.md
tests/*.test.ts
```

---

### Task 1: 雛形と縦型の枠

**Files:**
- Create: `package.json` `vite.config.ts` `tsconfig.json` `index.html` `src/main.ts` `src/App.svelte` `src/styles/{tokens,type,app}.css` `.gitignore`(`node_modules` `dist`)

**Interfaces:**
- Produces: `App.svelte` が `<div class="device">` を持ち、中に画面を描く。`html { font-size }` で 1rem ≈ 基準 390 幅の 1/39(= 10px @390)。

- [ ] **Step 1:** `npm create vite@latest . -- --template svelte-ts` 相当を作り、`vitest` `@fontsource/barlow` `@fontsource/barlow-condensed` `@fontsource/noto-sans-jp` `@fontsource/jetbrains-mono` を追加。`vite.config.ts` に `test: { environment: 'node' }`。`base: './'`(静的出力をどこでも開けるように)。
- [ ] **Step 2:** スキルの `assets/tokens.css` の `:root` と `@property`、`assets/type.css` を `src/styles/` へ写す(PROLOGUE の `[data-mode]` 部は除く)。
- [ ] **Step 3:** `app.css`: `body { background: var(--ink-0) }`、`.device { aspect-ratio: 9/19.5; height: 100dvh; max-width: 100vw; margin: auto; position: relative; overflow: hidden; background: var(--ink-1) }`、`html { font-size: min(calc(100vw / 39), calc(100dvh * 9 / 19.5 / 39)) }`。
- [ ] **Step 4:** `npm run build` が通り、`npx vitest run --passWithNoTests` が 0 で終わる。
- [ ] **Step 5:** Commit `chore: scaffold svelte app with sport tokens`

---

### Task 2: 補充の計算

**Files:** Create `src/lib/types.ts` `src/lib/refill.ts`、Test `tests/refill.test.ts`

**Interfaces:**
- Produces:
  - `export type Rarity = 'C'|'UC'|'R'|'UR'|'SEC'`、`export const RARITIES: Rarity[]`、`Card`・`Save` の型(仕様書 §6 のとおり)
  - `export const STOCK_MAX = 10, REFILL_MS = 60000`
  - `refill(stock: number, lastRefillAt: number, now: number): { stock: number; lastRefillAt: number }`
  - `msToNext(stock: number, lastRefillAt: number, now: number): number | null`(満タンなら `null`)

- [ ] **Step 1: テスト**
  ```ts
  refill(3, 0, 59_999)      → { stock: 3, lastRefillAt: 0 }
  refill(3, 0, 60_000)      → { stock: 4, lastRefillAt: 60_000 }
  refill(3, 0, 150_000)     → { stock: 5, lastRefillAt: 120_000 }
  refill(9, 0, 600_000)     → { stock: 10, lastRefillAt: 600_000 }   // 満タンで now に揃う
  refill(10, 0, 999_999)    → { stock: 10, lastRefillAt: 999_999 }
  refill(3, 500_000, 100)   → { stock: 3, lastRefillAt: 100 }        // 時計の巻き戻し
  msToNext(3, 0, 15_000)    → 45_000
  msToNext(10, 0, 15_000)   → null
  ```
- [ ] **Step 2:** `npx vitest run tests/refill.test.ts` → FAIL
- [ ] **Step 3:** 実装
- [ ] **Step 4:** PASS
- [ ] **Step 5:** Commit `feat: refill timer math`

---

### Task 3: 抽選

**Files:** Create `src/lib/draw.ts`、Test `tests/draw.test.ts`

**Interfaces:**
- Consumes: `Card`, `Rarity`
- Produces:
  - `export const WEIGHTS: Record<Rarity, number> = { C:55, UC:25, R:13, UR:6, SEC:1 }`
  - `pickRarity(rng: () => number, forced?: Rarity): Rarity`
  - `drawCard(cards: Card[], rng: () => number, forced?: Rarity): Card` — 選んだレアに 1 枚も無ければ、下のレアへ順に落とす(SEC→UR→…→C)。
  - `mulberry32(seed: number): () => number`

- [ ] **Step 1: テスト**
  - `pickRarity(() => 0)` → `'C'`、`pickRarity(() => 0.999)` → `'SEC'`、`pickRarity(() => 0.55)` → `'UC'`
  - `mulberry32(1)` で 100000 回、各レアの割合が重み ±1%
  - `drawCard(cards, rng, 'SEC')` が SEC のカードを返す
  - SEC が 0 枚の一覧で `forced: 'SEC'` → UR のカード
- [ ] **Step 2:** FAIL を確認
- [ ] **Step 3:** 実装
- [ ] **Step 4:** PASS
- [ ] **Step 5:** Commit `feat: weighted rarity draw`

---

### Task 4: 保存

**Files:** Create `src/lib/save.ts`、Test `tests/save.test.ts`

**Interfaces:**
- Consumes: `Save`, `STOCK_MAX`
- Produces:
  - `export const SAVE_KEY = 'wafer-cards:v1'`
  - `initialSave(now: number): Save`(stock 10, lastRefillAt now, eaten 0, owned {}, firstPulledAt {}, pending null)
  - `parseSave(raw: string | null, now: number): Save` — 値ごとに検証し、不正な値だけ既定値に戻す
  - `loadSave(storage: Pick<Storage,'getItem'> | null, now: number): Save`
  - `writeSave(storage: Pick<Storage,'setItem'> | null, s: Save): boolean`(例外は握りつぶして false)
- `Save` に `pending: string | null`(開封中に抽選済みのカード id)を追加し、仕様書 §6 の型を拡張する(Review Focus 5)。

- [ ] **Step 1: テスト**
  - `parseSave(null, 5)` → `initialSave(5)`
  - `parseSave('{bad', 5)` → `initialSave(5)`
  - `parseSave(JSON.stringify({v:2,...}), 5)` → `initialSave(5)`
  - `{v:1, stock: 99, ...}` → stock 10、`stock: NaN` → 10、`owned: []` → `{}`、`owned: {a: -1, b: 2}` → `{b: 2}`
  - 往復: `parseSave(JSON.stringify(s), 0)` が `s` と等しい
  - `writeSave({ setItem(){ throw new Error() } }, s)` → false、`loadSave(null, 5)` → initial
- [ ] **Step 2:** FAIL
- [ ] **Step 3:** 実装
- [ ] **Step 4:** PASS
- [ ] **Step 5:** Commit `feat: validated local save`

---

### Task 5: ゲームの状態

**Files:** Create `src/state/game.svelte.ts`、Test `tests/game.test.ts`(`.svelte.ts` は vitest で runes を使えるよう `vite.config.ts` の svelte プラグインを有効のまま)

**Interfaces:**
- Consumes: `refill`, `msToNext`, `drawCard`, `loadSave`, `writeSave`, `cards.json`(テストでは注入)
- Produces: `createGame(opts: { cards: Card[]; storage: Storage | null; now: () => number; rng: () => number }): Game`

  ```ts
  type Screen = 'home' | 'opening' | 'result' | 'garage' | 'detail' | 'records' | 'debug';
  interface Game {
    readonly save: Save;               // $state
    screen: Screen;
    detailId: string | null;
    forced: Rarity | null;             // デバッグのレア固定
    readonly current: Card | null;     // 開封中/結果のカード
    readonly isNew: boolean;           // current を今回初めて引いたか
    tick(): void;                      // 補充を反映(1 秒ごとに呼ぶ)
    startOpening(): boolean;           // stock 0 なら false で何もしない
    finishOpening(): void;             // screen = 'result'、pending = null
    ownedCount(): number;              // cards に存在する id のうち owned > 0 の数
    countByRarity(): Record<Rarity, number>;
  }
  ```
- `startOpening`: tick → stock>0 を確認 → 満タンからなら `lastRefillAt = now` → stock-1、eaten+1 → 抽選 → owned/firstPulledAt に加算 → `pending = id` → 保存 → screen = 'opening'。
- 起動時 `pending` があれば `current` に戻し screen = 'opening'(演出のやり直し、二重加算しない)。

- [ ] **Step 1: テスト**(メモリの storage と固定 now/rng で)
  - stock 0 で `startOpening()` → false、screen 'home' のまま、eaten 不変
  - stock 10 で開く → stock 9、lastRefillAt = now、owned に 1 件、`pending` が保存されている
  - 同じ storage で `createGame` し直すと screen 'opening'・current が同じ・owned は 1 のまま
  - `finishOpening()` 後、pending null
  - owned に一覧に無い id `'zzz'` があっても `ownedCount()` は数えない
  - 60 秒進めて `tick()` → stock +1
- [ ] **Step 2:** FAIL → **Step 3:** 実装 → **Step 4:** PASS
- [ ] **Step 5:** Commit `feat: game state with refill and pending draw`

---

### Task 6: 写真の取得とラインナップ

**Files:** Create `scripts/fetch-commons.mjs` `scripts/lineup.json` `src/data/cards.json` `public/cards/*` `CREDITS.md`

**Interfaces:**
- Produces: `cards.json`(`Card[]`、`no` 昇順、id は `c001` 形式)。Task 5 以降が import する。
- `lineup.json` の 1 行: `{ file: "File:….jpg", rarity, maker, model, year, country, focus? }`

- [ ] **Step 1:** スクリプト: 50 件ずつ `https://commons.wikimedia.org/w/api.php?action=query&titles=…&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&format=json` を取得。User-Agent `TCGcar/0.1 (personal art project; local script)`(個人の連絡先は入れない)。`extmetadata.LicenseShortName` が CC0 / Public domain / CC BY* / CC BY-SA* 以外なら、その件を出力せず標準エラーに報告。`Artist` は HTML タグを除去。`thumburl` を `public/cards/<id>.jpg` に保存。`modified: true`(全カードで写真を加工するため)。`CREDITS.md` を番号順に出力。
- [ ] **Step 2:** 写真を選ぶ。Commons の検索 API / カテゴリでレアの格(仕様書 §4)に合う候補を見て、C 15 / UC 12 / R 9 / UR 6 / SEC 3 を `lineup.json` に書く。同じ車種がレアをまたいでよい。ナンバーが読める写真・顔がはっきり写る写真は避ける。縦長の写真窓で切っても主題が残る構図を選ぶ(`focus` で調整)。
- [ ] **Step 3:** `node scripts/fetch-commons.mjs` を実行。期待: 45 件保存、拒否 0 件(拒否があれば差し替えて再実行)。
- [ ] **Step 4:** `cards.json` の全件に `credit.author` `license` `sourceUrl` があることを `node -e` で確認。
- [ ] **Step 5:** Commit `feat: add first lineup with credits`(車種を書かない)

---

### Task 7: 傾きの入力とカードの土台(C)

**Files:** Create `src/lib/tilt.svelte.ts` `src/cards/Card.svelte` `src/cards/CardBack.svelte` `src/cards/rarity/base.css` `src/cards/rarity/c.css` `src/screens/DebugGallery.svelte`、Test `tests/tilt.test.ts`

**Interfaces:**
- Produces:
  - `pointerToVars(px: number, py: number): Record<string, string>` — px, py は 0..1。返す変数: `--pointer-x` `--pointer-y`(%)、`--pointer-from-center`(0..1)、`--pointer-from-left` `--pointer-from-top`、`--background-x` `--background-y`(37%〜63% に圧縮)、`--rotate-x` `--rotate-y`(deg、最大 ±14)
  - `createTilt(): { attach(el: HTMLElement): () => void; style: string; active: boolean }` — pointermove / pointerleave / deviceorientation(iOS は `requestPermission` をタップで要求する `askGyro()` を併せて公開)。バネ: stiffness 0.066, damping 0.25(poke-holo と同じ感触)。reduced-motion ではバネを使わず直接代入。
  - `<Card card={Card} interactive={boolean} flipped={boolean} />` — `.card[data-rarity]` の中に `.card__photo` `.card__shine` `.card__glare` `.card__frame`。写真窓は CSS 変数 `--photo` に `url()` を入れ、輝度マスクで使い回す。
- [ ] **Step 1: テスト** `pointerToVars(0.5, 0.5)` → `--pointer-from-center: 0`、`--rotate-x: 0deg`。`(1, 0)` → from-center 1、`--background-x: 63%`、rotate の絶対値 14。
- [ ] **Step 2:** FAIL → **Step 3:** 実装 → **Step 4:** PASS
- [ ] **Step 5:** `base.css`(63:88、枠付きの文字組、フルアートの黒帯、glare = `radial-gradient(at var(--pointer-x) var(--pointer-y), …)` + `mix-blend-mode: overlay`)と `c.css`(紙ノイズ、彩度 0.85、shine なし)。
- [ ] **Step 6:** `?debug` で `DebugGallery` を出し、5 レアから各 1 枚を並べる。390×844 でスクリーンショットを撮り、C が枠付き・マットで反射だけ動くことを確認。
- [ ] **Step 7:** Commit `feat: tilt input and base card`

---

### Task 8: UC と R のホロ

**Files:** Create `scripts/make-fx.mjs` `public/fx/noise.png` `public/fx/glitter.png` `src/cards/rarity/uc.css` `src/cards/rarity/r.css`

- [ ] **Step 1:** `make-fx.mjs`(依存なし、`zlib` で PNG を書く): 256×256 のグレーノイズ `noise.png`、まばらな白点の `glitter.png`。実行して 2 ファイルを確認。
- [ ] **Step 2:** `uc.css`: リバースホロ。shine は写真窓の外だけ(`mask` で窓を抜く)、`glitter.png` + 縦の細い `repeating-linear-gradient` を `--background-x/y` で動かし、`mix-blend-mode: color-dodge`、不透明度は `--pointer-from-center` に比例。
- [ ] **Step 3:** `r.css`: レギュラーホロ。写真窓の中に虹の縦帯(`repeating-linear-gradient(110deg, …)` を 7 色)を `--background-x` で流し、`color-dodge` + `filter: brightness(.8) contrast(1.6) saturate(1.4)`。枠は銀(`linear-gradient` を `--pointer-y` で動かす)。
- [ ] **Step 4:** DebugGallery で 3 つの傾き(中央・左上・右下)のスクリーンショットを撮り、UC は枠だけ、R は窓だけが光ることを確認。
- [ ] **Step 5:** Commit `feat: reverse holo and regular holo`

---

### Task 9: UR と SEC

**Files:** Create `src/cards/rarity/ur.css` `src/cards/rarity/sec.css`

- [ ] **Step 1:** `ur.css`: フルアート、写真 `contrast(1.15)`。shine = 斜めの虹線 + `glitter.png`、`mask-image: var(--photo); mask-mode: luminance; mask-size: cover`(写真の明部だけ光る)。
- [ ] **Step 2:** `sec.css`: フルアート、金の縁(枠に金の `linear-gradient`)、車名は `text-shadow` を使わず、明暗 2 色の 1px ずらしで浮き彫り。shine 1 = 金箔(`glitter.png` を金色に `background-blend-mode: multiply`)、shine 2 = コスモス(`radial-gradient` を重ねた星雲を、写真の暗部だけに = 輝度マスクを反転するため写真を `filter: invert(1)` した別レイヤーのマスク)。`--pointer-from-center` で金と虹の比重を入れ替える。
- [ ] **Step 3:** DebugGallery で 3 つの傾きのスクリーンショット。UR は明部だけが光り、SEC は金 → 虹へ変わることを確認。60fps 前後か DevTools の Performance で一度確認(重ければ glitter の大きさを下げる)。
- [ ] **Step 4:** Commit `feat: rainbow full-art and secret gold`

---

### Task 10: SPORT 部品とホーム

**Files:** Create `src/ui/{Header,GuideBar,BottomStrip,Brackets,TitleLockup,RarityTag,Icon}.svelte` `src/screens/Home.svelte`、Modify `src/App.svelte`

**Interfaces:**
- Consumes: `Game`, `msToNext`
- Produces:
  - `<Header game={Game} />` — ロゴ枠(架空のウエハースのマーク)、タブ 開封 / ガレージ / 記録、右に `07/10` と `0:42`(満タンは `FULL`、SEC の結果中は `SECRET` タグ)
  - `<GuideBar items={{ key: string; label: string; action?: () => void }[]} dim={boolean} />`
  - `<BottomStrip cells={{ title: string; body: string; progress?: number }[]} dim={boolean} />`
  - `<Brackets />`(四隅の角括弧、親の `:focus-visible` で出す)、`<TitleLockup maker model year rarity />`、`<RarityTag rarity />`
- スキルの `assets/components/sport/` の該当部品を移植する(i18n・state の import は外し、props にする)。縦向け: ヘッダー高 = `--module` を 5.6rem、ボトム帯は 2 セル。
- [ ] **Step 1:** 部品を移植。`App.svelte` で `setInterval(game.tick, 1000)`。
- [ ] **Step 2:** `Home`: 中央に袋の置き場所(Task 11 まで仮の矩形)、ボトム帯に「図鑑 n/45 + 進捗」「直近 / UR / SEC の枚数」、ガイド「⇆ 上端をなぞって破る」。stock 0 ではガイドを「次の袋まで 0:42」に。
- [ ] **Step 3:** スクリーンショット(390×844、PC 1440×900)。禁止事項チェックリストを一つずつ照合。
- [ ] **Step 4:** Commit `feat: sport header, strips and home`

---

### Task 11: 袋と破る

**Files:** Create `src/open/Bag.svelte`、Test `tests/tear.test.ts`

**Interfaces:**
- Produces:
  - `tearPath(progress: number, seed: number): string` — 上端から 12% の高さのギザギザの `polygon()`。progress 0..1 で右へ伸びる。同じ seed で同じ形。
  - `<Bag onTorn={() => void} />` — 横ドラッグで progress を進める(戻らない)。0.7 を超えたら 1 にして切れ端を落とし、480ms 後に `onTorn`。Enter / ガイドの「破る」で自動進行(600ms)。袋は `createTilt` で光る。
- [ ] **Step 1: テスト** `tearPath(0, 1)` と `tearPath(1, 1)` が `polygon(` で始まる、同じ seed で同じ文字列、点数が progress とともに増える。
- [ ] **Step 2:** FAIL → **Step 3:** 実装(袋の箔は `conic-gradient` + `noise.png`、文字 `WAFER / CAR CARD COLLECTION / No.`)→ **Step 4:** PASS
- [ ] **Step 5:** ブラウザで: 途中で離すと止まる、続きから破れる、Enter で破れる。スクリーンショット。
- [ ] **Step 6:** Commit `feat: wafer bag with tear interaction`

---

### Task 12: かじる、めくる、予兆、スキップ

**Files:** Create `src/open/Wafer.svelte` `src/open/OpenSequence.svelte`、Test `tests/bite.test.ts`

**Interfaces:**
- Consumes: `Game.current`, `Game.finishOpening`, `<Bag>`, `<Card>`, `<CardBack>`
- Produces:
  - `bitesToFinish(seed: number): number` → 4〜6
  - `omen(rarity: Rarity, rng: () => number): boolean` → UR / SEC かつ rng() < 0.5 のときだけ true
  - `biteMask(bites: {x: number; y: number}[]): string` — 各かじりを歯形付きの半円(`radial-gradient` の円 1 つ + 小円 5 つ)にして `mask-image` 用にカンマで連結
  - `<OpenSequence game />` — 段階 `bag → wafer → flip → done`。
- めくり: C / UC 500ms、R 700ms + 光 1 回、UR 1200ms(ボトム帯とガイドを dim)+ 虹、SEC は黒の幕 400ms → 金の縁 → 1400ms で返す。予兆は最後の 1 口でかけら 1 粒にきらめき。
- スキップ: どの段階からでも `flip` へ。
- [ ] **Step 1: テスト** `omen('C', () => 0)` false、`omen('UR', () => 0.4)` true、`omen('SEC', () => 0.6)` false。`bitesToFinish` が 4..6。`biteMask([])` が `''`。
- [ ] **Step 2:** FAIL → **Step 3:** 実装 → **Step 4:** PASS
- [ ] **Step 5:** デバッグでレアを固定し、5 レアそれぞれ一周。キーボードだけで一周(Enter で破る、Space でかじる)。reduced-motion で一周。
- [ ] **Step 6:** Commit `feat: bite, flip by rarity, omen and skip`

---

### Task 13: 結果・ガレージ・詳細・記録

**Files:** Create `src/screens/{Result,Garage,Detail,Records}.svelte`、Modify `src/App.svelte`

**Interfaces:**
- Consumes: `Game` のすべて、`<Card>` `<CardBack>` `<TitleLockup>` `<Brackets>` `<RarityTag>`
- `Result`: カード + TitleLockup(12px 上昇のフェード、`--t-page`)+ `NEW` / `×n` + 「もう一袋」(stock 0 なら無効と残り時間)・「ガレージへ」。
- `Garage`: 絞り込みタブ ALL / C / UC / R / UR / SEC(選択はレア色の下線 2px)、3 列、未入手は番号と `???` のシルエット(カード比の暗い面 + 番号)。フォーカスは Brackets。選ぶと `detail`。
- `Detail`: 大きなカード、タップで裏(`CardBack`: 作者・ライセンス(リンク)・元ページ(リンク)・「改変あり」・年式・国・初めて引いた日時 `2026/10/10 18:13`)。
- `Records`: 食べた数、レア別の所持数、全クレジット一覧、デバッグ「レア固定」(なし / C / UC / R / UR / SEC)。
- [ ] **Step 1:** 実装。
- [ ] **Step 2:** スクリーンショット(390×844 と PC)で 4 画面、禁止事項チェックリストを照合。未入手の詳細には入れないことを確認。
- [ ] **Step 3:** Commit `feat: result, garage, detail and records screens`

---

### Task 14: 仕上げの確認

- [ ] **Step 1:** `npx vitest run` 全件 PASS、`npm run build` 成功、`dist/index.html` を静的サーバーで開いて一周。
- [ ] **Step 2:** 保存のない状態 / localStorage を壊した状態 / プライベート相当(`localStorage` が例外)で起動できる。
- [ ] **Step 3:** ネットワークタブで外部への接続が 0 件。
- [ ] **Step 4:** README に起動方法(`npm install` / `npm run dev` / `npm run build`)と「`src/data/cards.json` と `public/cards/` はネタバレ」を書く。
- [ ] **Step 5:** Commit `docs: readme`
