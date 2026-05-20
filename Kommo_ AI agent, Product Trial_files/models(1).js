define(['jquery'], function($) {
	return function(widget) {
		this.ScriptModel = Backbone.Model.extend({});
		this.ScriptsCollection = Backbone.Collection.extend({
			model: this.ScriptModel,
			isLoaded: false,
			initialize: function() {
				this.on('reset', function(model) {
					this.setIsLoaded(true);
				});
			},
			load: async function() {
				let scripts = await widget.API.getEnabledScripts();
				this.reset(scripts);
				return this;
			},
			setIsLoaded: function(value) {
				this.isLoaded = value;
				this.trigger('change:isLoaded', this, value);
			}
		});

		this.GroupModel = Backbone.Model.extend({});
		this.GroupsCollection = Backbone.Collection.extend({
			model: this.GroupModel,
			groupsRecord: {},
			isLoaded: false,
			initialize: function() {
				this.on('reset', function(model) {
					this.groupsRecord = model.toJSON().reduce((obj, el) => {
						obj[el.id] = el.name;
						return obj;
					}, {});
					this.setIsLoaded(true);
				});
			},
			load: async function() {
				let groups = await widget.API.getGroups();
				this.reset(groups);
				return this;
			},
			setIsLoaded: function(value) {
				this.isLoaded = value;
				this.trigger('change:isLoaded', this, value);
			}
		})
	};
});