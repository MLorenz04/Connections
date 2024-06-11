import { useParams } from "react-router-dom";
import Connection from "../Connection/Connection";
import Navbar from "../Navbar/Navbar";

export default function SingleConnection() {
  const { id } = useParams();
  return (
    <div>
      <Navbar />
      <Connection id={id}></Connection>
    </div>
  );
}
