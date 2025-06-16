<script>
  let score = 0, wickets = 0, balls = 0, oversLimit = 0;
  let teamA = '', teamB = '', batsmen = [], currentBatsman = null;
  let bowlers = [], currentBowlerIndex = 0, legByeCount = 0;
  let historyStack = [];

  let innings = 1;
  let firstInningsData = null;

  function startMatch() {
    teamA = document.getElementById("teamA").value || "Team A";
    teamB = document.getElementById("teamB").value || "Team B";
    oversLimit = parseInt(document.getElementById("totalOvers").value) || 2;
    score = 0; wickets = 0; balls = 0; legByeCount = 0;
    batsmen = []; bowlers = []; currentBowlerIndex = 0; historyStack = [];
    innings = 1;
    firstInningsData = null;

    let batsmanName = prompt("Enter first batsman name:");
    currentBatsman = { name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
    batsmen.push(currentBatsman);

    for (let i = 1; i <= 11; i++) {
      let bname = prompt(`Enter name of bowler ${i} (or leave blank to stop):`);
      if (!bname) break;
      bowlers.push({ name: bname, balls: 0, runs: 0, wickets: 0 });
    }

    document.getElementById("matchTeams").innerText = `${teamA} vs ${teamB}`;
    document.getElementById("matchPanel").classList.remove("hidden");
    document.getElementById("summary").classList.add("hidden");
    document.getElementById("scoreboard").classList.remove("hidden");

    updateDisplay();
  }

  function addRun(run) {
    saveState();
    score += run;
    currentBatsman.runs += run;
    currentBatsman.balls += 1;
    if (run === 4) currentBatsman.fours += 1;
    if (run === 6) currentBatsman.sixes += 1;
    bowlers[currentBowlerIndex].runs += run;
    nextBall();
  }

  function addWide() {
    saveState();
    score += 1;
    bowlers[currentBowlerIndex].runs += 1;
    updateDisplay();
  }

  function addLegBye() {
    saveState();
    legByeCount++;
    if (legByeCount >= 3) {
      alert("Out due to 3 Leg Byes!");
      legByeCount = 0;
      addWicket();
    } else {
      nextBall();
    }
  }

  function addWicket() {
    saveState();
    wickets++;
    bowlers[currentBowlerIndex].wickets++;
    currentBatsman.balls += 1;
    nextBall();
    setTimeout(() => {
      let newName = prompt("New Batsman Name:");
      currentBatsman = { name: newName, runs: 0, balls: 0, fours: 0, sixes: 0 };
      batsmen.push(currentBatsman);
    }, 100);
  }

  function nextBall() {
    balls++;
    bowlers[currentBowlerIndex].balls++;

    if (bowlers[currentBowlerIndex].balls % 6 === 0) {
      currentBowlerIndex = (currentBowlerIndex + 1) % bowlers.length;
      alert(`New Bowler: ${bowlers[currentBowlerIndex].name}`);
    }

    if (innings === 2 && firstInningsData && score > firstInningsData.score) {
      endMatch();
      return;
    }

    updateDisplay();

    const totalBalls = oversLimit * 6;
    if (balls >= totalBalls || wickets >= 10) {
      endMatch();
    }
  }

  function undoLastBall() {
    if (historyStack.length === 0) return alert("No actions to undo.");
    const last = JSON.parse(historyStack.pop());
    score = last.score;
    wickets = last.wickets;
    balls = last.balls;
    legByeCount = last.legByeCount;
    batsmen = last.batsmen;
    currentBatsman = batsmen[batsmen.length - 1];
    bowlers = last.bowlers;
    updateDisplay();
  }

  function endMatch() {
    const overs = `${Math.floor(balls / 6)}.${balls % 6}`;

    if (innings === 1) {
      firstInningsData = {
        score,
        wickets,
        overs,
        batsmen: [...batsmen],
        bowlers: [...bowlers],
      };
      innings = 2;

      alert(`End of 1st Innings.\n${teamA} scored ${score}/${wickets} in ${overs} overs.\nTarget for ${teamB}: ${score + 1}`);

      // Reset for 2nd innings
      score = 0; wickets = 0; balls = 0; legByeCount = 0;
      batsmen = []; bowlers = []; currentBowlerIndex = 0; historyStack = [];

      let batsmanName = prompt("Enter first batsman for 2nd innings:");
      currentBatsman = { name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
      batsmen.push(currentBatsman);

      for (let i = 1; i <= 11; i++) {
        let bname = prompt(`Enter name of bowler ${i} (2nd innings) or leave blank:`);
        if (!bname) break;
        bowlers.push({ name: bname, balls: 0, runs: 0, wickets: 0 });
      }

      updateDisplay();
    } else {
      let result;
      if (score > firstInningsData.score) {
        result = `${teamB} won by ${10 - wickets} wickets!`;
      } else if (score < firstInningsData.score) {
        result = `${teamA} won by ${firstInningsData.score - score} runs!`;
      } else {
        result = "Match Tied!";
      }

      document.getElementById("summary").classList.remove("hidden");
      document.getElementById("winner").innerText = result;
      saveHistory(result);
    }
  }

  function updateDisplay() {
    const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
    const runRate = (score / (balls / 6 || 1)).toFixed(2);
    const oversLeft = (oversLimit * 6 - balls) / 6;

    document.getElementById("score").innerText = `${score}/${wickets}`;
    document.getElementById("overs").innerText = overs;
    document.getElementById("runRate").innerText = runRate;
    document.getElementById("oversLeft").innerText = oversLeft.toFixed(1);

    const targetInfo = document.getElementById("targetInfo");
    if (innings === 2 && firstInningsData) {
      const target = firstInningsData.score + 1;
      const runsLeft = target - score;
      targetInfo.innerText = `Target: ${target} | Runs remaining: ${runsLeft}`;
    } else {
      targetInfo.innerText = '';
    }

    updateScoreboard();
  }

  function updateScoreboard() {
    const bTable = document.getElementById("batsmanTable");
    bTable.innerHTML = batsmen.map(p =>
      `<tr>
        <td class="border px-2">${p.name}</td>
        <td class="border px-2">${p.runs}</td>
        <td class="border px-2">${p.balls}</td>
        <td class="border px-2">${p.fours}</td>
        <td class="border px-2">${p.sixes}</td>
      </tr>`).join('');

    const bowlerTable = document.getElementById("bowlerTable");
    bowlerTable.innerHTML = bowlers.map(b => {
      const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
      return `<tr>
        <td class="border px-2">${b.name}</td>
        <td class="border px-2">${overs}</td>
        <td class="border px-2">${b.runs}</td>
        <td class="border px-2">${b.wickets}</td>
      </tr>`;
    }).join('');
  }

  function saveHistory(summary) {
    const history = JSON.parse(localStorage.getItem("matchHistory") || "[]");
    history.unshift(summary);
    localStorage.setItem("matchHistory", JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = JSON.parse(localStorage.getItem("matchHistory") || "[]");
    document.getElementById("matchHistory").innerHTML = history.map(s => `<li>${s}</li>`).join('');
  }

  function saveState() {
    historyStack.push(JSON.stringify({
      score, wickets, balls, legByeCount,
      batsmen: JSON.parse(JSON.stringify(batsmen)),
      bowlers: JSON.parse(JSON.stringify(bowlers))
    }));
  }

  renderHistory();
</script>
