import { useState, useEffect, useRef } from "react";
import ContactStyles from "./Contact.module.css";
import { useSyncContext } from "./context/SyncContext.js";
function Contact() {
  const { saveChanges, reShowSave, setreShowSave, text, setText } =
    useSyncContext();
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
  return (
    <>
      {reShowSave && <div className="syncText">{text}</div>}
      <div className={ContactStyles.contact}>
        <p>Owner: Jyoti Sharma</p>
        <p>Email: gobbledygook@gmail.com</p>
        <p>Phone number: 05406405640606</p>
      </div>
    </>
  );
}

export default Contact;
