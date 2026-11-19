import Hero from "./components/Hero";
import Projects from "./components/Projects";
import { LanguageProvider } from "./i18n/LanguageContext";
import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Stats from "./components/Stats";
import Footer from "./components/Footer";

function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </LanguageProvider>
  );
}

export default App;
