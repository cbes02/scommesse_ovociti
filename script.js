const screens = [...document.querySelectorAll(".screen")];
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const nameInput = document.querySelector("#bettorName");
const nameError = document.querySelector("#nameError");
const hiddenName = document.querySelector("#hiddenName");
const summaryName = document.querySelector("#summaryName");
const summaryValues = document.querySelector("#summaryValues");
const form = document.querySelector("#betForm");
const submitError = document.querySelector("#submitError");
let currentStep = 0;

function showStep(step) {
  currentStep = Math.max(0, Math.min(step, screens.length - 1));
  screens.forEach((screen, index) => {
    screen.classList.toggle("active", index === currentStep);
    screen.setAttribute("aria-hidden", index === currentStep ? "false" : "true");
  });
  progressBar.style.width = `${((currentStep + 1) / screens.length) * 100}%`;
  progressText.textContent = `${currentStep + 1} / ${screens.length}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => showStep(currentStep + 1)));
document.querySelectorAll("[data-back]").forEach(button => button.addEventListener("click", () => showStep(currentStep - 1)));

document.querySelector("#nameNext").addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name.length < 2) {
    nameError.textContent = "Ci serve almeno un nome, agente misteriosə.";
    nameInput.focus();
    return;
  }
  nameError.textContent = "";
  hiddenName.value = name;
  summaryName.textContent = name;
  updateSummary();
  showStep(3);
});

nameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#nameNext").click();
  }
});

document.querySelectorAll(".bet-card").forEach(card => {
  const output = card.querySelector("output");
  const hidden = card.querySelector('input[type="hidden"]');
  const skip = card.querySelector(".skip-button");
  const originalSkipLabel = skip.textContent;

  card.querySelector(".minus").addEventListener("click", () => {
    const value = Math.max(0, Number(output.value || output.textContent) - 1);
    output.value = value;
    output.textContent = value;
    hidden.value = value;
    updateSummary();
  });

  card.querySelector(".plus").addEventListener("click", () => {
    const value = Math.min(20, Number(output.value || output.textContent) + 1);
    output.value = value;
    output.textContent = value;
    hidden.value = value;
    updateSummary();
  });

  skip.addEventListener("click", () => {
    const skipped = card.classList.toggle("skipped");
    hidden.value = skipped ? "Preferisco non rispondere" : output.value || output.textContent;
    skip.textContent = skipped ? "Ci ho ripensato: voglio puntare" : originalSkipLabel;
    updateSummary();
  });
});

function updateSummary() {
  summaryValues.innerHTML = "";
  document.querySelectorAll(".bet-card").forEach(card => {
    const field = card.dataset.field;
    const value = card.querySelector('input[type="hidden"]').value;
    const chip = document.createElement("span");
    chip.textContent = `${field}: ${value === "Preferisco non rispondere" ? "passo" : value}`;
    summaryValues.append(chip);
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  submitError.textContent = "";
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Invio in corso…";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Invio non riuscito");
    showStep(4);
  } catch (error) {
    submitError.textContent = "Ops, la scommessa non è partita. Controlla la connessione e riprova.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Invia la scommessa <span>✨</span>";
  }
});

document.querySelector("#restartButton").addEventListener("click", () => {
  form.reset();
  nameInput.value = "";
  document.querySelectorAll(".bet-card").forEach((card, index) => {
    const value = index < 2 ? 5 : 1;
    card.classList.remove("skipped");
    card.querySelector("output").value = value;
    card.querySelector("output").textContent = value;
    card.querySelector('input[type="hidden"]').value = value;
    card.querySelector(".skip-button").textContent = index < 2 ? "Non voglio rispondere" : "Passo su questa";
  });
  showStep(0);
});

updateSummary();
showStep(0);
