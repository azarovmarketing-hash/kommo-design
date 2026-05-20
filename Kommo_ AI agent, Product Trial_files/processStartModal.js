define([
    'twigjs',
    'text!./../templates/process_start_modal.twig?v=' + sensei_widget_version,
    'lib/components/base/modal',
    'lib/components/base/confirm'
], function (
    twig,
    rawTemplate,
    Modal,
    ConfirmModal
) {
    const template = twig({
        id: '/sensei/process_start_modal.twig',
        data: rawTemplate,
        allowInlineIncludes: true
    });

    const ProcessStartModal = Backbone.View.extend({
        events: {
            'change input[name="sensei-start-modal-mode-select"]': 'onModeChange',
            'change input[name="sensei-process-stop-close-tasks"]': 'onCloseTaskChange',
            'change input[name="sensei-start-modal-process-select"]': 'onProcessChange',

            'click .sensei-process-start-save-button:not(.button-input-disabled)': 'onSaveClick'
        },

        initialize({ processes, selected }) {
            this.processes = processes;
            this.selected = selected.selected
                .filter((entity) => entity.type == 'lead')
                .map((lead) => lead.id);

            if (!this.selected.length) {
                return;
            }

            this.mode = 'start';
            this.closeTasks = false;
            this.processId = '0';

            this.startByFilter = false;
            this.filterUrl = location.href;

            this.render();
        },

        render() {
            this.createModal();
        },

        createModal() {
            let self = this;

            this.modal = new Modal({
                class_name: 'sensei-process-start-modal',
                init($modalBody) {
                    self.setElement($modalBody);
                    self.renderModal($modalBody);
                },
                destroy() { }
            });
        },

        renderModal($modalBody) {
            $modalBody.empty().append(template.render({ mode: this.mode, close_tasks: this.closeTasks }));

            let processes = this.processes;
            if (this.mode === 'stop') {
                processes = [
                    { id: 'all', name: SENSEI.locale.get('dp.start_modal.all_processes') },
                    ...processes
                ];
            } else if (this.mode === 'start') {
                processes = this.processes.filter((process) => !!process.enabled);
                if (this.processId === 'all') {
                    this.processId = '0';
                }
            }

            $modalBody.find('#sensei-start-modal-process-select').replaceWith(
                SENSEI.widget.renderProcessesList(processes, this.processId, 'sensei-start-modal-process-select', 'sensei-start-modal-process-select')
            );

            this.updateButton();
            $modalBody.trigger('modal:loaded').trigger('modal:centrify');
        },

        updateButton() {
            if (this.processId >= 1 || (this.processId === 'all' && this.mode === 'stop')) {
                this.$el.find('.sensei-process-start-save-button').removeClass('button-input-disabled');
            } else {
                this.$el.find('.sensei-process-start-save-button').addClass('button-input-disabled');
            }
        },

        onModeChange(event) {
            this.mode = event.currentTarget.value;

            this.renderModal(this.$el);
        },

        onProcessChange(event) {
            this.processId = event.currentTarget.value;
            this.updateButton();
        },

        onCloseTaskChange(event) {
            this.closeTasks = !!event.currentTarget.checked;
        },

        getCurrentProcessName() {
            return this.processes.find((process) => process.id == this.processId)?.name;
        },

        onSaveClick() {
            if (!SENSEI.constructorState) {
                this.modal.destroy();
                this.remove();
                SENSEI.widget.showAlertModal(SENSEI.locale.get('dp.start_modal.tariff_error'), false);
                return;
            }

            this.$el.find('.sensei-process-start-save-button').trigger('button:load:start');



            if (this.selected.length === APP.data.current_list?.length && !!APP.data.current_view.max_page) {
                let self = this;
                new ConfirmModal({
                    accept_text: SENSEI.locale.get('dp.start_modal.filter_modal.page'),
                    decline_text: SENSEI.locale.get('dp.start_modal.filter_modal.filter'),
                    text: SENSEI.locale.get('dp.start_modal.filter_modal.text'),
                    button_class: '',
                    message: [],
                    destroy: function () {
                        if (this.accepted === false) {
                            self.startByFilter = true;
                            self.performAction();
                        } else {
                            self.$el.find('.sensei-process-start-save-button').trigger('button:load:stop');
                        }
                    },
                    accept: function () {
                        self.startByFilter = false;
                        this.destroy();
                        self.performAction();
                    }
                });
            } else {
                this.performAction();
            }
        },

        performAction() {
            let success = () => {
                if (this.mode == 'start') {
                    SENSEI.widget.showAlertModal(SENSEI.locale.get('dp.start_modal.alerts.started', { name: this.getCurrentProcessName() }), true);
                } else if (this.mode == 'stop') {
                    if (this.processId == 'all') {
                        SENSEI.widget.showAlertModal(SENSEI.locale.get('dp.start_modal.alerts.stopped_all'), true);
                    } else {
                        SENSEI.widget.showAlertModal(SENSEI.locale.get('dp.start_modal.alerts.stopped', { name: this.getCurrentProcessName() }), true);
                    }
                }

                this.$el.find('.sensei-process-start-save-button').trigger('button:load:stop');
                this.modal.destroy();
                this.remove();
            };

            let fail = () => {
                SENSEI.widget.showAlertModal(SENSEI.locale.get('general.error.something_wrong'), false);
                this.$el.find('.sensei-process-start-save-button').trigger('button:load:stop');
            };

            if (!this.startByFilter) {
                let data = this.selected.map((id) => ({ entity_id: id, entity_type: 1 }));
                if (this.mode === 'start') {
                    SENSEI.api.send('process/start/' + this.processId, 'POST', { data }).then(success, fail);
                } else if (this.mode == 'stop') {
                    if (this.processId === 'all') {
                        SENSEI.api.send('process/stop-entity', 'POST', { data, close_tasks: this.closeTasks }).then(success, fail);
                    } else {
                        SENSEI.api.send('process/stop/' + this.processId, 'POST', { data, close_tasks: this.closeTasks }).then(success, fail);
                    }
                }
            } else {
                if (this.mode === 'start') {
                    SENSEI.api.send('process/start-by-filter/' + this.processId, 'POST', { filter_url: this.filterUrl }).then(success, fail);
                } else if (this.mode === 'stop') {
                    SENSEI.api.send('process/stop-by-filter/' + this.processId, 'POST', { filter_url: this.filterUrl, close_tasks: this.closeTasks }).then(success, fail);
                }
            }
        }

    });


    return {
        open: (processes, selected) => { return new ProcessStartModal({ processes, selected }) },
    };
});