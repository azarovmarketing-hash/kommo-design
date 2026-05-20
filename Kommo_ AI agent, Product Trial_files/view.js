define([
    'twigjs',
    'moment',
    'backbone',
    './model.js?v=' + sensei_widget_version,
    'text!../../../../templates/dynseg/process_starts/process_start.twig?v=' + sensei_widget_version,
    'text!../../../../templates/dynseg/process_starts/process_starts.twig?v=' + sensei_widget_version,
    '../../../searchable_select.js?v=' + sensei_widget_version,
], function(
    twig,
    moment,
    Backbone,
    Model,
    processStartRawTemplate,
    processStartsRawTemplate,
    SearchableSelect,
){
    const startTemplate = twig({
        id: '/sensei/dynseg/process_starts/process_start.twig',
        data: processStartRawTemplate,
        allowInlineIncludes: true
    });

    const startsTemplate = twig({
        id: '/sensei/dynseg/process_starts/process_starts.twig',
        data: processStartsRawTemplate,
        allowInlineIncludes: true
    });

    const startTypes = [
        'enter',
        'leave',
        'datetime',
        'daily',
        'weekly',
        'monthly',
    ];

    const ProcessStartView = Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-edit-modal-process-start-remove': 'onRemoveClick',

            'change input[name="process_id"]': 'onProcessChange',
            'change input[name="pipeline_id"]': 'onPipelineChange',

            'change input[name="datetime_date"]': 'onDateChange',
            'input input[name="time_hour"]': 'onHourChange',
            'input input[name="time_minute"]': 'onMinuteChange',
            'input input[name="daily_day_period"]': 'onDayPeriodChange',
            'change input:checked[name=\"monthly_mode\"]': 'onMonthlyModeChange',
            'input input[name="monthly_day"]': 'onMonthlyDayChange',
            'click .sensei-dynseg2-edit-modal-process-start-weekday-button': 'onWeekdayChange',
        },

        initialize({pipelines, dynseg}) {
            this.pipelines = pipelines;
            this.dateFormat = 'DD.MM.YYYY';
            this.timezone = moment.tz(APP.constant('account').timezone).utcOffset()*60;
            this.dynseg = dynseg;
        },

        render() {
            let weekdays = {
                mon: false,
                tue: false,
                wed: false,
                thu: false,
                fri: false,
                sat: false,
                sun: false,
            };
            let time = this.model.get('time');
            let date = '';

            if(this.model.get('type') == 'weekly') {
                const modelWeekdays = this.model.get('weekdays') || {};

                Object.keys(weekdays).forEach((day) => {
                    weekdays[day] = !!modelWeekdays[day];
                });

                this.model.set('weekdays', weekdays);
            }

            if(this.model.get('type') == 'datetime' && this.model.get('date')) {
                date = moment.unix(this.model.get('date') + this.getTimezoneOffset()).utc().format(this.dateFormat);
            }

            if(!this.model.get('time')){
                time = {hour: '', minute: ''};
            } else {
                time = {hour: this.model.get('time').h ?? '0', minute: ('00' + (this.model.get('time').m || '0')).slice(-2)};
            }

            this.setElement($(startTemplate.render({
                model: this.model.toJSON(),
                cid: this.model.cid,
                weekdays,
                time,
                date,
                format: this.dateFormat,
                dynseg: this.dynseg,
                is_contacts: this.dynseg.isContacts(),
            })));

            const pipelineList = [
                {id: 0, option: SENSEI.locale.get('dynamic_segment.modals.edit.components.process_starts.buttons.pipeline')},
                ...this.pipelines
            ];
            
            this.$el.find('.content .sensei-dynseg2-process-start-process-id__container .title').after(
                SENSEI.widget.renderProcessesList(SENSEI.widget.Processes.toJSON().filter((process) => process.enabled), this.model.get('process_id') || 0, 'sensei-underlined-select', 'process_id', false, {disableCheck: false}),
            );

            this.$el.find('.content .sensei-dynseg2-process-start-pipeline-id__container .title').after(
                new SearchableSelect({disableCheck: false, disableSearch: true}).render(pipelineList, this.model.get('pipeline_id') || 0, 'sensei-underlined-select', 'pipeline_id'),
            );

            this.$el.find('.content__line .sensei-searchable-select__hidden-input').trigger('change');

            return this.$el;
        },

        onRemoveClick(event) {
            this.model.collection.remove(this.model);
            this.remove();
        },


        onProcessChange({currentTarget}) {
            this.model.set('process_id', parseInt(currentTarget.value));
            if(this.model.get('process_id')){
                let hostConstructor = (localStorage.getItem('senseiConstructorUrl') || 'https://my.sensei.plus');
                this.$el.find('.content .sensei-dynseg2-process-start-process-id__container .link-button')
                    .removeClass('disabled')
                    .attr('href', SENSEI.config.getConstructorDomain() + '/constructor/' + APP.constant('account').id + '/' + this.model.get('process_id'));
            } else {
                this.$el.find('.content .sensei-dynseg2-process-start-process-id__container .link-button')
                    .addClass('disabled');
            }
        },

        onPipelineChange({currentTarget}) {
            this.model.set('pipeline_id', parseInt(currentTarget.value));
            if(this.model.get('pipeline_id')){
                this.$el.find('.content .sensei-dynseg2-process-start-pipeline-id__container .link-button')
                    .removeClass('disabled')
                    .attr('href', '/leads/list/pipeline/' + this.model.get('pipeline_id'));
            } else {
                this.$el.find('.content .sensei-dynseg2-process-start-pipeline-id__container .link-button')
                    .addClass('disabled');
            }
        },

        getTimezoneOffset() {
            return this.timezone;
        },

        onDateChange({currentTarget}) {
            this.model.set('date', moment.utc(currentTarget.value, this.dateFormat).unix());
            this.$el.find('input[name="time_hour"]').trigger('sensei:validation:clear');
        },

        onHourChange({currentTarget}) {
            if(!this.model.get('time')) {
                this.model.set('time', {h: 0, m: 0});
                $(currentTarget).next('input[name="time_minute"]').val('00');
            }
            let time = this.model.get('time');
            let hour = parseInt(currentTarget.value) || 0;
            if(hour > 23) {
                currentTarget.value = '23';
                hour = 23;
            }
            this.model.set('time', {h: hour, m: time.m});
        },

        onMinuteChange({currentTarget}) {
            if(!this.model.get('time')) {
                this.model.set('time', {h: 0, m: 0});
                $(currentTarget).prev('input[name="time_hour"]').val('0');
            }
            let time = this.model.get('time');
            let minute = parseInt(currentTarget.value) || 0;
            if(minute > 59) {
                currentTarget.value = '59';
                minute = 59;
            }
            this.model.set('time', {h: time.h, m: minute});

            this.$el.find('input[name="time_hour"]').trigger('sensei:validation:clear');
        },

        onDayPeriodChange({currentTarget}) {
            let value = parseInt(currentTarget.value) || 0;
            this.model.set('period_days', value);
        },

        onMonthlyModeChange({currentTarget}) {
            this.model.unset('time', {silent: true});
            if(currentTarget.value == 'day'){
                this.$el.find('.day-radio').removeClass('disabled').find('input[type="text"]').trigger('input');
                this.$el.find('.last-radio').addClass('disabled');
            } else if(currentTarget.value == 'last') {
                this.model.set('day', 'last');
                this.$el.find('.day-radio').addClass('disabled');
                this.$el.find('.last-radio').removeClass('disabled').find('input[type="text"]').trigger('input');
            }
        },

        onMonthlyDayChange({currentTarget}) {
            let value = parseInt(currentTarget.value) || 0;
            if(value > 31) {
                value = 31;
                currentTarget.value = 31;
            }
            this.model.set('day', value);
            this.$el.find('input[name="monthly_mode"][value="day"]:not(:checked)').prop('checked', true);
        },

        onWeekdayChange({currentTarget}) {
            const weekdays = JSON.parse(JSON.stringify(this.model.get('weekdays')));
            weekdays[currentTarget.name] = !!currentTarget.checked;
            this.model.set('weekdays', weekdays);

            this.$el.find('.weekday-validation').trigger('sensei:validation:clear');
        },

        validate(focus = false) {
            let failed = false;
            const triggerError = ($el, focusOnThis = true) => {
                $el.trigger('sensei:validation:error');
                failed = true;
                if(focus && focusOnThis){
                    focus = false;
                    $el.focus();
                }
            };

            if(this.model.get('process_id') == 0) {
                triggerError(this.$el.find('input[name="process_id"]'));
            }
            if(this.dynseg.isContacts() && this.model.get('pipeline_id') == 0) {
                triggerError(this.$el.find('input[name="pipeline_id"]'));
            }

            if(this.model.get('type') == 'datetime' && !this.model.get('date')) {
                triggerError(this.$el.find('input[name="time_hour"]'), false);
            }
            if(this.model.get('type') == 'daily' && !this.model.get('period_days')) {
                triggerError(this.$el.find('input[name="daily_day_period"]'));
            }
            if(this.model.get('type') == 'weekly') {
                if(Object.values(this.model.get('weekdays')).filter((day) => day).length == 0){
                    triggerError(this.$el.find('.weekday-validation'), false);
                }
            }
            if(this.model.get('type') == 'monthly' && !this.model.get('day')) {
                triggerError(this.$el.find('input[name="monthly_day"]'));
            }

            if(['datetime','daily','weekly','monthly'].includes(this.model.get('type')) && !this.model.get('time')) {
                triggerError(this.$el.find('input[name="time_hour"]').trigger('sensei:validation:error'));
            }
            return !failed;
        },
    });

    const ProcessStartsView = Backbone.View.extend({
        events: {
            'click .sensei-dynseg2-edit-modal-process-starts-add-start': 'onAddClick',
            'change input[name=\"sensei-dynseg2-edit-modal-process-starts-add-start-select\"]': 'onAddOptionClick',
        },

        initialize({pipelines, dynseg}) {
            this.typeSelect = new SearchableSelect({disableSearch: true, disableSelection: true, hideButton: true, disableScroll: true});
            this.pipelines = Object.values(pipelines).map((item) => ({id: item.id, option: item.name}));
            this.dynseg = dynseg;
        },

        render() {
            let $el = $(startsTemplate.render({type: this.dynseg.getContentType()}));
            this.$el.replaceWith($el);
            this.setElement($el);

            let elements = [];

            this.collection.forEach((model) => {
                let view = new ProcessStartView({model, pipelines: this.pipelines, dynseg: this.dynseg});
                model.view = view;
                elements.push(view.render({types: startTypes}));
            })

            this.$el.find('#sensei-dynseg2-edit-modal-process-starts-content').prepend(elements);

            this.$el.find('.sensei-dynseg2-edit-modal-process-starts-add-start').prepend(this.renderTypeSelect());

            this.$el.find('#sensei-dynseg2-edit-modal-process-starts-content').sortable({
                items: '.sensei-dynseg2-edit-modal-process-start',
                handle: '.handle',
                axis: 'y',
                appendTo: this.$el,
                placeholder: 'sensei-dynseg2-edit-modal-process-starts-placeholder',
                containment: '.sensei-dynseg2-modal .modal-body',
                scroll: true,
                
                helper: function(e, t) {
                    var i = t.clone();
                    return i
                },
                update: (_, { item }) => {
                    let order = [];
                    this.$el.find('#sensei-dynseg2-edit-modal-process-starts-content')
                        .find('.sensei-dynseg2-edit-modal-process-start')
                        .each((i, elem) => {
                            order.push(elem.dataset.cid);
                        });
                    this.collection.comparator = (a, b) => (order.indexOf(a.cid) - order.indexOf(b.cid));
                    this.collection.sort();
                    this.collection.comparator = false;
                    
                }
            });

            return this.$el;
        },

        renderTypeSelect(){
            return this.typeSelect.render(
                [
                    {id: '', hidden: true, option: ''},
                    ...startTypes.map((item) => ({
                        id: item,
                        option: SENSEI.locale.get('dynamic_segment.modals.edit.components.process_starts.types.'+item+'.title'+(this.dynseg.isContacts()?'_contact':'')),
                        title: '',
                    }))
                ],
                '',
                'sensei-dynseg2-edit-modal-process-starts-add-start-select',
                'sensei-dynseg2-edit-modal-process-starts-add-start-select'
            );
        },

        addStart(type) {
            let model = new Model({type})
            this.collection.add(model);
            let view = new ProcessStartView({model, pipelines: this.pipelines, dynseg: this.dynseg});
            model.view = view;
            this.$el.find('.sensei-dynseg2-edit-modal-process-starts-add-start')
                .before(view.render({types: startTypes}));
        },

        onAddClick(event) {
            this.typeSelect.showList();
        },

        onAddOptionClick(event) {
            this.addStart($(event.target).val());
        },

        validate(focus = false){
            let failed = false;
            this.collection.filter((model) => {
                if(!model.view || model.view.validate(focus)){
                    return true;
                }
                failed = true;
                return false;
            });
            return !failed;
        },
    });

    return {
        ProcessStartView,
        ProcessStartsView,
    };
});