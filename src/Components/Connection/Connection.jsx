import axios from "axios";
import config from "../../config/config";
import "./connection.css";
import { useEffect, useRef, useState } from "react";
import ErrorMessage from "../Connection/components/ErrorMess";
import FlipMove from "react-flip-move";
import ConfettiCanvas from "./components/ConfetetiCanvas";
import Swal from "sweetalert2";
import { LuHelpCircle } from "react-icons/lu";
import withReactContent from "sweetalert2-react-content";
import { useLocation } from "react-router-dom";

export default function Connection({ id }) {
  const timeouts = useRef([]);
  const modal = Swal;
  const [loading, setLoading] = useState();
  const [items, setItems] = useState([]);
  const [lives, setLives] = useState(4);
  const groups = useRef([]);
  const color_classes = ["yellow", "green", "blue", "purple"];
  const tries = useRef([]);
  const [solvedCategories, setSolvedCategories] = useState([]);
  const [solved, setSolved] = useState(false);
  const [shouldShowButtons, setShouldShowButtons] = useState(true);
  const [selectedElements, setSelectedElements] = useState([]);
  const [modes, setModes] = useState([...color_classes, "select"]);
  const [currentSelectMode, setCurrentSelectMode] = useState("select");
  const [errorMessage, setErrorMessage] = useState(".");
  const [currentItemModes, setCurrentItemModes] = useState([]);
  const [data, set_data] = useState(undefined);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const randomNumber = params.get("number_of_random");

  useEffect(() => {
    console.log(randomNumber);
    setModes([...color_classes, "select"]);
    setCurrentItemModes([]);
    setCurrentSelectMode("select");
    setLives(4);
    setItems([]);
    setLoading(true);
    groups.current = [];

    const fetchConnection = async () => {
      const res = await axios.get(`${config.BASE_URL}/api/connections`, {
        params: { id },
      });
      set_data(res.data);
    };

    fetchConnection();
    console.log("Now?");
  }, [location.pathname, randomNumber]);

  /**
   * Počítání životů
   */
  useEffect(() => {
    if (lives == 0) {
      setShouldShowButtons(false);
      setErrorMessage("Tak snad příště!");
      solveAll();
    }
  }, [lives]);

  /**
   * Konec hry
   */
  useEffect(() => {
    if (solvedCategories.length === 4 && lives > 0) {
      setShouldShowButtons(false);
      setSolved(true);
    }
  }, [solvedCategories]);

  /**
   * Základní load dat
   */
  useEffect(() => {
    if (data == undefined) return;
    const date = new Date(data.date);
    data.date = `${date.getDate()}. ${
      date.getMonth() + 1
    }. ${date.getFullYear()}, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    let allItems = [];
    let id = 1;
    data.groups.forEach((group, index) => {
      groups.current.push({ ...group, id: index, solved: false });
      group.items.map((item) => {
        allItems.push({
          item: item,
          id: id,
          selected: false,
          group: index,
          color_mode: color_classes[index],
          solved: false,
        });
        id += 1;
      });
    });

    zamichatPole(allItems);

    setCurrentItemModes(
      allItems.map((item) => ({ item_id: item.id, item_modes: [] }))
    );
    setLoading(false);
  }, [data]);

  /**
   * Vloží určitý vybraný prvek do pole vybraných prvů
   * @param {*} item Prvek
   */
  const insertIntoSelectedElements = (item) => {
    if (currentSelectMode !== "select") {
      return setCurrentItemModes((prev) =>
        prev.map((i) => {
          if (i.item_id !== item.id) return i;

          const exists = i.item_modes.includes(currentSelectMode);

          return {
            ...i,
            item_modes: exists
              ? i.item_modes.filter((m) => m !== currentSelectMode)
              : [...i.item_modes, currentSelectMode],
          };
        })
      );
    }
    const copy = [...items];
    if (item.selected === false)
      if (copy.filter((obj) => obj.selected === true).length === 4)
        return changeElements(item);
    const selectedItem = copy.find((single_item) => single_item === item);
    selectedItem.selected = !selectedItem.selected;
    if (selectedElements.find((existingItem) => existingItem.id == item.id)) {
      setSelectedElements((prev) =>
        prev.filter((existingItem) => existingItem.id !== item.id)
      );
    } else {
      setSelectedElements((prev) => [...prev, item]);
    }
    setItems(copy);
  };

  /**
   * Pokud jsou aktivní čtyři prvky, odebere první prvek, posune všechny o jeden dopředu a poté přidá pátý, aktuálně kliknutý
   */
  function changeElements(item) {
    const newItems = selectedElements;
    const deselectedItem = newItems.shift();
    newItems.push(item);
    setSelectedElements([...newItems]);

    const updatedItems = items.map((existingItem) =>
      existingItem.id === deselectedItem.id
        ? { ...existingItem, selected: false }
        : existingItem
    );
    const removedUpdatedItems = updatedItems.map((existingItem) =>
      existingItem.id === item.id
        ? { ...existingItem, selected: true }
        : existingItem
    );

    setItems(removedUpdatedItems);
  }

  /**
   * Modal vykreslující nápovědu pro uživatele
   */
  function showModal() {
    withReactContent(modal).fire({
      title: "Jak hrát?",
      html: (
        <div id="help-modal">
          <p>
            {" "}
            Najdětě skupiny po čtyřech slovech, které spolu nějakým způsobem
            souvisí.
          </p>
          <p> Kliknutím vyberete jednotlivé položky.</p>
          <p> Zmáčkněte tlačítko "Odeslat" pro zkontrolování kategorie.</p>
          <h5> Kategorie </h5>
          <p>
            {" "}
            Každá kategorie má svojí barvu znázorňující obtížnost uhádnutí.
          </p>
          <p>
            {" "}
            Těžká kategorie často obsahuje odkazy na pojmy z filmů, kultury,
            fráze či velmi specifické pojmy.
          </p>
          <div className="help-modal__category">
            <div className="--yellow help-modal__color"></div>
            <span class="help-modal__text">Jednoduchá</span>
          </div>
          <div className="help-modal__category">
            <div className="--green help-modal__color"></div>
            <span class="help-modal__text">Středně těžká</span>
          </div>
          <div className="help-modal__category">
            <div className="--blue help-modal__color"></div>
            <span class="help-modal__text">Těžká</span>
          </div>
          <div className="help-modal__category">
            <div className="--purple help-modal__color"></div>
            <span class="help-modal__text">Velmi těžká</span>
          </div>
          <h5> Příklady kategorie </h5>
          <p> Jednoduchá - MADAM, NEPOCHOPEN, KAJAK, KRK (Palindromy).</p>
          <p>
            {" "}
            Velmi těžká - DRN, OBRAZ, TLAK, VLIV (Pod čím člověk může být).
          </p>
        </div>
      ),
    });
  }

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
   * Funkce na threshold
   */
  function wait(ms) {
    return new Promise((resolve) =>
      timeouts.current.push(setTimeout(resolve, ms))
    );
  }

  /**
   * Odebere selectnuté itemy z listu
   * @returns
   */
  const removeItemsFromList = async () => {
    // Vyberu všechny aktivní prvky
    const selectedItems = items.filter((item) => item.selected);

    //Následně si vytvořím pole těch, které selectnuté nebyly
    const remainingItems = items.filter(
      (item) => !selectedItems.includes(item)
    );

    // A posadím selectnuté prvky na vršek tabulky
    const newItems = [
      ...selectedItems,
      ...remainingItems.slice(0, items.length - selectedItems.length),
    ];

    // Nastavím prvky kvůli provedení animace, aby se posunuli na vršek
    setItems(newItems);

    await wait(items.filter((item) => !item.solved).length === 4 ? 0 : 500);

    // Nastavím selectnuté je jako vyřešené
    selectedItems.forEach((item) => {
      item.solved = true;
      item.selected = false;
    });

    setSolvedCategories((prev) => [
      ...prev,
      groups.current.find((group) => group.id === selectedItems[0].group),
    ]);

    setSelectedElements([]);

    // A posadím selectnuté prvky na vršek tabulky
    const newItemsAfterAnimation = [
      ...selectedItems,
      ...remainingItems.slice(0, items.length - selectedItems.length),
    ];

    setModes((prev) => [
      ...prev.filter((item) => item !== selectedItems[0].color_mode),
    ]);

    setCurrentItemModes((prev) =>
      prev.map((item) => ({
        ...item,
        item_modes: item.item_modes.filter(
          (mode) => mode !== selectedItems[0].color_mode
        ),
      }))
    );

    return setItems(newItemsAfterAnimation);
  };

  /**
   * Odešle ke kontrole prvky, případně vykreslí hlášky
   */
  const submitCategory = async () => {
    const selectedItems = items.filter((item) => item.selected);

    if (selectedItems.length != 4) return;

    /* Kontrola již uhádnutých pokusů */
    if (
      tries.current.some(
        (pole) =>
          JSON.stringify(pole) ===
          JSON.stringify(selectedItems.map((item) => item.id).sort())
      )
    )
      return setErrorMessage("Již zkoušeno");

    /* Kontrola správného uhádnutí */

    tries.current.push(selectedItems.map((item) => item.id).sort());
    let numerator = 100;
    let waitForRemove = 450;
    let timeForRunAndDramaticPause = 150;
    let threshold = 0;

    async function makeAnimation() {
      for (let i = 0; i < selectedItems.length; i++) {
        const item = document.getElementById(selectedItems[i].id);
        timeouts.current.push(
          setTimeout(() => {
            item.classList.add("jump-up");
            timeouts.current.push(
              setTimeout(() => {
                item.classList.remove("jump-up");
              }, waitForRemove)
            );
          }, threshold)
        );

        threshold += numerator;
      }
      await wait(numerator * 4 + waitForRemove + timeForRunAndDramaticPause);
    }

    await makeAnimation();

    /* Kontrola, jestli nemá objekt tři společné prvky */
    const values = selectedItems.map((item) => item.group);
    let valueCounts = values.reduce((counts, value) => {
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {});

    if (Object.values(valueCounts).some((count) => count == 3)) {
      setLives((prev) => prev - 1);
      return setErrorMessage("Tak blízko...");
    }

    if (selectedItems.every((item) => item.group === selectedItems[0].group))
      return await removeItemsFromList();

    for (let i = 0; i < selectedItems.length; i++) {
      const item = document.getElementById(selectedItems[i].id);
      item.classList.add("shake");
      timeouts.current.push(
        setTimeout(() => item.classList.remove("shake"), 400)
      );
    }
    setLives((prev) => prev - 1);
    return setErrorMessage("Samá voda...");
  };

  const solveAll = async () => {
    items.forEach((selectedItem) => (selectedItem.selected = false));
    for (const group of [0, 1, 2, 3]) {
      if (!items.find((item) => item.group == group && item.solved == false))
        continue;

      items
        .filter((item) => item.group == group)
        .forEach((selectedItem) => (selectedItem.selected = true));
      await submitCategory();
    }
  };

  if (loading)
    return (
      <div>
        <h2 style={{ textAlign: "center" }}> Načítání ... </h2>
      </div>
    );
  return (
    !loading && (
      <div
        id="single-connection"
        style={{ backgroundColor: data?.settings?.color }}
      >
        <ConfettiCanvas isActive={solved} />
        <ErrorMessage statusMsg={errorMessage} setFunc={setErrorMessage} />
        {!data && <p>Načítání...</p>}
        {data && (
          <div id="single-connection__container">
            <LuHelpCircle className="help-icon" onClick={() => showModal()} />
            <h2>
              {" "}
              {data.creator}{" "}
              <LuHelpCircle
                className="help-icon2"
                onClick={() => showModal()}
              />{" "}
            </h2>
            <h4> {data.date} </h4>
            <div className="board-container">
              <div className="solvedCategories">
                {solvedCategories.map((group) => {
                  return (
                    <div
                      key={group.id}
                      className={"solvedCategory --" + color_classes[group.id]}
                    >
                      <h3 className="solvedCategory-heading">
                        {group.explanation.toUpperCase()}
                      </h3>
                      <div className="solvedCategory-items">
                        <p>
                          {group.items.map((item, key) => (
                            <span
                              key={key}
                              className="solvedCategory-items-single"
                            >
                              {item.toUpperCase()}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <FlipMove className="board">
                {items
                  .filter((item) => !item.solved)
                  .map((item) => {
                    return (
                      <label
                        onClick={() => insertIntoSelectedElements(item)}
                        className={
                          "board-item " + (item.selected ? "selected" : "")
                        }
                        key={item.id}
                        id={item.id}
                      >
                        <div className="tile-modes">
                          {currentItemModes
                            .find((i) => i.item_id == item.id)
                            .item_modes.map((mode) => (
                              <span
                                key={mode}
                                className={"tile-mode --" + mode}
                              ></span>
                            ))}
                        </div>
                        <p>{item.item}</p>
                      </label>
                    );
                  })}
              </FlipMove>
            </div>
            <div className="modes">
              {modes.length > 1 &&
                modes.map((mode) => (
                  <div
                    className={`mode --${mode} ${mode === currentSelectMode ? "--selected" : ""}`}
                    onClick={() => setCurrentSelectMode(mode)}
                  ></div>
                ))}
            </div>
            <div className="lives">
              {[...Array(lives)].map((e, i) => (
                <div className="life" key={i} />
              ))}
            </div>
            <section id="buttons">
              {shouldShowButtons == true && (
                <>
                  <div>
                    <button onClick={() => zamichatPole(items)}>
                      {" "}
                      Zamíchat{" "}
                    </button>
                    <button
                      onClick={() => {
                        if (items.filter((item) => item.selected).length === 4)
                          submitCategory();
                      }}
                    >
                      Odeslat
                    </button>
                  </div>
                  <button onClick={() => setLives(0)}> Vyřešit </button>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    )
  );
}
