import {
  createUser as apiCreateUser,
  login as apiLogin,
  logout as apiLogout,
  checkUserPerm,
  ensureCSRFToken,
} from "./utils/api.js";
import { useState, useEffect } from "react";
import { useSyncContext } from "./context/SyncContext.js";
import { useSaveSync } from "./customHooks/useSaveSync.js";
import { useEnsureCSRF } from "./customHooks/useEnsureCSRF.js";
import LoginStyles from "./Login.module.css";
function RegisterorLoginPage() {
  const {
    setsomethingChangedinLogin,
    reShowSave,
    setreShowSave,
    processing,
    setprocessing,
    text,
  } = useSyncContext();
  useSaveSync();
  useEnsureCSRF();
  const [DontSkipLogin, setDontSkipLogin] = useState(false);
  const [registerData, setRegisterData] = useState({});
  const [manualLogout, setManualLogout] = useState(false);
  const [LogoutState, setLogoutState] = useState("Logout");

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
      setprocessing(false);
      localStorage.setItem("MostRecentLogin", "User-" + dataToUse.username);
      console.log("Set mostrecentlogin");
      sessionStorage.setItem("Logged-In", true);
      setLogoutState("Logout");
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
  // Django's session cookie already keeps the user logged in across page
  // reloads (it persists ~2 weeks by default, per SESSION_COOKIE_AGE) - so
  // there's no need to store credentials anywhere to "remember" a login.
  // This just asks the backend "is my current session cookie still valid?"
  // checkUserPerm() returns {admin: true/false} if logged in, or an
  // {error: ...} object (401) if not - used here to tell those two cases
  // apart, since checkAdmin() alone can't distinguish "not logged in" from
  // "logged in but not an admin".
  async function restoreSessionFromCookie() {
    const result = await checkUserPerm();
    if (result && !result.error && typeof result.admin !== "undefined") {
      return { loggedIn: true, admin: !!result.admin };
    }
    return { loggedIn: false, admin: false };
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
      const flag = JSON.parse(sessionStorage.getItem("Logged-In")) ?? false;
      if (!flag && !manualLogout) {
        await ensureCSRFToken();
        const { loggedIn, admin } = await restoreSessionFromCookie();
        console.log("Session still valid:", loggedIn);
        sessionStorage.setItem("Logged-In", loggedIn);
        if (loggedIn) {
          sessionStorage.setItem("admin", admin);
          setLogoutState("Logout");
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
    // the existing session cookie. Adding `manualLogout` as a dep would
    // change behavior (e.g. re-firing this right after every logout) -
    // properly fixing that means wrapping the functions above in
    // useCallback, which is a bigger refactor for later.
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
                type="password"
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
