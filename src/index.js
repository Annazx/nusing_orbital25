import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function MyForm() {
    const [name, setName] = useState("");
    
    return (
    <form>
      <label>Enter your name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)} />
      </label>
    </form>
  )
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<MyForm />);