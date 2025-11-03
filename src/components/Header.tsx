import { NavLink } from "react-router";

export default function Header() {
  return (
    <>
      <header className="header">
        <NavLink to={"/"}>
          <span className="material-symbols-outlined logo">pets</span>
        </NavLink>
      </header>
    </>
  );
}
