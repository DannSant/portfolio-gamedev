import { useState } from 'react'

import './App.css'
import Hero from './components/Hero'
import Projects from './components/Projects'
import { LanguageProvider } from './i18n/LanguageContext'
import Navbar from './components/Navbar'
import Contact from './components/Contact'

function App() {
  return (
    <>
      <>
        <LanguageProvider>
          <Navbar />
          <Hero />
          <Projects />
          <Contact />
        </LanguageProvider>
      </>
    </>
  )
}

export default App
