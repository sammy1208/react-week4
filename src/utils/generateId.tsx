export function generateId(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[：:]/g, "") // 移除中英文冒號
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留英文、數字、底線、中文字
    .replace(/\s+/g, "-");
}
