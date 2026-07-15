import RenderBowls from "./HomePage.jsx";
import Contents from "./SpecificBowlContents.jsx";
import Contact from "./Contact.jsx";
import MainCheckout from "./MainCheckout.jsx";
import AdminPage from "./Admin.jsx";
import LoginFeature from "./LoginLogic.jsx";

import "./globalStyles.css";
import "./variables.css";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const basename = import.meta.env.DEV ? "/" : "/MealBowlApp/docs";
import { useState } from "react";
import {
  getEverythingForThatUser,
  getEverything,
  getPrices as fetchPrices,
} from "./utils/api.js";

function App() {
  async function callCheckoutData() {
    let result = await getEverythingForThatUser();
    if (Object.keys(result).length === 0) {
      result = {};
    }
    if (result && !result.error) {
      sessionStorage.setItem("CheckoutData", JSON.stringify(result));
    }
  }
  async function callAdminData() {
    let everythingResult = await getEverything();
    let pricesResult = await fetchPrices();
    if (Object.keys(everythingResult).length === 0) {
      everythingResult = {};
    }
    if (Object.keys(pricesResult).length === 0) {
      pricesResult = {};
    }
    if (everythingResult && !everythingResult.error) {
      sessionStorage.setItem("AdminData", JSON.stringify(everythingResult));
    }
    if (pricesResult && !pricesResult.error) {
      sessionStorage.setItem("AdminPriceData", JSON.stringify(pricesResult));
    }
  }
  const [somethingChangedinLogin, setsomethingChangedinLogin] = useState(0);
  const [reShowSave, setreShowSave] = useState(false);
  const [processing, setprocessing] = useState(false);
  const [text, setText] = useState("Save all changes");
  async function saveChanges() {
    await callCheckoutData();
    await callAdminData();
  }
  return (
    <>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route
            path="/"
            element={
              <RenderBowls
                somethingChangedinLogin={somethingChangedinLogin}
                setsomethingChangedinLogin={setsomethingChangedinLogin}
                saveChanges={saveChanges}
                reShowSave={reShowSave}
                setreShowSave={setreShowSave}
                processing={processing}
                setprocessing={setprocessing}
                text={text}
                setText={setText}
              />
            }
          />
          <Route
            path="/contents/:bowlID"
            element={
              <Contents
                somethingChangedinLogin={somethingChangedinLogin}
                setsomethingChangedinLogin={setsomethingChangedinLogin}
                saveChanges={saveChanges}
                reShowSave={reShowSave}
                setreShowSave={setreShowSave}
                processing={processing}
                setprocessing={setprocessing}
                text={text}
                setText={setText}
              />
            }
          />
          <Route path="/Admin" element={<AdminPage />} />
          <Route
            path="/checkout"
            element={
              <MainCheckout
                somethingChangedinLogin={somethingChangedinLogin}
                setsomethingChangedinLogin={setsomethingChangedinLogin}
                saveChanges={saveChanges}
                reShowSave={reShowSave}
                setreShowSave={setreShowSave}
                processing={processing}
                setprocessing={setprocessing}
                text={text}
                setText={setText}
              />
            }
          ></Route>
          <Route
            path="/loginPage"
            element={
              <LoginFeature
                somethingChangedinLogin={somethingChangedinLogin}
                setsomethingChangedinLogin={setsomethingChangedinLogin}
                saveChanges={saveChanges}
                reShowSave={reShowSave}
                setreShowSave={setreShowSave}
                processing={processing}
                setprocessing={setprocessing}
                text={text}
                setText={setText}
              />
            }
          ></Route>
          <Route
            path="/contact"
            element={
              <Contact
                somethingChangedinLogin={somethingChangedinLogin}
                setsomethingChangedinLogin={setsomethingChangedinLogin}
                saveChanges={saveChanges}
                reShowSave={reShowSave}
                setreShowSave={setreShowSave}
                processing={processing}
                setprocessing={setprocessing}
                text={text}
                setText={setText}
              />
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
