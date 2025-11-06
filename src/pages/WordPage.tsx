import { useEffect, useState } from "react";
import { WordData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";

export default function Word() {
  const Navigate = useNavigate();
  const { id } = useParams();
  const [wordData, setWordData] = useState<WordData[]>([]);
  const decodeId = decodeURIComponent(id || "");
  const [cpData, setCpData] = useState<WordData>({
    id: "",
    wordName: "",
    wordTitle: [],
  });

  const handleBook = (id: string) => {
    Navigate(`/CP/${id}`);
  };

  async function getNovels() {
    const res = await fetch("./data/word.json");
    const data = await res.json();
    setWordData(data);
  }

  useEffect(() => {
    getNovels();
  }, []);

  useEffect(() => {
    if (wordData.length > 0) {
      const found = wordData.find((item) => item.id === decodeId);
      if (found) {
        setCpData(found);
      }
    } else {
      console.warn("找不到指定小說:", decodeId);
    }
  }, [wordData, decodeId]);

  // function getId(id: string) {
  //   const AA = wordData.find((item) => item.id === id);
  //   if (!AA) {
  //     console.log("找不到指定小說:");
  //     return;
  //   }
  //   setCpData(AA);
  // }

  interface cpData {
    id: string;
    wordName: string;
    wordTitle: string[];
  }

  return (
    <>
      <main className="container theme-page">
        <div className="theme">
          <h5 className="theme-title">{cpData.wordName}</h5>

          <div className="theme-container">
            <ul className="theme-ul">
              {cpData.wordTitle?.map((item: string, index: number) => (
                <li
                  className="word-list glass-card"
                  key={index}
                  onClick={() => handleBook(item)}
                >
                  <div className="card-content">{item}</div>
                  <img
                    src="./public/img/img01.jpg"
                    alt=""
                    className="card-bg"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
