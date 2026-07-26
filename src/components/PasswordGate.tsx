import { FormEvent, ReactNode, useEffect, useState } from "react";
import { EncryptedContent } from "../types/theme";
import { decryptContent, NovelDecryptionError } from "../utils/decrypt";
import {
  getStoredPassword,
  PASSWORD_CLEARED_EVENT,
  storePassword,
} from "../security/passwordSession";

const BASE_URL = import.meta.env.BASE_URL;
const ACCESS_SENTINEL = "novel-reader-access-v1";

type PasswordGateProps = {
  children: ReactNode;
};

type GateStatus = "checking" | "locked" | "unlocked";

async function verifyPassword(password: string) {
  const response = await fetch(`${BASE_URL}security/novel-access.json`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("access-verifier-unavailable");
  }

  const data = (await response.json()) as {
    id?: string;
    contentEnc?: EncryptedContent;
  };

  if (!data.contentEnc) {
    throw new Error("access-verifier-invalid");
  }

  const plaintext = await decryptContent(data.contentEnc, password);
  if (plaintext !== ACCESS_SENTINEL) {
    throw new NovelDecryptionError();
  }
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const storedPassword = getStoredPassword();

    async function restoreSession() {
      if (!storedPassword) {
        setStatus("locked");
        return;
      }

      try {
        await verifyPassword(storedPassword);
        if (!cancelled) setStatus("unlocked");
      } catch {
        if (!cancelled) setStatus("locked");
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handlePasswordCleared() {
      setPasswordInput("");
      setErrorMessage("");
      setStatus("locked");
    }

    window.addEventListener(PASSWORD_CLEARED_EVENT, handlePasswordCleared);
    return () => {
      window.removeEventListener(PASSWORD_CLEARED_EVENT, handlePasswordCleared);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordInput) {
      setErrorMessage("請輸入閱讀密碼。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await verifyPassword(passwordInput);
      storePassword(passwordInput);
      setPasswordInput("");
      setStatus("unlocked");
    } catch (error) {
      if (error instanceof NovelDecryptionError) {
        setErrorMessage("密碼不正確，請重新輸入。");
      } else {
        setErrorMessage("無法讀取密碼驗證資料，請確認網站已重新部署。");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "checking") {
    return (
      <main className="password-gate password-gate--checking">
        <p>正在確認閱讀權限……</p>
      </main>
    );
  }

  if (status === "unlocked") {
    return children;
  }

  return (
    <main className="password-gate">
      <section className="password-gate__panel" aria-labelledby="password-gate-title">
        <div className="password-gate__mark" aria-hidden="true">
          ✦
        </div>
        <p className="password-gate__eyebrow">PRIVATE LIBRARY</p>
        <h1 id="password-gate-title">貓貓書城</h1>
        <p className="password-gate__intro">
          這座書城受到密碼保護。請先解鎖，才能進入網站。
        </p>

        <form className="password-gate__form" onSubmit={handleSubmit}>
          <label htmlFor="site-password">閱讀密碼</label>
          <input
            id="site-password"
            type="password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            autoComplete="current-password"
            autoFocus
            aria-describedby={errorMessage ? "site-password-error" : undefined}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "驗證中……" : "進入書城"}
          </button>
          {errorMessage ? (
            <p id="site-password-error" className="password-gate__error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>

        <p className="password-gate__notice">
          密碼只保留在目前的瀏覽器分頁，關閉分頁後即會清除。
        </p>
      </section>
    </main>
  );
}
