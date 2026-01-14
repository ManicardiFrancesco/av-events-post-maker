const $ = (id) => document.getElementById(id);

const fields = {
  city: $("city"),
  date: $("date"),
  street: $("street"),
  hours: $("hours"),
};

const preview = {
  city: $("preview-city"),
  date: $("preview-date"),
  street: $("preview-street"),
  hours: $("preview-hours"),
};

const card = $("card");
const bgUrlInput = $("bg-url");
const bgFileInput = $("bg-file");
const downloadButton = $("download");

const state = {
  city: fields.city.value,
  date: fields.date.value,
  street: fields.street.value,
  hours: fields.hours.value,
  background: "",
};

const fallback = (value, fallbackValue) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallbackValue;
};

const renderText = () => {
  preview.city.textContent = fallback(state.city, "City");
  preview.date.textContent = fallback(state.date, "00/00");
  preview.street.textContent = fallback(state.street, "Street Name");
  preview.hours.textContent = fallback(state.hours, "00:00 - 00:00");
};

const setBackground = (source) => {
  state.background = source;

  if (source) {
    card.style.backgroundImage = `url("${source}")`;
    card.classList.add("has-background");
  } else {
    card.style.backgroundImage = "";
    card.classList.remove("has-background");
  }
};

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener("input", (event) => {
    state[key] = event.target.value;
    renderText();
  });
});

bgUrlInput.addEventListener("input", (event) => {
  const value = event.target.value.trim();
  if (!value) {
    setBackground("");
    return;
  }
  bgFileInput.value = "";
  setBackground(value);
});

bgFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    bgUrlInput.value = "";
    setBackground(reader.result);
  };
  reader.readAsDataURL(file);
});

const makeFilename = () => {
  const parts = [state.city, state.date, state.street, state.hours]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .map((value) => value.replace(/[^a-z0-9]+/g, "-"))
    .map((value) => value.replace(/(^-|-$)/g, ""))
    .filter(Boolean);

  const slug = parts.slice(0, 3).join("_");
  return `${slug || "instagram-post"}.png`;
};

const downloadPng = async () => {
  if (!window.html2canvas) {
    alert("html2canvas failed to load.");
    return;
  }

  downloadButton.disabled = true;
  downloadButton.textContent = "Generating...";

  const clone = card.cloneNode(true);
  clone.style.transform = "none";
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  document.body.appendChild(clone);

  try {
    const canvas = await window.html2canvas(clone, {
      useCORS: true,
      backgroundColor: null,
      scale: 1,
    });

    const link = document.createElement("a");
    link.download = makeFilename();
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    alert("Something went wrong while generating the PNG.");
    console.error(error);
  } finally {
    clone.remove();
    downloadButton.disabled = false;
    downloadButton.textContent = "Download PNG";
  }
};

downloadButton.addEventListener("click", downloadPng);

renderText();
