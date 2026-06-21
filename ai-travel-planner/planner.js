// planner.js — Groq API integration & prompt engineering

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ── API Key is safely loaded from config.js ──
const GROQ_API_KEY = ENV.GROQ_API_KEY;

/* ─── Build a rich prompt from form state ─── */
function buildPrompt(state) {
  const parts = [];

  if (state.description) {
    parts.push(`User's description: "${state.description}"`);
  }

  // UPDATED: Now handles destination as a single string instead of an array
  if (state.destinations) {
    parts.push(`Preferred destination: ${state.destinations}`);
  }

  if (state.date) {
    const dateStr = new Date(state.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    parts.push(`Travel start date: ${dateStr}`);
  }

  parts.push(`Trip duration: ${state.days} day${state.days > 1 ? "s" : ""}`);

  if (state.budget) {
    const budgetMap = { low: "Budget / Backpacker", medium: "Mid-range", high: "Luxury", custom: `Custom (~$${state.customBudget} USD total)` };
    parts.push(`Budget level: ${budgetMap[state.budget] || state.budget}`);
  }

  if (state.group) {
    const groupMap = { solo: "Solo traveller", couple: "Couple", family: "Family with kids", friends: "Group of friends" };
    parts.push(`Travelling as: ${groupMap[state.group] || state.group}`);
  }

  if (state.activities && state.activities.length > 0) {
    const actLabels = state.activities.map(id => {
      const a = ACTIVITIES.find(x => x.id === id);
      return a ? a.label.replace(/^[^\w]+/, "").trim() : id;
    });
    parts.push(`Interested activities: ${actLabels.join(", ")}`);
  }

  if (state.seaActivities && state.seaActivities.length > 0) {
    const seaLabels = state.seaActivities.map(id => {
      const a = SEA_ACTIVITIES.find(x => x.id === id);
      return a ? a.label.replace(/^[^\w]+/, "").trim() : id;
    });
    parts.push(`Sea / beach activities: ${seaLabels.join(", ")}`);
  }

  if (state.mountainActivities && state.mountainActivities.length > 0) {
    const mtLabels = state.mountainActivities.map(id => {
      const a = MOUNTAIN_ACTIVITIES.find(x => x.id === id);
      return a ? a.label.replace(/^[^\w]+/, "").trim() : id;
    });
    parts.push(`Mountain activities: ${mtLabels.join(", ")}`);
  }

  if (state.food && state.food.length > 0) {
    const foodMap = { veg: "Pure Vegetarian", nonveg: "Non-Vegetarian", vegan: "Vegan", seafood: "Seafood lover", local: "Loves local cuisine", any: "No preference" };
    const foodLabels = state.food.map(id => foodMap[id] || id);
    parts.push(`Food preference: ${foodLabels.join(", ")}`);
  }

  return parts.join("\n");
}

/* ─── System prompt for Groq ─── */
/* ─── System prompt for Groq ─── */
const SYSTEM_PROMPT = `You are Wandr, an expert AI travel planner. Your job is to create beautiful, practical, and personalised travel itineraries.

Given the traveller's preferences, generate a detailed day-by-day trip plan in rich HTML format.

Structure your response as valid HTML (no doctype, no <html>/<body> tags — just the inner content). Use these exact classes for styling:
- <div class="itinerary-hero"> for a short intro paragraph about the trip
- <div class="day-card"> for each day's plan
- <div class="day-header"> for the day title (e.g. "Day 1 – Arrival in Bali")
- <div class="day-body"> for the day's content
- <div class="activity-item"> for each activity (morning / afternoon / evening)
- <span class="activity-time">Morning</span> for the time of day
- <div class="food-tip"> for food recommendations
- <div class="tips-box"> for practical tips at the end
- <div class="budget-box"> for a rough budget breakdown

CRITICAL RULES:
1. BUDGET CURRENCY: ALWAYS provide the rough budget breakdown in the destination's LOCAL CURRENCY (e.g., ₹ INR for India, ¥ JPY for Japan, € EUR for Europe). Do NOT default to USD.
2. SMART TIPS: Make practical tips hyper-specific to the destination. Do not give generic international advice like "buy a SIM card" or "exchange currency" if the trip appears domestic. If the destination is North East India, mention Inner Line Permits (ILP), weather gear, or terrain advice.
3. Be specific: name actual places, restaurants, and local experiences.`;

/* ─── Call Groq API ─── */
async function callGroq(prompt) {
  // Demo mode has been removed. We are now forcing the app to use the real AI!
  
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.7, // Lowered slightly to make the AI more factual and less generic
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/* ─── Generate the trip plan ─── */
async function generateTripPlan(state) {
  // UPDATED Validate: check if the string has length, not if the array has length
  const hasDescription  = state.description && state.description.length > 0;
  const hasDestination  = state.destinations && state.destinations.length > 0;

  if (!hasDescription && !hasDestination) {
    return `<div class="error-msg">Please describe your trip or type a destination to get started.</div>`;
  }

  const prompt = buildPrompt(state);
  const html = await callGroq(prompt);
  return html;
}

/* ─── Demo / fallback mock response ─── */
function getMockResponse(prompt) {
  const dest = prompt.includes("Bali") ? "Bali, Indonesia" : 
               prompt.includes("Japan") ? "Japan" :
               prompt.includes("Paris") ? "Paris, France" : "Your Dream Destination";

  return `
<div class="itinerary-hero">
  <h3>✦ Your Perfect Getaway to ${dest}</h3>
  <p>Here's your personalised itinerary crafted just for you. This plan balances exploration, relaxation, and authentic local experiences — designed around your preferences and budget.</p>
  <p class="demo-note">💡 <strong>Demo mode:</strong> Add your Groq API key in <code>planner.js</code> for real AI-generated itineraries.</p>
</div>

<div class="day-card">
  <div class="day-header">Day 1 — Arrival & First Impressions</div>
  <div class="day-body">
    <div class="activity-item">
      <span class="activity-time">Morning</span>
      <p>Land at the airport and check into your accommodation. Take a slow start — freshen up and explore your immediate neighbourhood on foot.</p>
    </div>
    <div class="activity-item">
      <span class="activity-time">Afternoon</span>
      <p>Head to a nearby landmark for orientation. Grab a local SIM card and exchange currency at a trusted bureau.</p>
    </div>
    <div class="activity-item">
      <span class="activity-time">Evening</span>
      <p>Welcome dinner at a well-reviewed local restaurant. Sample the signature dish of the region.</p>
    </div>
    <div class="food-tip">🍽️ <strong>Food tip:</strong> Ask your hotel for a recommendation — locals always know the best spots that aren't on tourist maps.</div>
  </div>
</div>

<div class="day-card">
  <div class="day-header">Day 2 — Culture & Exploration</div>
  <div class="day-body">
    <div class="activity-item">
      <span class="activity-time">Morning</span>
      <p>Visit the top cultural site of the region early to beat the crowds. Hire a local guide for insider stories.</p>
    </div>
    <div class="activity-item">
      <span class="activity-time">Afternoon</span>
      <p>Explore a local market — great for souvenirs, street food, and authentic interaction with locals.</p>
    </div>
    <div class="activity-item">
      <span class="activity-time">Evening</span>
      <p>Sunset at a scenic viewpoint. Many destinations have iconic sunset spots worth the small effort to reach.</p>
    </div>
  </div>
</div>

<div class="day-card">
  <div class="day-header">Day 3 — Adventure & Activities</div>
  <div class="day-body">
    <div class="activity-item">
      <span class="activity-time">Full Day</span>
      <p>Today is dedicated to your chosen activities. Whether it's a beach day, a mountain trail, or a city tour — make the most of it with an early start.</p>
    </div>
    <div class="food-tip">🍽️ <strong>Food tip:</strong> Pack a picnic or find a local café en route — eating where locals eat is always the best experience.</div>
  </div>
</div>

<div class="tips-box">
  <h4>📋 Practical Tips</h4>
  <ul>
    <li>Book major attractions in advance to avoid queues.</li>
    <li>Carry a reusable water bottle — stay hydrated especially in warm climates.</li>
    <li>Download offline maps before you head out each day.</li>
    <li>Keep digital and physical copies of your travel documents.</li>
    <li>Travel insurance is always worth it — especially for adventure activities.</li>
  </ul>
</div>

<div class="budget-box">
  <h4>💰 Rough Budget Breakdown (per person/day)</h4>
  <div class="budget-row"><span>Accommodation</span><span>$40 – $120</span></div>
  <div class="budget-row"><span>Food & Drinks</span><span>$20 – $60</span></div>
  <div class="budget-row"><span>Activities</span><span>$15 – $80</span></div>
  <div class="budget-row"><span>Transport</span><span>$10 – $30</span></div>
  <div class="budget-row total"><span>Estimated Total</span><span>$85 – $290 / day</span></div>
</div>
`;
}