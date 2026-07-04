import { useNavigate } from "react-router-dom";

type BreadcrumbVariant = "word" | "cp";

type BreadcrumbItem = {
  label: string;
  icon?: string;
  to?: string;
  current?: boolean;
};

type QuickLinkItem = {
  label: string;
  icon: string;
  onClick?: () => void;
};

type NavProps =
  | {
    variant: "home";
    items: QuickLinkItem[];
    ariaLabel?: string;
  }
  | {
    variant: BreadcrumbVariant;
    items: BreadcrumbItem[];
    ariaLabel?: string;
  };

export default function Nav(props: NavProps) {
  const navigate = useNavigate();

  if (props.variant === "home") {
    return (
      <nav className="home-quick-links" aria-label={props.ariaLabel ?? "首頁快速連結"}>
        {props.items.map((item) => (
          <button
            className="home-quick-links__item"
            type="button"
            key={item.label}
            onClick={item.onClick}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  const block = "ny-breadcrumb";

  return (
    <nav
      className={`${block} ${block}--${props.variant}`}
      aria-label={props.ariaLabel ?? "麵包屑"}
    >
      {props.items.map((item, index) => {
        const isLast = index === props.items.length - 1;
        const isCurrent = item.current ?? isLast;
        const content = (
          <>
            {item.icon && <span className="material-symbols-outlined">{item.icon}</span>}
            <span>{item.label}</span>
          </>
        );

        return (
          <span key={`${item.label}-${index}`} className={`${block}__item`}>
            {isCurrent || !item.to ? (
              <span className={`${block}__current`}>{item.label}</span>
            ) : (
              <button
                className={`${block}__link`}
                type="button"
                onClick={() => navigate(item.to as string)}
              >
                {content}
              </button>
            )}

            {!isLast && (
              <span className={`material-symbols-outlined ${block}__separator`}>
                chevron_right
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
