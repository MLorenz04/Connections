const express = require("express");
const app = express();
const port = 3001;
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");
const bodyParser = require("body-parser");

const corsOptions = {
  origin: "http://localhost:3000", // Povolí pouze požadavky z tohoto původu
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

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
app.post("/api/connection", async (req, res) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function generateId() {
    let id = "";
    for (let i = 0; i < 20; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
  }

  let id = generateId();

  const filePath = (id) => path.join(__dirname, `connections/${id}.json`);
  while (fs.existsSync(filePath(id))) id = generateId();

  const { groups, settings } = req.body;
  if (settings?.username.length == 0) return res.status(400).send("Omlouváme se, pane Tajemný, ale je potřebné vyplnit vaše jméno či přezdívku");
  console.log(groups);
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (group.explanation.length === 0) return res.status(400).send("Doplňte prosím všechna vysvětlení");
    if (group.items.find((item) => item.length === 0) !== undefined) return res.status(400).send("Doplňte prosím všechna slova");
  }

  const finalObjects = {
    id,
    creator: settings.username,
    date: new Date(),
    groups,
    settings: {
      color: settings.color,
    },
  };

  //fs.writeFileSync(filePath(id), JSON.stringify(finalObjects, null, 2), "utf8");

  res.status(200).send(id);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
