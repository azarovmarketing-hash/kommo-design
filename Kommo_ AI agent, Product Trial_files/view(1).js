define([
    'twigjs',
    'moment',
    'backbone',
    './model.js?v=' + sensei_widget_version,
    'text!../../../../templates/dynseg/set_sequence/sequence_item.twig?v=' + sensei_widget_version,
    'text!../../../../templates/dynseg/set_sequence/sequence.twig?v=' + sensei_widget_version,
    '../../../searchable_select.js?v=' + sensei_widget_version,
], function(
    twig,
    moment,
    Backbone,
    Model,
    sequenceItemRawTemplate,
    sequenceRawTemplate,
    SearchableSelect,
){
    const sequenceItemTemplate = twig({
        id: '/sensei/dynseg/set_sequence/sequence_item.twig',
        data: sequenceItemRawTemplate,
        allowInlineIncludes: true
    });

    const sequenceTemplate = twig({
        id: '/sensei/dynseg/set_sequence/sequence.twig',
        data: sequenceRawTemplate,
        allowInlineIncludes: true
    });

    const SequenceItemView = Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-edit-modal-sequence-item-remove': 'onRemoveClick',

            'change input[name="dynseg_id"]': 'onDynsegChange',
            'change input:checked[name=\"sequence_mode\"]': 'onModeChange',
        },

        initialize({getSegmentSelectOptions, dynseg}) {
            
            this.dynseg = dynseg;
            this.getSegmentSelectOptions = getSegmentSelectOptions;
            this.segmentSelect = new SearchableSelect({disableSearch: true, disableCheck: false});
        },

        render() {
            let $el = $(sequenceItemTemplate.render({model: this.model.toJSON()}));
            this.$el.replaceWith($el);
            this.setElement($el);

            this.$el.find('.sensei-dynseg2-edit-modal-sequence-item-select-wrapper').prepend(this.segmentSelect.render(
                this.getSegmentSelectOptions(),
                this.model.get('dynseg_id'),
                'sensei-dynseg2-edit-modal-sequence-item-dynseg-select',
                'dynseg_id'
            ));

            return this.$el;
        },

        onRemoveClick(event) {
            this.model.collection.remove(this.model);
            this.remove();
        },

        onDynsegChange({currentTarget}) {
            this.model.set('dynseg_id', parseInt(currentTarget.value));
        },

        onModeChange({currentTarget}) {
            this.model.set('operation', currentTarget.value)
        },

        validate() {
            return !!this.model.get('dynseg_id');
        },
    });

    const SequenceView = Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-edit-modal-sequence-add': 'onAddClick',
            'change input[name="sensei-dynseg2-edit-modal-sequence-add-select"]': 'onAddOptionClick',
        },

        initialize({dynseg}) {
            this.segmentSelect = new SearchableSelect({disableSearch: true, disableSelection: true, hideButton: true});
            this.dynseg = dynseg;

            this.listenTo(this.collection, 'remove', () => {
                if(this.collection.length > 0 && this.collection.at(0).get('operation') != 'set'){
                    let model = this.collection.at(0);
                    model.set('operation', 'set');
                    model.view.render();
                }
                    
                this.renderSelect();
            });
        },

        render() {
            let $el = $(sequenceTemplate.render({type: this.dynseg.getContentType()}));
            this.$el.replaceWith($el);
            this.setElement($el);

            let elements = [];

            this.collection.forEach((model) => {
                let view = new SequenceItemView({model, getSegmentSelectOptions: this.getSegmentSelectOptions, dynseg: this.dynseg});
                model.view = view;
                elements.push(view.render());
            })

            this.$el.find('#sensei-dynseg2-edit-modal-sequence-content').prepend(elements);

            this.$el.find('.sensei-dynseg2-edit-modal-sequence-add').prepend(this.renderSelect());

            return this.$el;
        },

        renderSelect() {
            let existing = this.collection.map((model) => model.get('dynseg_id'));

            return this.segmentSelect.render(
                this.getSegmentSelectOptions().filter((segment) => !existing.includes(segment.id)),
                '',
                'sensei-dynseg2-edit-modal-sequence-add-select',
                'sensei-dynseg2-edit-modal-sequence-add-select'
            )
        },

        addItem(id) {
            if(!id) {
                return;
            }

            let model = new Model({operation: (!this.collection.length ? 'set' : 'union'), dynseg_id: id})
            this.collection.add(model);
            let view = new SequenceItemView({model, getSegmentSelectOptions: this.getSegmentSelectOptions, dynseg: this.dynseg});
            model.view = view;
            this.$el.find('.sensei-dynseg2-edit-modal-sequence-add')
                .before(view.render());

            this.renderSelect();
        },

        onAddClick(event) {
            this.segmentSelect.showList();
        },

        onAddOptionClick(event) {
            this.addItem(parseInt($(event.target).val()));
        },

        getSegmentSelectOptions() {
            let dynsegs = this.dynseg.collection.filter((model) => this.dynseg.get('id') != model.get('id'));
            
            if(this.dynseg.isLeads()) {
                dynsegs = dynsegs.filter((model) => model.isLeads());
            }

            return [
                {id: 0, option: 'null', hidden: true, disabled: true},
                ...dynsegs.map((model) => ({id: model.get('id'), option: model.get('name')})),
            ];    
        },

        validate(focus = false){
            if(!this.collection.length) {
                if(focus) {
                    this.$el.find('input[name="sensei-dynseg2-edit-modal-sequence-add-select"]').focus().next('button').click();
                }
                return false;
            }
            return true;
        },
    });

    return {
        SequenceView,
        SequenceItemView,
    };
});