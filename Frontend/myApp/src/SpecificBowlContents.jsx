import BowlContentsStyles from "./Specific.module.css";
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  updateOrder,
  deleteOrder,
  updateBasket,
  updateBasketForDeletedOrder,
} from "./utils/api.js";
import { useSyncContext } from "./context/SyncContext.js";
import { useSaveSync } from "./customHooks/useSaveSync.js";
import { getBowlBySlug } from "./constants/bowls.js";

function Contents() {
  const { text, reShowSave, setreShowSave } = useSyncContext();
  useSaveSync();
  window.scrollTo(0, 0);
  const { bowlID } = useParams();
  const [ingredientsClicked, setingredientsClicked] = useState(true);
  const [macrosClicked, setMacrosClicked] = useState(true);
  const labels = ["Calories", "Protein", "Carbs", "Fats"];
  const [orderClicked, setOrderClicked] = useState(false);
  const [orderData, setorderData] = useState({});
  const [processing, setProcessing] = useState(false);
  const bowl = getBowlBySlug(bowlID);
  const bowlInfo = bowl ? bowl.ingredients : ["No ingredients found"];
  const bowlName = bowl ? bowl.name : bowlID;
  const bowlMacros = bowl
    ? [
        bowl.macros.calories,
        bowl.macros.protein,
        bowl.macros.carbs,
        bowl.macros.fats,
      ]
    : [];
  const bowlHot = bowl ? bowl.hot : false;
  const bowlPrice = bowl ? bowl.price : null;
  const stopCase = "Toppings";
  const bold = { fontWeight: "bold" };

  function updateOrderData(e, inputField) {
    if (inputField) {
      let { name, value } = e.target;
      setorderData((fillIn) => ({
        ...fillIn,
        [name]: value,
      }));
    } else {
      setorderData((fillIn) => ({
        ...fillIn,
        [e.name]: e.value,
      }));
    }
  }
  async function update(orderData, del) {
    setProcessing(true);
    const totalData = {
      ...orderData,
      bowlName: bowlName,
      bowlTotal: bowlPrice,
    };
    if (!del) {
      if (totalData.numberofBowls !== "" || totalData.numberofBowls) {
        await updateOrder(totalData);
        await updateBasket(totalData);
        setProcessing(false);
        setreShowSave(true);
      } else {
        console.log("An empty number of bowls cannot be sent as a request");
      }
    } else {
      await updateBasketForDeletedOrder(totalData);
      await deleteOrder(totalData);
      setProcessing(false);
      setreShowSave(true);
    }
  }
  function toggle(toChange) {
    if (toChange == "ingredients") {
      setingredientsClicked(!ingredientsClicked);
    }
    if (toChange == "macros") {
      setMacrosClicked(!macrosClicked);
    }
    if (toChange == "order") {
      setOrderClicked(!orderClicked);
    }
  }
  return (
    <>
      {reShowSave && <div className="syncText">{text}</div>}
      <div className={BowlContentsStyles.flexitAll}>
        <div className={BowlContentsStyles.flexIngreAndMacros}>
          <div
            className={BowlContentsStyles.ingredientsFlextheContentsVertically}
          >
            <h2 onClick={() => toggle("ingredients")} className="clickable">
              Ingredients
            </h2>
            {ingredientsClicked &&
              bowlInfo.map((value, index) => (
                <React.Fragment key={index}>
                  {!value.startsWith(stopCase) && <p>{value + "\n"}</p>}
                  {value.startsWith(stopCase) && (
                    <p style={bold}>{value + "\n"}</p>
                  )}
                </React.Fragment>
              ))}
          </div>
          <div>
            <div className={BowlContentsStyles.includeTitleinMacros}>
              <div
                className={BowlContentsStyles.macrosFlextheContentsHorizontally}
              >
                {macrosClicked &&
                  bowlMacros.map((value, index) => (
                    <React.Fragment key={index}>
                      {index === 0 && (
                        <>
                          <p>{labels[index] + ": " + value + "kcal"}</p>
                          <span
                            className={BowlContentsStyles.addSpacing}
                          ></span>
                        </>
                      )}
                      {index > 0 && (
                        <>
                          <p>{labels[index] + ": " + value + "g"}</p>
                          <span
                            className={BowlContentsStyles.addSpacing}
                          ></span>
                        </>
                      )}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className={BowlContentsStyles.flexTheRightChildrenVertically}>
          <div>
            {bowlHot && (
              <>
                <div className={BowlContentsStyles.positionSteam}></div>
                <p className={BowlContentsStyles.Bowl}>𓎩</p>
              </>
            )}
            {!bowlHot && (
              <>
                <p className={BowlContentsStyles.Bowl}>𓎩</p>
              </>
            )}
          </div>
          <div className={BowlContentsStyles.addToOrder}>
            {!processing ? (
              <button
                onClick={() => toggle("order")}
                className={BowlContentsStyles.Button}
              >
                Add to order
              </button>
            ) : (
              <button
                onClick={() => toggle("order")}
                className={BowlContentsStyles.Button}
              >
                Order being added, please wait
              </button>
            )}

            {orderClicked && (
              <>
                <input
                  className="rounded"
                  value={orderData.numberofBowls || ""}
                  id="numberofBowls"
                  name="numberofBowls"
                  type="number"
                  placeholder="Enter number of bowls"
                  disabled={processing}
                  onChange={(e) => updateOrderData(e, true)}
                />
                <button
                  type="button"
                  className={BowlContentsStyles.styleConfirm}
                  onClick={() => update(orderData, false)}
                  hidden={processing}
                  disabled={processing}
                >
                  Confirm
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => update(orderData, true)}
              disabled={processing}
              hidden={processing}
              className={BowlContentsStyles.Clear}
            >
              Clear orders for this bowl
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contents;
