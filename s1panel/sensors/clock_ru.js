'use strict';
/*!
 * s1panel - sensor/clock_ru
 * GPL-3 Licensed
 */
/* s1panel sensor: clock_ru — русские дата/время.
 * Токены: {0} ЧЧ:ММ  {1} СС  {2} ДЕНЬ НЕДЕЛИ  {3} Пн  {4} 11 ноября
 *         {5} 11 ноября 2026  {6} ДД.ММ.ГГГГ  {7} ЧЧ  {8} ММ
 */
const WD = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const WD_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const pad = n => String(n).padStart(2, '0');

function sample(rate, format) {
    return new Promise(fulfill => {
        const d = new Date();
        const out = format.replace(/{(\d+)}/g, (m, n) => {
            switch (n) {
                case '0': return pad(d.getHours()) + ':' + pad(d.getMinutes());
                case '1': return pad(d.getSeconds());
                case '2': return WD[d.getDay()].toUpperCase();
                case '3': return WD_SHORT[d.getDay()];
                case '4': return d.getDate() + ' ' + MON[d.getMonth()];
                case '5': return d.getDate() + ' ' + MON[d.getMonth()];
                case '6': return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
                case '7': return pad(d.getHours());
                case '8': return pad(d.getMinutes());
                case '9': return WD[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()];
                default: return 'undefined';
            }
        });
        fulfill({ value: out, min: 0, max: 0 });
    });
}
function init(config) { return 'clock_ru'; }
function stop() { return Promise.resolve(); }
function settings() {
    return { name: 'clock_ru', description: 'русские часы и дата', icon: 'pi-clock', multiple: false, ident: [], fields: [] };
}
module.exports = { init, settings, sample, stop };
