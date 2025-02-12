import { useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import axios from "axios";
// import ProductPage from './pages/ProductPage';
// import './App.css'

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    axios.defaults.headers.common["Authorization"] = token;

    setIsAuth(true);
  }, []);

  return (
    <>
      {isAuth ? (
        <ProductPage setIsAuth={setIsAuth} />
      ) : (
        <LoginPage setIsAuth={setIsAuth} />
      )}
    </>
  );
}

export default App;
