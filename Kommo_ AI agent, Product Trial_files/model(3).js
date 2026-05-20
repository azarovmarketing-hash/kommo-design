define([
    '../../nested_model.js?v=' + sensei_widget_version
], function(
    NestedModel
){
    return NestedModel.extend({
        defaults: {
            type: 'enter', 
            process_id: 0,
            pipeline_id: 0,
        },

    });
});