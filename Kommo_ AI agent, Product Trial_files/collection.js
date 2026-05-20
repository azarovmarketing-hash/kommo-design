define([
    'backbone',
    './v1/model.js?v=' + sensei_widget_version,
    './v2/model.js?v=' + sensei_widget_version,
], function(
    Backbone,
    ModelV1,
    ModelV2,
){
    return Backbone.Collection.extend({
        model: function (attrs, options) {
            if(['leads', 'linked_contacts', 'set_of_leads', 'set_of_contacts', 'contacts'].includes(attrs?.type)) {
                return new ModelV2(attrs, options);
            } else if(attrs?.type == 'entities') {
                return new ModelV1(attrs, options);
            }
        }
    });
});