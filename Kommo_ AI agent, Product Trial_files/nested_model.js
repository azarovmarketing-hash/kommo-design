define([
    'backbone'
], function(
    Backbone
){
    return Backbone.Model.extend({
        nested: {},

        parseNested: function(attributes) {
            for(let key in this.nested) {
                if(
                    !attributes[key] 
                    || ('object' !== typeof attributes[key]) 
                    || (attributes[key] instanceof Backbone.Model) 
                    || (attributes[key] instanceof Backbone.Collection)
                ) {
                    continue;
                }

                let embeddedClass = this.nested[key];
                let embeddedData = attributes[key];
                let object = new embeddedClass(embeddedData, {parse:true});
                object = this.setNestedEvents(object);
                attributes[key] = object;
            }
            return attributes;
        },

        set(attributes, options, ...args) {
            if('string' === typeof attributes){
                attributes = this.parseNested({[attributes]: options});

                return Backbone.Model.prototype.set.call(this, attributes, ...args);
            }

            return Backbone.Model.prototype.set.call(this, this.parseNested(attributes), options, ...args);
        },

        setNestedEvents(object) {
            let action = () => {
                this.trigger('change');
                this.resetNestedEvents();
            };

            this.listenTo(object, 'change', action);
            this.listenTo(object, 'add', action);
            this.listenTo(object, 'remove', action);
            this.listenTo(object, 'reset', action);
            this.listenTo(object, 'sort', action);

            return object;
        },

        resetNestedEvents() {
            this.stopListening();
            for(let key in this.nested) {
                if(!!this.attributes[key]){
                    this.setNestedEvents(this.attributes[key]);
                }
            }
        },

        toJSON() {
            let result = {};
            Object.keys(this.attributes).forEach((key) => {
                if(this.attributes[key]?.toJSON){
                    result[key] = this.attributes[key].toJSON();
                } else {
                    result[key] = this.attributes[key];
                }
            });
            return result;
        },

    });
});