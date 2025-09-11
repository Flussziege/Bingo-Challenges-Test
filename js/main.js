import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCDGnsgg1muZSLsiogP0AydwfRMmnL-rC0",
  authDomain: "lol-bingo.firebaseapp.com",
  databaseURL: "https://lol-bingo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lol-bingo",
  storageBucket: "lol-bingo.firebasestorage.app",
  messagingSenderId: "346023051769",
  appId: "1:346023051769:web:3bd5bfa276189114d93d28",
  measurementId: "G-MZ52BB5PD5"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// DOM Elemente
const grid = document.getElementById("grid");
const resetBtn = document.getElementById("resetBtn");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const colorInput = document.getElementById("colorInput");
const playerDisplay = document.getElementById("playerDisplay");
const gridSizeInput = document.getElementById("gridSize");
const playerStatsDiv = document.getElementById("playerStats");
const patternSelect = document.getElementById("patternSelect");
const challengeSetSelect = document.getElementById("challengeSetSelect"); // neues Menü


// 🔹 Zufällige Auswahl
function getRandomChallenges(pool, count) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

let playerName = "";
let playerColor = "";
let gridSize = 5;

// 🔹 Hintergrundmuster
function setBackgroundPattern(color, pattern){
  switch(pattern){
    case "stripes":
      document.body.style.background = `repeating-linear-gradient(45deg, ${color}33 0 20px, ${color}11 20px 40px)`;
      break;
    case "checker":
      document.body.style.background = `conic-gradient(${color}33 25%, transparent 0 50%, ${color}33 0 75%, transparent 0)`;
      document.body.style.backgroundSize = "40px 40px";
      break;
    case "dots":
      document.body.style.background = `radial-gradient(${color}44 20%, transparent 21%)`;
      document.body.style.backgroundSize = "30px 30px";
      break;
    case "waves":
      document.body.style.background = `repeating-radial-gradient(circle at 0 0, ${color}22, ${color}22 10px, transparent 10px, transparent 20px)`;
      document.body.style.backgroundSize = "40px 40px";
      break;
    case "gradient":
      document.body.style.background = `linear-gradient(120deg, ${color}33, ${color}11)`;
      break;
  }
  document.body.style.backgroundAttachment="fixed";
}

// 🔹 Start Button
startBtn.addEventListener("click", async () => {
  if (!nameInput.value.trim()) { 
    alert("Bitte gib deinen Namen ein!"); 
    return; 
  }

  playerName = nameInput.value.trim();
  playerColor = colorInput.value;
  gridSize = parseInt(gridSizeInput.value);
  const pattern = patternSelect.value;
  playerDisplay.textContent = `Du bist ${playerName} (${playerColor})`;

  setBackgroundPattern(playerColor, pattern);

  // ✅ Ausgewählte Challenge-Sets aus Checkboxen auslesen
  const selectedSets = Array.from(document.querySelectorAll("#challengeSetSelect input[type=checkbox]:checked"))
                            .map(cb => cb.value);

  // 🔹 Alle Challenges aus den ausgewählten Sets zusammenführen
  let challengesPool = [];
  for (const setName of selectedSets) {
    try {
      const module = await import(`./data/${setName}.js`);
      if (module.challenges) {
        challengesPool = challengesPool.concat(module.challenges);
      }
    } catch (err) {
      console.error(`Fehler beim Laden von ${setName}:`, err);
    }
  }
if (challengesPool.length === 0) {
  alert("Keine Challenges gefunden! Bitte mindestens ein Set auswählen.");
  return;
}

  const totalFields = gridSize * gridSize;
  const challenges = getRandomChallenges(challengesPool, totalFields);
  set(ref(db, "grid"), { gridSize, challenges });

  // Formular ausblenden
  nameInput.style.display = "none";
  colorInput.style.display = "none";
  patternSelect.style.display = "none";
  gridSizeInput.style.display = "none";
  document.getElementById("challengeSetSelect").style.display = "none";
  startBtn.style.display = "none";
});


// 🔹 Grid erstellen (unverändert, inkl. Doppelklick)
function createGrid(size,challenges){
  grid.innerHTML="";
  grid.style.gridTemplateColumns=`repeat(${size},96px)`;
  for(let i=0;i<size*size;i++){
    const cell=document.createElement("div");
    cell.classList.add("cell");
    const shortText=challenges[i]?challenges[i][0]:"";
    const longText=challenges[i]?challenges[i][1]:"";
    cell.dataset.index=i;
    cell.dataset.challengeShort=shortText;
    cell.dataset.challengeLong=longText;
    cell.title=longText;
    cell.textContent=shortText;

    // Einfacher Klick
    cell.addEventListener("click", async () => {
      const fieldRef = ref(db, "board/" + i);
      const snap = await new Promise(res => onValue(fieldRef, s => { res(s); }, { onlyOnce: true }));
      const fieldData = snap.val() || { players: {} };
      const players = fieldData.players || {};
      const exclusivePlayer = fieldData.exclusivePlayer || null;
      const isSelected = players[playerName] !== undefined;

      if (isSelected) {
        remove(ref(db, `board/${i}/players/${playerName}`));
        if (exclusivePlayer === playerName) update(fieldRef, { exclusivePlayer: null });
      } else {
        if (exclusivePlayer) return;
        set(ref(db, `board/${i}/players/${playerName}`), { color: playerColor, exclusive: false });
      }
    });

    // Doppelklick → Exklusiv
    cell.addEventListener("dblclick", async () => {
      const fieldRef = ref(db, "board/" + i);
      const snap = await new Promise(res => onValue(fieldRef, s => { res(s); }, { onlyOnce: true }));
      const fieldData = snap.val() || { players: {} };
      const exclusivePlayer = fieldData.exclusivePlayer || null;

      if (exclusivePlayer && exclusivePlayer !== playerName) return;
      set(fieldRef, { players: { [playerName]: { color: playerColor } }, exclusivePlayer: playerName });
    });

    grid.appendChild(cell);
  }
}
// 🔹 Kontrastfarbe
function getContrastYIQ(hex){
  hex=hex.replace("#","");
  const r=parseInt(hex.substr(0,2),16);
  const g=parseInt(hex.substr(2,2),16);
  const b=parseInt(hex.substr(4,2),16);
  const yiq=((r*299)+(g*587)+(b*114))/1000;
  return yiq>=128?"black":"white";
}

// 🔹 Listener Grid
onValue(ref(db,"grid"), snap=>{
  if(snap.exists()){
    const { gridSize: size, challenges } = snap.val();
    gridSize=size;
    createGrid(size,challenges);
  }
});

// 🔹 Board Listener & Scoreboard
// 🔹 Board Listener & Scoreboard
onValue(ref(db,"board"), snapshot=>{
  const board = snapshot.val()||{};

  document.querySelectorAll(".cell").forEach(cell=>{
    const idx = cell.dataset.index;
    const field = board[idx];

    // Standard zurücksetzen
    cell.style.border = "2px solid #333";
    cell.style.background = "#fff";
    cell.style.color = "black";

    if(field && field.players){
      const playerArr = Object.entries(field.players);

      if(field.exclusivePlayer){
        // Exklusiver Spieler → goldener Rahmen
        const player = field.exclusivePlayer;
        cell.style.backgroundColor = field.players[player].color;
        cell.style.color = getContrastYIQ(field.players[player].color);
        cell.style.border = "3px solid gold";
      } else if(playerArr.length > 0){
        // Mehrere Spieler → Gradient
        const colors = playerArr.map(([n,p])=>p.color);
        const percent = 100 / colors.length;
        const gradient = colors.map((c,i)=>`${c} ${i*percent}% ${(i+1)*percent}%`).join(', ');
        cell.style.background = `linear-gradient(to right, ${gradient})`;
        cell.style.color = "black";
        cell.style.border = "2px solid #333";
      }
    }
  });

  // Scoreboard
  const playerCounts = {};
  Object.values(board).forEach(f=>{
    if(f.players){
      Object.keys(f.players).forEach(p=>{
        playerCounts[p] = (playerCounts[p]||0)+1;
      });
    }
  });

  const playersArr = [];
  Object.keys(playerCounts).forEach(name=>{
    let color="#000";
    for(const f of Object.values(board)){
      if(f.players && f.players[name]){ color=f.players[name].color; break; }
    }
    if(name===playerName && color==="#000") color=playerColor;
    playersArr.push({name, points:playerCounts[name], color});
  });

  if(playerName && !playersArr.find(p=>p.name===playerName)){
    playersArr.push({name:playerName, points:0, color:playerColor});
  }

  playersArr.sort((a,b)=>b.points-a.points);

  let legendHTML="<ul>";
  playersArr.forEach(p=>{
    const isCurrent = p.name===playerName;
    legendHTML += `<li>
      <span class="color-circle" style="background:${p.color}"></span>
      <span style="font-weight:${isCurrent ? 'bold':'normal'}">${p.name}</span>: ${p.points} Punkte
    </li>`;
  });
  legendHTML += "</ul>";
  playerStatsDiv.innerHTML=legendHTML;

  // Spacer für zentriertes Grid
  const spacer = document.getElementById("spacer");
  spacer.style.width = `${playerStatsDiv.offsetWidth}px`;
});
// 🔹 Reset Button
resetBtn.addEventListener("click", async ()=>{
  remove(ref(db,"board"));

  // ausgewählte Sets erneut auslesen
  const selectedSets = Array.from(document.querySelectorAll("#challengeSetSelect input[type=checkbox]:checked"))
                            .map(cb => cb.value);

  let challengesPool = [];
  for (const setName of selectedSets) {
    try {
      const module = await import(`./data/${setName}.js`);

      if (module.challenges) {
        challengesPool = challengesPool.concat(module.challenges);
      }
    } catch (err) {
      console.error(`Fehler beim Laden von ${setName}:`, err);
    }
  }
if (challengesPool.length === 0) {
  alert("Keine Challenges gefunden! Bitte mindestens ein Set auswählen.");
  return;
}

  const totalFields = gridSize * gridSize;
  let newChallenges = getRandomChallenges(challengesPool, totalFields);
  newChallenges.sort(()=>0.5-Math.random());
  set(ref(db,"grid"), {gridSize, challenges:newChallenges});
});


