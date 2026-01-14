const $ = (id) => document.getElementById(id);

const gridColsInput = $("grid-cols");
const gridRowsInput = $("grid-rows");
const eventsContainer = $("events");
const addEventButton = $("add-event");
const presetNameInput = $("preset-name");
const savePresetButton = $("save-preset");
const clearStateButton = $("clear-state");
const presetsList = $("presets-list");
const presetJsonInput = $("preset-json");
const importPresetButton = $("import-preset");
const gridOffsetXInput = $("grid-offset-x");
const gridOffsetYInput = $("grid-offset-y");
const gridOffsetXValue = $("grid-offset-x-value");
const gridOffsetYValue = $("grid-offset-y-value");
const gridRowGapInput = $("grid-row-gap");
const gridRowGapValue = $("grid-row-gap-value");
const gridColumnGapInput = $("grid-column-gap");
const gridColumnGapValue = $("grid-column-gap-value");
const fontMaxInput = $("font-max");
const fontMaxValue = $("font-max-value");
const headerEnabledInput = $("header-enabled");
const headerTextInput = $("header-text");
const footerEnabledInput = $("footer-enabled");
const footerTextInput = $("footer-text");
const grid = $("grid");
const card = $("card");
const headerRow = $("header-row");
const footerRow = $("footer-row");
const bgUrlInput = $("bg-url");
const bgFileInput = $("bg-file");
const downloadButton = $("download");
const sections = document.querySelectorAll(".section");

const STORAGE_KEY = "instagram-post-maker:v1";
const PRESETS_KEY = "instagram-post-maker:presets:v1";
const SECTION_STATE_KEY = "instagram-post-maker:sections:v1";

const DEFAULT_STATE = {
  grid: {
    cols: Number(gridColsInput.value) || 2,
    rows: Number(gridRowsInput.value) || 2,
  },
  events: [
    {
      city: "Lisbon",
      date: "17/01",
      street: "Rua das Flores",
      hours: "15:30 - 18:30",
    },
  ],
  header: {
    enabled: false,
    text: "",
  },
  footer: {
    enabled: false,
    text: "",
  },
  layout: {
    offsetX: 0,
    offsetY: 0,
    fontMax: 60,
    rowGap: 20,
    columnGap: 28,
  },
  background: "",
  fontBase: 60,
};

const cloneState = (source) => JSON.parse(JSON.stringify(source));

const state = cloneState(DEFAULT_STATE);

const clampNumber = (value, min, max) => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

const parseNumber = (value, fallbackValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
};

const getCssNumber = (name, fallbackValue) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
};

const fallback = (value, fallbackValue) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallbackValue;
};

const sanitizeInlineText = (value) => value.replace(/[\r\n]+/g, " ");

const saveState = () => {
  const payload = {
    grid: state.grid,
    events: state.events,
    header: state.header,
    footer: state.footer,
    layout: state.layout,
    background: state.background,
    backgroundUrlInput: bgUrlInput.value,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save state", error);
  }
};

const saveSectionState = () => {
  const payload = {};
  sections.forEach((section) => {
    const key = section.dataset.section;
    if (key) {
      payload[key] = section.open;
    }
  });

  try {
    localStorage.setItem(SECTION_STATE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save section state", error);
  }
};

const loadSectionState = () => {
  try {
    const raw = localStorage.getItem(SECTION_STATE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    sections.forEach((section) => {
      const key = section.dataset.section;
      if (key && Object.prototype.hasOwnProperty.call(parsed, key)) {
        section.open = Boolean(parsed[key]);
      }
    });
  } catch (error) {
    console.warn("Failed to load section state", error);
  }
};

const applyState = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }

  const cols = clampNumber(Number(payload.grid?.cols), 1, 6);
  const rows = clampNumber(Number(payload.grid?.rows), 1, 6);
  state.grid = { cols, rows };

  if (Array.isArray(payload.events) && payload.events.length > 0) {
    state.events = payload.events.map((eventData) => ({
      city: eventData.city || "",
      date: eventData.date || "",
      street: eventData.street || "",
      hours: eventData.hours || "",
    }));
  } else {
    state.events = cloneState(DEFAULT_STATE.events);
  }

  state.header = {
    enabled: Boolean(payload.header?.enabled),
    text: payload.header?.text || "",
  };
  state.footer = {
    enabled: Boolean(payload.footer?.enabled),
    text: payload.footer?.text || "",
  };
  state.layout = {
    offsetX: clampNumber(
      parseNumber(payload.layout?.offsetX, DEFAULT_STATE.layout.offsetX),
      -200,
      200
    ),
    offsetY: clampNumber(
      parseNumber(payload.layout?.offsetY, DEFAULT_STATE.layout.offsetY),
      -200,
      200
    ),
    fontMax: clampNumber(
      parseNumber(payload.layout?.fontMax, DEFAULT_STATE.layout.fontMax),
      24,
      120
    ),
    rowGap: clampNumber(
      parseNumber(payload.layout?.rowGap, DEFAULT_STATE.layout.rowGap),
      0,
      80
    ),
    columnGap: clampNumber(
      parseNumber(payload.layout?.columnGap, DEFAULT_STATE.layout.columnGap),
      0,
      80
    ),
  };

  state.background = typeof payload.background === "string" ? payload.background : "";

  gridColsInput.value = state.grid.cols;
  gridRowsInput.value = state.grid.rows;
  bgUrlInput.value =
    typeof payload.backgroundUrlInput === "string" ? payload.backgroundUrlInput : "";
  bgFileInput.value = "";
  headerEnabledInput.checked = state.header.enabled;
  headerTextInput.value = state.header.text;
  headerTextInput.disabled = !state.header.enabled;
  footerEnabledInput.checked = state.footer.enabled;
  footerTextInput.value = state.footer.text;
  footerTextInput.disabled = !state.footer.enabled;
  gridOffsetXInput.value = state.layout.offsetX;
  gridOffsetYInput.value = state.layout.offsetY;
  fontMaxInput.value = state.layout.fontMax;
  gridRowGapInput.value = state.layout.rowGap;
  gridColumnGapInput.value = state.layout.columnGap;
  applyLayout();
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      applyState(DEFAULT_STATE);
      return;
    }

    const parsed = JSON.parse(raw);
    applyState(parsed);
  } catch (error) {
    console.warn("Failed to load state", error);
    applyState(DEFAULT_STATE);
  }
};

const loadPresets = () => {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to load presets", error);
    return [];
  }
};

const savePresets = (presets) => {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn("Failed to save presets", error);
  }
};

const renderPresets = () => {
  const presets = loadPresets();
  presetsList.innerHTML = "";

  if (presets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No presets saved yet.";
    presetsList.appendChild(empty);
    return;
  }

  presets.forEach((preset) => {
    const item = document.createElement("div");
    item.className = "preset-item";
    item.dataset.name = preset.name;

    const name = document.createElement("span");
    name.className = "preset-name";
    name.textContent = preset.name;

    const controls = document.createElement("div");
    controls.className = "preset-controls";

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.textContent = "Load";
    loadButton.dataset.action = "load";

    const exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.textContent = "Export";
    exportButton.dataset.action = "export";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "danger";
    deleteButton.dataset.action = "delete";

    controls.appendChild(loadButton);
    controls.appendChild(exportButton);
    controls.appendChild(deleteButton);

    item.appendChild(name);
    item.appendChild(controls);
    presetsList.appendChild(item);
  });
};

const updateFontScale = () => {
  const maxDimension = Math.max(state.grid.cols, state.grid.rows);
  const maxSize = Number.isFinite(state.layout.fontMax)
    ? state.layout.fontMax
    : getCssNumber("--event-font-max", 60);
  const size = Math.min(Math.round(140 / maxDimension), maxSize);
  document.documentElement.style.setProperty("--event-font-size", `${size}px`);
  state.fontBase = size;
};

const updateGridColumnWidth = () => {
  const gridStyles = getComputedStyle(grid);
  const gap = parseFloat(gridStyles.columnGap) || 0;
  const cols = state.grid.cols;
  const width = grid.clientWidth;

  if (!width || cols <= 0) {
    return;
  }

  const colWidth = (width - gap * (cols - 1)) / cols;
  grid.style.setProperty("--grid-col-width", `${colWidth}px`);
};

const applyLayout = () => {
  document.documentElement.style.setProperty(
    "--grid-offset-x",
    `${state.layout.offsetX}px`
  );
  document.documentElement.style.setProperty(
    "--grid-offset-y",
    `${state.layout.offsetY}px`
  );
  document.documentElement.style.setProperty(
    "--event-font-max",
    `${state.layout.fontMax}px`
  );
  document.documentElement.style.setProperty(
    "--grid-row-gap",
    `${state.layout.rowGap}px`
  );
  document.documentElement.style.setProperty(
    "--grid-column-gap",
    `${state.layout.columnGap}px`
  );
  gridOffsetXValue.textContent = `${state.layout.offsetX}px`;
  gridOffsetYValue.textContent = `${state.layout.offsetY}px`;
  fontMaxValue.textContent = `${state.layout.fontMax}px`;
  gridRowGapValue.textContent = `${state.layout.rowGap}px`;
  gridColumnGapValue.textContent = `${state.layout.columnGap}px`;
};

const fitLineToWidth = (line, baseSize) => {
  line.style.fontSize = `${baseSize}px`;
  const parent = line.parentElement;
  if (!parent) {
    return;
  }

  const availableWidth = parent.clientWidth;
  const width = line.scrollWidth;
  if (!availableWidth || !width) {
    return;
  }

  if (width <= availableWidth) {
    return;
  }

  const scale = Math.min(1, availableWidth / width);
  const adjusted = Math.max(1, Math.floor(baseSize * scale));
  line.style.fontSize = `${adjusted}px`;
};

const fitEventText = () => {
  const baseSize = state.fontBase || getCssNumber("--event-font-size", 70);
  const events = grid.querySelectorAll(".event");

  events.forEach((event) => {
    const lines = event.querySelectorAll(".event-line");
    if (lines.length === 0) {
      return;
    }

    lines.forEach((line) => fitLineToWidth(line, baseSize));
  });

  if (!headerRow.hidden) {
    fitLineToWidth(headerRow, baseSize);
  }

  if (!footerRow.hidden) {
    fitLineToWidth(footerRow, baseSize);
  }
};

const renderGrid = () => {
  grid.style.gridTemplateColumns = `repeat(${state.grid.cols}, minmax(0, 1fr))`;
  grid.style.gridTemplateRows = `repeat(${state.grid.rows}, auto)`;
  updateFontScale();
};

const renderPreview = () => {
  grid.innerHTML = "";
  const maxEvents = state.grid.cols * state.grid.rows;
  const visibleEvents = state.events.slice(0, maxEvents);
  const remainder = visibleEvents.length % state.grid.cols;
  const lastRowStart = visibleEvents.length - remainder;
  const rowGroup =
    remainder > 0 && visibleEvents.length > 0
      ? document.createElement("div")
      : null;

  if (rowGroup) {
    rowGroup.className = "row-group";
  }

  visibleEvents.forEach((eventData, index) => {
    const event = document.createElement("div");
    event.className = "event";

    const lines = [
      { key: "city", className: "event-line city", fallback: "City" },
      { key: "date", className: "event-line", fallback: "00/00" },
      { key: "street", className: "event-line", fallback: "Street" },
      { key: "hours", className: "event-line", fallback: "00:00 - 00:00" },
    ];

    lines.forEach((line) => {
      const lineEl = document.createElement("div");
      lineEl.className = line.className;
      lineEl.textContent = fallback(eventData[line.key] || "", line.fallback);
      lineEl.contentEditable = "true";
      lineEl.spellcheck = false;
      lineEl.dataset.eventIndex = String(index);
      lineEl.dataset.field = line.key;
      event.appendChild(lineEl);
    });

    if (rowGroup && index >= lastRowStart) {
      rowGroup.appendChild(event);
    } else {
      grid.appendChild(event);
    }
  });

  if (rowGroup) {
    grid.appendChild(rowGroup);
  }

  headerRow.textContent = state.header.text;
  headerRow.hidden = !state.header.enabled;
  headerRow.contentEditable = state.header.enabled ? "true" : "false";
  headerRow.spellcheck = false;
  footerRow.textContent = state.footer.text;
  footerRow.hidden = !state.footer.enabled;
  footerRow.contentEditable = state.footer.enabled ? "true" : "false";
  footerRow.spellcheck = false;

  requestAnimationFrame(() => {
    updateGridColumnWidth();
    fitEventText();
  });
};

const renderEditors = () => {
  eventsContainer.innerHTML = "";

  state.events.forEach((eventData, index) => {
    const editor = document.createElement("div");
    editor.className = "event-editor";
    editor.dataset.index = index;

    const header = document.createElement("div");
    header.className = "event-editor-header";

    const title = document.createElement("h3");
    title.className = "event-editor-title";
    title.textContent = `Event ${index + 1}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "event-editor-remove";
    removeButton.textContent = "Remove";
    removeButton.dataset.action = "remove";

    header.appendChild(title);
    header.appendChild(removeButton);

    const fields = document.createElement("div");
    fields.className = "event-editor-grid";

    const createField = (labelText, fieldKey, maxLength) => {
      const label = document.createElement("label");
      label.className = "field";

      const span = document.createElement("span");
      span.textContent = labelText;

      const input = document.createElement("input");
      input.type = "text";
      input.value = eventData[fieldKey] || "";
      input.maxLength = maxLength;
      input.dataset.field = fieldKey;

      label.appendChild(span);
      label.appendChild(input);

      return label;
    };

    fields.appendChild(createField("City", "city", 40));
    fields.appendChild(createField("Date", "date", 10));
    fields.appendChild(createField("Street", "street", 40));
    fields.appendChild(createField("Hours", "hours", 20));

    editor.appendChild(header);
    editor.appendChild(fields);
    eventsContainer.appendChild(editor);
  });
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

  saveState();
};

const updateGridFromInputs = () => {
  const cols = clampNumber(Number(gridColsInput.value), 1, 6);
  const rows = clampNumber(Number(gridRowsInput.value), 1, 6);
  state.grid.cols = cols;
  state.grid.rows = rows;
  gridColsInput.value = cols;
  gridRowsInput.value = rows;
  renderGrid();
  renderPreview();
  saveState();
};

const addEvent = () => {
  state.events.push({
    city: "",
    date: "",
    street: "",
    hours: "",
  });
  renderEditors();
  renderPreview();
  saveState();
};

const removeEvent = (index) => {
  state.events.splice(index, 1);
  renderEditors();
  renderPreview();
  saveState();
};

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

gridColsInput.addEventListener("input", updateGridFromInputs);

gridRowsInput.addEventListener("input", updateGridFromInputs);

gridOffsetXInput.addEventListener("input", (event) => {
  state.layout.offsetX = clampNumber(Number(event.target.value), -200, 200);
  applyLayout();
  saveState();
});

gridOffsetYInput.addEventListener("input", (event) => {
  state.layout.offsetY = clampNumber(Number(event.target.value), -200, 200);
  applyLayout();
  saveState();
});

gridRowGapInput.addEventListener("input", (event) => {
  state.layout.rowGap = clampNumber(Number(event.target.value), 0, 80);
  applyLayout();
  renderPreview();
  saveState();
});

gridColumnGapInput.addEventListener("input", (event) => {
  state.layout.columnGap = clampNumber(Number(event.target.value), 0, 80);
  applyLayout();
  renderPreview();
  saveState();
});

fontMaxInput.addEventListener("input", (event) => {
  state.layout.fontMax = clampNumber(Number(event.target.value), 24, 120);
  applyLayout();
  updateFontScale();
  renderPreview();
  saveState();
});

addEventButton.addEventListener("click", addEvent);

headerEnabledInput.addEventListener("change", (event) => {
  state.header.enabled = event.target.checked;
  headerTextInput.disabled = !state.header.enabled;
  renderPreview();
  saveState();
});

headerTextInput.addEventListener("input", (event) => {
  state.header.text = event.target.value;
  renderPreview();
  saveState();
});

footerEnabledInput.addEventListener("change", (event) => {
  state.footer.enabled = event.target.checked;
  footerTextInput.disabled = !state.footer.enabled;
  renderPreview();
  saveState();
});

footerTextInput.addEventListener("input", (event) => {
  state.footer.text = event.target.value;
  renderPreview();
  saveState();
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.classList.contains("event-line")) {
    return;
  }
  event.preventDefault();
});

grid.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.classList.contains("event-line")) {
    return;
  }

  const index = Number(target.dataset.eventIndex);
  const field = target.dataset.field;
  if (!Number.isFinite(index) || !field) {
    return;
  }

  const cleaned = sanitizeInlineText(target.textContent || "");
  if (cleaned !== target.textContent) {
    target.textContent = cleaned;
  }

  if (!state.events[index]) {
    return;
  }

  state.events[index][field] = cleaned;
  const editorInput = eventsContainer.querySelector(
    `.event-editor[data-index="${index}"] input[data-field="${field}"]`
  );
  if (editorInput) {
    editorInput.value = cleaned;
  }
  fitLineToWidth(target, state.fontBase);
  saveState();
});

const handleRowEdit = (rowType, event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const cleaned = sanitizeInlineText(target.textContent || "");
  if (cleaned !== target.textContent) {
    target.textContent = cleaned;
  }
  state[rowType].text = cleaned;
  if (rowType === "header") {
    headerTextInput.value = cleaned;
  } else {
    footerTextInput.value = cleaned;
  }
  fitLineToWidth(target, state.fontBase);
  saveState();
};

const preventRowNewline = (event) => {
  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
};

headerRow.addEventListener("keydown", preventRowNewline);
footerRow.addEventListener("keydown", preventRowNewline);
headerRow.addEventListener("input", handleRowEdit.bind(null, "header"));
footerRow.addEventListener("input", handleRowEdit.bind(null, "footer"));

eventsContainer.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const field = target.dataset.field;
  if (!field) {
    return;
  }

  const editor = target.closest(".event-editor");
  if (!editor) {
    return;
  }

  const index = Number(editor.dataset.index);
  const eventData = state.events[index];
  if (!eventData) {
    return;
  }

  eventData[field] = target.value;
  renderPreview();
  saveState();
});

eventsContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.dataset.action !== "remove") {
    return;
  }

  const editor = target.closest(".event-editor");
  if (!editor) {
    return;
  }

  const index = Number(editor.dataset.index);
  if (Number.isNaN(index)) {
    return;
  }

  removeEvent(index);
});

savePresetButton.addEventListener("click", () => {
  const name = presetNameInput.value.trim();
  if (!name) {
    alert("Please provide a preset name.");
    return;
  }

  const presets = loadPresets();
  const payload = {
    name,
    data: {
      grid: state.grid,
      events: state.events,
      header: state.header,
      footer: state.footer,
      background: state.background,
      backgroundUrlInput: bgUrlInput.value,
    },
    savedAt: new Date().toISOString(),
  };

  const existingIndex = presets.findIndex((preset) => preset.name === name);
  if (existingIndex >= 0) {
    presets[existingIndex] = payload;
  } else {
    presets.push(payload);
  }

  savePresets(presets);
  renderPresets();

  applyState(data);
  renderEditors();
  renderGrid();
  renderPreview();
  setBackground(state.background);
  saveState();
  presetNameInput.value = name;
});

presetsList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const item = target.closest(".preset-item");
  if (!item) {
    return;
  }

  const presetName = item.dataset.name;
  if (!presetName) {
    return;
  }

  const presets = loadPresets();
  const preset = presets.find((entry) => entry.name === presetName);
  if (!preset) {
    return;
  }

  if (target.dataset.action === "delete") {
    const updated = presets.filter((entry) => entry.name !== presetName);
    savePresets(updated);
    renderPresets();
    return;
  }

  if (target.dataset.action === "export") {
    presetJsonInput.value = JSON.stringify(
      { name: preset.name, data: preset.data },
      null,
      2
    );
    return;
  }

  if (target.dataset.action === "load") {
    applyState(preset.data);
    renderEditors();
    renderGrid();
    renderPreview();
    if (state.background) {
      setBackground(state.background);
    }
    saveState();
  }
});

clearStateButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  applyState(DEFAULT_STATE);
  renderEditors();
  renderGrid();
  renderPreview();
  setBackground(state.background);
});

importPresetButton.addEventListener("click", () => {
  const raw = presetJsonInput.value.trim();
  console.log("[preset-import] raw length", raw.length);
  if (!raw) {
    alert("Paste preset JSON first.");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("[preset-import] JSON parse error", error);
    alert("Invalid JSON.");
    return;
  }
  console.log("[preset-import] parsed", parsed);

  const data =
    parsed && typeof parsed === "object" && parsed.data ? parsed.data : parsed;
  const inputName = presetNameInput.value.trim();
  const name =
    parsed && typeof parsed === "object" && parsed.name
      ? parsed.name
      : inputName || `Imported preset ${Date.now()}`;

  if (!data || typeof data !== "object") {
    alert("Preset JSON is missing data.");
    return;
  }
  console.log("[preset-import] resolved name", name);
  console.log("[preset-import] data", data);

  const presets = loadPresets();
  const payload = {
    name,
    data,
    savedAt: new Date().toISOString(),
  };

  const existingIndex = presets.findIndex((preset) => preset.name === name);
  if (existingIndex >= 0) {
    presets[existingIndex] = payload;
  } else {
    presets.push(payload);
  }

  savePresets(presets);
  renderPresets();

  console.log("[preset-import] applying preset");
  applyState(data);
  renderEditors();
  renderGrid();
  renderPreview();
  setBackground(state.background);
  saveState();
  presetNameInput.value = name;
  console.log("[preset-import] done");
});

sections.forEach((section) => {
  section.addEventListener("toggle", saveSectionState);
});

const makeFilename = () => {
  const seed = state.events
    .slice(0, 2)
    .map((eventData) => eventData.city || eventData.street)
    .filter(Boolean)
    .join("_");

  const slug = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    fitEventText();
  });
}

loadState();
renderEditors();
renderGrid();
renderPreview();
if (state.background) {
  setBackground(state.background);
}
renderPresets();
loadSectionState();
