export const PASSWORD_STORAGE_KEY = "novel-reader-password";
export const PASSWORD_CLEARED_EVENT = "novel-reader-password-cleared";

export function getStoredPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storePassword(password: string) {
  try {
    sessionStorage.setItem(PASSWORD_STORAGE_KEY, password);
  } catch {
    // 停用儲存空間時，PasswordGate 仍會在本次頁面生命週期內保留解鎖狀態。
  }
}

export function clearStoredPassword() {
  try {
    sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {
    // 即使儲存空間不可用，仍要通知全站回到鎖定畫面。
  }

  window.dispatchEvent(new Event(PASSWORD_CLEARED_EVENT));
}
