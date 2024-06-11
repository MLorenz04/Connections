const express = require("express");
const app = express();
const port = 3001;
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");

const corsOptions = {
  origin: "http://localhost:3000", // Povolí pouze požadavky z tohoto původu
};

app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

let dailyFile;

const jsonFolderPath = path.join(__dirname, "connections");

// Function to get a random file from the folder
function selectRandomFile() {
  const files = fs.readdirSync(jsonFolderPath).filter((file) => file.endsWith(".json"));
  const randomIndex = Math.floor(Math.random() * files.length);
  dailyFile = files[randomIndex];
  console.log(`Selected file: ${dailyFile}`);
}

selectRandomFile();

cron.schedule("0 0 * * *", selectRandomFile);

app.get("/api/connection/daily", (req, res) => {
  if (dailyFile) {
    const filePath = path.join(jsonFolderPath, dailyFile);
    res.sendFile(filePath);
  } else {
    res.status(404).send("No file selected");
  }
});

app.get("/api/connection/random", (req, res) => {
  const directoryPath = path.join(__dirname, "connections");

  fs.readdir(directoryPath, (err, files) => {
    if (err) return res.status(500).send("Chyba při čtení adresáře");

    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) return res.status(404).send("Žádné soubory nenalezeny");

    const randomFile = jsonFiles[Math.floor(Math.random() * jsonFiles.length)];
    const filePath = path.join(directoryPath, randomFile);

    res.sendFile(filePath);
  });
});
app.get("/api/connection/:id", (req, res) => {
  const fileId = req.params.id;
  const filePath = path.join(__dirname, "connections", fileId) + ".json";

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
