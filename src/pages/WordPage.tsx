import { useEffect, useState } from "react";
import { WordData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import GlassCard from "../components/GlassCard";
import Nav from "../components/Nav";

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
      <main className="word-section">
        <div className="container">
          <section className="word-card">
            {/* <Nav /> */}
            <GlassCard title={cpData.wordName}>
              <ul className="theme-card__list">
                {cpData.wordTitle?.map((item: string, index: number) => (
                  <li
                    className="word-card__item glass-btn-l"
                    role="button"
                    tabIndex={0}
                    key={index}
                    onClick={() => handleBookClick(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </section>
        </div>
      </main>
    </>
  );
}
