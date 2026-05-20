define([
    '../model.js?v=' + sensei_widget_version
], function(
    BaseModel
){
    return BaseModel.extend({
        defaults: {
            id: 0,
            name: '',
            type: 'entities',
            config: {
                amo_filter: '',
                date_filter: {
                    entity_type: 2,
                    field_id: "created_at",
                    from: "",
                    to: "",
                },
            },
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
            
            process_id_on_enter: 0,
            process_id_on_leave: 0,
            process_id_on_stay: 0,
            update_every: 60
            
        },
        initialize(data) {

        },

        isMultisegment() {
            return false;
        },

        isLeads() {
            return true;
        },

        isContacts() {
            return false;
        },

        isTypeValid() {
            return this.get('type') == 'entities';
        },

        getContentType() {
            return 'leads';
        },

        version() {
            return 1;
        },
        
    });
});