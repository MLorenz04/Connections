import axios from "axios";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import config from "../config/config";
import "./singleConnection.css";
import { useEffect, useRef, useState } from "react";

export default function SingleConnection() {
  const { id } = useParams();
  const [loading, setLoading] = useState();
  const [items, setItems] = useState([]);
  const [lives, setLives] = useState(4);
  const groups = useRef([]);
  const color_classes = [
    "yellow", "green", "blue", "purple"
  ]

  const fetchConnection = async () => {
    const res = await axios.get(`${config.BASE_URL}/connection/${id}`);
    return res.data;
  };

  const { data, status } = useQuery(["connection", id], fetchConnection, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if(lives == 0) {
      alert("Prohra!");
    }
  }, [lives])


  useEffect(() => {
    if (data == undefined) return;
    const date = new Date(data.date);
    data.date = `${date.getDay()}. ${date.getMonth()}. ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;

    let allItems = [];
    let id = 1;
    data.groups.forEach((group, index) => {
      groups.current.push({...group, id: index, solved: false});
      group.items.map((item) => {
        allItems.push({ item: item, id: id, selected: false, group: index });
        id += 1;
      })
    }
    );

    zamichatPole(allItems);
    console.log(groups);
    //zamichatPole(allItems);
    setLoading(false);
  }, [data]);

  const insertIntoSelectedElements = (item) => {
    const copy = [...items];
    if (item.selected === false)
      if (copy.filter((obj) => obj.selected === true).length === 4) return;
    const selectedItem = copy.find((single_item) => single_item === item);
    selectedItem.selected = !selectedItem.selected;
    setItems(copy);
  };


  function zamichatPole(pole) {
    let final = [...pole];
    for (let i = pole.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [final[i], final[j]] = [final[j], final[i]];
    }
    setItems(final);
  }

  const submitCategory = () => {
  
    const selectedItems = items.filter((item) => item.selected);
    console.log(selectedItems);
    if (
      selectedItems.length === 4 &&
      selectedItems.every((item) => item.group === selectedItems[0].group)
    ) {
      const newItems = items.filter((item) => !selectedItems.includes(item));
      setItems(newItems);
      groups.current.find((group) => group.id === selectedItems[0].group).solved = true;
    }
      
    else setLives((prev) => prev - 1);
  };

  return (
    !loading && (
      <div id="singleConPage">
        <div className="error_message"> Tak blízko... </div>
        {status === "error" && <p>Chyba :(</p>}
        {status === "loading" && <p>Načítání...</p>}
        {status === "success" && (
          <div>
            <h1> {data.creator} </h1>
            <h3> {data.date} </h3>
            <div className="solvedCategories">
              {groups.current.map((group,index) => {
                if(group.solved) {
                  return (
                    <div className={"solvedCategory --" + color_classes[group.id]}> 
                    <h3 className="solvedCategory-heading"> {group.explanation} </h3>
                    <div className="solvedCategory-items">
                    <p> {group.items.map((item) => ( <span className="solvedCategory-items-single"> {item.toUpperCase()} </span>))}</p>
                    </div>
                    </div>
                  )
                }
              })}
              </div>
            <div class="board">
              {items.map((item) => {
                return (
                  <label
                    onClick={() => insertIntoSelectedElements(item)}
                    className={
                      "board-item " + (item.selected === true ? "selected" : "")
                    }
                    key={item.id}
                    id={item.id}
                  >
                    <p>{item.item}</p>
                  </label>
                );
              })}
            </div>
            <div className="lives">
            {[...Array(lives)].map((e, i) => (
        <div className="life" key={i}/>
      ))}
            </div>
            <section id="buttons">
              <button onClick={() => zamichatPole(items)}> Zamíchat </button>
              <button
                onClick={() => {
                  if (items.filter((item) => item.selected).length === 4)
                    submitCategory();
                }}
              >
                {" "}
                Odeslat{" "}
              </button>
            </section>
          </div>
        )}
      </div>
    )
  );
}
