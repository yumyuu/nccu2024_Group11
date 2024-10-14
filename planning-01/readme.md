---
title: 系統架構圖

---



### UI 設計

* 使用者一開始會登入系統，也可以用訪客身分進入
![1728915026874](https://hackmd.io/_uploads/BJ5XPick1e.jpg)
* Database 的部分記錄使用者上傳紀錄，並可以新增檔案，在此會需要使用者需要該data的資訊
* ![1728915049637](https://hackmd.io/_uploads/HJByuo9Jkg.jpg)
![1728915038367](https://hackmd.io/_uploads/rkBk_j5kke.jpg)

* 點入 data 的資料後，可以看見系統依照使用者的輸入產出的資訊
![1728915065307](https://hackmd.io/_uploads/HJ0Hui511g.jpg)
![1728915074649](https://hackmd.io/_uploads/HyRHdscyJg.jpg)

* 另外有生成式 AI 的功能，可以依照選擇的資料範圍回答問題
![1728915097990](https://hackmd.io/_uploads/Hyrs_jc1Jx.jpg)







### 核心功能
- pdf 轉文字
     -  PDF ORC API：PDF.js（可以在網頁上直接編輯 pdf）、PyMuPDF（Python）、PDF.co

- LLM 分析文本及圖表
    - 利用開源模型如：Llama 3、TAIDE（可信任），調整 prompt
- 即時協作編輯、資料同步以及版本控制
    - Conflict-Free Replicated Data Types (CRDTs)：同步編輯技術，即使用戶是以離線狀態編輯，重新連接時依然可以自動合併變更而不衝突。
    - Operational Transformation (OT)： Google Docs 使用的就是這種技術。
    - 後端技術：Node.js 和 Socket.IO。
    - 資料庫： MongoDB 或 MySQL ，用來儲存文件的歷史版本與變更記錄。
- Word、PPt 輸出：後端套件(python-pptx、python-docs)
 

- 系統效能優化
    - 將查詢結果儲存於 DB（MySQL）
    - 同一篇論文的資料儲存於快取（Redis/Memcached）



### 系統架構圖
![系統架構圖](https://hackmd.io/_uploads/SyfqIicJke.png)


## 技術

#### 前端技術選擇

1. Vue.js + Vuetify
    * 特點：輕量且易學，模組化設計讓開發過程流暢
    * 支援：多檔上傳可以使用 vue-file-agent，整合簡單
2. React.js + Tailwind CSS
    * 特點：大量的社群支持、成熟的生態系統、適合複雜 UI 應用
    * 支援多檔上傳功能，如 react-dropzone 可以輕鬆實現檔案上傳功能

#### 後端技術選擇

* 程式語言與框架
    1. Node.js + Express
        - Express  輕量、靈活的框架適合構建 RESTful API。專案中需實現文件上傳、資料儲存、摘要生成等功能，Express 可以簡化 API 開發流程。 
    3. FastAPI（Python）
        - 本專案涉及 NLP 處理任務，例如多篇論文摘要生成和處理。Python 在處理 NLP 任務時擁有豐富的庫（如 spaCy、NLTK），而 FastAPI 在此基礎上具有良好的性能，故選用此框架。
    
* 資料庫
    1. MongoDB
        - **原因**：適合儲存非結構化資料，支援動態結構和文件格式（如 JSON），便於快速儲存和檢索變化多端的資料。此專案中的文件摘要、用戶設定及暫存元數據可使用 MongoDB 靈活管理。
       - **本專案適用資料**：上傳的文件摘要、用戶偏好設定、文件元數據和暫存資料等。    
    2. MySQL： 
       - **原因**：適合結構化資料和關聯性高的數據，支援複雜查詢，能確保數據完整性。此專案中的用戶帳號管理、使用紀錄及訂閱狀況可使用 MySQL 儲存，便於高效查詢與維護數據一致性。
       - **本專案適用資料**：用戶帳號資料、使用歷史紀錄、訂閱與權限狀態等。


* 雲端檔案儲存
    * AWS S3
        - 原因：可以用於暫存和永久存儲生成的Word和PPT文件，也支援自動清理暫存檔案

* 身份驗證和會員系統
    1. Auth0
        - 原因：Auth0 是一個即用型的身份驗證解決方案，支援多種驗證方式（如社交登錄、單點登錄等），並且可以輕鬆集成到前後端應用中，提供高安全性和可擴展性。
    3. AWS Cognito
        - 原因：適合用於 AWS 生態系統，支援用戶註冊、登入、社交登入等功能，方便和其他 AWS 服務整合。

## 團隊合作

* **採用的 Branch Model**
    小組採用GitHub Flow，主要有兩種分支，第一個是master，其餘的都是branch，採用此 Branch Model 原因為操作較輕量化，適用於本次小團隊協作專案，開發流程及情境如下：
    

| Fork | 專案開發初期，團隊連結主要開發的 Repo（已完成） | 
| -------- | -------- | 
| commit + push | 有組員完成部分功能開發，提交上 repo 等待 review 及 merge  | 
| Pull Request     | 小組成員在部分功能開發完成後進行 Code Review   (至少由另一位非該功能開發組員進行 Review)
| Merge   | 確定 code 無誤後合併主分支


- Trello 連結：https://trello.com/invite/b/66f63fa56af509ef03ae105d/ATTI4b8597d2ee70c9326598407ab0e09508884AEC0E/nccu-group-11
    - 使用方法: 用 TODO, Doing, Done 協助追蹤 deadline
    - 未來希望可以用在專案上，幫助觀察每個功能的開發進度
    
- 固定開會討論的時間
    - 每個禮拜四下午實體會議
    - 不定時線上討論
- 這次討論中遇到的問題，以及你們是怎麼解決的？
    - 一開始想到的功能都過於粗淺，在老師的協助後發現角度要更宏觀，並且加入更多巧思，才能讓系統具有特色同時擁有完整功能性
    


