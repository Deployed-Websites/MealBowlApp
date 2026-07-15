import BowlContentsStyles from "./Specific.module.css";
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  updateOrder,
  deleteOrder,
  updateBasket,
  updateBasketForDeletedOrder,
} from "./utils/api.js";
import { useSyncContext } from "./context/SyncContext.js";

function Contents() {
  const { saveChanges, text, setText, reShowSave, setreShowSave } =
    useSyncContext();
  window.scrollTo(0, 0);
  const { bowlID } = useParams();
  const [ingredientsClicked, setingredientsClicked] = useState(true);
  const [macrosClicked, setMacrosClicked] = useState(true);
  const labels = ["Calories", "Protein", "Carbs", "Fats"];
  const [orderClicked, setOrderClicked] = useState(false);
  const [orderData, setorderData] = useState({});
  const [processing, setProcessing] = useState(false);
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
  const Hot = {
    "Soya-Chunk-High-Protein-Bowl": true,
    "Paneer-Power-Bowl": true,
    "Tofu-Stir-Fry-Bowl": true,
    "Chicken-Tikka-Macro-Bowl": false,
    "Fish-&-Veggie-Grain-Bowl": false,
    "Egg-Bhurji-Nutrition-Bowl": true,
    "Rajma-Superfood-Bowl": false,
    "Eggless-Bhurji-&-Oats-Bowl": false,
  };
  const Prices = {
    "Soya-Chunk-High-Protein-Bowl": 200,
    "Paneer-Power-Bowl": 300,
    "Tofu-Stir-Fry-Bowl": 400,
    "Chicken-Tikka-Macro-Bowl": 500,
    "Fish-&-Veggie-Grain-Bowl": 600,
    "Egg-Bhurji-Nutrition-Bowl": 700,
    "Rajma-Superfood-Bowl": 800,
    "Eggless-Bhurji-&-Oats-Bowl": 900,
  };
  const Macros = {
    "Soya-Chunk-High-Protein-Bowl": [460, 32, 30, 18],
    "Paneer-Power-Bowl": [480, 30, 35, 20],
    "Tofu-Stir-Fry-Bowl": [480, 28, 30, 22],
    "Chicken-Tikka-Macro-Bowl": [500, 38, 30, 22],
    "Fish-&-Veggie-Grain-Bowl": [520, 36, 25, 28],
    "Egg-Bhurji-Nutrition-Bowl": [450, 28, 25, 20],
    "Rajma-Superfood-Bowl": [470, 22, 38, 16],
    "Eggless-Bhurji-&-Oats-Bowl": [440, 25, 35, 16],
  };
  const information = {
    "Soya-Chunk-High-Protein-Bowl": [
      "100g cooked soya chunks (masala sautéed)",
      "1/2 cup mashed sweet potato or mashed potato",
      "1/4 cup steamed broccoli and beans",
      "2 tbsp roasted peanuts",
      "Sprinkle of chat masala and lemon juice",
    ],
    "Paneer-Power-Bowl": [
      "150g Grilled paneer (cubes, tossed with spices)",
      "1/2 cup cooked brown rice or quinoa",
      "1/4 cup boiled black chana",
      "1/2 cup sautéed bell peppers, zucchini, and spinach",
      "1 tsp olive oil",
      "Toppings: Fresh coriander, lemon juice,black pepper",
    ],
    "Tofu-Stir-Fry-Bowl": [
      "150g tofu (pan-grilled with turmeric, garlic, and pepper)",
      "1/2 cup cooked oats or barley",
      "1/4 cup capsicum, mushroom, and baby corn stir-fry",
      "1 tsp sesame oil",
      "Toppings: Toasted sesame seeds and soy sauce drizzle",
    ],
    "Chicken-Tikka-Macro-Bowl": [
      "150g grilled chicken tikka (marinated in curd + spices)",
      "1/2 cup cooked millets or jeera brown rice",
      "1/4 cup cucumber-tomato-onion salad",
      "1 tbsp hung curd mint dip",
      "1 tsp ghee for flavor",
    ],
    "Fish-&-Veggie-Grain-Bowl": [
      "150g grilled fish (pomfret or salmon, spiced with turmeric, garlic)",
      "1/2 cup cooked red rice or foxtail millet",
      "1/2 avocado or 1 tsp flaxseed oil",
      "1/2 cup sautéed kale/spinach + carrots",
      "Toppings: Roasted sesame seeds, green chutney drizzle",
    ],
    "Egg-Bhurji-Nutrition-Bowl": [
      "3 egg whites + 2 whole eggs (bhurji with onion, tomato, green chili)",
      "1/2 cup cooked oats or rolled oats khichdi",
      "1/4 cup steamed cauliflower or peas",
      "1 tsp ghee or butter",
      "Toppings: Mint, lemon, and flaxseed powder",
    ],
    "Rajma-Superfood-Bowl": [
      "3/4 cup boiled rajma (kidney beans)",
      "1/2 cup cooked red rice or millets",
      "1/2 cup mixed vegetables (carrot, peas, beans)",
      "1 tsp mustard oil or ghee",
      "Toppings: Fresh coriander, cumin powder, lemon juice",
    ],
    "Eggless-Bhurji-&-Oats-Bowl": [
      "1/2 cup moong dal chilla crumble (eggless bhurji style)",
      "1/2 cup cooked masala oats",
      "1/4 cup steamed peas and cauliflower",
      "1 tsp ghee or coconut oil",
      "Toppings: Mint, lemon, roasted cumin powder",
    ],
  };
  const bowlInfo = information[bowlID]
    ? information[bowlID]
    : ["No ingredients found"];
  const bowlIDWithoutDashes = bowlID
    .split("")
    .map((char) => (char === "-" ? " " : char))
    .join("");
  const bowlMacros = Macros[bowlID] ? Macros[bowlID] : [];
  const bowlHot = Hot[bowlID] ? Hot[bowlID] : false;
  const bowlPrice = Prices[bowlID] ? Prices[bowlID] : null;
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
      bowlName: bowlIDWithoutDashes,
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
