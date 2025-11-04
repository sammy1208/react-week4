import { NavLink } from "react-router";

export default function Header() {
  return (
    <>
      <header className="header">
        <NavLink to={"/"} className="navLink">
          <span className="material-symbols-outlined logo">pets</span>
          <p>Nyarchive</p>
        </NavLink>
      </header>
    </>
  );
}
