import ContactStyles from "./modulesCSSs/Contact.module.css";
import { useSyncContext } from "../context/SyncContext.js";
import { useSaveSync } from "../customHooks/useSaveSync.js";
function Contact() {
  const { reShowSave, text } = useSyncContext();
  useSaveSync();
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
