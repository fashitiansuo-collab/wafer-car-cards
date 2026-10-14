# Wafer Car Cards
ウエハースの袋を破ってかじると、ウィキメディア・コモンズの車の写真を使ったホロカードが1枚出る、CSS表現の習作。

## 動かし方
- `npm install`
- `npm run dev`（http://localhost:5173）
- `npm run build` → `npm run preview`（dist/ はファイルを直接開いても動かないので、静的サーバーに置く）
- `npm test`

## 遊び方
袋は1分に1袋補充、最大10袋。上端をなぞって破る（Enterでも可）→ タップかSpaceでかじる → カードがめくれる。ガレージで集めたカードを見られ、タップで裏返すとクレジット。

## デバッグ
`?debug` でレア別の確認画面（`&rarity=UR`、`&id=c001`、`&px=0.2&py=0.3` で傾きを固定）。`?force=SEC` で次の抽選のレアを固定（記録画面のスイッチと同じ）。

## ネタバレ注意
`src/data/cards.json`、`scripts/lineup.json`、`public/cards/` を開くとラインナップが分かる。

## 写真の差し替え
`scripts/lineup.json` を編集 → `node scripts/fetch-commons.mjs` → `python scripts/make-dark-masks.py`（SEC用マスク）→ `python scripts/make-palettes.py`（5色の見本）。額縁は `lineup.json` の `frame`（gallery / watermark / litt / palette / window）で写真ごとに選ぶ。撮影データ（EXIF）は取得時にコモンズから読む。受け付けるライセンスは CC0 / パブリックドメイン / CC BY / CC BY-SA のみ。

## クレジット
写真の作者とライセンスは `CREDITS.md`(第1弾)、`CREDITS-s2.md`(第2弾)、`CREDITS-s3.md`(第3弾)、カード裏面、記録画面にある。写真は切り抜きと色調整をしている（改変あり）。

ウエハースの質感は Paolo Neo の写真2枚（パブリックドメイン、Wikimedia Commons の [Biscuit with chocolate.jpg](https://commons.wikimedia.org/wiki/File:Biscuit_with_chocolate.jpg) と [Biscuit with jam and chocolate.jpg](https://commons.wikimedia.org/wiki/File:Biscuit_with_jam_and_chocolate.jpg)）から `scripts/make-wafer.py` で作っている。タイル化と色の付け替えをした改変版。

第3弾のスペックと解説文は Wikipedia(CC BY-SA 4.0)からの引用で、カード裏面に出典を載せている。

## 参考
カードのホロ表現は simeydotme/pokemon-cards-css（poke-holo）の手法を参考にした。UIは Gran Turismo SPORT のメニューの配置の考え方を参考にしているが、名称・ロゴ・素材は使っていない。
