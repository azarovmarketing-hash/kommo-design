define([
    '../../nested_model.js?v=' + sensei_widget_version
], function(
    NestedModel
){
    return NestedModel.extend({
        defaults: {
            operation: 'set', 
            dynseg_id: 0,
        },

    });
});