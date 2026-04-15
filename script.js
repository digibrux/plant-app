document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://ngnnskdmmkilytdbdtts.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_NrSZ8cvWZO0WwhsvxIwsOQ_c-3JDaEK";
  const PLANT_SLUG = "pachira-bruxeo";
  const DAY_MS = 1000 * 60 * 60 * 24;

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  function clearStatusStyles() {
    statusBox.classList.remove("status-green", "status-orange", "status-red");
    statusMessage.classList.remove("status-green-text", "status-orange-text", "status-red-text");
  }

  async function loadPlant() {
    const { data, error } = await supabaseClient
      .from("plants")
      .select("*")
      .eq("slug", PLANT_SLUG)
      .single();

    if (error) {
      console.error("Erreur chargement plante :", error);
      statusLabel.textContent = "Erreur";
      statusIcon.textContent = "⚠️";
      statusMessage.textContent = "Impossible de charger les données de la plante.";
      statusDetail.textContent = "Vérifiez la configuration Supabase.";
      return;
    }

    plant = data;
    render();
  }

  function render() {
    if (!plant) return;

    lastWateredBy.textContent = plant.last_watered_by || "Personne pour le moment";
    lastWateredAt.textContent = formatDate(plant.last_watered_at);
    wateringInterval.value = plant.watering_interval_days || 7;
    pageUrl.textContent = window.location.href;

    clearStatusStyles();

    if (!plant.last_watered_at) {
      statusBox.classList.add("status-red");
      statusMessage.classList.add("status-red-text");
      statusLabel.textContent = "À arroser";
      statusIcon.textContent = "🚨";
      statusMessage.textContent = "La plante n’a pas encore d’arrosage enregistré.";
      statusDetail.textContent =
        "Attention, votre plante a besoin d'être arrosée ! Si besoin, reportez vous aux détails de cette plante sur la page d'accueil.";
      return;
    }

    const lastDate = new Date(plant.last_watered_at);
    const today = startOfToday();
    const lastDateStart = new Date(lastDate);
    lastDateStart.setHours(0, 0, 0, 0);

    const daysSinceLastWatering = Math.max(0, diffInDays(lastDateStart, today));

    if (daysSinceLastWatering < 5) {
      statusBox.classList.add("status-green");
      statusMessage.classList.add("status-green-text");
      statusLabel.textContent = "Statut OK";
      statusIcon.textContent = "✅";
      statusMessage.textContent = `La plante a été arrosée il y a ${daysSinceLastWatering} jour${daysSinceLastWatering > 1 ? "s" : ""}.`;
      statusDetail.textContent = "Tout est en ordre, votre plante a assez d'eau.";
      return;
    }

    if (daysSinceLastWatering <= 7) {
      statusBox.classList.add("status-orange");
      statusMessage.classList.add("status-orange-text");
      statusLabel.textContent = "Bientôt à arroser";
      statusIcon.textContent = "🟠";
      statusMessage.textContent = `La plante a été arrosée il y a ${daysSinceLastWatering} jour${daysSinceLastWatering > 1 ? "s" : ""}.`;
      statusDetail.textContent = "Vous devriez bientôt arroser la plante";
      return;
    }

    statusBox.classList.add("status-red");
    statusMessage.classList.add("status-red-text");
    statusLabel.textContent = "Arrosage urgent";
    statusIcon.textContent = "🔴";
    statusMessage.textContent = `La plante a été arrosée il y a ${daysSinceLastWatering} jour${daysSinceLastWatering > 1 ? "s" : ""}.`;
    statusDetail.textContent =
      "Attention, votre plante a besoin d'être arrosée ! Si besoin, reportez vous aux détails de cette plante sur la page d'accueil.";
  }

  waterButton.addEventListener("click", () => {
    nameModal.classList.remove("hidden");
    personName.value = "";
    personName.focus();
  });

  cancelButton.addEventListener("click", () => {
    nameModal.classList.add("hidden");
  });

  personName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      validateWatering();
    }
  });

  confirmButton.addEventListener("click", () => {
    validateWatering();
  });

  wateringInterval.addEventListener("change", async () => {
    if (!plant) return;

    const value = Math.max(1, Number(wateringInterval.value) || 1);

    const { data, error } = await supabaseClient
      .from("plants")
      .update({ watering_interval_days: value })
      .eq("id", plant.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour fréquence :", error);
      return;
    }

    plant = data;
    render();
  });

  async function validateWatering() {
    if (!plant) return;

    const name = personName.value.trim();
    if (!name) return;

    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from("plants")
      .update({
        last_watered_by: name,
        last_watered_at: nowIso
      })
      .eq("id", plant.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour plante :", error);
      return;
    }

    const logResult = await supabaseClient
      .from("watering_log")
      .insert({
        plant_id: plant.id,
        watered_by: name,
        watered_at: nowIso
      });

    if (logResult.error) {
      console.error("Erreur historique :", logResult.error);
    }

    plant = data;
    render();

    nameModal.classList.add("hidden");
    thankYouMessage.classList.remove("hidden");

    setTimeout(() => {
      thankYouMessage.classList.add("hidden");
    }, 2500);
  }

  loadPlant();
});
