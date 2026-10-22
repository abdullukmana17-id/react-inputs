import { useState } from 'react'
import './App.css'
import Input from './input/index'

function App() {
  const [html, setHtml] = useState("");

  return (
    <>
      <section className='py-5'>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <Input
                type="code"
                label="HTML Editor"
                language="html"
                value={html}
                mini={false}
                onChange={setHtml}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
