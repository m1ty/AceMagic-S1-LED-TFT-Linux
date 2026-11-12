#!/bin/bash
# Использование: ./install_clock.sh /путь/к/s1panel [clock_landscape.json|clock_digital.json]
set -e
S1="${1:?укажите путь к папке s1panel}"
HERE="$(cd "$(dirname "$0")" && pwd)"      # .../themes/clock
SRC="$(cd "$HERE/../.." && pwd)"             # корень s1panel в репозитории
[ -f "$S1/main.js" ] || { echo "в $S1 нет main.js"; exit 1; }
apt-get install -y fonts-dejavu-core fonts-montserrat fonts-dseg >/dev/null
mkdir -p /usr/local/share/fonts/oswald
[ -s /usr/local/share/fonts/oswald/Oswald.ttf ] || curl -fsSL -o /usr/local/share/fonts/oswald/Oswald.ttf "https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf"
fc-cache -f
cp "$S1/config.json" "$S1/config.json.bak.$(date +%s)"
mkdir -p "$S1/themes/clock"
cp "$SRC/sensors/clock_ru.js" "$S1/sensors/"
cp "$SRC/widgets/text_alert.js" "$SRC/widgets/seg_clock.js" "$S1/widgets/"
cp "$HERE"/*.json "$HERE/bg.png" "$S1/themes/clock/"
node -e '
const fs=require("fs"),p=process.argv[1]+"/config.json",c=JSON.parse(fs.readFileSync(p));
if(!c.sensors.some(s=>s.module==="sensors/clock_ru.js")) c.sensors.unshift({module:"sensors/clock_ru.js"});
for(const m of ["sensors/cpu_temp.js","sensors/cpu_power.js"]){ if(!c.sensors.some(s=>s.module===m)) c.sensors.push({module:m,config:{max_points:300}}); }
c.sensors.forEach(s=>{ if(s.module==="sensors/cpu_temp.js"){ s.config=s.config||{}; s.config.fahrenheit=false; } });
for(const m of ["widgets/text_alert.js","widgets/seg_clock.js"]) if(!c.widgets.includes(m)) c.widgets.push(m);
const t="themes/clock/"+(process.argv[2]||"clock_landscape.json");
for(const [f,n] of [["clock_landscape.json","Часы (landscape)"],["clock_digital.json","Часы (электронные)"]]){
  const cf="themes/clock/"+f; if(!c.theme_list.some(x=>x.config===cf)) c.theme_list.push({name:n,config:cf}); }
c.theme=t; c.portrait=false;
fs.writeFileSync(p,JSON.stringify(c,null,3));' "$S1" "$2"
systemctl restart s1panel 2>/dev/null || echo "перезапустите s1panel вручную"
echo "Готово. Логи: journalctl -u s1panel -f"
