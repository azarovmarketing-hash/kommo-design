define([
    '../model.js?v=' + sensei_widget_version,
    './config_model.js?v=' + sensei_widget_version,
], function (
    BaseModel,
    ConfigModel,
) {
    return BaseModel.extend({
        nested: {
            config: ConfigModel,
        },

        defaults: {
            id: 0,
            name: '',
            type: 'leads',
            config: {},

            update_progress: {
                current: 0,
                total: 0,
                start_time: null,
                finish_time: null,
                last_action_time: null
            },
            current_ids_count: 0,
            is_updating_now: true,
            last_update_at: null,

        },
        initialize(data) {

        },

        isMultisegment() {
            return ['set_of_leads', 'set_of_contacts'].includes(this.get('type'));
        },

        isLeads() {
            return ['leads', 'set_of_leads'].includes(this.get('type'));
        },

        isContacts() {
            return ['linked_contacts', 'set_of_contacts', 'contacts'].includes(this.get('type'));
        },

        isTypeValid() {
            return ['leads', 'linked_contacts', 'set_of_leads', 'set_of_contacts', 'contacts'].includes(this.get('type'));
        },

        getContentType() {
            let type = 'error';
            if (this.isLeads()) {
                type = 'leads';
            } else if (this.isContacts()) {
                type = 'contacts'
            }
            if (this.isMultisegment()) {
                type = 'multi_' + type;
            }
            return type;
        },

        version() {
            return 2;
        },

        async save() {
            if (this.get('id') == 0) {
                let data = await SENSEI.api.createDynamicSegment(this.toJSON());
                this.set('id', data?.data?.id || 0);
                return data;
            } else {
                return await SENSEI.api.updateDynamicSegment(this.get('id'), this.toJSON());
            }
        },
    });
});