import { useEffect, useState } from "react";
import { NovelsData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import GlassCard from "../components/GlassCard";

export default function CompanionPage() {
  const Navigate = useNavigate();
  const [novelsData, setNovelsData] = useState<NovelsData[]>([]);
  const { cpId } = useParams<{ cpId: string }>();
  const decodeId = decodeURIComponent(cpId || "");
  const [cpData, setCpData] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);
  // const [tags, setTags] = useState([]);

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
      case "太光":
        setCpData("TaiKou");
        break;
      case "忍岳":
        setCpData("OshiGaku");
        break;
      case "原創角色":
        setCpData("NyaMix");
        break;
      case "鐵蟲":
        setCpData("IronSpider");
        break;
      case "盾冬":
        setCpData("Stucky");
        break;
      case "锤基":
        setCpData("Thorki");
        break;
      case "漫威其他":
        setCpData("MultiCP");
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

  // function tagData() {
  //   setTags(tags);
  // }
  const tags = [...new Set(novelsData.flatMap((item) => item.tags))];

  return (
    <>
      <div className="container cp-section">
        <button
          className="tag-toggle-btn glass-btn-s"
          onClick={() => setOpenSidebar(true)}
        >
          標籤列表 ☰
        </button>
        <div className={`sidebar ${openSidebar ? "open" : ""}`}>
          <button
            className="sidebar-close"
            onClick={() => setOpenSidebar(false)}
          >
            ✕
          </button>

          <h3 className="cp-tag__title">{`${novelsData.length} 篇文章`}</h3>

          <div className="sidebar-tags">
            {tags.map((item) => (
              <p key={item} className="cp-tag__list glass-btn-s">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="cp-card">
          <div className="cp-card__box1">
            <GlassCard title={decodeId}>
              {novelsData.map((item) => (
                <div
                  className="glass-card--hover"
                  key={item.id}
                  onClick={() => handleBook(item.id)}
                >
                  <h5 className="cp-card__title">{item.title}</h5>
                  <div className="cp-card__tag">
                    {item.tags?.map((item, index) => (
                      <p key={index} className="tag">
                        {item}
                      </p>
                    ))}
                  </div>
                  <p className="cp-description">{item.description}</p>
                </div>
              ))}
            </GlassCard>
          </div>
          <div className="cp-card__box2">
            <GlassCard title={""}>
              <h3 className="cp-tag__title">{`${novelsData.length}篇文章`}</h3>
              {tags.map((item) => (
                <p className="cp-tag__list glass-btn-s">{item}</p>
              ))}
            </GlassCard>
          </div>
        </div>
      </div>
    </>
  );
}
