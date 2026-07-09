const weaponBtn = document.getElementById("weaponBtn");
const weaponEmoji = document.getElementById("weaponEmoji");
const weaponName = document.getElementById("weaponName");
const weaponGlow = document.getElementById("weaponGlow");
const forgeCard = document.getElementById("forgeCard");
const stageIndex = document.getElementById("stageIndex");
const hintText = document.getElementById("hintText");
const clickCount = document.getElementById("clickCount");
const progressValue = document.getElementById("progressValue");
const logList = document.getElementById("logList");

let audioCtx = null;

// 用 Web Audio API 合成一段「升級音效」,不需要額外的 mp3 檔案
function playLevelUpSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6 (小小的勝利音階)

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now + i * 0.09;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

function addLog(text, isNew) {
  const empty = logList.querySelector(".log-empty");
  if (empty) empty.remove();
  const li = document.createElement("li");
  li.textContent = text;
  if (isNew) li.classList.add("new");
  logList.appendChild(li);
  logList.scrollTop = logList.scrollHeight;
}

weaponBtn.addEventListener("click", async () => {
  weaponBtn.style.transform = "scale(0.94)";
  setTimeout(() => (weaponBtn.style.transform = ""), 100);

  try {
    const res = await fetch("/click", { method: "POST" });
    const data = await res.json();

    clickCount.textContent = data.clicks;
    progressValue.textContent = `${data.level + 1} / ${data.max_level + 1}`;

    if (data.leveled_up) {
      weaponEmoji.textContent = data.emoji;
      weaponName.textContent = data.name;
      stageIndex.textContent = `階段 ${toRoman(data.level + 1)} / ${data.max_level + 1}`;

      forgeCard.classList.add("shake");
      weaponGlow.classList.add("flash");
      setTimeout(() => {
        forgeCard.classList.remove("shake");
        weaponGlow.classList.remove("flash");
      }, 600);

      playLevelUpSound();
      addLog(`鍛造成功 → ${data.emoji} ${data.name}(第 ${data.clicks} 次點擊)`, true);

      if (data.is_max) {
        hintText.textContent = "已鍛造出傳說神器,鍛造之路完成";
        forgeCard.classList.add("max-reached");
        weaponBtn.disabled = true;
      }
    }
  } catch (err) {
    hintText.textContent = "連線失敗,請確認伺服器是否正常運作";
  }
});

function toRoman(num) {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[num - 1] || num;
}
