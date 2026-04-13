import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import Experience from "./pages/Experience";
import About from "./pages/About";
import Navbar from "./components/Navbar";

export default function App() {
  useEffect(() => {
    // Define the media query for system dark mode
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Logic to add or remove the 'dark' class based on system preference
    const handleThemeChange = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Initial detection
    handleThemeChange(darkQuery.matches);

    // Listen for system preference changes
    const listener = (e: MediaQueryListEvent) => handleThemeChange(e.matches);
    darkQuery.addEventListener("change", listener);
    return () => darkQuery.removeEventListener("change", listener);
  }, []);

  return (
    <>
      <Navbar />
      <main className="route-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
