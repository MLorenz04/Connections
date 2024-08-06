import { useParams } from "react-router-dom";
import Connection from "../Connection/Connection";

export default function SingleConnection() {
  const { id } = useParams();
  return <Connection id={id}></Connection>;
}
