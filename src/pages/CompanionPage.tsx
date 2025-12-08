import { useEffect, useState } from "react";
import { NovelsData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import GlassCard from "../components/GlassCard";
import Nav from "../components/Nav";
import CP_MAP from "../data_encrypted";

export default function CompanionPage() {
  const Navigate = useNavigate();
  const [novelsData, setNovelsData] = useState<NovelsData[]>([]);
  const { cpId } = useParams<{ cpId: string }>();
  const decodeId = decodeURIComponent(cpId || "");
  const [cpData, setCpData] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);
  const [filterData, setFilterData] = useState<NovelsData[]>([]);
  const TAG_ORDER = ["超好", "不錯", "不好不壞", "嗯…", "PWP", "圖", "待看"];

  const handleBook = (id: string) => {
    Navigate(`/CP/${cpData}/${id}`);
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
      case "排球其他":
        setCpData("HaikyuuCP");
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
      case "太中":
        setCpData("Dachu");
        break;
      case "芥敦":
        setCpData("AkuAtsu");
        break;
      case "福亂":
        setCpData("FukuRan");
        break;
      case "文豪其他":
        setCpData("BungouCP");
        break;
      case "千叉":
        setCpData("SenXeno");
        break;
      case "美國組":
        setCpData("StanXeno");
        break;
      case "千幻":
        setCpData("SenGen");
        break;
      case "龍羽":
        setCpData("RyuUkyou");
        break;
      case "千琥":
        setCpData("SenHaku");
        break;
      case "司千":
        setCpData("TsuSen");
        break;
      case "新石紀其他":
        setCpData("DrStoneCP");
        break;

      default:
        console.warn("沒有對應的 CP ID:", cpIdName);
    }
  }

  async function getNovels() {
    if (!cpData) return;
    try {
      const list = CP_MAP[cpData]; // ⬅ 就這句！

      if (!list) return;

      const safeList = list.map((novel: NovelsData) => ({
        id: novel.id,
        title: novel.title,
        author: novel.author,
        tags: novel.tags,
        description: novel.description,
        rating: novel.rating,
      }));

      setNovelsData(safeList);
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

  useEffect(() => {
    if (openSidebar) {
      document.body.style.overflow = "hidden"; // 禁止滑動
      document.body.style.pointerEvents = "none"; // 禁止點擊主頁
    } else {
      document.body.style.overflow = "auto"; // 恢復
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.pointerEvents = "auto";
    };
  }, [openSidebar]);

  function handleTag(item: string) {
    const res = novelsData.filter((novel) => novel.tags?.includes(item));

    setFilterData(res);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setOpenSidebar(false);
  }

  const rawTags = [...new Set(novelsData.flatMap((item) => item.tags))];

  const tags = rawTags.sort((a, b) => {
    const indexA = TAG_ORDER.indexOf(a);
    const indexB = TAG_ORDER.indexOf(b);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  return (
    <>
      <div className="cp-section">
        <div className="container">
          <div className="nav-item">
            {/* <Nav /> */}
            <button
              className="tag-toggle-btn glass-btn-s"
              onClick={() => setOpenSidebar(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div
            className={`sidebar glass-card--border scrollbar ${
              openSidebar ? "open" : ""
            }`}
          >
            <button
              className="sidebar-close"
              onClick={() => setOpenSidebar(false)}
            >
              ✕
            </button>

            <h3 className="cp-tag__title">{`${
              (filterData.length > 0 ? filterData : novelsData).length
            }篇文章`}</h3>

            <div className="sidebar-tags">
              <p
                className="cp-tag__list glass-btn-m"
                onClick={() => setFilterData([])}
              >
                全部
              </p>
              {tags.map((item) => (
                <p
                  key={item}
                  className="cp-tag__list glass-btn-m"
                  onClick={() => handleTag(item)}
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="cp-card">
            <div className="cp-card__box1">
              <GlassCard title={decodeId}>
                {(filterData.length > 0 ? filterData : novelsData).map(
                  (item) => (
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
                  )
                )}
              </GlassCard>
            </div>
            <div className="cp-card__box2">
              <GlassCard title={""}>
                <h3 className="cp-tag__title">{`${
                  (filterData.length > 0 ? filterData : novelsData).length
                }篇文章`}</h3>
                <p
                  className="cp-tag__list glass-btn-s"
                  onClick={() => setFilterData([])}
                >
                  全部
                </p>
                {tags.map((item, index) => (
                  <p
                    className="cp-tag__list glass-btn-s"
                    key={index}
                    onClick={() => handleTag(item)}
                  >
                    {item}
                  </p>
                ))}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
      {openSidebar && <div className="page-mask open"></div>}
    </>
  );
}
