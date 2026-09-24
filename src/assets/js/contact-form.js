// Progressive Enhancement für das Kontaktformular:
// Ohne JavaScript greift der normale POST an Formspree.
(() => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form || !status || !window.fetch) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton.textContent;
  const fallbackEmail = form.dataset.fallbackEmail;

  const messages = {
    valueMissing: (label) => `Bitte ${label} ausfüllen.`,
    typeMismatch: () => "Bitte eine gültige E-Mail-Adresse angeben, z. B. name@schule.ch.",
    selectMissing: () => "Bitte ein Thema auswählen.",
  };

  form.noValidate = true;

  const labelFor = (field) =>
    form.querySelector(`label[for="${field.id}"]`)?.firstChild?.textContent.trim() ?? "dieses Feld";

  const errorFor = (field) => document.getElementById(`${field.id}-error`);

  const showFieldError = (field, text) => {
    const error = errorFor(field);
    field.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = text;
      error.hidden = false;
    }
  };

  const clearFieldError = (field) => {
    const error = errorFor(field);
    field.removeAttribute("aria-invalid");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  };

  const validateField = (field) => {
    if (field.validity.valid) {
      clearFieldError(field);
      return true;
    }
    let text;
    if (field.tagName === "SELECT") text = messages.selectMissing();
    else if (field.validity.typeMismatch) text = messages.typeMismatch();
    else text = messages.valueMissing(labelFor(field));
    showFieldError(field, text);
    return false;
  };

  const requiredFields = [...form.querySelectorAll("[required]")];

  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.value !== "") validateField(field);
    });
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  const setStatus = (type, text) => {
    status.className = `form-status form-status--${type} mb-4`;
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

    const invalid = requiredFields.filter((field) => !validateField(field));
    if (invalid.length > 0) {
      setStatus("error", `Bitte ${invalid.length === 1 ? "ein Feld" : `${invalid.length} Felder`} korrigieren.`);
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
        setStatus("success", "Danke! Eure Nachricht ist bei uns angekommen. Wir melden uns innerhalb von 48 Stunden.");
        status.focus?.();
        return;
      }

      // Falls der Dienst die AJAX-Übermittlung ablehnt, klassisch absenden.
      if (response.status !== 422) {
        HTMLFormElement.prototype.submit.call(form);
        return;
      }

      setStatus(
        "error",
        `Die Nachricht konnte nicht gesendet werden. Bitte prüft eure Eingaben oder schreibt direkt an ${fallbackEmail}.`,
      );
    } catch {
      setStatus(
        "error",
        `Die Verbindung ist fehlgeschlagen. Bitte versucht es später erneut oder schreibt direkt an ${fallbackEmail}.`,
      );
    } finally {
      setBusy(false);
    }
  });
})();
