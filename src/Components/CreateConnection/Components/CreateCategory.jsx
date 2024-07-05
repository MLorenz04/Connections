import EditBox from "./EditBox";

export default function CreateCategory(props) {
  return (
    <div className={"create-category " + props.className}>
      <input className="create-category__heading" type="text" placeholder="Vysvětlivka kategorie"></input>
      <div>
        <EditBox />
        <EditBox />
        <EditBox />
        <EditBox />
      </div>
    </div>
  );
}
