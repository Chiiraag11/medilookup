import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SearchPage from "./SearchPage.jsx";
import DetailPage from "./DetailPage.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <nav className="nav">
      <Link to="/" className="brand">
        <span>🔍</span> MediLookup
      </Link>
      <span className="nav-tag">Powered by openFDA</span>
    </nav>
    <main className="container">
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/medicine/:id" element={<DetailPage />} />
      </Routes>
    </main>
  </BrowserRouter>
);