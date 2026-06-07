# 計畫：add-calendar

## A. 任務清單

### 1. 基礎設定

- [ ] 1.1 安裝日期處理依賴（如需）
- [ ] 1.2 建立元件目錄結構

### 2. 行事曆元件

- [ ] 2.1 建立 CalendarHeader 元件（月份導航）
- [ ] 2.2 建立 CalendarGrid 元件（日期格渲染）
- [ ] 2.3 建立 Calendar 元件主體，整合 Header與 Grid
- [ ] 2.4 實作月份計算邏輯（取得每月第一天、填充格）

### 3. 事件管理

- [ ] 3.1 建立 useEvents hook（CRUD + localStorage）
- [ ] 3.2 建立 EventModal 元件（新增/編輯/刪除表單）
- [ ] 3.3 整合 Calendar 與 EventModal

### 4. 樣式與整合

- [ ] 4.1撰寫行事曆樣式（CSS/全域樣式）
- [ ] 4.2 在 App 中整合行事曆元件
- [ ] 4.3 測試完整流程

---

## B. 測試案例

| 測試案例 | 規格情境 | 類型 |優先順序 |
|---------|---------|------|---------|
| TC-01：顯示當月行事曆 | Scenario: 顯示當月所有日期 |單元 | P0 |
| TC-02：上一月/下一月導航 | Scenario: 導航按鈕功能 |單元 | P0 |
| TC-03：今日日期 highlight | Scenario: 今日標示 | 單元 | P1 |
| TC-04：新增事件 | Scenario: 新增事件 | 整合 | P0 |
| TC-05：編輯事件 | Scenario: 編輯事件 | 整合 | P0 |
| TC-06：刪除事件 | Scenario: 刪除事件 | 整合 | P0 |
| TC-07：事件詳情檢視 | Scenario: 檢視事件詳情 | 單元 | P1 |
| TC-08：localStorage 持久化 | - | 整合 | P1 |

---

## C. TDD 微步驟

### 任務 2.1：CalendarHeader 元件

1. 🔴 RED：寫測試——點擊上一月按鈕，驗證月份遞減
2. ✅ 確認測試失敗
3. 🟢 GREEN：實作 CalendarHeader，渲染年月與導航按鈕
4. ✅ 確認測試通過
5. 🔵 REFACTOR：提取按鈕樣式
6. ✅ commit

### 任務 2.2：CalendarGrid 元件

1. 🔴 RED：寫測試——驗證當月第一天正確定位
2. ✅ 確認測試失敗
3. 🟢 GREEN：實作 CalendarGrid，計算填充格
4. ✅ 確認測試通過
5. 🔵 REFACTOR：提取日期計算工具函式
6. ✅ commit

### 任務 2.3：Calendar 主體

1. 🔴 RED：寫測試——驗證 Calendar渲染子元件
2. ✅ 確認測試失敗
3. 🟢 GREEN：整合 CalendarHeader + CalendarGrid
4. ✅ 確認測試通過
5. 🔵 REFACTOR：提取月份狀態管理
6. ✅ commit

### 任務 3.1：useEvents Hook

1. 🔴 RED：寫測試——新增事件後，列表包含該事件
2. ✅ 確認測試失敗
3. 🟢 GREEN：實作 useEvents（add/update/delete + localStorage）
4. ✅ 確認測試通過
5. 🔵 REFACTOR：提取 action types
6. ✅ commit

### 任務 3.2：EventModal

1. 🔴 RED：寫測試——開啟 modal，輸入標題後儲存
2. ✅ 確認測試失敗
3. 🟢 GREEN：實作 EventModal 表單與 CRUD邏輯
4. ✅ 確認測試通過
5. 🔵 REFACTOR：提取表單驗證邏輯
6. ✅ commit

### 任務 3.3：整合 Calendar + EventModal

1. 🔴 RED：寫測試——點擊日期格，modal開啟並預填日期
2. ✅ 確認測試失敗
3. 🟢 GREEN：連接 Calendar click handler與 EventModal
4. ✅ 確認測試通過
5. 🔵 REFACTOR：提取事件點擊處理
6. ✅ commit
