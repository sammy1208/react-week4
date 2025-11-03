import { useEffect, useState } from "react";
import { NovelsData } from "../types/theme";
import { useNavigate } from "react-router-dom";

export default function Word() {
  const Navigate = useNavigate();
  const [novelsData, setNovelsData] = useState<NovelsData[]>([]);

  const handleBook = (id: string) => {
    Navigate(`/book/${encodeURIComponent(id)}`);
  };

  async function getNovels() {
    const res = await fetch("./data/novels.json");
    const data = await res.json();
    setNovelsData(data);
  }

  useEffect(() => {
    getNovels();
  }, []);

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
