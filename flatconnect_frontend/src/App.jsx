// src/App.jsx

// 1. Remove unused imports like useState and logos.
// 2. Import the Outlet component from react-router-dom.
import { Outlet } from "react-router-dom";
import Header from "./components/Header"; // Import your header component
import "./App.css";
import Footer from "./components/Footer"; // Import your footer component

function App() {
  // 3. Remove the state logic, as it's not needed here.

  // 4. Return only the <Outlet /> component.
  // This acts as a placeholder where your pages (Landing, Login, Signup) will be rendered by the router.
  return (
    <>
    <Header/>
      <Outlet />
      <Footer/>
    </>
  );
}

export default App;
