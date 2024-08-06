import axios from "axios";
import { useQuery } from "react-query";
import config from "../../config/config";
import "./connection.css";
import { useEffect, useRef, useState } from "react";
import ErrorMessage from "../Connection/components/ErrorMess";
import FlipMove from "react-flip-move";
import ConfettiCanvas from "./components/ConfetetiCanvas";
import Swal from "sweetalert2";
import { LuHelpCircle } from "react-icons/lu";
import withReactContent from "sweetalert2-react-content";

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

  const [errorMessage, setErrorMessage] = useState(".");

  const fetchConnection = async () => {
    const res = await axios.get(`${config.BASE_URL}/api/connection/${id}`);
    return res.data;
  };

  const { data, status } = useQuery(["connection", id], fetchConnection, {
    refetchOnWindowFocus: false,
  });

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
    data.date = `${date.getDay()}. ${date.getMonth()}. ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
    let allItems = [];
    let id = 1;
    data.groups.forEach((group, index) => {
      groups.current.push({ ...group, id: index, solved: false });
      group.items.map((item) => {
        allItems.push({ item: item, id: id, selected: false, group: index, solved: false });
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
    if (item.selected === false) if (copy.filter((obj) => obj.selected === true).length === 4) return changeElements(item);
    const selectedItem = copy.find((single_item) => single_item === item);
    selectedItem.selected = !selectedItem.selected;
    if (selectedElements.find((existingItem) => existingItem.id == item.id)) {
      setSelectedElements((prev) => prev.filter((existingItem) => existingItem.id !== item.id));
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

    const updatedItems = items.map((existingItem) => (existingItem.id === deselectedItem.id ? { ...existingItem, selected: false } : existingItem));
    const removedUpdatedItems = updatedItems.map((existingItem) => (existingItem.id === item.id ? { ...existingItem, selected: true } : existingItem));

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
          <p> Najdětě skupiny po čtyřech slovech, které spolu nějakým způsobem souvisí.</p>
          <p> Kliknutím vyberete jednotlivé položky.</p>
          <p> Zmáčkněte tlačítko "Odeslat" pro zkontrolování kategorie.</p>
          <h5> Kategorie </h5>
          <p> Každá kategorie má svojí barvu znázorňující obtížnost uhádnutí.</p>
          <p> Těžká kategorie často obsahuje odkazy na pojmy z filmů, kultury, fráze či velmi specifické pojmy.</p>
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
          <p> Velmi těžká - DRN, OBRAZ, TLAK, VLIV (Pod čím člověk může být).</p>
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
    return new Promise((resolve) => timeouts.current.push(setTimeout(resolve, ms)));
  }

  /**
   * Odebere selectnuté itemy z listu
   * @returns
   */
  const removeItemsFromList = async () => {
    // Vyberu všechny aktivní prvky
    const selectedItems = items.filter((item) => item.selected);

    //Následně si vytvořím pole těch, které selectnuté nebyly
    const remainingItems = items.filter((item) => !selectedItems.includes(item));

    // A posadím selectnuté prvky na vršek tabulky
    const newItems = [...selectedItems, ...remainingItems.slice(0, items.length - selectedItems.length)];

    // Nastavím prvky kvůli provedení animace, aby se posunuli na vršek
    setItems(newItems);

    await wait(items.filter((item) => !item.solved).length === 4 ? 0 : 500);

    // Nastavím selectnuté je jako vyřešené
    selectedItems.forEach((item) => {
      item.solved = true;
      item.selected = false;
    });

    setSolvedCategories((prev) => [...prev, groups.current.find((group) => group.id === selectedItems[0].group)]);

    setSelectedElements([]);

    // A posadím selectnuté prvky na vršek tabulky
    const newItemsAfterAnimation = [...selectedItems, ...remainingItems.slice(0, items.length - selectedItems.length)];

    return setItems(newItemsAfterAnimation);
  };

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
    if (selectedItems.filter((item) => item.group === selectedItems[0].group).length === 3) {
      setLives((prev) => prev - 1);
      return setErrorMessage("Tak blízko...");
    }

    if (selectedItems.every((item) => item.group === selectedItems[0].group)) return await removeItemsFromList();

    for (let i = 0; i < selectedItems.length; i++) {
      const item = document.getElementById(selectedItems[i].id);
      item.classList.add("shake");
      timeouts.current.push(setTimeout(() => item.classList.remove("shake"), 400));
    }
    setLives((prev) => prev - 1);
    return setErrorMessage("Samá voda...");
  };

  const solveAll = async () => {
    items.forEach((selectedItem) => (selectedItem.selected = false));
    for (const group of [0, 1, 2, 3]) {
      if (!items.find((item) => item.group == group && item.solved == false)) continue;

      items.filter((item) => item.group == group).forEach((selectedItem) => (selectedItem.selected = true));
      await submitCategory();
    }
  };

  return (
    !loading && (
      <div id="single-connection" style={{ backgroundColor: data?.settings?.color }}>
        <ConfettiCanvas isActive={solved} />
        <ErrorMessage statusMsg={errorMessage} setFunc={setErrorMessage} />
        {status === "error" && <p>Chyba :(</p>}
        {status === "loading" && <p>Načítání...</p>}
        {status === "success" && (
          <div id="single-connection__container">
            <LuHelpCircle className="help-icon" onClick={() => showModal()} />
            <h2> {data.creator} </h2>
            <h4> {data.date} </h4>
            <div className="solvedCategories">
              {solvedCategories.map((group) => {
                return (
                  <div key={group.id} className={"solvedCategory --" + color_classes[group.id]}>
                    <h3 className="solvedCategory-heading">{group.explanation.toUpperCase()}</h3>
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
              })}
            </div>
            <FlipMove className="board">
              {items
                .filter((item) => !item.solved)
                .map((item) => {
                  return (
                    <label onClick={() => insertIntoSelectedElements(item)} className={"board-item " + (item.selected === true ? "selected" : "")} key={item.id} id={item.id}>
                      <p>{item.item}</p>
                    </label>
                  );
                })}
            </FlipMove>
            <div className="lives">
              {[...Array(lives)].map((e, i) => (
                <div className="life" key={i} />
              ))}
            </div>
            <section id="buttons">
              {shouldShowButtons == true && (
                <>
                  <div>
                    <button onClick={() => zamichatPole(items)}> Zamíchat </button>
                    <button
                      onClick={() => {
                        if (items.filter((item) => item.selected).length === 4) submitCategory();
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
