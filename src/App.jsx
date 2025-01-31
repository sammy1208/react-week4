import { useState } from "react";
// import reactLogo from './assets/react.svg'
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
// import ProductPage from './pages/ProductPage';
// import './App.css'

function App() {
  const [isAuth, setIsAuth] = useState(false);

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
