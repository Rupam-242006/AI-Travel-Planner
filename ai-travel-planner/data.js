// data.js — All static data for Wandr

const ACTIVITIES = [
  { id: "beach",     label: "🏖️ Beach",       triggers: "sea" },
  { id: "surfing",   label: "🏄 Surfing",      triggers: "sea" },
  { id: "diving",    label: "🤿 Diving / Snorkelling", triggers: "sea" },
  { id: "trekking",  label: "🥾 Trekking",    triggers: "mountain" },
  { id: "hiking",    label: "⛰️ Hiking",      triggers: "mountain" },
  { id: "camping",   label: "🏕️ Camping",     triggers: "mountain" },
  { id: "culture",   label: "🏛️ Culture & History", triggers: null },
  { id: "shopping",  label: "🛍️ Shopping",    triggers: null },
  { id: "food",      label: "🍽️ Food Tours",  triggers: null },
  { id: "nightlife", label: "🎉 Nightlife",   triggers: null },
  { id: "wildlife",  label: "🦁 Wildlife",    triggers: null },
  { id: "spa",       label: "🧖 Spa & Wellness", triggers: null },
  { id: "adventure", label: "🪂 Adventure Sports", triggers: null },
  { id: "cycling",   label: "🚴 Cycling",     triggers: null },
  { id: "photography",label: "📸 Photography", triggers: null },
  { id: "yoga",      label: "🧘 Yoga / Retreat", triggers: null },
];

const SEA_ACTIVITIES = [
  { id: "sea_snorkel",  label: "🤿 Snorkelling" },
  { id: "sea_kayak",   label: "🛶 Kayaking" },
  { id: "sea_sailing",  label: "⛵ Sailing" },
  { id: "sea_parasail", label: "🪂 Parasailing" },
  { id: "sea_fishing",  label: "🎣 Deep-sea Fishing" },
  { id: "sea_catamaran",label: "🚢 Catamaran cruise" },
];

const MOUNTAIN_ACTIVITIES = [
  { id: "mt_summit",    label: "🏔️ Summit trek" },
  { id: "mt_camping",   label: "🏕️ Mountain camping" },
  { id: "mt_cable",     label: "🚡 Cable car ride" },
  { id: "mt_rafting",   label: "🌊 River rafting" },
  { id: "mt_ski",       label: "⛷️ Skiing / Snowboarding" },
  { id: "mt_climbing",  label: "🧗 Rock climbing" },
];
