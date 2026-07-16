import { useEffect, useState } from "react";
import { getEverything, getPrices as fetchPrices } from "../utils/api.js";

function AdminPage() {
  const [allData, setAllData] = useState([]);
  const [rows, setRows] = useState(0);
  let getAllresult = null;
  let getPricesresult = null;
  // NOTE: still not called anywhere below (same as before this refactor) -
  // render() only ever reads from the sessionStorage cache. Left as-is for
  // now since fixing that behavior is a separate change from consolidating
  // the API layer.
  async function callAdminData() {
    getAllresult = await getEverything();
    getPricesresult = await fetchPrices();
    sessionStorage.setItem("AdminData", JSON.stringify(getAllresult));
    sessionStorage.setItem("AdminPriceData", JSON.stringify(getPricesresult));
  }
  async function render() {
    const tryToPullAdminDataFromLocal =
      JSON.parse(sessionStorage.getItem("AdminData")) ?? {};
    getAllresult = tryToPullAdminDataFromLocal;
    const tryToPullPriceDataFromLocal =
      JSON.parse(sessionStorage.getItem("AdminPriceData")) ?? {};
    getPricesresult = tryToPullPriceDataFromLocal;
    let max = 0;
    const users = Object.keys(getAllresult).length;
    for (const key of Object.keys(getAllresult)) {
      const dict = getAllresult[key];
      const lengthofDict = Object.keys(dict).length;
      if (lengthofDict > max) {
        max = lengthofDict;
      }
    }
    let renderingData = [];
    setRows(max * 3 + users);
    Object.entries(getAllresult).forEach(([key, value], i) => {
      renderingData.push(
        <div
          style={{ gridColumn: "1", position: "relative", left: "50%" }}
          key={`User-${key}-${i}`}
        >
          <b>
            <u>{key}</u>
          </b>
        </div>,
      );
      Object.entries(value).forEach(([key2, value2], j) => {
        renderingData.push(
          <div
            style={{ gridColumn: "1", position: "relative", left: "50%" }}
            key={`BowlName-${key}-${key2}-${j}`}
          >
            {key2}
          </div>,
        );
        renderingData.push(
          <div
            style={{ gridColumn: "1", position: "relative", left: "50%" }}
            key={`NoOfBowls-${key}-${key2}-${j}`}
          >
            Number of bowls: {value2["NumberofBowls"]}
          </div>,
        );
        renderingData.push(
          <div
            style={{ gridColumn: "1", position: "relative", left: "50%" }}
            key={`Price-${key}-${key2}-${j}`}
          >
            Price of this part of the order: {value2["Price"]}
          </div>,
        );
        renderingData.push(
          <div
            key={`Space-${key}-${key2}-${j}`}
            style={{
              gridColumn: "1 / -1",
              height: "20px",
              position: "relative",
              left: "50%",
            }}
          ></div>,
        );
      });
      renderingData.push(
        <div style={{ color: "blue" }} key={`BasketPrice-User-${key}-${i}`}>
          Basket total: {getPricesresult[key]["price"]}
        </div>,
      );
      if (i !== Object.keys(getAllresult).length - 1) {
        renderingData.push(
          <hr
            key={`HorizontalLine-${key}-${i}`}
            style={{
              background: "aquamarine",
              gridColumn: "1 / -1", // remove this line and put width: x% for non full screen line
              border: "none",
              borderTop: "1px solid red",
              height: "1px",
              margin: "10px 0",
            }}
          />,
        );
      }
    });
    setAllData(renderingData);
  }
  useEffect(() => {
    render();
  }, []);

  return (
    <>
      <div
        id="grid"
        style={{
          display: "grid",
          gridTemplateRows: Array(rows).fill("1fr").join(" "),
          gridTemplateColumns: "1fr 3fr",
          rowGap: "50px",
        }}
      >
        {allData.length > 0 ? (
          allData
        ) : (
          <div>No user has added any orders yet</div>
        )}
      </div>
    </>
  );
}

export default AdminPage;
