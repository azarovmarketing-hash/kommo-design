define([
    '../../nested_model.js?v=' + sensei_widget_version
], function(
    NestedModel
){
    return NestedModel.extend({
        defaults: {
            type: '', 
            field_id: 0, 
            field_type: 0, 
            field_entity_type: 0, 
            from: 0,
            to: 0,
        },

    });
});