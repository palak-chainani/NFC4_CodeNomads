import React from 'react'

function Footer() {
  return (
    <div>
      <footer className="bg-[#0A400C] text-[#B1AB86] py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} SocietyTracker. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-[#FEFAE0] underline">Terms of Service</a>
            <a href="#" className="hover:text-[#FEFAE0] underline">Privacy Policy</a>
            <a href="#" className="hover:text-[#FEFAE0] underline">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
