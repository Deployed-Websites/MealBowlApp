import { useState, useEffect, useRef } from "react";
import {
  updateOrder,
  deleteOrder,
  updateBasket,
  updateBasketForDeletedOrder,
} from "./utils/api.js";
import React from "react";
function MainCheckout({
  saveChanges,
  reShowSave,
  setreShowSave,
  text,
  setText,
}) {
  const [allData, setAllData] = useState([]);
  const [rows, setRows] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [cur, setCur] = useState({});
  const [userData, setUserData] = useState({});
  const [CheckoutData, setCheckoutData] = useState({});
  const [trackPrice, setTrackPrice] = useState(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  async function saveClicked() {
    if (!isMounted.current) return;
    setText("Syncing changes");
    console.log("Syncing changes");
    await saveChanges();

    if (!isMounted.current) return;
    console.log("Synced changes");
    setText("Synced changes");
    setreShowSave(false);
  }

  useEffect(() => {
    if (reShowSave) {
      (async () => {
        await saveClicked();
      })();
    }
  }, [reShowSave]);
  function updateCur(e) {
    let { name, value } = e.target;
    setCur((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  async function update(changedValue, originalValue, bowlPrice, bowlName) {
    const dataToChange = JSON.parse(sessionStorage.getItem("CheckoutData"));
    const dataToChange2 = JSON.parse(sessionStorage.getItem("AdminData"));
    const dataToChange3 = JSON.parse(sessionStorage.getItem("AdminPriceData"));

    const userKey = Object.keys(dataToChange)[0];
    changedValue = Number(changedValue ?? 0);
    originalValue = Number(originalValue ?? 0);
    console.log(
      "Changed value: ",
      changedValue,
      "Original value: ",
      originalValue,
      "Bowl price: ",
      bowlPrice,
      "Bowl name: ",
      bowlName,
    );
    console.log(changedValue > originalValue);
    console.log(0 < changedValue < originalValue);
    console.log(changedValue === 0);
    setreShowSave((prev) => prev + 1);
    setCheckingOut(true);
    let totalData;
    if (changedValue === 0) {
      delete dataToChange[userKey][bowlName];
      delete dataToChange2[userKey][bowlName];
      delete dataToChange3[userKey];
      sessionStorage.setItem("CheckoutData", JSON.stringify(dataToChange));
      sessionStorage.setItem("AdminData", JSON.stringify(dataToChange2));
      sessionStorage.setItem("AdminPriceData", JSON.stringify(dataToChange3));

      totalData = {
        numberofBowls: originalValue,
        bowlName: bowlName,
        bowlTotal: bowlPrice,
      };
      await updateBasketForDeletedOrder(totalData);
      await deleteOrder(totalData);
      setreShowSave(true);
    }
    if (changedValue > originalValue) {
      dataToChange[userKey][bowlName]["NumberofBowls"] = changedValue;
      dataToChange2[userKey][bowlName]["NumberofBowls"] = changedValue;
      dataToChange3[userKey]["price"] =
        parseFloat(changedValue) * parseFloat(bowlPrice);
      sessionStorage.setItem("CheckoutData", JSON.stringify(dataToChange));
      sessionStorage.setItem("AdminData", JSON.stringify(dataToChange2));
      sessionStorage.setItem("AdminPriceData", JSON.stringify(dataToChange3));

      totalData = {
        numberofBowls: changedValue - originalValue,
        bowlName: bowlName,
        bowlTotal: bowlPrice,
      };
      await updateOrder(totalData);
      await updateBasket(totalData);
      setreShowSave(true);
    } else if (0 < changedValue < originalValue) {
      dataToChange[userKey][bowlName]["NumberofBowls"] = changedValue;
      dataToChange2[userKey][bowlName]["NumberofBowls"] = changedValue;
      dataToChange3[userKey]["price"] =
        parseFloat(changedValue) * parseFloat(bowlPrice);
      sessionStorage.setItem("CheckoutData", JSON.stringify(dataToChange));
      sessionStorage.setItem("AdminData", JSON.stringify(dataToChange2));
      sessionStorage.setItem("AdminPriceData", JSON.stringify(dataToChange3));
      sessionStorage.setItem("CheckoutData", JSON.stringify(dataToChange));
      console.log(changedValue - originalValue);
      totalData = {
        numberofBowls: changedValue - originalValue,
        bowlName: bowlName,
        bowlTotal: bowlPrice,
      };
      await updateOrder(totalData);
      await updateBasket(totalData);
      setreShowSave(true);
    }
    setCheckingOut(false);
  }
  useEffect(() => {
    let tryToPullCheckoutDataFromLocal = null;
    async function fetchData() {
      try {
        tryToPullCheckoutDataFromLocal =
          JSON.parse(sessionStorage.getItem("CheckoutData")) ?? {};
        setCheckoutData(tryToPullCheckoutDataFromLocal);
      } catch (error) {
        console.error("An error occurred:", error);
      }
      let max = 0;
      for (const key of Object.keys(tryToPullCheckoutDataFromLocal)) {
        const dict = tryToPullCheckoutDataFromLocal[key];
        const lengthofDict = Object.keys(dict).length;
        if (lengthofDict > max) {
          max = lengthofDict;
        }
      }
      setRows(max * 3 + 2);
      const usernameKey = localStorage
        .getItem("MostRecentLogin")
        .replace("User-", "");
      const userDataLocal = tryToPullCheckoutDataFromLocal[usernameKey] ?? {};
      console.log("", userDataLocal);
      setUserData(userDataLocal);
      const initialCur = {};
      Object.entries(userDataLocal).forEach(([key2, value2]) => {
        if (key2 !== "TotalPrice") {
          initialCur[key2] = value2["NumberofBowls"];
          console.log(initialCur[key2]);
        } else {
          setTrackPrice(value2);
        }
      });
      setCur(initialCur);
    }
    fetchData();
  }, [reShowSave]);
  return (
    <>
      {reShowSave && <div className="syncText">{text}</div>}
      <div
        id="grid"
        style={{
          display: "grid",
          gridTemplateRows: Array(rows).fill("1fr").join(" "),
          gridTemplateColumns: "1fr 1fr 1fr",
          rowGap: "50px",
        }}
      >
        {/* Show username */}
        {Object.keys(userData).length > 0 && (
          <div>{Object.keys(CheckoutData ?? {})[0]}</div>
        )}

        {Object.entries(userData).map(([key2, value2]) =>
          key2 !== "TotalPrice" ? (
            <React.Fragment key={key2}>
              <div style={{ gridColumn: "1" }}>{key2}</div>
              <div style={{ gridColumn: "2" }}>
                Number of bowls: {cur[key2] ?? ""}
              </div>
              <div style={{ gridColumn: "3" }}>
                Price of this part of the order: {value2["Price"]}
              </div>

              {/* ✅ Now input stays in sync */}
              <input
                onChange={(e) => updateCur(e)}
                //disabled={checkingOut}
                name={key2}
                hidden={false}
                disabled={checkingOut}
                type="number"
                value={cur[key2] ?? ""}
                placeholder="Change your order quantity"
                style={{ gridColumn: "1 / 2" }}
              />

              <button
                onClick={() =>
                  update(
                    cur[key2] ?? "",
                    value2["NumberofBowls"],
                    value2["Price"] / value2["NumberofBowls"],
                    key2,
                  )
                }
                hidden={false}
                disabled={checkingOut}
                type="button"
                style={{ gridColumn: "2 / 3" }}
              >
                Click to confirm
              </button>

              <div style={{ gridColumn: "1 / -1", height: "20px" }}></div>
            </React.Fragment>
          ) : null,
        )}
        {Object.keys(userData).length !== 0 && (
          <div>Basket total: {trackPrice ?? userData["TotalPrice"]}</div>
        )}
        {Object.keys(userData).length === 0 && <div>No data at the moment</div>}
      </div>
    </>
  );
}

export default MainCheckout;
