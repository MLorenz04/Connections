import { useParams } from "react-router-dom";
import Connection from "../Connection/Connection";

export default function DailyConnection() {
  return (
    <div>
      <Connection id={"daily"}></Connection>
    </div>
  );
}
