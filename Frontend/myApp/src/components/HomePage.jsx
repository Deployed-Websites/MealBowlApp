import BowlImage from "./BowlImage.jsx";
import HomepageStyles from "./HomePage.module.css";
import React from "react";
import logo from "../assets/logo.png";
import { BOWLS } from "../constants/bowls.js";

import { useSyncContext } from "../context/SyncContext.js";
import { useSaveSync } from "../customHooks/useSaveSync.js";
import { useEnsureCSRF } from "../customHooks/useEnsureCSRF.js";
import { Link } from "react-router-dom";
function RenderBowls() {
  const { reShowSave, processing, text } = useSyncContext();
  useSaveSync();
  useEnsureCSRF();
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
        {BOWLS.map((bowlItem) => (
          <BowlImage
            key={bowlItem.slug}
            slug={bowlItem.slug}
            name={bowlItem.name}
            price={`₹ ${bowlItem.price}`}
            picture={bowlItem.picture}
          />
        ))}
      </div>
    </>
  );
}

export default RenderBowls;
