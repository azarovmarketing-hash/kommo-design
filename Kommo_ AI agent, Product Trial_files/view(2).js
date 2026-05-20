define([
    'twigjs',
    'moment',
    'backbone',
    './model.js?v=' + sensei_widget_version,
    'text!../../../../templates/dynseg/additional_filters/filter.twig?v=' + sensei_widget_version,
    'text!../../../../templates/dynseg/additional_filters/filters.twig?v=' + sensei_widget_version,
    '../../../searchable_select.js?v=' + sensei_widget_version,
], function(
    twig,
    moment,
    Backbone,
    Model,
    filterRawTemplate,
    filtersRawTemplate,
    SearchableSelect,
){
    const filterTemplate = twig({
        id: '/sensei/dynseg/additional_filters/filter.twig',
        data: filterRawTemplate,
        allowInlineIncludes: true
    });

    const filtersTemplate = twig({
        id: '/sensei/dynseg/additional_filters/filters.twig',
        data: filtersRawTemplate,
        allowInlineIncludes: true
    });

    const numericTypes = [2, 20, 23]; 
    const dateTypes = [14, 6, 19]; 
    const noAggregateFields = ['lead_count'];

    const FilterView = Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-edit-modal-filter-remove': 'onRemoveClick',

            'click .sensei-dynseg2-edit-modal-filter-statuses-select__button': 'openStatuses',

            'input input[name="from"]': 'onFromInput',
            'input input[name="to"]': 'onToInput',
            'change input[name="sensei-dynseg2-edit-modal-filter-aggregate-select"]': 'onAggregationChange',
            'change .sensei-dynseg2-edit-modal-filter-statuses-select .pipeline-select-wrapper': 'onStatusChange',
        },

        initialize({dynseg, pipelines}) {
            this.dynseg = dynseg;
            this.pipelines = pipelines;

            this.leadSystem = {
                created_at: SENSEI.locale.get('amo.lead.fields.created_at'), 
                updated_at: SENSEI.locale.get('amo.lead.fields.updated_at'), 
                closed_at: SENSEI.locale.get('amo.lead.fields.closed_at'),
            };
            this.contactSystem = {
                created_at: SENSEI.locale.get('amo.contact.fields.created_at'), 
                updated_at: SENSEI.locale.get('amo.contact.fields.updated_at'), 
            };

            if(!this.model.get('type')){
                const field_id = this.model.get('field_id')
                if(Object.keys(this.contactSystem).includes(field_id) && this.dynseg.isContacts()) {
                    this.model.set({
                        type: 'date',
                        field_id: field_id,
                        field_type: 6,
                        field_entity_type: 2,
                        from: 0,
                        to: 0
                    });
                } else if(Object.keys(this.leadSystem).includes(field_id)) {
                    this.model.set({
                        type: 'date',
                        field_id: field_id,
                        field_type: 6,
                        field_entity_type: 1,
                        from: 0,
                        to: 0,
                    });
                } else if(field_id == 'budget') {
                    this.model.set({
                        type: 'number',
                        field_id: 'budget',
                        field_type: 20,
                        field_entity_type: 1,
                        from: 0,
                        to: 0,
                        pipelines: null,
                        aggregate: 'avg',
                    });
                } else if(field_id == 'lead_count') {
                    this.model.set({
                        type: 'number',
                        field_id: 'lead_count',
                        field_type: 2,
                        field_entity_type: 2,
                        from: 0,
                        to: 0,
                        pipelines: null,
                        aggregate: null,
                    });
                } else {
                    const field = APP.constant('account').cf[field_id];
                    let data = {
                        type: '',
                        field_id: field_id,
                        field_type: field.TYPE_ID,
                        field_entity_type: field.ENTREE_DEALS ? 1 : 2,
                        from: 0,
                        to: 0,
                    };
                    
                    if(dateTypes.includes(data.field_type)) {
                        data.type = 'date';
                    } else if(numericTypes.includes(data.field_type)) {
                        data.type = 'number';
                        data.pipelines = null;
                        data.aggregate = 'avg';
                    } else {
                        throw new Error('Неверный тип поля');
                    }

                    this.model.set(data);
                }
            }

            this.aggreateSelect = new SearchableSelect({disableSearch: true});
        },

        render() {

            let name = APP.constant('account').cf[this.model.get('field_id')]?.NAME;
            if(this.model.get('field_id') == 'budget') {
                name = SENSEI.locale.get('amo.lead.fields.budget');

            } else if(this.model.get('field_id') == 'lead_count'){
                name = SENSEI.locale.get('dynamic_segment.modals.edit.components.additional_filters.fields.special.lead_count');

            } else if(Object.keys(this.contactSystem).includes(this.model.get('field_id')) && this.dynseg.isContacts()) {
                name = this.contactSystem[this.model.get('field_id')];

            } else if(Object.keys(this.leadSystem).includes(this.model.get('field_id')) && this.dynseg.isLeads()) {
                name = this.leadSystem[this.model.get('field_id')];
            }

            let $el = $(filterTemplate.render({field_name: name, model: this.model.toJSON()}));
            this.$el.replaceWith($el);
            this.setElement($el);

            let selects = [
                $('<div>')
                    .addClass('label sensei-dynseg2-edit-modal-filter-statuses-select')
                    .append(
                        $('<div>')
                            .addClass('sensei-dynseg2-edit-modal-filter-statuses-select__button')
                            .text(''),
                        twig({ref: '/tmpl/controls/pipeline_select/select.twig'}).render({
                            name: 'sensei-dynseg2-edit-modal-filter-statuses-select',
                            has_pipelines: true,
                            items: this.pipelines,
                            multiple: true,
                            sel: this.model.get('pipelines') ?? {},
                        })
                    )
            ];

            if(!noAggregateFields.includes(this.model.get('field_id'))) {
                selects.push(
                    this.aggreateSelect.render(
                        [
                            {id: 'avg', option: SENSEI.locale.get('dynamic_segment.modals.edit.components.additional_filters.fields.aggregations.avg')},
                            {id: 'sum', option: SENSEI.locale.get('dynamic_segment.modals.edit.components.additional_filters.fields.aggregations.sum')},
                        ],
                        this.model.get('aggregate') ?? 'avg',
                        'label sensei-underlined-select',
                        'sensei-dynseg2-edit-modal-filter-aggregate-select'
                    )
                );
            }

            if(this.model.get('type') == 'number') {
                this.$el.find('.content').prepend(
                    selects
                );

                this.updateStatusLabel();
            }

            return this.$el;
        },

        onRemoveClick(event) {
            this.model.collection.remove(this.model);
            this.remove();
        },

        validate() {
            if(!this.model.get('field_id')) {
                return false;
            }

            let from = this.$el.find('input[name="from"]');
            if(!from.val()){
                from.trigger('sensei:validation:error');
                return false;
            }

            let to = this.$el.find('input[name="to"]');
            if(!to.val()){
                to.trigger('sensei:validation:error');
                return false;
            }

            return true;
        },

        onFromInput(event) {
            this.model.set('from', parseInt(event.target.value) || 0);
        },

        onToInput(event) {
            this.model.set('to', parseInt(event.target.value) || 0);
        },

        onAggregationChange(event) {
            this.model.set('aggregate', event.target.value);
        },

        onStatusChange() {
            const select = this.$el.find('.sensei-dynseg2-edit-modal-filter-statuses-select > .pipeline-select-wrapper > .pipeline-select-wrapper__inner');
            if(select.length > 0) {
                let data = {};
                select.find('input[type="checkbox"][data-pipeline-id][data-value]:checked').each((i, elem) => {
                    if(!data[elem.dataset.pipelineId]) {
                        data[elem.dataset.pipelineId] = [];
                    }
                    data[elem.dataset.pipelineId].push(elem.dataset.value);
                });

                this.model.set('pipelines', data);
                this.updateStatusLabel();
            }
        },

        updateStatusLabel() {
            let count = 0;
            Object.values(this.model.get('pipelines') ?? {}).forEach((statuses) => statuses.forEach((status) => count++));

            let el = this.$el.find('.sensei-dynseg2-edit-modal-filter-statuses-select__button')

            el.text(SENSEI.locale.numeral('dynamic_segment.modals.edit.components.additional_filters.buttons.status', count, {count}))
                .removeClass('empty');

            if(count == 0) {
                el.text(SENSEI.locale.get('dynamic_segment.modals.edit.components.additional_filters.buttons.status_empty'))
                    .addClass('empty')
            }
        },  

        openStatuses(){
            setTimeout(() => {
                this.$el.find('.pipeline-select-wrapper__inner__holder').click();
            }, 10);
        }
    });

    const FiltersView = Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-edit-modal-filters-add-filter': 'onAddClick',
            'change input[name="sensei-dynseg2-edit-modal-filters-add-select"]': 'onAddOptionClick',
        },

        initialize({dynseg, pipelines}) {
            this.fieldSelect = new SearchableSelect({disableSelection: true, hideButton: true});
            this.dynseg = dynseg;
            this.pipelines = pipelines;

            this.listenTo(this.collection, 'remove', () => {
                this.renderSelect();
            });
        },

        render() {
            let $el = $(filtersTemplate.render({type: this.dynseg.getContentType()}));
            this.$el.replaceWith($el);
            this.setElement($el);

            let elements = [];

            this.collection.forEach((model) => {
                let view = new FilterView({model, dynseg: this.dynseg, pipelines: this.pipelines});
                model.view = view;
                elements.push(view.render());
            })

            this.$el.find('#sensei-dynseg2-edit-modal-filters-content').prepend(elements);

            this.$el.find('.sensei-dynseg2-edit-modal-filters-add-filter').prepend(this.renderSelect());

            return this.$el;
        },

        renderSelect(){
            let existing = this.collection.map((model) => model.get('field_id'));

            let leadFields = Object.values(APP.constant('account').cf)
                .filter((item) => (
                    (this.dynseg.isLeads() && item.ENTREE_DEALS && dateTypes.includes(item.TYPE_ID))
                    || (this.dynseg.isContacts() && item.ENTREE_DEALS && numericTypes.includes(item.TYPE_ID))
                ))
                .map((item) => ({id: item.ID, option: item.NAME}));

            let contactFields = Object.values(APP.constant('account').cf)
                .filter((item) => 
                    (this.dynseg.isContacts() && item.ENTREE_CONTACTS && dateTypes.includes(item.TYPE_ID))
                )
                .map((item) => ({id: item.ID, option: item.NAME}));

            if(this.dynseg.isLeads()) {
                leadFields = [
                    {id: 'created_at', option: SENSEI.locale.get('amo.lead.fields.created_at')},
                    {id: 'updated_at', option: SENSEI.locale.get('amo.lead.fields.updated_at')},
                    {id: 'closed_at', option: SENSEI.locale.get('amo.lead.fields.closed_at')},
                    ...leadFields
                ];
            }

            if(this.dynseg.isContacts()) {
                leadFields = [
                    {id: 'budget', option: SENSEI.locale.get('amo.lead.fields.budget')},
                    ...leadFields
                ];

                contactFields = [
                    {id: 'created_at', option: SENSEI.locale.get('amo.contact.fields.created_at')},
                    {id: 'updated_at', option: SENSEI.locale.get('amo.contact.fields.updated_at')},
                    ...contactFields
                ];
            }

            let fields = [];
            if(leadFields.length) {
                fields = [
                    ...fields,
                    {id: 'leads_group', option: SENSEI.locale.get('amo.lead.title'), disabled: true},
                    ...leadFields,
                ];
            }

            if(contactFields.length) {
                fields = [
                    ...fields,
                    {id: 'contacts_group', option: SENSEI.locale.get('amo.contact.title'), disabled: true},
                    ...contactFields,
                ];
            }

            if(this.dynseg.isContacts()) {
                fields.unshift({id: 'lead_count', option: SENSEI.locale.get('dynamic_segment.modals.edit.components.additional_filters.fields.special.lead_count')});
            }

            return this.fieldSelect.render(
                fields.filter((field) => !existing.includes(field.id)),
                '',
                'sensei-dynseg2-edit-modal-filters-add-select',
                'sensei-dynseg2-edit-modal-filters-add-select'
            );
        },

        addItem(id) {
            if(!id) {
                return;
            }

            let model = new Model({field_id: id})
            this.collection.add(model);
            let view = new FilterView({model, dynseg: this.dynseg, pipelines: this.pipelines});
            model.view = view;
            this.$el.find('.sensei-dynseg2-edit-modal-filters-add-filter')
                .before(view.render());

            this.renderSelect();
        },

        onAddClick(event) {
            this.fieldSelect.showList();
        },

        onAddOptionClick(event) {
            let id = parseInt($(event.target).val());
            if(isNaN(id)) {
                id = $(event.target).val();
            }
            this.addItem(id);
        },

        validate(focus = false){
            let failed = false;
            this.collection.forEach((model) => {
                if(model.view && !model.view.validate(focus)){
                    failed = true;
                }
            })
            return !failed;
        },
    });

    return {
        FiltersView,
        FilterView,
    };
});