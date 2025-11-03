import { useNavigate } from "react-router-dom"

export default function Theme () {

    const Navigate = useNavigate();




const handleTheme = () => {
  Navigate(`/word`)
}

  return <li className="theme-list" onClick={handleTheme}>book01</li>
}