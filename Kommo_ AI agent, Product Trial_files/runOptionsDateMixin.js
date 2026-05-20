define([
    'moment'
], (moment) => {
    return function runOptionsDateMixin(target) {

        target.prototype.getDate = function() {
            let val = this.$el.find('input[name="sensei-robocode-planner-run-option-date"]').val();

            const dateFormat = this.getDateFormat();

            let date;

            try {
                date = moment(val, dateFormat);
            } catch {
                date = moment(val);
            }

            if (!date.isValid() || (new Date()) > date) {
                date = moment();
            }

            return date;
        };

        target.prototype.getDateTimeOptions = function() {
            let date = this.getDate();

            this.setTime(date);

            let now = moment();

            if (now >= date) {
                now.add(2, 'm');

                date = now;
            }

            date = this.convertDateToAccountTimezone(date);

            return {
                once_date: date.format('YYYY-MM-DD'),
                time: date.format('HH:mm')
            }
        };

        target.prototype.setTime = function(date) {
            const value = this.$el.find('#sensei-robocode-planner-run-option-time').val();

            const [hours, minutes] = value.split(':');

            date.hours(parseInt(hours));
            date.minutes(parseInt(minutes));
        }

        target.prototype.getTimeAccount = function() {

            let date = this.getDate();

            this.setTime(date);

            date = this.convertDateToAccountTimezone(date);

            return date.format('HH:mm')
        }

        target.prototype.getTimeLocal = function(time) {
            let date = moment();

            const [hours, minutes] = time.split(':');

            date.hours(parseInt(hours));
            date.minutes(parseInt(minutes));

            date = this.convertDateToAccountTimezone(date, Intl.DateTimeFormat().resolvedOptions().timeZone);

            return date.format('HH:mm');
        }

        target.prototype.convertDateToAccountTimezone = function(date, timeZone = APP.constant('account').timezone) {
            const accountFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            });

            const formattedDateParts = accountFormatter.format(date.toDate()).split(/[\/, :]/).map(Number);

            return moment(new Date(formattedDateParts[2], formattedDateParts[0] - 1, formattedDateParts[1], formattedDateParts[4], formattedDateParts[5], formattedDateParts[6]));
        }

        target.prototype.getDateTimeLocal = function(accountDateStr, time) {
            let date = moment.tz(accountDateStr, this.getDateFormat(), APP.constant('account').timezone);

            if (!date.isValid()) {
                date = moment.tz(APP.constant('account').timezone);
            }

            const [hours, minutes] = time.split(':');

            date.hours(parseInt(hours));
            date.minutes(parseInt(minutes));

            date = this.convertDateToAccountTimezone(date, Intl.DateTimeFormat().resolvedOptions().timeZone);

            return {
                once_date: date.format(this.getDateFormat()),
                time: date.format('HH:mm')
            };
        }

        target.prototype.getDateFormat = function() {
            return APP.constant('account').date_format
                .replace('d', 'DD')
                .replace('m', 'MM')
                .replace('Y', 'YYYY');
        }
    }
});