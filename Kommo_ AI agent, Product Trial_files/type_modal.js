define([
    'twigjs',
    'lib/components/base/modal',
    'text!../../../templates/dynseg/type_modal.twig',
    './model.js?v=' + sensei_widget_version,
], function(
    twig,
    Modal,
    rawTemplate,
    Model,
){
    const template = twig({
        id: '/sensei/dynseg/type_modal.twig',
        data: rawTemplate,
        allowInlineIncludes: true
    });

    const contactLocations = {
        leads: 'linked_contacts',
        contacts: 'contacts',
        segments_contacts: 'set_of_contacts',
        segments_leads: 'set_of_contacts',
        segments_mixed: 'set_of_contacts',

    };

    const leadLocations = {
        leads: 'leads',
        contacts: null,
        segments_contacts: null,
        segments_leads: 'set_of_leads',
        segments_mixed: null,
    };

    return Backbone.View.extend({
        events: {
            'click .modal-body__close': 'onClose',
            'click .button-cancel':  'onClose',
            'click .sensei-dynseg2-type-button:not(.disabled)': 'onButtonClick',
            'click .sensei-save-segment-button': 'onSaveClick',

            'input .sensei-segment-name': 'onNameInput',
        },
        initialize({collection = undefined, location, dynseg = {}, createMode = false, openEditModal = false}) {
            this.renderOptions = {
                location,
                leadType: leadLocations[location],
                contactType: contactLocations[location],
                createMode,
                openEditModal,
            };
            this.collection = collection;
            this.dynseg = dynseg;
            this.selectedType = null;
            
            if(!leadLocations[location]) {
                this.selectedType = contactLocations[location];
            } else if(!contactLocations[location]) {
                this.selectedType = leadLocations[location];
            }

            this.name
            this.render();
        },
        render() {
            let that = this;
            this.modal = new Modal({
                class_name: 'sensei-dynseg2-type-modal sensei-dynseg2-modal' + (that.renderOptions.createMode ? ' create-mode' : ''),
                default_overlay: true,
                init(modalBody) {
                    const html = template.render(that.renderOptions);

                    modalBody.trigger('modal:loaded').html(html).trigger('modal:centrify');
                    that.setElement(modalBody);

                    this.$el.find('.sensei-segment-name').focus();
                },
                destroy() {}
            });
        },

        openEditModal(dynseg) {
            let model = new Model(dynseg);
            if(this.collection) {
                model.collection = this.collection;
            }
            document.dispatchEvent(new CustomEvent('sensei:dynseg_v2:edit', {
                detail: {
                    model
                }
            }));
        },

        onButtonClick(event) {
            if(this.renderOptions.createMode) {
                this.$el.find('.sensei-dynseg2-type-button').removeClass('selected');
                $(event.currentTarget).addClass('selected');
                this.selectedType = event.currentTarget.dataset.type;
            } else {
                this.openEditModal({...this.dynseg, type: event.currentTarget.dataset.type});
                this.modal.destroy();
            } 
        },

        onNameInput({currentTarget}) {
            this.name = currentTarget.value;
        },

        onClose() {
            document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:closed', {bubbles: true}));
        },

        validate() {
            let valid = true;

            if(!this.name){
                this.$el.find('input.sensei-segment-name').trigger('sensei:validation:error');
                valid = false;
            }

            if(!this.selectedType) {
                valid = false;
            }

            if(!valid) {
                this.$el.find('.sensei-save-segment-button').addClass('animated shake');
                setTimeout(() => this.$el.find('.sensei-save-segment-button').removeClass('animated shake'), 250);
            }

            return valid;
        },

        onSaveClick() {
            if(this.validate()) {
                let model = new Model({...this.dynseg, name: this.name, type: this.selectedType});
                model.get('config').set('amo_filter', location.href);

                if(this.renderOptions.openEditModal){   
                    if(this.collection) {
                        this.collection.remove(model.get('id'))
                        this.collection.add(model);
                    }
                    document.dispatchEvent(new CustomEvent('sensei:dynseg_v2:edit', {
                        detail: { model }
                    }));
                    this.modal.destroy();
                } else {
                    model.save().then((data) => {
                        document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:saved', {bubbles: true}));
                        if(data?.data?.id){
                            let name = `<a style="color: var(--palette-text-primary);" href="/widget_page/${SENSEI.widget.get_settings().widget_code}/left_menu/dynamic_segments?segment_id=${data?.data?.id}">${this.name}</a>`;
                            SENSEI.widget.showAlertModal(`${SENSEI.locale.get('dynamic_segment.modals.type.create.message', {name})}`, true);
                        }
                        this.onClose();
                        this.modal.destroy();
                    });    
                }
            }
        },

    });
});