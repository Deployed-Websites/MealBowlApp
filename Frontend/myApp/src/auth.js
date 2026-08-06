export async function setCookie() {
  await fetch("https://mealbowlapp.onrender.com/databaseTesting/setToken/", {
    method: "GET",
    credentials: "include",
  });
  return new Promise((resolve) => setTimeout(resolve, 100));
}
export async function getCookieFromBrowser() {
  const fetchTheData = await fetch(
    "https://mealbowlapp.onrender.com/databaseTesting/getToken/",
    {
      method: "GET",
      credentials: "include",
    },
  );
  const cookiesData = await fetchTheData.json();
  return cookiesData.csrftoken;
}
