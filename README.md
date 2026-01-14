# AV Events Post Maker

A minimal, user-friendly HTML + JavaScript tool to compose a centered grid layout and export it as a PNG for Instagram.

## Use
1. Open `index.html` in your browser.
2. Set the grid rows/columns.
3. Add events and fill in city, date, street, and hours.
4. Set a background image (URL or upload).
5. Click **Download PNG**.

## Customize
- Font: edit `--font-card` in `style.css` to set the font for all four fields.
- City color: edit `--city-color` in `style.css`.
- Card size: `--card-width` and `--card-height` in `style.css`.
- Grid scaling: the app auto-adjusts type size based on rows/columns in `app.js`.
- Header/Footer: toggle and edit text in the panel; colors are `--header-text` and `--footer-text`.
- Card colors: `--card-bg` for background and `--card-text` for default text.
- Grid offset: sliders move the event grid on x/y using `--grid-offset-x` and `--grid-offset-y`.
- Typography: adjust max event size with the slider or `--event-font-max`.
- Row spacing: adjust with slider or number input (`--grid-row-gap`).
- Column spacing: adjust with slider or number input (`--grid-column-gap`).
- Presets: save, export JSON, or copy/apply the current JSON from the presets panel.
- Sections: every panel section is collapsible and remembers its open/closed state.
- Sample preset: a built-in “sample” preset is always available and loads by default on first use.
- Help: the ? button opens a quick workflow tip for copy/paste editing via ChatGPT.

## Notes
- If a background URL does not download in the PNG, use an uploaded image instead (some hosts block CORS).
