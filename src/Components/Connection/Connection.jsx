import axios from "axios";
import { useQuery } from "react-query";
import config from "../../config/config";
import "./connection.css";
import { useEffect, useRef, useState } from "react";
import ErrorMessage from "../Connection/components/ErrorMess";

export default function Connection({ id }) {
  const [loading, setLoading] = useState();
  const [items, setItems] = useState([]);
  const [lives, setLives] = useState(4);
  const groups = useRef([]);
  const color_classes = ["yellow", "green", "blue", "purple"];
  const tries = useRef([]);

  const [errorMessage, setErrorMessage] = useState(".");

  const fetchConnection = async () => {
    const res = await axios.get(`${config.BASE_URL}/api/connection/${id}`);
    return res.data;
  };

  const { data, status } = useQuery(["connection", id], fetchConnection, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (lives == 0) {
      setErrorMessage("Tak snad příště!");
      solveAll();
    }
  }, [lives]);

  useEffect(() => {
    if (data == undefined) return;
    const date = new Date(data.date);
    data.date = `${date.getDay()}. ${date.getMonth()}. ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
    let allItems = [];
    let id = 1;
    data.groups.forEach((group, index) => {
      groups.current.push({ ...group, id: index, solved: false });
      group.items.map((item) => {
        allItems.push({ item: item, id: id, selected: false, group: index });
        id += 1;
      });
    });

    zamichatPole(allItems);
    setLoading(false);
  }, [data]);

  /**
   * Vloží určitý vybraný prvek do pole vybraných prvů
   * @param {*} item Prvek
   */
  const insertIntoSelectedElements = (item) => {
    const copy = [...items];
    if (item.selected === false) if (copy.filter((obj) => obj.selected === true).length === 4) return;
    const selectedItem = copy.find((single_item) => single_item === item);
    selectedItem.selected = !selectedItem.selected;
    setItems(copy);
  };

  /**
   * Náhodně zamíchá hrací plochu
   * @param {*} pole - Hrací plocha
   */
  function zamichatPole(pole) {
    let final = [...pole];
    for (let i = pole.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [final[i], final[j]] = [final[j], final[i]];
    }
    setItems(final);
  }
  /**
   * Pokud jsou aktivní čtyři prvky, odebere první prvek, posune všechny o jeden dopředu a poté přidá pátý, aktuálně kliknutý
   */
  function changeElements() {}

  /**
   * Funkce na threshold
   */
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Odešle ke kontrole prvky, případně vykreslí hlášky
   */
  const submitCategory = async () => {
    const selectedItems = items.filter((item) => item.selected);

    if (selectedItems.length != 4) return;

    /* Kontrola již uhádnutých pokusů */
    if (tries.current.some((pole) => JSON.stringify(pole) === JSON.stringify(selectedItems.map((item) => item.id).sort()))) return setErrorMessage("Již zkoušeno");

    /* Kontrola správného uhádnutí */
    tries.current.push(selectedItems.map((item) => item.id).sort());
    let numerator = 100;
    let waitForRemove = 450;
    let timeForRunAndDramaticPause = 150;
    let threshold = 0;

    async function makeAnimation() {
      for (let i = 0; i < selectedItems.length; i++) {
        const item = document.getElementById(selectedItems[i].id);
        setTimeout(() => {
          item.classList.add("jump-up");
          setTimeout(() => {
            item.classList.remove("jump-up");
          }, waitForRemove);
        }, threshold);

        threshold += numerator;
      }
      await wait(numerator * 4 + waitForRemove + timeForRunAndDramaticPause);
    }

    await makeAnimation();

    if (selectedItems.every((item) => item.group === selectedItems[0].group)) {
      const newItems = items.filter((item) => !selectedItems.includes(item));
      groups.current.find((group) => group.id === selectedItems[0].group).solved = true;
      return setItems(newItems);
    }

    for (let i = 0; i < selectedItems.length; i++) {
      const item = document.getElementById(selectedItems[i].id);
      item.classList.add("shake");
      setTimeout(() => item.classList.remove("shake"), 400);
    }
    setLives((prev) => prev - 1);

    /* Kontrola blízkosti v tipu */
    if (selectedItems.filter((item) => item.group === selectedItems[0].group).length === 3) return setErrorMessage("Tak blízko...");

    return setErrorMessage("Samá voda...");
  };

  const solveAll = () => {};

  return (
    !loading && (
      <div>
        <div id="singleConPage">
          <ErrorMessage statusMsg={errorMessage} setFunc={setErrorMessage} />
          {status === "error" && <p>Chyba :(</p>}
          {status === "loading" && <p>Načítání...</p>}
          {status === "success" && (
            <div>
              <h2> {data.creator} </h2>
              <h4> {data.date} </h4>
              <div className="solvedCategories">
                {groups.current.map((group) => {
                  if (group.solved) {
                    return (
                      <div className={"solvedCategory --" + color_classes[group.id]}>
                        <h3 className="solvedCategory-heading"> {group.explanation.toUpperCase()} </h3>
                        <div className="solvedCategory-items">
                          <p>
                            {group.items.map((item, key) => (
                              <span key={key} className="solvedCategory-items-single">
                                {item.toUpperCase()}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              <div className="board">
                {items.map((item) => {
                  return (
                    <label onClick={() => insertIntoSelectedElements(item)} className={"board-item " + (item.selected === true ? "selected" : "")} key={item.id} id={item.id}>
                      <p>{item.item}</p>
                    </label>
                  );
                })}
              </div>
              <div className="lives">
                {[...Array(lives)].map((e, i) => (
                  <div className="life" key={i} />
                ))}
              </div>
              <section id="buttons">
                {lives > 0 && items.length > 0 && (
                  <>
                    <button onClick={() => zamichatPole(items)}> Zamíchat </button>
                    <button
                      onClick={() => {
                        if (items.filter((item) => item.selected).length === 4) submitCategory();
                      }}
                    >
                      Odeslat
                    </button>
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    )
  );
}
