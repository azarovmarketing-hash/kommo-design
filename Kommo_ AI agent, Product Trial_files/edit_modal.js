define([
    'twigjs',
    'lib/components/base/modal',
    'text!../../../templates/dynseg/edit_modal.twig?v=' + sensei_widget_version,
    './process_starts/view.js?v=' + sensei_widget_version,
    './set_sequence/view.js?v=' + sensei_widget_version,
    './additional_filters/view.js?v=' + sensei_widget_version,
    'lib/network/leads/api',
    'lib/components/base/confirm',
], function(
    twig,
    Modal,
    rawTemplate,
    { ProcessStartsView },
    { SequenceView },
    { FiltersView },
    { getPipelines },
    ConfirmModal
){
    const template = twig({
        id: '/sensei/dynseg/edit_modal.twig',
        data: rawTemplate,
        allowInlineIncludes: true
    });

    return Backbone.View.extend({
        events: {
            'click .sensei-save-segment-button:not(.button-input-disabled)': 'onSaveClick',
            'click .sensei-remove-segment-button': 'onRemoveClick',
            'click .sensei-launch-segment-button': 'onLaunchClick',

            'input .sensei-segment-name': 'onNameInput'
        },

        initialize({}) {

            if(!this.model.isMultisegment() && !this.model.get('config').get('amo_filter') && (location.pathname.includes('/leads/') || location.pathname.includes('/contacts/'))) {
                this.modal.get('config').set('amo_filter', location.href);
            }

            this.resetChanges();

            this.model.on('change', () => {       
                this.checkChanges();
            });

            this.render();
        },

        checkChanges() {
            if(this.isChanged() || this.isNew()) {
                this.$el.find('.sensei-save-segment-button').removeClass('button-input-disabled');
            } else {
                this.$el.find('.sensei-save-segment-button').addClass('button-input-disabled');
            }
        },

        isNew() {
            return !this.model.get('id');
        },

        isChanged() {
            let segment = JSON.stringify(this.getModelObjectForChangeDetection());
            return this.oldSegmentModel != segment;
        },

        resetChanges() {
            let segment = JSON.stringify(this.getModelObjectForChangeDetection());
            this.oldSegmentModel = segment;
        },

        getModelObjectForChangeDetection() {
            

            let model = this.model.toJSON();
            return {
                name: model.name,
                config: model.config,
            };
        },

        async load() {
            const config = this.model.get('config');
            
            if(!this.pipelines) {
                this.pipelines = (await getPipelines.call({ _pipelines_xhr: false })).pipelines;
            }

            this.setSequenceView = null;
            this.additionalFiltersView = new FiltersView({ collection: config.get('additional_filters'), dynseg: this.model, pipelines: this.pipelines });
            this.processStartsView = new ProcessStartsView({ collection: config.get('process_starts'), dynseg: this.model, pipelines: this.pipelines });

            if(this.model.isMultisegment()){
                this.setSequenceView = new SequenceView({ collection: config.get('set_sequence'), dynseg: this.model});
            }
        },

        render() {
            let self = this;
            let model = this.model;

            if(this.modal) {
                this.modal.destroy();
            }

            this.modal = new Modal({
                class_name: 'sensei-dynseg2-edit-modal sensei-dynseg2-modal',
                default_overlay: true,
                init(modalBody) {
                    self.load().then(() => {
                        const html = template.render({
                            name: model.get('name'),
                            amo_filter: model.get('config').get('amo_filter'),
                            is_new: model.get('id') == 0,
                        });

                        modalBody.html(html);

                        const content = modalBody.find('#sensei-dynseg2-edit-modal-content');

                        content.prepend([
                            self.setSequenceView?.render(),
                            self.additionalFiltersView?.render(),
                            self.processStartsView?.render(),
                        ]);

                        modalBody.trigger('modal:loaded').trigger('modal:centrify');
                        self.setElement(modalBody);

                        self.checkChanges();

                        if(!model.get('name')){
                            modalBody.find('input.sensei-segment-name').focus();
                        } else {
                            modalBody.find('input.sensei-segment-name').val(model.get('name'));
                        }
                    });
                },
                destroy() {
                    if(!self.isChanged()){
                        return true;
                    }
                    editModal = this;

                    new ConfirmModal({
                        accept_text: SENSEI.locale.get('dynamic_segment.modals.edit.messages.close_confirm.confirm'),
                        decline_text: SENSEI.locale.get('dynamic_segment.modals.edit.messages.close_confirm.cancel'),
                        text: SENSEI.locale.get('dynamic_segment.modals.edit.messages.close_confirm.message.1'),
                        button_class: 'button-input_blue',
                        message: [
                            {text: SENSEI.locale.get('dynamic_segment.modals.edit.messages.close_confirm.message.2')},
                        ],
                        destroy: function() {
                            if(this.accepted === false) {
                                self.resetChanges();
                                setTimeout(()=>{
                                    self.$el.find('.button-cancel').click();
                                }, 10);
                            }
                        },
                        accept: function() {
                            if(self.validate(true)){
                                self.model.save();
                                document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:saved', {bubbles: true}));
                                self.resetChanges();
                                setTimeout(()=>{
                                    self.$el.find('.button-cancel').click();
                                }, 10);
                            }
                            this.destroy();
                        }
                    });

                    return false;
                }
            });
        },

        onNameInput(event) {
            this.model.set('name', ($(event.target).val() || '').trim());
        },

        destroy() {
            document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:closed', {bubbles: true}));
        },

        onSaveClick(event) {
            if(this.validate(true)) {
                this.$el.find('.sensei-save-segment-button').trigger('button:load:start');
                this.model.save().then(() => {
                    this.$el.find('.sensei-save-segment-button').trigger('button:load:stop');
                    document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:saved', {bubbles: true}));
                    this.resetChanges();
                    this.model.trigger('change');
                    this.render();
                })
            }
        },

        onRemoveClick(event) {
            if(!this.model.canBeDeleted()) {
                SENSEI.widget.showAlertModal(SENSEI.locale.get('dynamic_segment.modals.edit.messages.delete.segment_used'));
                return;
            }
            this.model.delete().then((result) => {
                if(result !== false){
                    document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:saved', {bubbles: true}));
                    this.modal.destroy();
                }
            });
        },

        onLaunchClick(event) {
            document.dispatchEvent(new CustomEvent('sensei:dynseg_v2:launch', {
                detail: {
                    dynseg_ids: [this.model.get('id')],
                    requirePipeline: this.model.isContacts(),
                }
            }));
        },

        validate(focus = false) {
            let valid = true;

            if(!this.model.get('name')){
                this.$el.find('input.sensei-segment-name').trigger('sensei:validation:error');
                valid = false;
                if(focus){
                    focus = false;
                    this.$el.find('input.sensei-segment-name').focus();
                }
            }

            if(this.setSequenceView && !this.setSequenceView.validate(focus)) {
                valid = false;
                focus = false;
            }
            if(this.additionalFiltersView && !this.additionalFiltersView.validate(focus)) {
                valid = false;
                focus = false;
            }
            if(this.processStartsView && !this.processStartsView.validate(focus)) {
                valid = false;
                focus = false;
            }

            if(!valid) {
                this.$el.find('.sensei-save-segment-button').addClass('animated shake');
                setTimeout(() => this.$el.find('.sensei-save-segment-button').removeClass('animated shake'), 250);
            }

            return valid;
        }
    });
});