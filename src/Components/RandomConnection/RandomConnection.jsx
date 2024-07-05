import { useParams } from "react-router-dom";
import Connection from "../Connection/Connection";

export default function RandomConnection() {
  return (
    <div>
      <Connection id={"random"}></Connection>
    </div>
  );
}
