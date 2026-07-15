// Replaces the 9 props (somethingChangedinLogin, setsomethingChangedinLogin,
// saveChanges, reShowSave, setreShowSave, processing, setprocessing, text,
// setText) that used to be manually passed into every single <Route>
// element in App.jsx. Any component that needs this shared "sync" state now
// just calls useSyncContext() (from SyncContext.js) instead of receiving it
// as props.

import { useState } from "react";
import { SyncContext } from "./SyncContext.js";
import {
  getEverythingForThatUser,
  getEverything,
  getPrices as fetchPrices,
} from "../utils/api.js";

export function SyncProvider({ children }) {
  const [somethingChangedinLogin, setsomethingChangedinLogin] = useState(0);
  const [reShowSave, setreShowSave] = useState(false);
  const [processing, setprocessing] = useState(false);
  const [text, setText] = useState("Save all changes");

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

  async function saveChanges() {
    await callCheckoutData();
    await callAdminData();
  }

  const value = {
    somethingChangedinLogin,
    setsomethingChangedinLogin,
    saveChanges,
    reShowSave,
    setreShowSave,
    processing,
    setprocessing,
    text,
    setText,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
