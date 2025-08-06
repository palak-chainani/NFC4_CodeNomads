// Paste the Header.jsx code you provided here.
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
const Header = () => {
    let token = localStorage.getItem("token");
    const navigate = useNavigate();
    return (
        <header className="bg-[#0A400C] text-[#FEFAE0] p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                    {/* <ShieldCheck className="h-7 w-7" /> */}
                    FlatConnect
                </Link>
                <nav>
                    <ul className="flex space-x-4">
  <li>
    <button
    onClick={() => {
      navigate("/")
    }}
     className="px-4 py-2 bg-[#0A400C] text-white rounded hover:bg-[#B1AB86] transition-colors">
      home
    </button>
  </li>
  {token ? (
    <li>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload(); // or navigate("/login") if using react-router
        }}
        className="px-4 py-2 bg-[#0A400C] text-white rounded hover:bg-[#B1AB86] transition-colors"
      >
        LogOut
      </button>
    </li>
  ) : (
    <>
      <li>
        <Link to="/login" className="hover:text-[#B1AB86] transition-colors">
          Login
        </Link>
      </li>
      <li>
        <Link to="/signup" className="hover:text-[#B1AB86] transition-colors">
          Sign Up
        </Link>
      </li>
    </>
  )}
</ul>

                </nav>
            </div>
        </header>
    );
};

export default Header;