import React from 'react';

function Footer() {
  return (
    <footer
      className="w-full bg-gray-100 text-black text-center py-4 text-sm"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      © {new Date().getFullYear()} Virtual Outfit. All rights reserved.
    </footer>
  );
}

export default Footer;
