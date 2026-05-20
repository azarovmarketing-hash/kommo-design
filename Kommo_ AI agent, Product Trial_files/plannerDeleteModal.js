define([
    'jquery',
    'twigjs',
    'lib/components/base/modal',
], ($, twig, Modal) => {
    return Backbone.View.extend({
        events: {
            'click .modal-body__actions__save': 'onSaveClick'
        },
        initialize: function (options) {
            this.deleteSchedulerIds = options.delete_ids;
        },
        async render() {
            if (!this.deleteSchedulerIds || !Array.isArray(this.deleteSchedulerIds) || !this.deleteSchedulerIds.length) {
                console.debug('Scheduler ids is required and not empty for delete action');
                return;
            }

            this.modal = new Modal({
                init: ($modalBody) => {
                    const html = twig({ ref: '/tmpl/common/modal/delete.twig' }).render({ 
                        caption: SENSEI.locale.get('table.remove_dialog.caption'),
                        message: [
                            { text: SENSEI.locale.get('table.remove_dialog.message_1') },
                            { text: SENSEI.locale.get('table.remove_dialog.message_2') }
                        ],
                        accept_text: SENSEI.locale.get('general.button.confirm')
                    });

                    $modalBody.trigger('modal:loaded').html(html).trigger('modal:centrify');

                    this.setElement($modalBody);
                },
            });
        },
        async onSaveClick({ currentTarget }) {
            $(currentTarget).trigger('button:load:start');

            for (const shcedulerId of this.deleteSchedulerIds) {
                try {
                    await SENSEI.widget.Robocode.API.deleteScheduler(shcedulerId);
                } catch(err) {
                    console.debug('Error deleting scheduler with id: ' + shcedulerId);
                    console.debug(err);
                }
            }

            SENSEI.widget.Robocode.postMessageToAllRobocodeIframes({
                type: 'scheduler_deleted',
                ids: this.deleteSchedulerIds
            });

            window.SENSEI.alert.showAlertModal(SENSEI.locale.get('robocode_planner.delete.success'), true, 2000);

            this.destroy();

            return;
        },
        destroy() {
            this.modal.destroy();
            this.remove();
        }
    });
})