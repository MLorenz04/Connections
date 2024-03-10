const express = require("express");
const app = express();
const port = 3001;
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000", // Povolí pouze požadavky z tohoto původu
};

app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/connection/:id", (req, res) => {
  const fileId = req.params.id;
  const filePath = path.join(__dirname, "connections", fileId) + ".json";

  // Kontrola existence souboru
  const exists = fs.existsSync(filePath);
  if (exists) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Hádanka nenalezena :(");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
