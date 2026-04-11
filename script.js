document.addEventListener("DOMContentLoaded", () => {

const SUPABASE_URL = "https://ngnnskdmmkilytdbdtts.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NrSZ8cvWZO0WwhsvxIwsOQ_c-3JDaEK";
const PLANT_SLUG = "pachira-bruxeo";
const DAY_MS = 1000 * 60 * 60 * 24;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// éléments DOM
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

let plant = null;

// utils
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

// charger plante
async function loadPlant() {
  const { data, error } = await supabaseClient
    .from("plants")
    .select("*")
    .eq("slug", PLANT_SLUG)
    .single();

  if (error) {
    console.error("Erreur chargement plante:", error);
    return;
  }

  plant = data;
  render();
}

// affichage
function render() {
  if (!plant) return;

  lastWateredBy.textContent = plant.last_watered_by || "Personne pour le moment";
  lastWateredAt.textContent = formatDate(plant.last_watered_at);
  wateringInterval.value = plant.watering_interval_days;
  pageUrl.textContent = window.location.href;

  statusBox.classList.remove("status-ok", "status-late");
  statusMessage.classList.remove("green-text", "red-text");

  if (!plant.last_watered_at) {
    statusBox.classList.add("status-late");
    statusLabel.textContent = "Arrosage à faire";
    statusIcon.textContent = "⚠️";
    statusMessage.textContent = "Cette plante n'a pas encore d'arrosage enregistré.";
    statusMessage.classList.add("red-text");
    statusDetail.textContent = "Vous pouvez l’arroser maintenant.";
    return;
  }

  const lastDate = new Date(plant.last_watered_at);
  const dueDate = new Date(lastDate.getTime() + plant.watering_interval_days * DAY_MS);
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

// événements
wateringInterval.addEventListener("change", async () => {
  if (!plant) return;

  const value = Math.max(1, Number(wateringInterval.value) || 1);

  const { data } = await supabaseClient
    .from("plants")
    .update({ watering_interval_days: value })
    .eq("id", plant.id)
    .select()
    .single();

  plant = data;
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
  if (e.key === "Enter") validateWatering();
});

// validation
async function validateWatering() {
  if (!plant) return;

  const name = personName.value.trim();
  if (!name) return;

  const nowIso = new Date().toISOString();

  const { data } = await supabaseClient
    .from("plants")
    .update({
      last_watered_by: name,
      last_watered_at: nowIso
    })
    .eq("id", plant.id)
    .select()
    .single();

  await supabaseClient
    .from("watering_log")
    .insert({
      plant_id: plant.id,
      watered_by: name,
      watered_at: nowIso
    });

  plant = data;
  render();

  nameModal.classList.add("hidden");
  thankYouMessage.classList.remove("hidden");

  setTimeout(() => {
    thankYouMessage.classList.add("hidden");
  }, 2500);
}

// init
loadPlant();

});
