\# Production Readiness Review (PRR) 範本與實例 \#\# 1\. 發布概覽 (Release Overview)

| 項目 | 說明 |
| :---- | :---- |
| **產品名稱** | Lot Action |
| **發布版本** | v2.5.0 |
| **核心功能** |  |
| **受影響的模組化架構** | Order Domain Service |
| **外部相關性變更** | 調整 API 憑證 (Secrets)；Orders 資料庫新增 XXX 欄位。 |

\#\# 2\. 程式碼與架構審查 (Code & Architecture Review)

* \[檢附C4 Diagram用紅字、紅框標註本次有改動的部分\]  
* \[簡易Mermaid Diagram描述 Sequence Diagram。或用其他現成架構圖可說明動態Traffic狀態亦可\]

| 檢核項目 | 狀態 | 佐證資料 / 備註 (Links & Notes) |
| :---- | :---- | :---- |
| **PR Review 審批** | \[ \] Done / \[ \] N/A | \[請提供相關 Pull Request 連結\] |
| **DB Migration 審核** | \[ \] Done / \[ \] N/A | \[DBA 或架構師簽核截圖或 Ticket\] |

\#\# 3\. 部署與爆炸半徑控制 (Deployment & Blast Radius Mitigation)

### **部署策略 (Canary Deployment)：**

| 階段 (Phase) | 流量比例 | 觀察日期 | 進階至下一階段條件 |
| :---- | :---- | :---- | :---- |
| **Phase 1** | 5% | 2026/06/01 10:00 \~ 2026/06/02 09:30 | 無 SL1/SL2 Alerts，Error Rate 穩定 |
| **Phase 2** | 20% | 2026/06/02 10:00 \~ 2026/06/03 09:30 | API Latency 正常 |
| **Phase 3** | 50% | 2026/06/03 10:00 \~ 2026/06/04 09:30 | 資源使用率 (CPU/Mem) 正常 |
| **Phase 4** | 100% | 2026/06/04 10:00 \~ | 全量上線 |

### **退版計畫 (Rollback Plan)：**

| 應變策略 | 執行步驟 (Action) | 預估恢復時間 (MTTR) |
| :---- | :---- | :---- |
| **前端/功能降級 (Feature Toggle)** | \[描述如何透過開關關閉異常功能，不需重啟\] | \[如: \< 1 min\] |
| **服務版本回滾 (Service Rollback)** | \[描述透過 CI/CD 退版至前一版本的流程\] | \[如: 5 mins\] |
| **資料庫回滾 (DB Rollback)** | \[確認本次 Schema 是否向後相容\] |  |

\#\# 4\. 系統觀測與異常回應 (Observability & Incident Response)  
**部署後 15 分鐘內的重點監控項目 (Golden Signals)：**

| 系統組件 (Components) | Latency (延遲) | Traffic (流量) | Errors (錯誤) | Saturation (飽和度) |
| :---- | :---- | :---- | :---- | :---- |
| **外部入口** *(API Gateway / WAF)* | API 回應時間 (P99 \> 500ms 持續 5m) | 總請求數 (QPS) (突發流量激增 \> 200%) | HTTP 狀態碼 (5xx 錯誤率 \> 1%) | 連線數上限 (Connection Pool \> 85%) |
| **核心應用服務** *(e.g., Domain API)* | 業務邏輯處理時間 (P99 \> 200ms) | 業務交易吞吐量 (TPS 異常下降 \> 30%) | 應用程式內部例外 (Exception Rate \> 5%) | 執行緒 / 記憶體堆積 (Thread Pool \> 90% 或 GC 停頓過長) |
| **快取層** *(Redis Cluster)* | 讀寫回應時間 (P99 \> 50ms) | 讀寫指令數 / 命中率 (Cache Hit Rate \< 60%) | 連線失敗 / 拒絕連線 (Rejected Connections \> 0\) | 記憶體使用量 (Memory Usage \> 80% 或 Evictions 激增) |
| **資料庫** *(MM, Oracle)* | 慢查詢數量 (慢查詢數量 \> 100/5m) | 活躍連線與交易數 (Active Transactions) | 死鎖 / 查詢失敗 (Deadlocks \> 0\) | 磁碟 IOPS 與空間 |

\#\# 5\. 測試覆蓋與品質保證 (Quality Assurance)

| 測試類別 | 測試情境 / 範圍說明 | 結果 |
| :---- | :---- | :---- |
| **正向測試 (Sunny Case)** | \[說明核心流程測試涵蓋\] | \[ \] Pass |
| **負向與邊界 (Negative Test)** | \[說明例外處理：如外部 API Timeout、不合法輸入之防呆\] | \[ \] Pass |
| **自動化回歸 (Regression)** | \[因本次修改而影響之原有功能測試狀況\] | \[ \] Pass |
| **效能與壓測 (Load Test)** | \[若無大量流量變更可標 N/A\] | \[ \] Pass |

\#\# 6\. 維運準備度 (Operational Readiness)

* **容量評估**：預期新開單方式會增加 15% 的 API 請求，已確認 K8s HPA 設置最大 Pod 數可承載流量峰值。  
* **維運手冊**：已更新 Runbook，加入「如何手動增加 BFF POD 數量」及「開單異常排查步驟」。