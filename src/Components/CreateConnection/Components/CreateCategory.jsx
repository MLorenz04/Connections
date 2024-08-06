import { useRef, useState } from "react";
import EditBox from "./EditBox";

export default function CreateCategory({ className, id }) {
  const [explanation, setExplanation] = useState();

  return (
    <div id={id} className={"create-category " + className}>
      <input
        id={"create-category__explanation"}
        className="create-category__heading"
        type="text"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Vysvětlivka kategorie"
      ></input>
      <div>
        <EditBox />
        <EditBox />
        <EditBox />
        <EditBox />
      </div>
    </div>
  );
}
