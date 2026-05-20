define([
    'backbone',
    './model.js?v=' + sensei_widget_version
], function(
    Backbone,
    Model
){
    return Backbone.Collection.extend({
        model: Model,
    });
});