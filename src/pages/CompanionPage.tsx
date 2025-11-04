import { useEffect, useState } from "react";
import { NovelsData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";

export default function CompanionPage() {
  const Navigate = useNavigate();
  const [novelsData, setNovelsData] = useState<NovelsData[]>([]);
  const { cpId } = useParams<{ cpId: string }>();
  const decodeId = decodeURIComponent(cpId || "");
  const [cpData, setCpData] = useState("");

  const handleBook = (id: string) => {
    Navigate(`/cp/${cpData}/${id}`);
  };

  function getCp(cpIdName: string) {
    switch (cpIdName) {
      case "佐久侑":
        setCpData("SakuAtsu");
        break;
      case "治角名":
        setCpData("OsaSuna");
        break;
      case "兔赤":
        setCpData("BokuAka");
        break;
      case "黑研":
        setCpData("KuroKen");
        break;
      case "灰夜久":
        setCpData("HaiYaku");
        break;
      case "多CP":
        setCpData("other");
        break;
      default:
        console.warn("沒有對應的 CP ID:", cpIdName);
    }
  }

  async function getNovels() {
    if (!cpData) return;
    try {
      const res = await fetch(`./data/${cpData}.json`);
      if (!res.ok) throw new Error("無法讀取檔案");
      const data = await res.json();
      setNovelsData(data);
    } catch (error) {
      console.error("抓取資料錯誤:", error);
    }
  }

  useEffect(() => {
    getNovels();
  }, [cpData]);

  useEffect(() => {
    if (decodeId) {
      getCp(decodeId);
    } else {
      console.log("找不到id");
    }
  }, [decodeId]);

  return (
    <>
      {novelsData.map((item) => (
        <div
          className="book-box"
          key={item.id}
          onClick={() => handleBook(item.id)}
        >
          <h5 className="word-title">{item.title}</h5>
          <p>{item.tags}</p>
          <p>{item.description}</p>
        </div>
      ))}
    </>
  );
}
