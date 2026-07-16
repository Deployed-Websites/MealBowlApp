import BowlStyles from "./BowlImage.module.css";
import { Link } from "react-router-dom";
import React from "react";
function BowlImage(props) {
  return (
    <>
      <div className={BowlStyles.item}>
        <Link
          to={`/contents/${props.slug}`}
          className={`${BowlStyles.bowl} ${BowlStyles.reSize}`}
        >
          <img
            src={props.picture}
            alt="𓎩"
            className={BowlStyles.bowlImageDimensions}
          ></img>
        </Link>
        <p className={BowlStyles.bowlText}>
          {props.name}
          <br></br>
          Price: {props.price}
        </p>
      </div>
    </>
  );
}

export default BowlImage;
