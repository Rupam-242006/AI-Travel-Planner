// app.js — Entry point: initialises UI and wires up the generate button

document.addEventListener("DOMContentLoaded", () => {

  /* ─── Initialise all UI components ─── */
  // Notice: renderDestinations() has been safely removed.
  initBudgetPills();
  initGroupPills();
  initActivityPills();
  initFoodPills();
  initDaysStepper();
  initCharCounter();
  initSkipBtn();

  /* ─── Set default date to tomorrow ─── */
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("travel-date").value = tomorrow.toISOString().split("T")[0];
  document.getElementById("travel-date").min = tomorrow.toISOString().split("T")[0];

  /* ─── Generate button ─── */
  const generateBtn = document.getElementById("generate-btn");
  generateBtn.addEventListener("click", async () => {
    const state = collectFormState();

    // Validation Updated: Now checks if both the description AND the new destination input are empty
    if (!state.description && !state.destinations) {
      showValidationError("Please describe your trip or type a destination.");
      return;
    }

    // Show loading UI
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span class="gen-icon spinning">✦</span> Planning your trip…`;
    showLoading();

    try {
      const html = await generateTripPlan(state);
      showResult(html);
    } catch (err) {
      console.error(err);
      showResult(`<div class="error-msg">
        <strong>Something went wrong.</strong><br>
        ${err.message || "Please check your API key and try again."}
      </div>`);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `<span class="gen-icon">✦</span> Generate My Trip Plan`;
    }
  });

  /* ─── Replan button ─── */
  document.getElementById("replan-btn").addEventListener("click", () => {
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("planner").scrollIntoView({ behavior: "smooth" });
  });

});

/* ─── Validation toast ─── */
function showValidationError(msg) {
  let toast = document.getElementById("validation-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "validation-toast";
    toast.className = "validation-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}