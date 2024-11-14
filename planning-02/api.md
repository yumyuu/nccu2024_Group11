![image](https://hackmd.io/_uploads/HyoLMAlG1e.png)

# 說明
本架構圖呈現了前端與後端系統之間的互動流程，包含各個服務之間的資料傳遞順序及回應過程。

在架構圖中，共有七個參與者：
1. **Frontend**：前端系統，負責發出 HTTP 請求並接收回應。
2. **Gateway API**：API 閘道，負責接收前端請求並分發至相應的後端服務，充當前端與各服務之間的中介。
3. **Document Service**：文件服務，處理文件相關的請求，如 PDF 上傳、文字轉換等，負責文件內容的初步處理。
4. **File Storage**：檔案儲存服務，用於存放文件、圖片或 PPT 等資源，確保文件正確性和檔案管理。
5. **LLM Service**：大型語言模型服務，負責文本分析或內容生成，增強文件的語義處理。
6. **Json Transfer**：JSON 轉換服務，將資料轉換為 JSON 格式，以便進行儲存和傳輸。
7. **Database**：資料庫，儲存各類數據，包括文字摘要、文件路徑和分析結果等，提供數據的持久性支持。

# 流程概要
圖型由左至右，起始點均為由 Frontend 發出 Http Request 至後端，最後回到前端完成一 Request，本圖共有四項 Requests：

- **PDF 上傳流程**：前端將 PDF 文件上傳至 Gateway API。經過 Document Service 的文件處理後，文件被轉換為文字並傳送至 LLM Service 進行文本分析。分析結果最終儲存至 Database。
  
- **圖片上傳流程**：前端上傳截取的論文圖片，經由 Gateway API 驗證並傳送至 Document Service。圖片經過處理並存入 File Storage，隨後進行圖像分析及描述生成，生成的描述數據以 JSON 格式存入 Database。

- **選擇 PPT 素材**：使用者在前端選擇 PPT 素材，系統透過 Document Service 處理生成 PPT 並存儲於 File Storage 中。Database 中則記錄 PPT 的存儲路徑與相關資料，便於後續的查詢和下載。

- **下載 PPT**：前端發出下載 PPT 的請求，Gateway API 透過查詢 Database 獲取 PPT 路徑，並從 File Storage 中檢索 PPT 文件。文件經由 Gateway API 回傳至前端，完成下載流程。
 
