define([
    'twigjs',
    'lib/components/base/modal',
    'text!../../templates/planner_modal.twig?v=' + sensei_widget_version,
], (twig, Modal,planner_modal_tmpl) => {

    const modalTemplate = twig({
        id: '/sensei_robocode/planner_modal.twig',
        data: planner_modal_tmpl,
        allowInlineIncludes: true
    });
    
    return function modalMixin(target) {
        target.prototype.render = async function() {
            const self = this;

            if (!this.isNew && !this.schedulerId) {
                console.debug('Scheduler id is required for edit action');
                return;
            }

            this.modal = new Modal({
                class_name: 'modal-list sensei-robocode-planner-modal',
                init: async ($modalBody) => {
                    self.setElement($modalBody);

                    if (!SENSEI.widget.Robocode.Scripts.isLoaded) {
                        await SENSEI.widget.Robocode.Scripts.load();
                    }

                    if (!SENSEI.widget.Robocode.ScriptsGroups.isLoaded) {
                        await SENSEI.widget.Robocode.ScriptsGroups.load();
                    }

                    self.renderModal($modalBody);
                }
            });
        }

        target.prototype.renderModal = function($modalBody) {
            $modalBody.empty().append(modalTemplate.render({
                is_new: this.isNew,
                name: this.name
            }));

            const scriptSelect = SENSEI.widget.Robocode.renderProcessesList(
                SENSEI.widget.Robocode.Scripts.models.map(model => model.attributes), this.selectedScript, 'robocode-start-modal-script-select', 'robocode_script'
            );

            $modalBody.find('#sensei-robocode-planner-script').append(scriptSelect);

            this.renderRunOptions();

            $modalBody.trigger('modal:loaded').trigger('modal:centrify');
        }
        
        target.prototype.onChangeRunMode = function() {
            this.runMode = this.$el.find('input[name="sensei-robocode-planner-run-option-type"]').val();
            this.renderRunOptions();
        }

        target.prototype.onSaveClick = async function({ currentTarget }) {

            if (!this.isValid()) {
                return;
            }

            $(currentTarget).trigger('button:load:start');

            if (this.isNew) {
                await this.createScheduler();

                this.destroy();

                return;
            }

            await this.updateScheduler();

            this.destroy();

            return;
        }
    }
})