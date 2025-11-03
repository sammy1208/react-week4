import ReactMarkdown from "react-markdown"
import { useState, useEffect } from "react"
import rehypeRaw from "rehype-raw"


export default function BookPage () {
    const [content, setContent] = useState("")

useEffect(() => {
  fetch("./novels/【佐久侑】我迷戀的ASMRer是你？！.md")
    .then(res => res.text())
    .then(text => setContent(text))
}, [])


  return<>
  <div className="container jc-center">
    <div className=" bookpage">

    <ReactMarkdown rehypePlugins={[rehypeRaw]} >
      {content}
    </ReactMarkdown>
    </div>
    <div className=" bookpage1">
        <ReactMarkdown rehypePlugins={[rehypeRaw]} >
      {content}
    </ReactMarkdown>
    </div>
        <div className=" bookpage2">
        <ReactMarkdown rehypePlugins={[rehypeRaw]} >
      {content}
    </ReactMarkdown>
    </div>
  </div>
  </>
}