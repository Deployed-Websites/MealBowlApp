import BowlImage from "./BowlImage.jsx";
import HomepageStyles from "./HomePage.module.css";
import { useEffect, useRef, useCallback } from "react";
import React from "react";
import bowl from "./assets/bowl.png";
import bowl3 from "./assets/Paneer power bowl.jpg";
import bowl4 from "./assets/bowl4.jpg";
import bowl5 from "./assets/bowl5.jpg";
import bowl6 from "./assets/bowl6.jpg";
import bowl7 from "./assets/bowl7.jpg";
import bowl8 from "./assets/Rajma-Chickpea superfood bowl.jpg";
import logo from "./assets/logo.png";

import { ensureCSRFToken } from "./utils/api.js";
import { useSyncContext } from "./context/SyncContext.js";
import { Link } from "react-router-dom";
function RenderBowls() {
  const { saveChanges, reShowSave, setreShowSave, processing, text, setText } =
    useSyncContext();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const saveClicked = useCallback(async () => {
    if (!isMounted.current) return;
    setText("Syncing changes");
    console.log("Syncing changes");
    await saveChanges();

    if (!isMounted.current) return;
    console.log("Synced changes");
    setText("Synced changes");
    setreShowSave(false);
  }, [saveChanges, setText, setreShowSave]);

  useEffect(() => {
    if (reShowSave) {
      (async () => {
        await saveClicked();
      })();
    }
  }, [reShowSave, saveClicked]);
  useEffect(() => {
    (async () => {
      const tok = await ensureCSRFToken();
      console.log("Token set:", tok);
    })();
  }, []);
  return (
    <>
      {reShowSave && <div className="syncText">{text}</div>}
      <div className={HomepageStyles.banner}>
        <img src={logo} className={HomepageStyles.Logo} />
        <p className={HomepageStyles.logoText}>JS</p>
        <p className={HomepageStyles.slogan}>Tasty and healthy food bowls</p>
        <p className={HomepageStyles.caption}>
          Fuel your body with delicious healthy food delivered right to you
        </p>
      </div>
      <p
        className={`${HomepageStyles.caption} ${HomepageStyles.captionSecond}`}
      >
        Do you want to want to be healthy, fit and energetic? <br></br> Are you
        dieting and struggling to find time to make healthy, balanced meals?{" "}
        <br></br> Do you need a nourishing office lunch box? <br></br> Eating
        well doesn't have to mean bland food. <br></br> Jyoti's superbowls
        brings you balanced meals, with lots of options, all bursting with
        flavours
      </p>
      <div className={HomepageStyles.container}>
        <div>
          <Link to={"/loginPage"} className={HomepageStyles.loginLink}>
            👤 Login/Register
          </Link>
        </div>
        {JSON.parse(sessionStorage.getItem("admin", true)) &&
          JSON.parse(sessionStorage.getItem("Logged-In", true)) &&
          !reShowSave && (
            <div className={HomepageStyles.admin}>
              <Link to="/Admin">
                <h2 className="clickable">👑 Access admin page</h2>
              </Link>
            </div>
          )}
        {JSON.parse(sessionStorage.getItem("Logged-In", true)) &&
          !reShowSave && (
            <Link to={`/checkout`}>
              <button
                hidden={processing}
                className={HomepageStyles.MainCheckout}
              >
                🛒 Checkout
              </button>
            </Link>
          )}
        <Link to={"/contact"} className={HomepageStyles.placeContactLink}>
          📞 Contact
        </Link>
      </div>

      <div className={HomepageStyles.bowlTextContainer}>
        <div href="#Bowls" className={HomepageStyles.formatExploreBowls}>
          <span>E</span>
          <span>x</span>
          <span>p</span>
          <span>l</span>
          <span>o</span>
          <span>r</span>
          <span>e</span>
          <span> </span>
          <span>B</span>
          <span>o</span>
          <span>w</span>
          <span>l</span>
          <span>s</span>
        </div>
      </div>
      <div id="Bowls" className={HomepageStyles.arrangeBowls}>
        <BowlImage
          name="Soya Chunk High-Protein Bowl"
          price="₹ 200"
          picture={bowl}
        />
        <BowlImage name="Paneer Power Bowl" price="₹ 300" picture={bowl3} />
        <BowlImage name="Tofu Stir-Fry Bowl" price="₹ 400" picture={bowl4} />
        <BowlImage
          name="Chicken Tikka Macro Bowl"
          price="₹ 500"
          picture={bowl5}
        />

        <BowlImage
          name="Fish & Veggie Grain Bowl"
          price="₹ 600"
          picture={bowl6}
        />
        <BowlImage
          name="Egg Bhurji Nutrition Bowl"
          price="₹ 700"
          picture={bowl7}
        />
        <BowlImage name="Rajma Superfood Bowl" price="₹ 800" picture={bowl8} />
        <BowlImage
          name="Eggless Bhurji & Oats Bowl"
          price="₹ 900"
          picture={bowl}
        />
      </div>
    </>
  );
}

export default RenderBowls;
