## 新增需求（ADDED Requirements）

### Requirement: Marquee 渲染

Marquee 元件應（SHALL）渲染傳入的子內容，並將內容複製一份以實現無縫循環滾動。

#### Scenario: 渲染傳入的子內容
- **WHEN** 使用者提供 `<Marquee>Hello World</Marquee>`
- **THEN** 元件應（SHALL）在 DOM 中渲染兩份 "Hello World" 內容以支援無縫循環

### Requirement: 水平滾動動畫

Marquee 元件應（SHALL）使用 CSS `@keyframes` 動畫實現水平方向的自動滾動，從右向左持續移動。

#### Scenario: 預設方向為由右至左
- **WHEN** 元件渲染完成且未指定方向 prop
- **THEN** 內容應（SHALL）從右側滾動至左側並無縫循環

#### Scenario: 可配置方向為由左至右
- **WHEN** 使用者設定 `direction="right"`
- **THEN** 內容應（SHALL）從左側滾動至右側並無縫循環

### Requirement: 速度控制

Marquee 元件應（SHALL）接受 `speed` prop（單位：秒），控制完成一次完整滾動循環所需的時間。

#### Scenario: 預設速度
- **WHEN** 未提供 `speed` prop
- **THEN** 動畫循環時間應（SHALL）為 10 秒

#### Scenario: 自訂速度
- **WHEN** 使用者設定 `speed={5}`
- **THEN** 動畫循環時間應（SHALL）為 5 秒

### Requirement: 滑鼠懸停暫停

Marquee 元件應（SHALL）在滑鼠指標進入元件區域時暫停滾動，離開時恢復滾動。

#### Scenario: 滑鼠進入時暫停
- **WHEN** 滑鼠指標進入 Marquee 元件範圍（`mouseenter`）
- **THEN** 動畫應（SHALL）暫停（`animation-play-state: paused`）

#### Scenario: 滑鼠離開時恢復
- **WHEN** 滑鼠指標離開 Marquee 元件範圍（`mouseleave`）
- **THEN** 動畫應（SHALL）恢復播放（`animation-play-state: running`）

### Requirement: 整合至 App.jsx

Marquee 元件應（SHALL）在 `App.jsx` 中被引入並放置於頁面頂部，作為示範用途顯示預設公告訊息。

#### Scenario: App 頁面包含跑馬燈
- **WHEN** 應用載入
- **THEN** 頁面頂部應（SHALL）顯示 Marquee 元件，帶有預設公告文字
