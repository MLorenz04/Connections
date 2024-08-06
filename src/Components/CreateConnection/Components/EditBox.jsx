import { useState } from "react";

export default function EditBox() {
  const [value, setValue] = useState();

  return <input value={value} onChange={(e) => setValue(e.target.value)} className="editbox"></input>;
}
