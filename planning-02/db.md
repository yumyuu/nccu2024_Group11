![mongo_shcema.drawio (1)](https://hackmd.io/_uploads/BJacNDkM1e.png)



## 一. 系統描述

本系統提供研究生優化的論文閱讀體驗，使用者可以把 PDF 文件上傳至系統，藉由文本分析功能整理出文件大綱以及 PPT 簡報，註冊登入後則把結果儲存在雲端。PDF 文件會變成 Word 文件以供編輯，使用者可以將文件大綱，以及從文件中擷取的圖片做成簡報最後也提供問答題本，模擬與教授面談的情況

## 二. Schema 架構
### 1. Collection
- `user`: 紀錄會員基本資料，分別出一個集合易於管理
- `file`: 考慮到不同使用者可能會上傳同一篇文章，為了節省運算資源和雲端空間，把文件獨立出來，不同 user 可以 reference 到同一個 file
- `Output`: 另外，即便是同一篇文章，不同使用者也會對其進行不同的編輯，因此需要把編輯結果另外獨立出來，並 refernce 到原始文章和編輯的 user ， 才是正確的結果
### 2. Relation
* 一個 User 可以有多個 File
* 一個 File 可以有多個 Output
* 一個 User 可以創建多個 Output