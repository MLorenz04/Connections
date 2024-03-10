import axios from "axios";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import config from "../config/config";
import "./singleConnection.css";
import { useEffect, useState } from "react";

export default function SingleConnection() {
  const { id } = useParams();
  const [loading, setLoading] = useState();
  const [items, setItems] = useState([]);

  const fetchConnection = async () => {
    const res = await axios.get(`${config.BASE_URL}/connection/${id}`);
    return res.data;
  };

  const { data, status } = useQuery(["connection", id], fetchConnection, {
    refetchOnWindowFocus: false,
  });

  function zamichatPole(pole) {
    for (let i = pole.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pole[i], pole[j]] = [pole[j], pole[i]];
    }
    console.log(pole);
    setItems(pole);
  }

  useEffect(() => {
    if (data == undefined) return;
    const date = new Date(data.date);
    data.date = `${date.getDay()}. ${date.getMonth()}. ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;

    let allItems = [];

    data.groups.forEach((group) => (allItems = allItems.concat(group.items)));
    zamichatPole(allItems);
    setLoading(false);
  }, [data]);
  return (
    !loading && (
      <div id="singleConPage">
        {status === "error" && <p>Chyba :(</p>}
        {status === "loading" && <p>Načítání...</p>}
        {status === "success" && (
          <div>
            <h1> {data.creator} </h1>
            <h3> {data.date} </h3>
            <div class="board">
              {items.map((item, itemIndex) => (
                <label className="board-item" key={itemIndex}>
                  <p>{item}</p>
                </label>
              ))}
            </div>
            <button onClick={() => zamichatPole(items)}> Zamíchat </button>
          </div>
        )}
      </div>
    )
  );
}
