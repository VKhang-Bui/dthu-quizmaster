/**
 * IMPORT / EXPORT SERVICE
 * Hỗ trợ xuất ngân hàng đề ra file JSON và nhập file JSON vào Web App
 */
const ImportExportService = {
  // Xuất một môn học ra file JSON
  exportSubject(subjectId) {
    const subject = StorageService.getSubjectById(subjectId);
    if (!subject) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `de-thi-${subject.code || subject.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Xuất toàn bộ cơ sở dữ liệu (tất cả các môn) để sao lưu
  exportAll() {
    const subjects = StorageService.getSubjects();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjects, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dthu-quiz-backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Nhập file JSON từ máy tính
  importFromFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          // Là danh sách nhiều môn học
          parsed.forEach(sub => StorageService.saveSubject(sub));
          callback(true, `Đã nhập thành công ${parsed.length} môn học!`);
        } else if (parsed && parsed.id && parsed.name) {
          // Là một môn học đơn lẻ
          StorageService.saveSubject(parsed);
          callback(true, `Đã nhập thành công môn "${parsed.name}" (${parsed.questions ? parsed.questions.length : 0} câu hỏi)!`);
        } else {
          callback(false, "Định dạng file JSON không hợp lệ.");
        }
      } catch (err) {
        callback(false, "Lỗi đọc file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }
};
