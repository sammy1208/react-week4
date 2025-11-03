
// import { useState } from "react"

import { useNavigate } from "react-router-dom"

export default function Word () {

  const Navigate = useNavigate();

    const data = [1, 2, 3, 4]



const handleBook = () =>{
  Navigate(`/book`)
} 



  return<>
      {data.map(() => (
      <div className="book-box" onClick={handleBook}>
        <h5 className="word-title">書名</h5>
        <p>tag</p>
        <p>簡介:lormhomepagesWhereas disregard 我
        </p>
      </div>
    ))}
  <p>homepagesWhereas disregard 我</p>

  </>
}