import { useEffect, useState } from "react";
import "./connectionList.css";
import axios from "axios";
import config from "../../config/config";
import { Link } from "react-router-dom";

export default function ConnectionList() {
  const [data, set_data] = useState([]);
  const [loading, set_loading] = useState(true);
  useEffect(() => {
    const fetchConnection = async () => {
      const res = await axios.get(`${config.BASE_URL}/api/connections`, {
        params: { id: "list" },
      });
      set_data(res.data);
      set_loading(false);
    };

    fetchConnection();
  }, []);

  if (loading)
    return (
      <div>
        <h2 style={{ textAlign: "center" }}> Načítání ... </h2>
      </div>
    );
  if (!loading)
    return (
      <div id="connection-list">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Autor </th>
              <th>Odkaz</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                style={{
                  backgroundColor: item.color,
                }}
              >
                <td>
                  {`${new Date(item.date).getDate()}. ${
                    new Date(item.date).getMonth() + 1
                  }. ${new Date(item.date).getFullYear()}, ${new Date(item.date).getHours().toString().padStart(2, "0")}:${new Date(item.date).getMinutes().toString().padStart(2, "0")}`}
                </td>
                <td>{item.creator}</td>
                <td>
                  <Link to={`/connection/${item.id}`}>Odkaz</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}
