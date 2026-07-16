import RenderBowls from "./components/HomePage.jsx";
import Contents from "./components/SpecificBowlContents.jsx";
import Contact from "./components/Contact.jsx";
import MainCheckout from "./components/MainCheckout.jsx";
import AdminPage from "./components/Admin.jsx";
import LoginFeature from "./components/LoginLogic.jsx";

import "./styles/globalStyles.css";
import "./styles/variables.css";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const basename = import.meta.env.DEV ? "/" : "/MealBowlApp/docs";
import { SyncProvider } from "./context/SyncProvider.jsx";

function App() {
  return (
    <SyncProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<RenderBowls />} />
          <Route path="/contents/:bowlID" element={<Contents />} />
          <Route path="/Admin" element={<AdminPage />} />
          <Route path="/checkout" element={<MainCheckout />} />
          <Route path="/loginPage" element={<LoginFeature />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </SyncProvider>
  );
}

export default App;
