define([
    'moment',
    '../constants.js?v=' + sensei_widget_version,
    './plannerEditModal/runOptionsMixin.js?v=' + sensei_widget_version,
    './plannerEditModal/modalMixin.js?v=' + sensei_widget_version,
    './plannerEditModal/runOptionsDateMixin.js?v=' + sensei_widget_version,
], (moment, ROBOCODE_PLANNER_CONTANTS, modalMixin, runOptionsMixin, runOptionsDateMixin, ) => {

    const PlannerEditModal = Backbone.View.extend({
        className: "robocode-planner",
        events: {
            'change input[name="sensei-robocode-planner-run-option-type"]': 'onChangeRunMode',
            'click .modal-body__actions__save': 'onSaveClick'
        },
        initialize: function (options) {
            this.isNew = options.isNew;

            this.schedulerId = options.id || '';
            this.name = options.name || '';
            this.selectedScript = options.scenario_id || '0';

            this.runMode = options.type || 'once';
            this.runTime = options.time || '00:00';

            this.daily_interval = options.daily_interval || '1';
            this.weekly_days = options.weekly_days || '1';
            this.monthly_days = options.monthly_days || '1';
            this.once_date = (options.once_date ? moment(options.once_date) : moment()).format(this.getDateFormat());

            if (this.runMode === ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.last_month_day) {
                this.runMode = ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.monthly;
                this.monthly_days = ROBOCODE_PLANNER_CONTANTS.RUN_TYPES.last_month_day;
            }

            if (!this.isNew) {
                this.setDataForEditMode();
            }
        },
        async setDataForEditMode() {
            const localDateOptions = this.getDateTimeLocal(this.once_date, this.runTime);

            this.once_date = localDateOptions.once_date;
            this.runTime = localDateOptions.time;
        },
        isValid() {
            let isValid = true;

            this.$el.find('.sensei-robocode-planner-modal-validation-not-valid').removeClass('sensei-robocode-planner-modal-validation-not-valid');

            if (this.getSelectedScriptId() === '0') {
                this.$el.find('#sensei-robocode-planner-script').addClass('sensei-robocode-planner-modal-validation-not-valid');
                isValid = false;
            }

            if (!this.getName()) {
                this.$el.find('input[name="title"]').addClass('sensei-robocode-planner-modal-validation-not-valid');
                isValid = false;
            }

            return isValid;
        },
        getName() {
            return this.$el.find('input[name="title"]').val();
        },
        getSelectedScriptId() {
            return this.$el.find('input[name="robocode_script"]').val();
        },
        getDataForRequest() {
            return {
                "scenario_id": this.getSelectedScriptId(),
                "name": this.getName(),
                "type": this.runMode,
                time: this.getTimeAccount(),
                ...this.getRunOptions()
            };
        },
        async createScheduler() {
            const response = await SENSEI.widget.Robocode.API.createScheduler({
                "enabled": true,
                ...this.getDataForRequest()
            });

            if (response.id) {
                SENSEI.widget.Robocode.postMessageToAllRobocodeIframes({
                    type: 'scheduler_created',
                    scheduler: response
                });
            }

            return;
        },
        async updateScheduler() {
            const response = await SENSEI.widget.Robocode.API.updateScheduler(this.schedulerId, this.getDataForRequest());

            if (response.id) {
                SENSEI.widget.Robocode.postMessageToAllRobocodeIframes({
                    type: 'scheduler_edited',
                    scheduler: response
                });
            }

            return;
        },
        destroy() {
            this.modal.destroy();
            this.remove();
        }
    });

    modalMixin(PlannerEditModal);
    runOptionsMixin(PlannerEditModal);
    runOptionsDateMixin(PlannerEditModal);

    return PlannerEditModal;
})