import { NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";

export default function Header() {
  const location = useLocation();
  const [bgColor, setBgColor] = useState("var(--off-white)");
  const [textColor, setTextColor] = useState("var(--dark-green)");

  function backgroundColor() {
    if (location.pathname.startsWith("/word")) {
      setBgColor("#093821");
      setTextColor("var(--off-white)");
    } else if (location.pathname.startsWith("/CP")) {
      setBgColor("#0A412B");
      setTextColor("var(--off-white)");
    } else if (location.pathname.startsWith("/")) {
      setBgColor("var(--off-white)");
      setTextColor("var(--dark-green)");
    } else {
      setBgColor("#0A412B");
      setTextColor("var(--off-white)");
    }
  }
  useEffect(() => backgroundColor(), [location.pathname]);
  return (
    <>
      <header
        className="header"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <NavLink to={"/"} className="navLink">
          <span className="material-symbols-outlined logo">pets</span>
          <p>Nyarchive</p>
        </NavLink>
      </header>
    </>
  );
}
