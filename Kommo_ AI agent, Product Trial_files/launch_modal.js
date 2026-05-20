define([
    'twigjs',
    'lib/components/base/modal',
    './../../searchable_select.js?v=' + sensei_widget_version,
    'lib/network/leads/api',
], function(
    twig,
    Modal,
    SearchableSelect,
    { getPipelines },
){

    return Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-launch-modal-launch': 'onLaunchClick'
        },
        async initialize({dynseg_ids, requirePipeline}) {
            this.pipelines = (await getPipelines.call({ _pipelines_xhr: false })).pipelines;
            this.dynseg_ids = dynseg_ids;
            this.requirePipeline = requirePipeline;

            this.render();
        },
        render() {
            let that = this;
            this.modal = new Modal({
                class_name: 'sensei-dynseg2-launch-modal sensei-dynseg2-modal',
                default_overlay: true,
                init(modalBody) {
                    const html = 
                    `
                        <h2 class="modal-body__title">${SENSEI.locale.get('dynamic_segment.modals.launch.title')}</h2>
                        <div class="modal-body__description">${SENSEI.locale.get('dynamic_segment.modals.launch.description')}</div>
                        <div class="modal-body__actions ">
                            ${twig({ ref: '/tmpl/controls/button.twig' }).render({
                                class_name:"button-input_blue sensei-dynseg2-launch-modal-launch",
                                text: SENSEI.locale.get('general.button.start')
                            })}
                            ${twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({})}
                        </div>
                    `;

                    const pipelineList = [
                        {id: 0, option: SENSEI.locale.get('dynamic_segment.modals.edit.components.process_starts.buttons.pipeline'), disabled: true, hidden: true},
                        ...Object.values(that.pipelines).map((pipeline) => ({id: pipeline.id, option: pipeline.name}))
                    ];
                    
                    modalBody.html(html).find('.modal-body__description').after(
                        SENSEI.widget.renderProcessesList(SENSEI.widget.Processes.toJSON().filter((process) => process.enabled), 0, '', 'process_id', false, {}),
                        new SearchableSelect({disableSearch: true}).render(pipelineList, 0, '', 'pipeline_id'),
                    );

                    modalBody.trigger('modal:loaded').trigger('modal:centrify');
                    that.setElement(modalBody);
                },
                destroy() {}
            });
        },

        onLaunchClick() {
            let process = parseInt(this.modal.$el.find('input[name="process_id"]').val()) || null;
            let pipeline = parseInt(this.modal.$el.find('input[name="pipeline_id"]').val()) || null;

            if(!process) {
                this.modal.$el.find('input[name="process_id"]').next('button').click();
                return;
            }

            if(!pipeline && this.requirePipeline) {
                this.modal.$el.find('input[name="pipeline_id"]').next('button').click();
                return;
            }

            this.dynseg_ids.forEach(async (id) => {
                await SENSEI.api.launchDynamicSegment(id, process, pipeline);
            });
        
            SENSEI.widget.showAlertModal(SENSEI.locale.get('dynamic_segment.modals.edit.messages.launch'), true);

            this.modal.remove();
        }

    });
});