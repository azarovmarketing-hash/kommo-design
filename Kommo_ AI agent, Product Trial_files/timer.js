define([
    'backbone', 'moment'
], (Backbone, moment) => {
    return Backbone.View.extend({
        formats: {
            'm:s': '00:00'
        },
        initialize(options) {
            this.format = this.formats[options.format];
            this.timer = null;
            this.date_start = 0;
        },
        setTime() {
            let timestamp = moment().unix() - this.date_start;
            let hours = Math.floor(timestamp / 60 / 60);
            let minutes = Math.floor(timestamp / 60)  - (hours * 60);
            let seconds = timestamp % 60;

            const time = (hours > 0) ? [hours, minutes, seconds].map(this.convertUnitToString).join(':') : [minutes, seconds].map(this.convertUnitToString).join(':');

            this.update(time);
        },
        start() {
            this.timer = setInterval(() => {
                this.setTime();
            }, 1000);
        },
        update(text) {
            this.$el.text(text);
        },
        getTime(format) {
            switch (format) {
                case 'seconds':
                    const [minutes, seconds] = this.$el.text().split(':').map(this.convertUnitToNumber);
                    
                    return minutes * 60 + seconds;
            }
        },
        convertUnitToNumber(unit) {
            return +unit;
        },
        convertUnitToString(unit) {
            return `0${unit}`.slice(-2);
        },
        stop() {
            clearInterval(this.timer);
            this.update('00:00');
        },
        setDateStart(date_start) {
            this.date_start = date_start;
        },
        setEl($el) {
            this.$el = $el;
        },
    });
});