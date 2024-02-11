import { useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Content from "./pages/Content";
import Header from "./components/Header";
import Pdf from "./pages/Pdf";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <div>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/content" element={<Content />} />
          <Route path="/pdf/:pdfId" element={<Pdf />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
