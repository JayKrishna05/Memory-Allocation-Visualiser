/* 
   Memory Allocation Visualizer
   - Fixed and Variable Partition Allocation
   - Algorithms: First Fit, Best Fit, Worst Fit
   - Step Controls, Adjustable Speed, PNG/JSON Export
   = */

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let blocks = [], processes = [], algorithm = "first", mode = "fixed";
let steps = [], currentStep = 0;
let playing = false, speed = 1, playInterval = null;

// Event Listeners
document.getElementById("startBtn").addEventListener("click", startSimulation);
document.getElementById("algoSelect").addEventListener("change", e => algorithm = e.target.value);
document.getElementById("modeSelect").addEventListener("change", e => mode = e.target.value);
document.getElementById("speedRange").addEventListener("input", e => speed = parseFloat(e.target.value));
document.getElementById("playBtn").addEventListener("click", play);
document.getElementById("pauseBtn").addEventListener("click", pause);
document.getElementById("nextBtn").addEventListener("click", nextStep);
document.getElementById("prevBtn").addEventListener("click", prevStep);
document.getElementById("exportPngBtn").addEventListener("click", exportPng);
document.getElementById("exportJsonBtn").addEventListener("click", exportJson);

/* Core Simulation */
function startSimulation() {
  const blockInput = document.getElementById("blockInput").value;
  const processInput = document.getElementById("processInput").value;

  blocks = blockInput.split(",").map(Number).filter(n => !isNaN(n));
  processes = processInput.split(",").map(Number).filter(n => !isNaN(n));

  if (blocks.length === 0 || processes.length === 0)
    return alert("Enter valid block and process sizes.");

  steps = [];
  currentStep = 0;

  if (mode === "fixed") simulateFixed();
  else simulateVariable();

  drawStep(steps[0]);
}

/* Fixed Partition Simulation */
function simulateFixed() {
  let mem = [...blocks];
  let alloc = new Array(processes.length).fill(-1);

  for (let i = 0; i < processes.length; i++) {
    let chosen = -1;
    if (algorithm === "first") {
      for (let j = 0; j < mem.length; j++) if (mem[j] >= processes[i]) { chosen = j; break; }
    } else if (algorithm === "best") {
      let best = Infinity;
      for (let j = 0; j < mem.length; j++) if (mem[j] >= processes[i] && mem[j] < best) { best = mem[j]; chosen = j; }
    } else if (algorithm === "worst") {
      let worst = -1;
      for (let j = 0; j < mem.length; j++) if (mem[j] >= processes[i] && mem[j] > worst) { worst = mem[j]; chosen = j; }
    }

    if (chosen !== -1) {
      alloc[i] = chosen;
      mem[chosen] -= processes[i];
    }

    steps.push({ mem: [...mem], alloc: [...alloc], current: i });
  }
}

/* Variable Partition Simulation */
function simulateVariable() {
  let memorySize = blocks.reduce((a,b)=>a+b,0);
  let partitions = [{ start: 0, size: memorySize, free: true }];
  let alloc = new Array(processes.length).fill(-1);

  for (let i = 0; i < processes.length; i++) {
    let p = processes[i];
    let candidate = -1;
    if (algorithm === "first") {
      candidate = partitions.findIndex(part => part.free && part.size >= p);
    } else if (algorithm === "best") {
      let bestSize = Infinity;
      partitions.forEach((part, idx) => {
        if (part.free && part.size >= p && part.size < bestSize) { bestSize = part.size; candidate = idx; }
      });
    } else if (algorithm === "worst") {
      let worstSize = -1;
      partitions.forEach((part, idx) => {
        if (part.free && part.size >= p && part.size > worstSize) { worstSize = part.size; candidate = idx; }
      });
    }

    if (candidate !== -1) {
      let part = partitions[candidate];
      alloc[i] = candidate;
      let remaining = part.size - p;
      part.free = false;
      part.size = p;
      if (remaining > 0)
        partitions.splice(candidate + 1, 0, { start: part.start + p, size: remaining, free: true });
    }

    steps.push({
      partitions: JSON.parse(JSON.stringify(partitions)),
      alloc: [...alloc],
      current: i
    });
  }
}

/*  Drawing Engine  */
function drawStep(step) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Always reset fill style to black before drawing titles
  ctx.fillStyle = "#000";
  ctx.font = "14px Segoe UI";

  ctx.fillText(`Step ${currentStep + 1} / ${steps.length}`, 20, 25);
  ctx.fillText(`Mode: ${mode.toUpperCase()} | Algorithm: ${algorithm.toUpperCase()}`, 20, 45);

  if (mode === "fixed") drawFixed(step);
  else drawVariable(step);
}


/* Fixed Partition Rendering */
function drawFixed(step) {
  const blockWidth = 100, maxHeight = 300;
  const baseY = 420, startX = 80;
  const maxBlock = Math.max(...blocks);

  for (let i = 0; i < blocks.length; i++) {
    const used = blocks[i] - step.mem[i];
    const totalH = (blocks[i] / maxBlock) * maxHeight;
    const usedH = (used / maxBlock) * maxHeight;
    const x = startX + i * (blockWidth + 20);

    ctx.fillStyle = "#e3f2fd";
    ctx.fillRect(x, baseY - totalH, blockWidth, totalH);
    ctx.fillStyle = "#1976d2";
    ctx.fillRect(x, baseY - usedH, blockWidth, usedH);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x, baseY - totalH, blockWidth, totalH);
    ctx.fillStyle = "#000";
    ctx.fillText(`B${i+1}`, x + 35, baseY + 15);
  }

  for (let i = 0; i <= step.current; i++) {
    const allocBlock = step.alloc[i];
    ctx.fillStyle = allocBlock !== -1 ? "#1976d2" : "red";
    ctx.fillText(`P${i+1} (${processes[i]} KB) → ${allocBlock !== -1 ? "B" + (allocBlock + 1) : "Not Allocated"}`, 20, 80 + i * 20);
  }

  updateStats(step.mem, step.alloc);
}

/* Variable Partition Rendering */
function drawVariable(step) {
  const totalMem = blocks.reduce((a,b)=>a+b,0);
  const baseY = 420, startX = 120, width = 200, scale = 300 / totalMem;
  let y = baseY - 300;

  step.partitions.forEach((part, idx) => {
    const h = part.size * scale;
    ctx.fillStyle = part.free ? "#bbdefb" : "#1976d2";
    ctx.fillRect(startX, y, width, h);
    ctx.strokeRect(startX, y, width, h);
    ctx.fillStyle = "#000";
    ctx.fillText(`Part ${idx+1} (${part.size} KB) ${part.free ? "Free" : "Used"}`, startX + 220, y + h/2);
    y += h;
  });

  for (let i = 0; i <= step.current; i++) {
    const allocPart = step.alloc[i];
    ctx.fillStyle = allocPart !== -1 ? "#1976d2" : "red";
    ctx.fillText(`P${i+1} (${processes[i]} KB) → ${allocPart !== -1 ? "Part " + (allocPart + 1) : "Not Allocated"}`, 20, 80 + i * 20);
  }

  const free = step.partitions.filter(p => p.free).reduce((a,b)=>a+b.size,0);
  const used = totalMem - free;
  updateStatsVariable(totalMem, used, step.alloc);
}

/* ===== Stats ===== */
function updateStats(mem, alloc) {
  const used = blocks.reduce((a,b)=>a+b,0) - mem.reduce((a,b)=>a+b,0);
  const total = blocks.reduce((a,b)=>a+b,0);
  const free = total - used;
  const allocCount = alloc.filter(x=>x!==-1).length;
  const util = ((used/total)*100).toFixed(2);
  updateStatsUI(used, free, allocCount, util);
}

function updateStatsVariable(total, used, alloc) {
  const free = total - used;
  const allocCount = alloc.filter(x=>x!==-1).length;
  const util = ((used/total)*100).toFixed(2);
  updateStatsUI(used, free, allocCount, util);
}
// updating the utilisation bar and stats
function updateStatsUI(used, free, allocCount, util) {
  let color = "#d32f2f";
  if (util >= 80) color = "#388e3c";
  else if (util >= 50) color = "#f57c00";

  const barWidth = Math.min(util, 100);
  document.getElementById("stats").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;font-family:'Segoe UI';">
      <div><b>Used:</b> ${used} KB</div>
      <div><b>Free:</b> ${free} KB</div>
      <div><b>Allocated:</b> ${allocCount}/${processes.length}</div>
      <div><b>Utilization:</b> ${util}%</div>
      <div style="height:18px;width:100%;background:#eee;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${barWidth}%;background:${color};transition:width 0.5s ease;"></div>
      </div>
    </div>
  `;
}

/* Playback Controls */
function play() {
  if (playing || steps.length === 0) return;
  playing = true;
  playInterval = setInterval(() => {
    if (currentStep < steps.length - 1) { currentStep++; drawStep(steps[currentStep]); }
    else pause();
  }, 1200 / speed);
}
function pause() { playing = false; clearInterval(playInterval); }
function nextStep() { if (steps.length) { currentStep = Math.min(currentStep + 1, steps.length - 1); drawStep(steps[currentStep]); } }
function prevStep() { if (steps.length) { currentStep = Math.max(currentStep - 1, 0); drawStep(steps[currentStep]); } }

/* Export functionality, ability to export png and traces*/
function exportPng() {
  const link = document.createElement("a");
  link.download = "memory_allocation.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
function exportJson() {
  const blob = new Blob([JSON.stringify(steps, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "allocation_trace.json";
  link.href = URL.createObjectURL(blob);
  link.click();
}

