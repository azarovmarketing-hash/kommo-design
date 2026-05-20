define([
    'jquery',
    'lib/components/base/modal',
    '../../alert.js?v=' + sensei_widget_version,
    '../../utils.js?v=' + sensei_widget_version,
], function ($, Modal, Alert, Utils) {
    return Backbone.View.extend({
        initialize({
            prerender,
            templates,
            processes,
            segment,
            destroy
        }) {
            this.processes = SENSEI.widget.Processes.toJSON();
            this.templates = SENSEI.widget.templates;
            this.segment = segment;
            this.segment.frequency = this.segment.update_every;

            this.prerender();
            this.render();

            return this;
        },
        events: {
            'change .sensei-run-current-segment-leads-checkbox input': 'onRunCurrentSegmentLeadsCheckboxChange',
            'input .sensei-segment-name': 'validate',
            'paste .sensei-segment-name': 'validate',
            'input .sensei-segment-date-filter-from': 'validate',
            'paste .sensei-segment-date-filter-from': 'validate',
            'input .sensei-segment-date-filter-to': 'validate',
            'paste .sensei-segment-date-filter-to': 'validate',
            'change .sensei-segment-leads-enter input': 'validate',
            'change .sensei-segment-leads-stay input': 'validate',
            'change .sensei-segment-leads-leave input': 'validate',
            'change .sensei-segment-frequency input': 'validate',
            'change .sensei-segment-date-filter-field-id': 'validate',
            'click .sensei-create-segment-button:not(.button-input-disabled)': 'onCreateSegmentButtonClick',
            'click .sensei-save-segment-button:not(.button-input-disabled)': 'onSaveSegmentButtonClick'
        },
        setModal(modal) {
            this.modal = modal;
        },
        getModal() {
            return this.modal;
        },
        destroy() {
            document.dispatchEvent(new CustomEvent('sensei:dynseg:modal:closed', { bubbles: true }));
        },
        prerender() { },
        render() {
            const that = this;
            const {
                processes,
                destroy,
                templates: {
                    dynamic_segment_modal
                },
                segment: {
                    id,
                    name,
                    type = APP.data.current_entity,
                    frequency = 1440,
                    config,
                    process_id_on_enter,
                    process_id_on_stay,
                    process_id_on_leave
                }
            } = that;
            const {
                getDateFieldsList,
                prepareListForSelect
            } = new Utils();

            let grouped = {
                '1_leads': [
                    {
                        option: SENSEI.locale.get('dynamic_segment.date_filter.create'),
                        id: 'created_at'
                    },
                    {
                        option: SENSEI.locale.get('dynamic_segment.date_filter.update'),
                        id: 'updated_at'
                    },
                    {
                        option: SENSEI.locale.get('dynamic_segment.date_filter.close'),
                        id: 'closed_at'
                    }
                ]
            };
            prepareListForSelect(getDateFieldsList()).forEach((elem) => {
                let group = '';
                switch (elem.entity_type) {
                    case 2:
                        group = '1_leads';
                        break;
                    case 1:
                        group = '2_contacts';
                        break;
                    case 3:
                        group = '3_companies';
                        break;
                    default:
                        group = '4_other';
                }
                grouped[group] = grouped[group] || [];
                grouped[group].push(elem);
            });



            let groups = {
                '1_leads': SENSEI.locale.get('amo.lead.title'),
                '2_contacts': SENSEI.locale.get('amo.contact.title'),
                '3_companies': SENSEI.locale.get('amo.company.title'),
                '4_other': SENSEI.locale.get('general.other')
            };
            let dateFields = [
                {
                    id: null,
                    option: SENSEI.locale.get('general.button.choose'),
                    disabled: true
                }
            ];

            for (let i in grouped) {
                if (groups[i]) {
                    dateFields.push({
                        id: 'group_' + i,
                        option: groups[i],
                        disabled: true
                    });
                }
                for (let e in grouped[i]) {
                    dateFields.push(grouped[i][e]);
                }
            }

            let processesFiltered = [
                {
                    id: 'none',
                    name: SENSEI.locale.get('dynamic_segment.placeholder.process')
                },
                ...processes.filter((process) => process.enabled)
            ];

            const modal = new Modal({
                class_name: 'sensei-dynamic-segment-modal',
                init(modalBody) {
                    const html = dynamic_segment_modal.render({
                        id: id || undefined,
                        name,
                        type: type === 'events' ? 'events' : 'entities',
                        frequency,
                        processes: [],
                        config,
                        process_id_on_enter: process_id_on_enter || 'none',
                        process_id_on_stay: process_id_on_stay || 'none',
                        process_id_on_leave: process_id_on_leave || 'none',
                        date_fields: dateFields,
                    }).replace(/text-input/g, '');

                    modalBody.addClass('sensei-w-600').trigger('modal:loaded').html(html).trigger('modal:centrify').find('.sensei-segment-name').focus();


                    that.setElement(modalBody);
                },
                destroy() {
                    destroy()
                }
            });

            that.setModal(modal);

            modal.$el.find('.sensei-segment-leads-enter .sensei-place-for-process-select').replaceWith(
                SENSEI.widget.renderProcessesList(processesFiltered, process_id_on_enter || 'none', 'sensei-w-50', 'process_id_enter')
            );

            modal.$el.find('.sensei-segment-leads-stay .sensei-place-for-process-select').replaceWith(
                SENSEI.widget.renderProcessesList(processesFiltered, process_id_on_stay || 'none', 'sensei-w-50', 'process_id_stay')
            );

            modal.$el.find('.sensei-segment-leads-leave .sensei-place-for-process-select').replaceWith(
                SENSEI.widget.renderProcessesList(processesFiltered, process_id_on_leave || 'none', 'sensei-w-50', 'process_id_leave')
            );

            modal.$el.find('.sensei-place-for-process-select-one-time').replaceWith(
                SENSEI.widget.renderProcessesList(processes, 0, 'sensei-w-50 sensei-mb-0 hidden', 'process_one_time')
            );

            modal.el.dispatchEvent(new CustomEvent('sensei:dynseg:modal:opened', { bubbles: true }));
        },
        onRunCurrentSegmentLeadsCheckboxChange({
            currentTarget
        }) {
            $(currentTarget).closest('.sensei-run-current-segment-leads-checkbox').find('~ div').toggleClass('hidden');
        },
        validate() {
            const name = $('.sensei-segment-name').val();
            const from = +$('.sensei-segment-date-filter-from').val();
            const to = +$('.sensei-segment-date-filter-to').val();

            const button = $('.sensei-segment-id').length > 0 ? $('.sensei-save-segment-button') : $('.sensei-create-segment-button');

            if (name.length > 0 && !Number.isNaN(from) && !Number.isNaN(to)) {
                button.trigger('button:save:enable');
            } else {
                button.trigger('button:save:disable');
            }
        },
        async onCreateSegmentButtonClick({
            currentTarget
        }) {
            $(currentTarget).addClass('events-off');

            try {

                const {
                    status,
                    message
                } = await SENSEI.api.createDynamicSegment(this.collectSegmentData());

                if (status === 200) {
                    this.getModal().el.dispatchEvent(new CustomEvent('sensei:dynseg:modal:saved', { bubbles: true }));
                    this.getModal().destroy();

                    Alert.showAlertModal(SENSEI.locale.get('dynamic_segment.segment_created'), true, 1000);
                } else {
                    throw new Error(message);
                }
            } catch ({
                message
            }) {
                this.getModal().destroy();

                Alert.showAlertModal(message, false, 1000);
            }
        },
        async onSaveSegmentButtonClick(currentTarget) {
            $(currentTarget).addClass('events-off');

            const segmentId = $('.sensei-segment-id').val();

            try {

                const {
                    status,
                    message
                } = await SENSEI.api.updateDynamicSegment(segmentId, this.collectSegmentData());

                if (status === 200) {
                    this.getModal().el.dispatchEvent(new CustomEvent('sensei:dynseg:modal:saved', { bubbles: true }));
                    this.getModal().destroy();

                    Alert.showAlertModal(SENSEI.locale.get('dynamic_segment.segment_saved'), true, 1000);
                } else {
                    throw new Error(message);
                }
            } catch ({
                message
            }) {
                this.getModal().destroy();

                Alert.showAlertModal(message, false, 1000, () => $(document).trigger('page:reload'));
            }
        },
        collectSegmentData() {
            let dateFilter = {
                field_id: $('.sensei-segment-date-filter-field-id input').val(),
                entity_type: 2,
                from: $('.sensei-segment-date-filter-from').val(),
                to: $('.sensei-segment-date-filter-to').val()
            };
            const fieldData = (new Utils()).getDateFieldsList().find(elem => elem.id == dateFilter.field_id);
            if (!!fieldData) {
                dateFilter.field_id = fieldData.id;
                dateFilter.entity_type = fieldData.entity_type;
                dateFilter.format = fieldData.format;
            }

            function sanitizeId(id) {
                if (id == 'none' || id == 0 || isNaN(id)) {
                    return null;
                }
                return id;
            }

            const shouldWeRunCurrentSegmentLeads = $('.sensei-run-current-segment-leads-checkbox input').is(':checked');
            const runCurrentSegmentLeadsForProcessId = shouldWeRunCurrentSegmentLeads ? sanitizeId(+$('.sensei-run-current-segment-leads-checkbox ~ div input.sensei-searchable-select__hidden-input').val()) : null;

            return {
                name: $('.sensei-segment-name').val(),
                type: APP.data.current_entity === 'events' ? 'events' : 'entities',
                update_every: $('.sensei-segment-frequency input').val(),
                config: {
                    amo_filter: $('.sensei-segment-amo-filter').val() || location.href,
                    date_filter: dateFilter
                },
                process_id_one_time: runCurrentSegmentLeadsForProcessId,
                process_id_on_enter: +sanitizeId($('.sensei-segment-leads-enter input.sensei-searchable-select__hidden-input').val()),
                process_id_on_stay: +sanitizeId($('.sensei-segment-leads-stay input.sensei-searchable-select__hidden-input').val()),
                process_id_on_leave: +sanitizeId($('.sensei-segment-leads-leave input.sensei-searchable-select__hidden-input').val()),
            };
        }
    });
});