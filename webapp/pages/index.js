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
      <div className='flex h-screen items-center'>
        <div className='flex flex-row w-screen justify-center'>
          <input className='w-2/4 h-12 text-black' onChange={e=>{setQuery(e.target.value)}} value={query}></input>
          <button className='bg-white ml-1 text-black' onClick={captureQuery}>SEND!</button>
        </div>
      </div>
    </main>
  )
}