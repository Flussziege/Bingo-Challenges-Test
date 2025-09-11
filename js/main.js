<script type="module">
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

// 🔹 Challenge-Pool
const challengePool = [
  ["Gold Hunter", "Bekomme ein Shutdown von 700 Gold auf deinen Kopf ausgesetzt."],
  ["Damage Dealer", "Habe mehr als 50k Schaden."],
  ["Death Count", "Habe mehr als 20 Tode."],
  ["First Strike", "Erhalte First Blood."],
  ["Comeback King", "Gewinne trotz 8k Gold Defizit."],
  ["Swift Turret", "Bekomme einen Turm in unter 8 Minuten."],
  ["Penta Slayer", "Erziele einen Penta Kill."],
  ["Nexus Opener", "Gewinne trotz eines offenen (eigenen) Nexus."],
  ["CS Machine", "Habe mindestens 9 CS pro Minute."],
  ["Speedrun Any%", "Gewinne das Spiel in unter 15 Minuten."],
  ["ULT Trio", "Treffe mindestens 3 Gegner mit deiner Ultimate."],
  ["Critical Support", "Treffe einen Crit mit Yuumi."],
  ["Tombstone", "Habe mehr als 3 Tode."],
  ["Hat Collector", "Sammle mehr als 15 Hüte."],
  ["Ignite Executioner", "Erziele einen Kill mit Ignite."],
  ["Flashless Hero", "Spiele das Spiel ohne Flash."],
  ["Unscathed", "Verlasse einen Teamfight mit voller HP."],
  ["AP/AD Overload", "Alle Spieler im Team sind FULL AP oder FULL AD."],
  ["Survivor", "Überlebe 20 Minuten am Stück ohne zu sterben."],
  ["Barefoot", "Spiele das Spiel ohne Boots."],
  ["Wind Rider", "Spiele Yasuo."],
  ["Heartstealer", "Erziele über 500 Stacks durch Heartsteal."],
  ["I'll do it myself", "Spiele AD Milio erfolgreich."],
  ["Damage Master", "Habe den meisten Schaden im Spiel."],
  ["Soul Collector", "Habe ein volles Mejai's Soulstealer aufgebaut."],
  ["Immortal", "Gewinne ohne zu sterben."],
  ["Jungle First", "Erreiche als Jungle-Player den First Blood."],
  ["Tower Dive", "Erledige einen Gegner unter dem Turm."],
  ["Triple Kill", "Erziele einen Triple Kill in einem Fight."],
  ["Dragon Steal", "Stehle den Drachen von den Gegnern."],
  ["Baron Steal", "Stehle den Baron Nashor."],
  ["Assist King", "Sammle die meisten Assists im Team."],
  ["Backdoor", "Gewinne durch Backdoor ohne Teamfight."],
  ["CS Master", "Erreiche 10 CS pro Minute im Spiel."],
  ["Gold Lead", "Baue einen Goldvorsprung von 5k auf."],
  ["Epic Save", "Rette ein Teammitglied vor dem Tod."],
  ["Tower Destroyer", "Zerstöre 3 gegnerische Türme."],
  ["Item Rush", "Kaufe ein Full-Item-Build zuerst im Team."],
  ["First Tower", "Nimm den ersten Turm des Spiels."],
  ["Vision Control", "Erhalte 80 Vision Score"],
  ["Enemy Jungler Dead", "Töte den gegnerischen Jungler 3x."],
  ["Lane Domination", "Gewinne deine Lane (min 18) ohne zu sterben."],
  ["Quick Recall", "Recall unter 10 Sekunden nach Kill."],
  ["Epic Ult", "Treffe mindestens 3 Gegner mit deiner Ultimate."],
  ["Champion Master", "Spiele deinen Lieblingschampion perfekt. (keine Tode/Assist)"],
  ["Soul Sweep", "Sichere ein Objective, ohne dass Gegner einen Drachen bekommen."],
  ["Last Tower", "Zerstöre den gegnerischen Nexus (mindestens 50 Gold erhalten)."],
  ["Help?", "Töte Baron Nashor alleine."],
  ["Dragon Hunter", "Töte 3 Drachen im Spiel."],
  ["Tower Smacker", "Verursache 10k Schaden an Türmen."],
  ["Healing Done", "Heile 2000 HP während des Spiels."],
  ["Solo Baron", "Nimm Baron Nashor fast alleine."],
  ["Backdoor Genius", "Gewinne das Spiel, während du den Gegner-Turm unbemerkt zerstörst."],
  ["First Tower Sniper", "Zerstöre den ersten gegnerischen Turm als erstes im Spiel."],
  ["Flashless Killer", "Erziele einen Kill ohne Flash."],
  ["Tower Focus", "Verursache 5k Schaden an einem Turm."],
  ["Heal Overload", "Heile 1500 HP innerhalb von 5 Minuten."]
];

// 🔹 Zufällige Auswahl
function getRandomChallenges(pool, count) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

let playerName = "";
let playerColor = "";
let gridSize = 5;
const patternSelectEl = document.getElementById("patternSelect");

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
startBtn.addEventListener("click",()=>{
  if(!nameInput.value.trim()){alert("Bitte gib deinen Namen ein!"); return;}
  playerName = nameInput.value.trim();
  playerColor = colorInput.value;
  gridSize = parseInt(gridSizeInput.value);
  const pattern = patternSelect.value;
  playerDisplay.textContent = `Du bist ${playerName} (${playerColor})`;

  setBackgroundPattern(playerColor, pattern);

  const totalFields = gridSize*gridSize;
  const challenges = getRandomChallenges(challengePool, totalFields);
  set(ref(db,"grid"), { gridSize, challenges });

  nameInput.style.display="none";
  colorInput.style.display="none";
  patternSelect.style.display="none";
  gridSizeInput.style.display="none";
  startBtn.style.display="none";
});

// 🔹 Grid erstellen
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

  // Einfacher Klick → normale Auswahl
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
    if (exclusivePlayer) return; // niemand kann setzen, wenn schon exklusiv
    set(ref(db, `board/${i}/players/${playerName}`), { color: playerColor, exclusive: false });
  }
});

// Doppelklick → Exklusiv markieren
cell.addEventListener("dblclick", async () => {
  const fieldRef = ref(db, "board/" + i);
  const snap = await new Promise(res => onValue(fieldRef, s => { res(s); }, { onlyOnce: true }));
  const fieldData = snap.val() || { players: {} };
  const exclusivePlayer = fieldData.exclusivePlayer || null;

  if (exclusivePlayer && exclusivePlayer !== playerName) return; // exklusiv durch andere
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
resetBtn.addEventListener("click", ()=>{
  remove(ref(db,"board"));
  const totalFields = gridSize*gridSize;
  let newChallenges = getRandomChallenges(challengePool, totalFields);
  newChallenges.sort(()=>0.5-Math.random());
  set(ref(db,"grid"), {gridSize, challenges:newChallenges});
});

</script>
