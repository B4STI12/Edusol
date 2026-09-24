// Kontaktformular: Vorauswahl per ?thema=, optionale Felder, Akut-Hinweis,
// barrierefreie Validierung und Versand per fetch mit nativem Fallback.
(() => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const success = document.getElementById("form-success");
  if (!form || !status) return;

  // Thema aus der URL vorauswählen (z. B. von einer Wirkungsfeld-Seite)
  const crisisHint = document.getElementById("crisis-hint");
  const topics = [...form.querySelectorAll('input[name="thema"]')];
  const updateCrisisHint = () => {
    const checked = topics.find((t) => t.checked);
    if (crisisHint) crisisHint.hidden = checked?.dataset.slug !== "krisenmanagement";
  };
  const preset = new URLSearchParams(location.search).get("thema");
  const presetInput = topics.find((t) => t.dataset.slug === preset);
  if (presetInput) presetInput.checked = true;
  topics.forEach((t) => t.addEventListener("change", updateCrisisHint));
  updateCrisisHint();

  // Telefon & Organisation erst auf Wunsch einblenden
  const moreToggle = document.getElementById("more-toggle");
  const moreFields = document.getElementById("more-fields");
  if (moreToggle && moreFields) {
    moreToggle.hidden = false;
    moreToggle.setAttribute("aria-expanded", "false");
    moreFields.hidden = true;
    moreToggle.addEventListener("click", () => {
      moreFields.hidden = false;
      moreToggle.setAttribute("aria-expanded", "true");
      moreToggle.hidden = true;
      document.getElementById("telefon")?.focus();
    });
  }

  if (!window.fetch) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton.textContent;
  const fallbackEmail = form.dataset.fallbackEmail;
  form.noValidate = true;

  const labelText = (field) => form.querySelector(`label[for="${field.id}"]`)?.textContent.replace(/^\d+\.\s*/, "").trim() ?? "dieses Feld";

  const setError = (field, text) => {
    const error = document.getElementById(`${field.id}-error`);
    if (text) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    if (error) {
      error.textContent = text ?? "";
      error.hidden = !text;
    }
  };

  const validate = (field) => {
    if (field.validity.valid) {
      setError(field, null);
      return true;
    }
    setError(
      field,
      field.validity.typeMismatch
        ? "Bitte eine gültige E-Mail-Adresse angeben, z. B. name@schule.ch."
        : `Bitte «${labelText(field)}» ausfüllen.`,
    );
    return false;
  };

  const required = [...form.querySelectorAll("[required]")];
  required.forEach((field) => {
    field.addEventListener("blur", () => field.value !== "" && validate(field));
    field.addEventListener("input", () => field.getAttribute("aria-invalid") === "true" && validate(field));
  });

  const setStatus = (type, text) => {
    status.className = `form-status form-status--${type}`;
    status.textContent = text;
    status.hidden = false;
  };

  const setBusy = (busy) => {
    submitButton.disabled = busy;
    submitButton.textContent = busy ? "Wird gesendet …" : submitLabel;
    form.setAttribute("aria-busy", String(busy));
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const invalid = required.filter((field) => !validate(field));
    if (invalid.length) {
      setStatus("error", `Bitte ${invalid.length === 1 ? "ein Feld" : `${invalid.length} Felder`} ergänzen.`);
      invalid[0].focus();
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        form.hidden = true;
        status.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus();
        }
        return;
      }
      // Lehnt der Dienst die AJAX-Übermittlung ab, klassisch absenden.
      if (response.status !== 422) {
        HTMLFormElement.prototype.submit.call(form);
        return;
      }
      setStatus("error", `Die Nachricht konnte nicht gesendet werden. Bitte prüft eure Eingaben oder schreibt direkt an ${fallbackEmail}.`);
    } catch {
      setStatus("error", `Die Verbindung ist fehlgeschlagen. Bitte versucht es später erneut oder schreibt direkt an ${fallbackEmail}.`);
    } finally {
      setBusy(false);
    }
  });
})();
