import { useRef, useState } from "react";
import CreateCategory from "./Components/CreateCategory";
import "./createConnection.css";
import { GithubPicker } from "react-color";
import axios from "axios";
import config from "../../config/config";
import Swal from "sweetalert2";

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

  const submit = async () => {
    const groups = [];

    for (let i = 0; i < 4; i++) {
      const element = document.getElementById("category-" + i);
      const inputs = element.getElementsByTagName("input");
      groups.push({
        explanation: inputs[0].value,
        items: [inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value],
      });
    }
    await axios
      .post(`${config.BASE_URL}/api/connection/`, {
        groups: groups,
        settings: settings,
      })
      .then((results) => {
        Swal.fire({
          title: "Úspěšně vytvořeno",
          html: `Odkaz: http://localhost:3000/connection/${results.data}`,
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "Vyskytl se problém",
          html: err.response.data,
        });
      });
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
              colors={["#fff", "#fabf96", "#EB9694", "#FAD0C3", "#FEF3BD", "#C1E1C5", "#BEDADC", "#C4DEF6", "#BED3F3", "#D4C4FB"]}
              onChange={(e) => changeSettings("color", e.hex)}
            />
          </label>

          <button onClick={submit} className="create-connection__submit">
            Vytvořit
          </button>
        </div>

        <div className="create-connection__inputs">
          <CreateCategory id={"category-0"} className={"--yellow"} />
          <CreateCategory id={"category-1"} className={"--green"} />
          <CreateCategory id={"category-2"} className={"--blue"} />
          <CreateCategory id={"category-3"} className={"--purple"} />
        </div>
      </div>
    </div>
  );
}
