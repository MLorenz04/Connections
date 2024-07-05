import { useRef, useState } from "react";
import CreateCategory from "./Components/CreateCategory";
import "./createConnection.css";
import { GithubPicker } from "react-color";

export default function CreateConnection({ id }) {
  const createdCategories = useState([]);
  const [settings, setSettings] = useState({
    username: "",
    color: "#ffffff",
  });

  const changeSettings = (prop, value) => {
    setSettings((prev) => ({
      ...prev,
      [prop]: value,
    }));
  };

  return (
    <div className="create-connection" style={{ backgroundColor: settings.color }}>
      <h1> Vytvořit </h1>
      <div className="create-connection__container">
        <div className="create-connection__settings">
          <label for="jmeno">Jméno autora</label>
          <input type="text" onChange={(e) => changeSettings("username", e.target.value)}></input>
          <label>
            Barva pozadí
            <GithubPicker
              width={"170px"}
              triangle={"hide"}
              colors={["#EB9694", "#FAD0C3", "#FEF3BD", "#C1E1C5", "#BEDADC", "#C4DEF6", "#BED3F3", "#D4C4FB"]}
              onChange={(e) => changeSettings("color", e.hex)}
            />
          </label>
        </div>

        <div className="create-connection__inputs">
          <CreateCategory className={"--yellow"} />
          <CreateCategory className={"--green"} />
          <CreateCategory className={"--blue"} />
          <CreateCategory className={"--purple"} />
        </div>
      </div>
    </div>
  );
}
