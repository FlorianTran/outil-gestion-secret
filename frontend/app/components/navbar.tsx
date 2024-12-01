'use client';

import Link from "next/link";
import "../globals.css";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 text-white fixed top-0 w-full shadow-md z-50 h-16">
      <div>
        <Link href="/" className="text-white no-underline">
          <h1 className="text-xl font-bold">Secret Manager</h1>
        </Link>
      </div>
      <ul className="flex gap-6 list-none">
        <li>
          <Link href="/dashboard" className="text-white no-underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/login" className="text-white no-underline">
            Login
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-white no-underline">
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}