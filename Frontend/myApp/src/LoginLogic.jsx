import {
  createUser as apiCreateUser,
  login as apiLogin,
  logout as apiLogout,
  checkUserPerm,
  ensureCSRFToken,
} from "./utils/api.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSyncContext } from "./context/SyncContext.js";
import LoginStyles from "./Login.module.css";
function RegisterorLoginPage() {
  const {
    setsomethingChangedinLogin,
    saveChanges,
    reShowSave,
    setreShowSave,
    processing,
    setprocessing,
    text,
    setText,
  } = useSyncContext();
  const [DontSkipLogin, setDontSkipLogin] = useState(false);
  const [registerData, setRegisterData] = useState({});
  const [manualLogout, setManualLogout] = useState(false);
  const [LogoutState, setLogoutState] = useState("Logout");
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

  function updateRegisterData(e, inputField) {
    if (inputField) {
      let { name, value } = e.target;
      setRegisterData((fillIn) => ({
        ...fillIn,
        [name]: value,
      }));
    } else {
      setRegisterData((fillIn) => ({
        ...fillIn,
        [e.name]: e.value,
      }));
    }
  }
  async function register() {
    setprocessing(true);
    const make = await apiCreateUser(registerData);
    if (make.message) {
      const loginToAccount = await apiLogin(registerData);
      if (loginToAccount.message) {
        setreShowSave(true);
        localStorage.setItem(
          "User-" + registerData.username,
          JSON.stringify(registerData),
        );
        sessionStorage.setItem("Logged-In", true);
        const admin = await checkAdmin();
        setsomethingChangedinLogin((prev) => prev + 1);
        localStorage.setItem(
          "MostRecentLogin",
          "User-" + registerData.username,
        );
        if (admin) {
          sessionStorage.setItem("admin", true);
        } else {
          sessionStorage.setItem("admin", false);
        }
      } else {
        console.log("error");
        sessionStorage.setItem("Logged-In", false);
      }
    } else {
      sessionStorage.setItem("Logged-In", false);
    }
    setprocessing(false);
  }
  async function verifyLocally() {
    let lastIndex = -1;
    for (let i = 0; i < localStorage.length; i++) {
      const Currentkey = localStorage.key(i);
      if (Currentkey.includes("User-")) {
        lastIndex = i;
      }
    }
    if (lastIndex != -1) {
      const key = localStorage.getItem("MostRecentLogin");
      const value = JSON.parse(localStorage.getItem(key));
      setRegisterData(value);
      const verification = await verifyUsingDatabase(value);
      if (verification) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  async function verifyUsingDatabase(data = {}) {
    let dataToUse;
    if (Object.keys(registerData).length !== 0) {
      dataToUse = registerData;
    } else {
      if (Object.keys(data).length !== 0) {
        dataToUse = data;
      }
    }
    setprocessing(true);
    const check = await apiLogin(dataToUse);
    if (check.message) {
      const admin = await checkAdmin();
      setreShowSave(true);
      if (admin) {
        sessionStorage.setItem("admin", true);
      } else {
        sessionStorage.setItem("admin", false);
      }
      localStorage.setItem(
        "User-" + dataToUse.username,
        JSON.stringify(dataToUse),
      );
      setprocessing(false);
      localStorage.setItem("MostRecentLogin", "User-" + dataToUse.username);
      console.log("Set mostrecentlogin");
      sessionStorage.setItem("Logged-In", true);
      setLogoutState("Logout");
      await saveClicked();
      return true;
    } else {
      updateRegisterData(
        { name: "username", value: "Invalid credentials" },
        false,
      );
      updateRegisterData({ name: "email", value: "" }, false);
      updateRegisterData({ name: "password", value: "" }, false);
      setprocessing(false);
      sessionStorage.setItem("Logged-In", false);
      setDontSkipLogin(true);
      return false;
    }
  }
  async function checkAdmin() {
    const result = await checkUserPerm();
    return !!result.admin;
  }
  async function logoutfunction() {
    sessionStorage.removeItem("admin");
    setLogoutState("Logging out");
    const result = await apiLogout();
    if (result.message) {
      setDontSkipLogin(true);
      sessionStorage.setItem("Logged-In", false);
      updateRegisterData({ name: "username", value: "" }, false);
      updateRegisterData({ name: "email", value: "" }, false);
      updateRegisterData({ name: "password", value: "" }, false);
      setManualLogout(true);
      setreShowSave(false);
      console.log(result.message);
    } else {
      sessionStorage.setItem("Logged-In", true);
      console.log(result.error);
    }
  }
  function redirectToLogin() {
    setDontSkipLogin(true);
    sessionStorage.setItem("Logged-In", false);
  }
  function redirectToRegister() {
    setDontSkipLogin(false);
    sessionStorage.setItem("Logged-In", false);
  }
  function pressed(param) {
    if (param === "logout") {
      logoutfunction();
    }
  }

  useEffect(() => {
    (async () => {
      await ensureCSRFToken();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const flag = JSON.parse(sessionStorage.getItem("Logged-In")) ?? false;
      if (!flag && !manualLogout) {
        await ensureCSRFToken();
        const ver = await verifyLocally();
        console.log(ver);
        if (ver) {
          sessionStorage.setItem("Logged-In", true);
        } else {
          sessionStorage.setItem("Logged-In", false);
        }
      } else if (flag && !manualLogout) {
        console.log("Here");
        const admin = await checkAdmin();
        if (admin) {
          sessionStorage.setItem("admin", true);
          setreShowSave(false);
        } else {
          sessionStorage.setItem("admin", false);
          setreShowSave(false);
        }
      }
    })();
    // Intentionally runs once on mount only, to restore login state from
    // localStorage. Adding `manualLogout`/`verifyLocally` as deps would
    // change behavior (e.g. re-firing this right after every logout) -
    // properly fixing that means wrapping verifyLocally -> verifyUsingDatabase
    // -> checkAdmin in useCallback, which is a bigger refactor for later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {reShowSave && <div className="syncText">{text}</div>}
      <div className={LoginStyles.flexedLogin}>
        {!JSON.parse(sessionStorage.getItem("Logged-In")) ? (
          DontSkipLogin ? (
            <h2 className="clickable">Login</h2>
          ) : (
            <h2 className="clickable">Signup</h2>
          )
        ) : (
          <h2 onClick={() => pressed("logout")} className="clickable">
            {LogoutState}
          </h2>
        )}
        {!JSON.parse(sessionStorage.getItem("Logged-In")) &&
          (DontSkipLogin ? (
            <>
              <br></br>
              <label htmlFor="username">Enter username: </label>
              <input
                className="rounded"
                value={registerData.username || ""}
                id="username"
                type="text"
                name="username"
                placeholder="Enter username here"
                disabled={processing}
                onChange={(e) => updateRegisterData(e, true)}
              />
              <label htmlFor="email">Enter email: </label>
              <input
                className="rounded"
                value={registerData.email || ""}
                id="email"
                name="email"
                type="email"
                placeholder="Enter email here"
                disabled={processing}
                onChange={(e) => updateRegisterData(e, true)}
              />
              <label htmlFor="password">Enter password: </label>
              <input
                className="rounded"
                value={registerData.password || ""}
                id="password"
                type="password"
                name="password"
                placeholder="Enter password here"
                disabled={processing}
                onChange={(e) => updateRegisterData(e, true)}
              />
              <button
                type="button"
                onClick={verifyUsingDatabase}
                disabled={processing}
              >
                {processing ? "Please wait...." : "Login"}
              </button>
              <button
                type="button"
                onClick={redirectToRegister}
                disabled={processing}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              <br></br>
              <label htmlFor="username">Enter username: </label>
              <input
                className="rounded"
                value={registerData.username || ""}
                id="username"
                name="username"
                type="text"
                placeholder="Enter username here"
                disabled={processing}
                onChange={(e) => updateRegisterData(e, true)}
              />
              <label htmlFor="email">Enter email: </label>
              <input
                className="rounded"
                value={registerData.email || ""}
                id="email"
                name="email"
                type="email"
                placeholder="Enter email here"
                disabled={processing}
                onChange={(e) => updateRegisterData(e, true)}
              />
              <label htmlFor="password">Enter password: </label>
              <input
                className="rounded"
                value={registerData.password || ""}
                id="password"
                name="password"
                type="text"
                placeholder="Enter password here"
                disabled={processing}
                onChange={(e) => updateRegisterData(e, true)}
              />

              <button
                type="button"
                onClick={() => register()}
                disabled={processing}
              >
                {processing ? "Please wait...." : "Signup"}
              </button>
              <button
                type="button"
                onClick={redirectToLogin}
                disabled={processing}
              >
                Login to account
              </button>
            </>
          ))}
      </div>
    </>
  );
}

export default RegisterorLoginPage;
