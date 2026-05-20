define([
    './nested_model.js?v=' + sensei_widget_version
], function (
    NestedModel
) {
    return NestedModel.extend({
        defaults: {
            id: 0,
            name: '',
            type: 'entities',
            config: {
                amo_filter: '',
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

        },

        isMultisegment() {
            return false;
        },

        isLeads() {
            return false;
        },

        isContacts() {
            return false;
        },

        isTypeValid() {
            return false
        },

        getContentType() {
            return 'error';
        },

        version() {
            return 0;
        },

        async save() { },

        canBeDeleted() {
            return this.get('used_in_segments')?.length <= 0;
        },

        async delete(force = false) {
            if (!this.canBeDeleted() && !force) {
                return false;
            }
            if (this.get('id') != 0) {
                let data = await SENSEI.api.deleteDynamicSegment(this.get('id'));
                return data?.status == 200;
            }

            return false;
        }
    });
});