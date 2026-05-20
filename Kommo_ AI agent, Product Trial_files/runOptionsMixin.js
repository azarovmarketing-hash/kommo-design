define([
    'twigjs',
    '../../constants.js?v=' + sensei_widget_version,
    'text!../../templates/planne_run_options.twig?v=' + sensei_widget_version
], (twig, ROBOCODE_PLANNER_CONTANTS, planner_run_options_tmpl) => {

    const runOptionsTemplate = twig({
        id: '/sensei_robocode/planne_run_options.twig',
        data: planner_run_options_tmpl,
        allowInlineIncludes: true
    });
    
    return function runOptionsMixin(target) {
        target.prototype.getMonthOptions = function() {
            const value = this.$el.find('input[name="sensei-robocode-planner-run-option-choose-month-day"]').val();

            if (value === ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.last_month_day) {
                return {
                    type: value
                }
            }

            return {
                monthly_days: [parseInt(value)]
            };
        }

        target.prototype.getWeekOptions = function() {
            return {
                weekly_days: [parseInt(this.$el.find('input[name="sensei-robocode-planner-run-option-choose-week-day"]').val())]
            }
        }

        target.prototype.getRunOptions = function() {
            switch (this.runMode) {
                case ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.once: {
                    return this.getDateTimeOptions();
                }
                case ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.daily: {
                    return {
                        "daily_interval": 1
                    }
                }
                case ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.weekly: {
                    return this.getWeekOptions();
                }
                case ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.monthly: {
                    return this.getMonthOptions();
                }
            }
        }

        target.prototype.renderRunOptions = function() {
            this.$el.find('#sensei-robocode-planner-run-options').empty().append(
                runOptionsTemplate.render({
                    run_type: this.runMode,
                    daily_interval: this.daily_interval,
                    weekly_days: this.weekly_days,
                    monthly_days: this.monthly_days,
                    once_date: this.once_date ?? new Date()
                })
            );

            this.updateInputsValueAfterRender();
        }

        target.prototype.updateInputsValueAfterRender = function() {
            this.$el.find('#sensei-robocode-planner-run-option-time').val(this.runTime);

            this.$el.find('input[name="sensei-robocode-planner-run-option-date"]').val(this.once_date);
        }
    }
})