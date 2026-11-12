'use strict';
/*!
 * s1panel - widget/seg_clock
 * GPL-3 Licensed
 */
/* s1panel widget: seg_clock — рисованные 7-сегментные цифры (семёрка в 3 сегмента).
 * Значение — строка вида "21:37" (цифры, ':' и пробел). Погасшие сегменты рисуются тусклым цветом.
 * Поля: color, off_color, digit_height (px), thickness (% высоты), skew (наклон, 0..0.3),
 *       glow (размытие свечения, px), blink (мигающее двоеточие).
 */
const SEGMENTS = {
    '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
    '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'
};

function num(v, dflt) {
    const n = Number(v);
    return isNaN(n) || v === undefined || v === '' ? dflt : n;
}

/* горизонтальный сегмент: от x0 до x1 по линии y, толщина t, концы заострены */
function hbar(x0, x1, y, t) {
    return [[x0, y], [x0 + t / 2, y - t / 2], [x1 - t / 2, y - t / 2], [x1, y], [x1 - t / 2, y + t / 2], [x0 + t / 2, y + t / 2]];
}

function vbar(x, y0, y1, t) {
    return [[x, y0], [x + t / 2, y0 + t / 2], [x + t / 2, y1 - t / 2], [x, y1], [x - t / 2, y1 - t / 2], [x - t / 2, y0 + t / 2]];
}

function digit_polygons(w, h, t, gap) {
    const l = t / 2, r = w - t / 2, top = t / 2, mid = h / 2, bot = h - t / 2;
    const g = gap + 0.5;
    return {
        a: hbar(l + g, r - g, top, t),
        g: hbar(l + g, r - g, mid, t),
        d: hbar(l + g, r - g, bot, t),
        f: vbar(l, top + g, mid - g, t),
        b: vbar(r, top + g, mid - g, t),
        e: vbar(l, mid + g, bot - g, t),
        c: vbar(r, mid + g, bot - g, t)
    };
}

function fill_poly(context, pts, ox, oy, h, skew) {
    context.beginPath();
    pts.forEach((p, i) => {
        const x = ox + p[0] + (h - p[1]) * skew;
        const y = oy + p[1];
        if (i === 0) { context.moveTo(x, y); } else { context.lineTo(x, y); }
    });
    context.closePath();
    context.fill();
}

function draw(context, value, min, max, config) {
    return new Promise(fulfill => {
        if (!config._private) {
            config._private = {};
        }
        const _private = config._private;
        const _rect = config.rect;
        const _text = String(value);
        const _colon_on = !config.blink || (new Date().getSeconds() % 2 === 0);
        const _key = _text + '|' + _colon_on;
        const _has_changed = _private.last_value !== _key;

        const _lit = config.color || '#3df0ff';
        const _off = config.off_color || '#0f2b36';
        const _skew = num(config.skew, 0);
        const _glow = num(config.glow, 0);

        // раскладка: цифры по 0.56 высоты, зазор 0.12, двоеточие 0.22
        var h = num(config.digit_height, _rect.height);
        const _items = _text.split('');
        const _layout = _items.map(c => c === ':' ? 0.22 : 0.56);
        const _spacing = 0.12;
        var _total = _layout.reduce((a, b) => a + b, 0) + _spacing * (_items.length - 1);
        const _usable = _rect.width - h * _skew;
        if (_total * h > _usable) {
            h = _usable / _total;
        }
        const _t = h * num(config.thickness, 13) / 100;
        const _gap = _t * 0.09;
        const _width = _total * h + h * _skew;
        var x = _rect.x + (_rect.width - _width) / 2;
        const y = _rect.y + (_rect.height - h) / 2;

        context.save();
        context.beginPath();
        context.rect(_rect.x, _rect.y, _rect.width, _rect.height);
        context.clip();

        _items.forEach((c, i) => {
            const _w = _layout[i] * h;
            if (c === ':') {
                const _d = _t * 1.05;
                [h * 0.32, h * 0.68].forEach(cy => {
                    context.fillStyle = _colon_on ? _lit : _off;
                    if (_colon_on && _glow) { context.shadowColor = _lit; context.shadowBlur = _glow; }
                    const _cx = x + _w / 2 + (h - cy) * _skew;
                    context.fillRect(_cx - _d / 2, y + cy - _d / 2, _d, _d);
                    context.shadowBlur = 0;
                });
            }
            else {
                const _poly = digit_polygons(_w, h, _t, _gap);
                const _on = SEGMENTS[c] || '';
                context.fillStyle = _off;
                Object.keys(_poly).forEach(s => fill_poly(context, _poly[s], x, y, h, _skew));
                context.fillStyle = _lit;
                if (_glow) { context.shadowColor = _lit; context.shadowBlur = _glow; }
                _on.split('').forEach(s => fill_poly(context, _poly[s], x, y, h, _skew));
                context.shadowBlur = 0;
            }
            x += _w + _spacing * h;
        });

        if (config.debug_frame) {
            context.lineWidth = 1;
            context.strokeStyle = 'red';
            context.rect(_rect.x, _rect.y, _rect.width, _rect.height);
            context.stroke();
        }
        context.restore();

        if (_has_changed) {
            _private.last_value = _key;
        }
        fulfill(_has_changed);
    });
}

function info() {
    return {
        name: 'seg_clock',
        description: 'Drawn 7-segment digits (3-segment seven)',
        fields: [
            { name: 'color', value: 'color' },
            { name: 'off_color', value: 'color' },
            { name: 'digit_height', value: 'number' },
            { name: 'thickness', value: 'number' },
            { name: 'skew', value: 'number' },
            { name: 'glow', value: 'number' },
            { name: 'blink', value: 'boolean' }
        ]
    };
}

module.exports = { info, draw };
