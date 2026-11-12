# Clock themes for s1panel

Two landscape clock themes for the 320x170 LCD, with Russian date and CPU temperature / power in the bottom corners.

| Theme | File | Look |
|---|---|---|
| Digital clock | `clock_digital.json` | 7-segment cyan digits (DSEG7 Classic) with dim unlit segments (`88:88`) behind them |
| Clock (landscape) | `clock_landscape.json` | big white Oswald digits |

Both use the gradient background `bg.png` (dithered, so there is no banding on the RGB565 panel).

## What is added

| File | Purpose |
|---|---|
| `sensors/clock_ru.js` | sensor `clock_ru`: zero-padded `HH:MM`, Russian weekday and date |
| `widgets/text_alert.js` | widget `text_alert`: text that changes color above a threshold (used for CPU temperature) |
| `widgets/seg_clock.js` | widget `seg_clock`: draws 7-segment digits itself, with a 3-segment seven (DSEG's seven has 4 segments). Not used by the shipped themes |
| `themes/clock/*.json`, `bg.png` | the themes and the background |
| `themes/clock/install_clock.sh` | installer (see below) |
| `themes/clock/tools/` | `make_bg.py` regenerates `bg.png` (needs Pillow); `render_seg.js` renders `seg_clock` to a PNG using the panel's own canvas |

## Layout (both themes)

| Place | Widget | Format |
|---|---|---|
| center | time | `clock_ru` `{0}` |
| bottom, center | weekday and date, e.g. "Четверг, 12 ноября" | `clock_ru` `{9}` (Oswald 20px) |
| bottom-left corner | CPU temperature | `cpu_temp` `{0}°{2}` with `text_alert`: cyan, orange from 70 °C, red from 85 °C |
| bottom-right corner | CPU power | `cpu_power` `{0} W` |

The longest Russian date ("Воскресенье, 30 сентября") is about 209 px wide in Oswald 20px and fits between the corner labels; Montserrat would be too wide.

### `clock_ru` tokens

`{0}` `21:37` · `{1}` seconds · `{2}` `СРЕДА` · `{3}` `Ср` · `{4}` `11 ноября` · `{5}` `11 ноября 2026` · `{6}` `11.11.2026` · `{7}` hours · `{8}` minutes · `{9}` `Среда, 11 ноября`

### `text_alert` fields

Same as `text`, plus `warn` / `warn_color` and `crit` / `crit_color`. The first number in the value is compared: `>= crit` uses `crit_color`, `>= warn` uses `warn_color`, otherwise `color`.

### `seg_clock` fields

`color`, `off_color`, `digit_height` (px), `thickness` (% of height), `skew` (0..0.3), `glow` (px), `blink` (blinking colon).

## Fonts

| Font | Used for | How to get it |
|---|---|---|
| Oswald | digits (landscape theme), date and corner labels | no Debian package; the installer downloads it from Google Fonts (OFL) into `/usr/local/share/fonts/oswald/` |
| DSEG7 Classic | digits (digital theme) | `apt install fonts-dseg` |
| Montserrat, DejaVu Sans | fallbacks | `apt install fonts-montserrat fonts-dejavu-core` |

If a font is missing, canvas silently falls back to another one and the theme looks different.

## Install

Needs a running s1panel systemd service, `node`, `apt` and internet access (for Oswald). Run as root from the repository:

```
cd s1panel/themes/clock
sudo ./install_clock.sh /path/to/s1panel [clock_digital.json|clock_landscape.json]
```

The first argument is the directory the service runs from (`systemctl cat s1panel | grep WorkingDirectory`). Without the second argument the landscape theme becomes active.

The script installs the fonts, backs up `config.json` (`config.json.bak.<time>`), copies the sensor, widgets, themes and background, and edits `config.json`: adds the `clock_ru`, `cpu_temp` and `cpu_power` sensors if missing, sets `cpu_temp.fahrenheit=false`, registers both widgets and both themes, activates the chosen theme and restarts `s1panel`. It is safe to run again, and it is also how you switch between the themes.

## Customizing

Positions, colors and fonts are easiest to change in the s1panel web GUI (port 8686) and then Save. `rect` coordinates are for the 320x170 canvas, origin at the top left; widgets are drawn in ascending `id` order. The `text` widget draws from the top of the font's em box, so different fonts put their digits at different heights, so check the preview. The landscape theme uses a negative `y` for the time because Oswald has a tall top bearing above the digits.

## Troubleshooting

| Symptom | Check |
|---|---|
| Wrong time | the time comes from the system: `timedatectl set-timezone <Zone>` |
| Wrong font | `fc-match "Oswald:bold"`, `fc-match "DSEG7 Classic:bold"`; after installing a font run `fc-cache -f` and restart the service |
| Old theme on the panel | check `"theme"` in `config.json` and restart the service |
| Corner shows `0 W` or nothing | `cpu_power` needs access to the CPU energy counter (RAPL); see the s1panel log |
| Temperature in °F | `sensors/cpu_temp.js` needs `"fahrenheit": false` in `config.json` |
| `text_alert` / `seg_clock` not drawn | the log must contain `widget text_alert loaded` / `widget seg_clock loaded` |

## Known limitations

- Checked only in the s1panel web preview, not photographed on the real panel; RGB565 colors may differ slightly.
- The color switch of `text_alert` was tested with a unit test of the widget, not observed live.
