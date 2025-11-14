import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AutoScrollToTop from "../components/AutoScrollToTop";

export default function FrontLayout() {
  return (
    <>
      <AutoScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
