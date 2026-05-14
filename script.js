const STORAGE_KEY = "noor-work-rota-custom-days";
const ROTA_START = "2026-05-11";
const ROTA_END = "2026-08-09";

const customTypes = {
  vacation: {
    label: "Vacation",
    chip: "vacation",
    render: () => '<span class="shift vacation">Vacation</span>',
  },
  "teaching-afternoon": {
    label: "Teaching afternoon",
    chip: "teaching",
    render: () => '<span class="shift teaching"><span>Teaching</span><span>13-17</span></span>',
  },
  "teaching-full": {
    label: "Teaching full day",
    chip: "teaching",
    render: () => '<span class="shift teaching"><span>Teaching</span><span>09-17</span></span>',
  },
};

const form = document.querySelector("#custom-form");
const dateInput = document.querySelector("#custom-date");
const typeInput = document.querySelector("#custom-type");
const clearButton = document.querySelector("#clear-day");
const customList = document.querySelector("#custom-list");
const tableBody = document.querySelector("tbody");

const cells = Array.from(tableBody.querySelectorAll("tr")).flatMap((row) =>
  Array.from(row.querySelectorAll("td")),
);

cells.forEach((cell, index) => {
  cell.dataset.date = addDays(ROTA_START, index);
  cell.dataset.original = cell.innerHTML;
});

dateInput.value = ROTA_START;

let customDays = loadCustomDays();
applyCustomDays();
renderCustomList();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = dateInput.value;

  if (!isDateInRange(date)) {
    return;
  }

  customDays[date] = typeInput.value;
  saveCustomDays();
  applyCustomDays();
  renderCustomList();
});

clearButton.addEventListener("click", () => {
  const date = dateInput.value;
  delete customDays[date];
  saveCustomDays();
  applyCustomDays();
  renderCustomList();
});

function loadCustomDays() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCustomDays() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customDays));
}

function applyCustomDays() {
  cells.forEach((cell) => {
    cell.innerHTML = cell.dataset.original;
  });

  Object.entries(customDays).forEach(([date, type]) => {
    const cell = cells.find((candidate) => candidate.dataset.date === date);
    const customType = customTypes[type];

    if (!cell || !customType) {
      return;
    }

    cell.innerHTML = customType.render();
  });
}

function renderCustomList() {
  const entries = Object.entries(customDays).sort(([left], [right]) => left.localeCompare(right));
  customList.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No saved custom days yet";
    customList.append(empty);
    return;
  }

  entries.forEach(([date, type]) => {
    const item = document.createElement("li");
    const chip = document.createElement("span");
    const text = document.createElement("span");
    const customType = customTypes[type];

    chip.className = `mini-chip ${customType.chip}`;
    text.textContent = `${formatDate(date)}: ${customType.label}`;

    item.append(chip, text);
    customList.append(item);
  });
}

function isDateInRange(date) {
  return date >= ROTA_START && date <= ROTA_END;
}

function addDays(startDate, days) {
  const date = parseDate(startDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(parseDate(date));
}
