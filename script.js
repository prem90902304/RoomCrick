// State variables
let score = 0, wickets = 0, balls = 0, oversLimit = 0;
let teamA = '', teamB = '', batsmen = [], currentBatsman = null;
let bowlers = {}, currentBowler = null, legByeCount = 0;

// DOM elements
const elems = {
  startBtn: document.getElementById('startBtn'),
  matchPanel: document.getElementById('matchPanel'),
  scoreInfo: document.getElementById('scoreInfo'),
  runButtons: document.getElementById('runButtons'),
  bowlerSelect: document.getElementById('bowlerSelect'),
  batsmanTable: document.getElementById('batsmanTable'),
  bowlerTable: document.getElementById('bowlerTable'),
  scoreboard: document.getElementById('scoreboard'),
  summary: document.getElementById('summary'),
  winner: document.getElementById('winner'),
  matchHistory: document.getElementById('matchHistory'),
};

// Initialize event listeners
function init() {
  elems.startBtn.addEventListener('click', startMatch);
  ['1','2','3','4','6'].forEach(r => {
    const btn = document.createElement('button');
    btn.textContent = r;
    btn.className = 'btn';
    btn.onclick = () => addRun(+r);
    elems.runButtons.appendChild(btn);
  });
  
  ['Wide','Leg Bye','Wicket','End Match'].forEach((label, i) => {
    const btn=document.createElement('button');
    btn.textContent = label;
    btn.className = 'btn ' + (label==='Wide'? 'bg-yellow-400':'') + (label==='Leg Bye'? 'bg-green-400':'' ) + (label==='Wicket'? 'bg-red-500 hover:bg-red-600':'') + (label==='End Match'? 'bg-gray-600 hover:bg-gray-700':'');
    btn.onclick = label==='Wide'? addWide :
                  label==='Leg Bye'? addLegBye :
                  label==='Wicket'? addWicket :
                  endMatch;
    elems.runButtons.appendChild(btn);
  });

  elems.bowlerSelect.addEventListener('change', selectBowler);
  renderHistory();
}

function startMatch() {
  teamA = document.getElementById('teamA').value || 'Team A';
  teamB = document.getElementById('teamB').value || 'Team B';
  oversLimit = +document.getElementById('totalOvers').value || 2;
  [score, wickets, balls, legByeCount] = [0,0,0,0];
  batsmen = []; bowlers = {};

  const bName = prompt('Enter first batsman name:');
  const bw = prompt('Enter first bowler name:');
  currentBatsman = { name:bName, runs:0, balls:0, fours:0, sixes:0 };
  batsmen.push(currentBatsman);
  addBowler(bw);

  elems.matchPanel.classList.remove('hidden');
  elems.scoreboard.classList.remove('hidden');
  elems.summary.classList.add('hidden');
  updateDisplay();
}

function addBowler(name) {
  if (!bowlers[name]) {
    bowlers[name] = { name, balls:0, runs:0, wickets:0 };
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    elems.bowlerSelect.appendChild(opt);
  }
  currentBowler = bowlers[name];
  elems.bowlerSelect.value = name;
}

function selectBowler() {
  addBowler(elems.bowlerSelect.value);
}

function updateDisplay() {
  const oversStr = `${Math.floor(balls/6)}.${balls%6}`;
  const runRate = (score/(balls/6||1)).toFixed(2);
  const oversLeft = `${oversLimit - Math.floor(balls/6)}.${(6 - balls%6)%6}`;
  elems.scoreInfo.innerHTML = `
    Score: ${score}/${wickets}<br>
    Overs: ${oversStr}<br>
    Run Rate: ${runRate}<br>
    Overs Left: ${oversLeft}
  `;
  updateScoreboard();
}

function updateScoreboard() {
  elems.batsmanTable.innerHTML = `
    <tr><th>Name</th><th>Runs</th><th>Balls</th><th>4s</th><th>6s</th></tr>
    ${batsmen.map(p => `<tr>
      <td>${p.name}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p.fours}</td><td>${p.sixes}</td>
    </tr>`).join('')}
  `;
  elems.bowlerTable.innerHTML = `
    <tr><th>Name</th><th>Overs</th><th>Runs</th><th>Wickets</th></tr>
    ${Object.values(bowlers).map(b => `<tr>
      <td>${b.name}</td><td>${Math.floor(b.balls/6)}.${b.balls%6}</td><td>${b.runs}</td><td>${b.wickets}</td>
    </tr>`).join('')}
  `;
}

function addRun(r) {
  score += r; currentBatsman.runs += r; currentBatsman.balls++;
  if (r===4) currentBatsman.fours++;
  if (r===6) currentBatsman.sixes++;
  currentBowler.runs += r;
  nextBall();
}

function addWide() {
  score++; currentBowler.runs++; updateDisplay();
}

function addLegBye() {
  legByeCount++;
  if (legByeCount>=3) { alert('Out due to 3 Leg Byes!'); legByeCount=0; addWicket(); }
  else nextBall();
}

function addWicket() {
  wickets++; currentBowler.wickets++; currentBatsman.balls++;
  nextBall();
  setTimeout(() => {
    const name = prompt('New Batsman Name:');
    currentBatsman = { name, runs:0, balls:0, fours:0, sixes:0 };
    batsmen.push(currentBatsman);
    updateDisplay();
  },100);
}

function nextBall() {
  balls++; currentBowler.balls++; updateDisplay();
  if (currentBowler.balls % 6 ===0) {
    setTimeout(() => {
      const name = prompt('New Bowler Name for next over:');
      if (name) addBowler(name);
    },100);
  }
  if (balls>=oversLimit*6 || wickets>=10) endMatch();
}

function endMatch() {
  const o = `${Math.floor(balls/6)}.${balls%6}`;
  const summary = `${teamA} scored ${score}/${wickets} in ${o} overs.`;
  elems.summary.classList.remove('hidden');
  elems.winner.textContent = summary;
  saveHistory(summary);
}

function saveHistory(entry) {
  const h = JSON.parse(localStorage.getItem('matchHistory')||'[]');
  h.unshift(entry);
  localStorage.setItem('matchHistory', JSON.stringify(h));
  renderHistory();
}

function renderHistory() {
  const h = JSON.parse(localStorage.getItem('matchHistory')||'[]');
  elems.matchHistory.innerHTML = h.map(e=>`<li>${e}</li>`).join('');
}

// Initialize
init();
