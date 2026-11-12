'use strict';
/*!
 * s1panel - widget/text_alert
 * GPL-3 Licensed
 */
/* s1panel widget: text_alert — текст, меняющий цвет по порогу.
 * Из значения берётся первое число: >= crit -> crit_color, >= warn -> warn_color, иначе color.
 */
function pick_color(value, config) {
    const _num = parseFloat(String(value).replace(',', '.'));
    if (!isNaN(_num)) {
        if (config.crit !== undefined && _num >= Number(config.crit)) {
            return config.crit_color || '#ff4d4d';
        }
        if (config.warn !== undefined && _num >= Number(config.warn)) {
            return config.warn_color || '#ff9f43';
        }
    }
    return config.color || 'white';
}

function draw(context, value, min, max, config) {
    return new Promise(fulfill => {
        if (!config._private) {
            config._private = {};
        }
        const _private = config._private;
        const _rect = config.rect;
        const _color = pick_color(value, config);
        const _key = value + '|' + _color;
        const _has_changed = _private.last_value !== _key;

        context.save();
        context.beginPath();
        context.rect(_rect.x, _rect.y, _rect.width, _rect.height);
        context.clip();

        context.font = config.font || '20px Arial';
        context.fillStyle = _color;
        context.textAlign = 'left';
        context.textBaseline = 'top';

        const _width = context.measureText(value).width;
        var _offset = 0;
        if (config.align === 'center') {
            _offset = (_rect.width - _width) / 2;
        }
        else if (config.align === 'right') {
            _offset = _rect.width - _width;
        }
        context.fillText(value, _rect.x + _offset, _rect.y);

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
        name: 'text_alert',
        description: 'Text that changes color above a threshold',
        fields: [
            { name: 'font', value: 'font' },
            { name: 'color', value: 'color' },
            { name: 'align', value: 'list:left,center,right' },
            { name: 'warn', value: 'number' },
            { name: 'warn_color', value: 'color' },
            { name: 'crit', value: 'number' },
            { name: 'crit_color', value: 'color' }
        ]
    };
}

module.exports = { info, draw };
