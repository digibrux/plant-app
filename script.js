const STORAGE_KEY = "plant-watering-app-static-v1";
const DAY_MS = 1000 * 60 * 60 * 24;

const defaultData = {
  plantName: "Pachira Aquatica",
  wateringIntervalDays: 7,
  lastWateredAt: null,
  lastWateredBy: "Personne pour le moment"
};

const statusBox = document.getElementById("statusBox");
const statusLabel = document.getElementById("statusLabel");
const statusIcon = document.getElementById("statusIcon");
const statusMessage = document.getElementById("statusMessage");
const statusDetail = document.getElementById("statusDetail");
const lastWateredBy = document.getElementById("lastWateredBy");
const lastWateredAt = document.getElementById("lastWateredAt");
const wateringInterval = document.getElementById("wateringInterval");
const waterButton = document.getElementById("waterButton");
const thankYouMessage = document.getElementById("thankYouMessage");
const nameModal = document.getElementById("nameModal");
const personName = document.getElementById("personName");
const cancelButton = document.getElementById("cancelButton");
const confirmButton = document.getElementById("confirmButton");
const pageUrl = document.getElementById("pageUrl");

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultData };

  try {
    return { ...defaultData, ...JSON.parse(saved) };
  } catch {
    return { ...defaultData };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(dateString) {
  if (!dateString) return "Jamais arrosée";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffInDays(fromDate, toDate) {
  return Math.floor((toDate.getTime() - fromDate.getTime()) / DAY_MS);
}

let data = loadData();

function render() {
  lastWateredBy.textContent = data.lastWateredBy;
  lastWateredAt.textContent = formatDate(data.lastWateredAt);
  wateringInterval.value = data.wateringIntervalDays;
  pageUrl.textContent = window.location.href;

  statusBox.classList.remove("status-ok", "status-late");
  statusMessage.classList.remove("green-text", "red-text");

  if (!data.lastWateredAt) {
    statusBox.classList.add("status-late");
    statusLabel.textContent = "Arrosage à faire";
    statusIcon.textContent = "⚠️";
    statusMessage.textContent = "Cette plante n'a pas encore d'arrosage enregistré.";
    statusMessage.classList.add("red-text");
    statusDetail.textContent = "Vous pouvez l’arroser maintenant.";
    return;
  }

  const lastDate = new Date(data.lastWateredAt);
  const dueDate = new Date(lastDate.getTime() + data.wateringIntervalDays * DAY_MS);
  const today = startOfToday();
  const dueDateStart = new Date(dueDate);
  dueDateStart.setHours(0, 0, 0, 0);

  const daysRemaining = diffInDays(today, dueDateStart);

  if (daysRemaining >= 0) {
    statusBox.classList.add("status-ok");
    statusLabel.textContent = "Tout va bien";
    statusIcon.textContent = "✅";
    statusMessage.classList.add("green-text");

    if (daysRemaining === 0) {
      statusMessage.textContent = "Arrosage prévu aujourd’hui.";
    } else {
      statusMessage.textContent = `Il reste ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} avant le prochain arrosage.`;
    }

    statusDetail.textContent =
      "Prochain arrosage conseillé : " +
      new Intl.DateTimeFormat("fr-BE", { dateStyle: "full" }).format(dueDate) +
      ".";
  } else {
    const overdueDays = Math.abs(daysRemaining);
    statusBox.classList.add("status-late");
    statusLabel.textContent = "En retard";
    statusIcon.textContent = "⚠️";
    statusMessage.classList.add("red-text");
    statusMessage.textContent = `L'arrosage a ${overdueDays} jour${overdueDays > 1 ? "s" : ""} de retard.`;
    statusDetail.textContent =
      "Le prochain arrosage aurait dû être fait le " +
      new Intl.DateTimeFormat("fr-BE", { dateStyle: "full" }).format(dueDate) +
      ".";
  }
}

wateringInterval.addEventListener("change", () => {
  const value = Math.max(1, Number(wateringInterval.value) || 1);
  data.wateringIntervalDays = value;
  saveData(data);
  render();
});

waterButton.addEventListener("click", () => {
  personName.value = "";
  nameModal.classList.remove("hidden");
  personName.focus();
});

cancelButton.addEventListener("click", () => {
  nameModal.classList.add("hidden");
});

confirmButton.addEventListener("click", validateWatering);

personName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    validateWatering();
  }
});

function validateWatering() {
  const name = personName.value.trim();
  if (!name) return;

  data.lastWateredBy = name;
  data.lastWateredAt = new Date().toISOString();

  saveData(data);
  render();

  nameModal.classList.add("hidden");
  thankYouMessage.classList.remove("hidden");

  setTimeout(() => {
    thankYouMessage.classList.add("hidden");
  }, 2500);
}

render();
