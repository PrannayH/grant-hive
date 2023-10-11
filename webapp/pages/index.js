import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link'; // Import Link component for navigation

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const captureQuery = async () => {
    try {
      const response = await axios.post('api/processQuery', { query });
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      setResult("An error occurred."); // Display an error message on failure
    }
  }

  return (
    <main>
      <nav className='navbar'>
        <div className='logo'>
          <Link href="/">
            GrantHive
          </Link>
        </div>
        <div className='login'>
          <Link href="/login">
            Login
          </Link>
        </div>
      </nav>
      <img src="/money.svg" alt="Your SVG" className="money-svg" />
      <img src="/work.svg" alt="Your SVG" className="work-svg" />
      <div className='content'>
        <h1 className="center-text">GrantHive</h1>
        <p className="description">
          "Fueling Dreams and Empowering Students to Shape the Future, One Project at a Time!"
        </p>
      </div>
    </main>
  )
}
