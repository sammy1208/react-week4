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

  const handleBookClick = (id: string) => {
    Navigate(`/CP/${id}`);
  };

  async function loadWordData() {
    const res = await fetch("./data/word.json");
    const data = await res.json();
    setWordData(data);
  }

  useEffect(() => {
    loadWordData();
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

  interface cpData {
    id: string;
    wordName: string;
    wordTitle: string[];
  }

  return (
    <>
      <main className="container word-section">
        <section className="word-card">
          <h2 className="word-card__title">{cpData.wordName}</h2>

          <ul className="word-card__list">
            {cpData.wordTitle?.map((item: string, index: number) => (
              <li
                className="word-card__item glass-card"
                key={index}
                onClick={() => handleBookClick(item)}
              >
                <div className="word-card__item-text">{item}</div>
                <img
                  src="./public/img/img01.jpg"
                  alt={`${item} 封面背景`}
                  className="word-card__bg"
                />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
