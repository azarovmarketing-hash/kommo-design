define([
    'backbone',
    'twigjs',
    'lib/components/base/modal',
    'text!../../../templates/workplace_panel_break_switch.twig?v=' + sensei_widget_version,
    'text!../../../templates/break_modal.twig?v=' + sensei_widget_version
], (
    Backbone,
    twig,
    Modal,
    workplace_panel_break_switch,
    break_modal
) => {
    return Backbone.View.extend({
        async initialize(options) {
            this.template = twig({
                id: 'sensei/workplace_panel_break_switch',
                data: workplace_panel_break_switch,
                allowInlineIncludes: true
            });

            this.breakModal = twig({
                id: 'sensei/break_modal',
                data: break_modal,
                allowInlineIncludes: true
            });

            SENSEI.widget.loadCssFile("lib/css/switcher.css");

            this.isOnBreak = null;
            this.updatePending = false;
            SENSEI.api.getPauseModeFlag(AMOCRM.constant('user').id)
                .then(result => {
                    this.isOnBreak = result.data.paused;
                    SENSEI.events.trigger('workplace_break_switch', result.data.paused);
                    this.switchBreakSwitcherTwig(result.data.paused);
                });
        },
        render() {
            this.setElement(
                $(this.template.render({
                    isNotOnBreak: !this.isOnBreak,
                    switcher_wrapper_class: 'break-switcher'
                }))
            );

            this.addBreakSwitcherHandler();

            return this.$el;
        },
        addBreakSwitcherHandler() {
            this.$el.find('.switcher').on('click', async (e) => {
                if ($(e.target).siblings('input').get(0).checked) {
                    this.openBreakConfirmationModal();
                } else {
                    SENSEI.events.trigger('workplace_break_switch', false);
                    await this.switchBreakStatus(false); // входим в очередь
                }
            });
        },

        openBreakConfirmationModal() {
            let view = this;
            this._modal = new Modal({
                class_name: 'modal-window',
                disable_overlay_click: true,
                init: ($modal_body) => {
                    let html = this.breakModal.render({
                        title: SENSEI.locale.get('workplace.break.switch'),
                        text: SENSEI.locale.get('workplace.break.description'),
                        textTip: SENSEI.locale.get('workplace.break.tip'),
                        saveButtonText: SENSEI.locale.get('workplace.button.proceed'),
                        saveButtonClass: 'button-input-break button-input_blue'
                    });
                    $modal_body.trigger('modal:loaded').html(html).trigger('modal:centrify');
                    $modal_body.find('.button-input_blue').on('click', async (e) => {
                        $(e.target).trigger('button:load:start');

                        SENSEI.events.trigger('workplace_break_switch', true);

                        await this.switchBreakStatus(true); // выходим из очереди
                        view._modal.destroy();
                    });
                    $modal_body.find('.button-cancel, .modal-body__close ').on('click', () => {
                        this.switchBreakSwitcherTwig(false);
                    });
                },
            });
        },

        switchBreakSwitcherTwig(checkedValue) {
            checkedValue = !checkedValue
            let switchFrom = checkedValue ? 'switcher__off' : 'switcher__on';
            let switchTo = checkedValue ? 'switcher__on' : 'switcher__off';
            $('.break-switcher .switcher').removeClass(switchFrom).addClass(switchTo);
            $('.break-switcher .switcher__checkbox').prop('checked', checkedValue);
        },

        async switchBreakStatus(status) {
            this.updatePending = true;
            let previousStatus = this.isOnBreak;
            this.isOnBreak = status
            const result = await SENSEI.api.setPauseModeFlag(AMOCRM.constant('user').id, { status: this.isOnBreak });
            if (!result.status || result.status !== 200) {
                this.isOnBreak = previousStatus;

                SENSEI.events.trigger('workplace_break_switch', this.isOnBreak);

                this.switchBreakSwitcherTwig(this.isOnBreak);
            }
            this.updatePending = false;
        }
    });
});