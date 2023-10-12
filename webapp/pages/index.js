'use client';
import axios from 'axios'
import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState(";");

  const captureQuery = async ()=>{
    const response = await axios.post('api/processQuery', {'query':query});
    console.log(response.data)
  }

  return (
    <main>
      <div className='query-global'>
        <div className='query-box'>
          <input className='query-input' onChange={e=>{setQuery(e.target.value)}} value={query}></input>
          <button className='query-send' onClick={captureQuery}>SEND!</button>
        </div>
      </div>
    </main>
  )
}