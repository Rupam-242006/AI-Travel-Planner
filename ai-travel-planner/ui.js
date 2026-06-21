/* ─── Pills (single or multi) ─── */
function renderPills(containerId, items, multi = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  items.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "pill";
    btn.dataset.val = item.id || item.val;
    btn.textContent = item.label;
    btn.addEventListener("click", () => {
      if (multi) {
        btn.classList.toggle("selected");
      } else {
        container.querySelectorAll(".pill").forEach(p => p.classList.remove("selected"));
        btn.classList.add("selected");
      }
    });
    container.appendChild(btn);
  });
}

/* ─── Budget custom field ─── */
function initBudgetPills() {
  const group = document.getElementById("budget-group");
  const customWrap = document.getElementById("custom-budget-wrap");
  group.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", () => {
      group.querySelectorAll(".pill").forEach(p => p.classList.remove("selected"));
      btn.classList.add("selected");
      if (btn.dataset.val === "custom") {
        customWrap.classList.remove("hidden");
      } else {
        customWrap.classList.add("hidden");
      }
    });
  });
}

/* ─── Group pills ─── */
function initGroupPills() {
  const group = document.getElementById("group-group");
  group.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", () => {
      group.querySelectorAll(".pill").forEach(p => p.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

/* ─── Food pills (multi-select) ─── */
function initFoodPills() {
  const group = document.getElementById("food-group");
  if (!group) return;
  
  group.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle allows them to select multiple options
      btn.classList.toggle("selected"); 
    });
  });
}

/* ─── Activity pills + conditional sea/mountain ─── */
function initActivityPills() {
  renderPills("activity-group", ACTIVITIES, true);
  renderPills("sea-group", SEA_ACTIVITIES, true);
  renderPills("mountain-group", MOUNTAIN_ACTIVITIES, true);

  const actGroup = document.getElementById("activity-group");
  actGroup.addEventListener("click", (e) => {
    if (!e.target.classList.contains("pill")) return;
    const val = e.target.dataset.val;
    const activity = ACTIVITIES.find(a => a.id === val);
    if (!activity) return;

    // Debounce re-evaluation
    setTimeout(() => {
      const selectedActivities = getSelectedMulti("activity-group");
      const wantsSea = ACTIVITIES.some(a => a.triggers === "sea" && selectedActivities.includes(a.id));
      const wantsMountain = ACTIVITIES.some(a => a.triggers === "mountain" && selectedActivities.includes(a.id));

      document.getElementById("sea-block").classList.toggle("hidden", !wantsSea);
      document.getElementById("mountain-block").classList.toggle("hidden", !wantsMountain);
    }, 50);
  });
}

/* ─── Days stepper ─── */
function initDaysStepper() {
  let days = 7;
  const val = document.getElementById("days-val");
  document.getElementById("days-minus").addEventListener("click", () => {
    if (days > 1) { days--; val.textContent = days; }
  });
  document.getElementById("days-plus").addEventListener("click", () => {
    if (days < 30) { days++; val.textContent = days; }
  });
}

/* ─── Char counter ─── */
function initCharCounter() {
  const ta = document.getElementById("trip-description");
  const cc = document.getElementById("char-count");
  ta.addEventListener("input", () => {
    const len = ta.value.length;
    if (len > 500) ta.value = ta.value.slice(0, 500);
    cc.textContent = `${Math.min(len, 500)} / 500`;
  });
}

/* ─── Skip button smooth scroll ─── */
function initSkipBtn() {
  document.getElementById("skip-btn").addEventListener("click", () => {
    document.getElementById("step-destination").scrollIntoView({ behavior: "smooth" });
  });
}

/* ─── Helpers ─── */
function getSelectedMulti(containerId) {
  return [...document.querySelectorAll(`#${containerId} .pill.selected`)].map(p => p.dataset.val);
}

function getSingleSelected(containerId) {
  const sel = document.querySelector(`#${containerId} .pill.selected`);
  return sel ? sel.dataset.val : null;
}

/* ─── Collect all form state ─── */
function collectFormState() {
  return {
    description:    document.getElementById("trip-description").value.trim(),
    // Now just grabbing the value from your new text input
    destinations:   document.getElementById("destination-input").value.trim(), 
    date:           document.getElementById("travel-date").value,
    days:           parseInt(document.getElementById("days-val").textContent),
    budget:         getSingleSelected("budget-group"),
    customBudget:   document.getElementById("custom-budget").value,
    group:          getSingleSelected("group-group"),
    activities:     getSelectedMulti("activity-group"),
    seaActivities:  getSelectedMulti("sea-group"),
    mountainActivities: getSelectedMulti("mountain-group"),
    food:           getSelectedMulti("food-group"),
  };
}

/* ─── Result rendering ─── */
function showResult(html) {
  document.getElementById("result-loading").classList.add("hidden");
  const content = document.getElementById("result-content");
  content.innerHTML = html;
  content.classList.add("visible");
}

function showLoading() {
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("result-loading").classList.remove("hidden");
  document.getElementById("result-content").innerHTML = "";
  document.getElementById("result-section").scrollIntoView({ behavior: "smooth" });
}