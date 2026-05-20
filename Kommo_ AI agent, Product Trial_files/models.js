define([], function () {
    return function () {
        let self = this;


        this.ProcessModel = Backbone.Model.extend({
            update: function (processData, onSuccess, onError) {
                let self = this;
                let id = this.get('id');
                let onFulfilled = function (response) {
                    if (response.status == 200) {
                        self.set(processData);
                        onSuccess(response.data);
                    } else {
                        onError(response);
                    }
                };
                SENSEI.api.updateProcess(id, processData).then(onFulfilled, onError);
            },
            start: function (data, onSuccess, onError) {
                let id = this.get('id');
                let onFulfilled = function (response) {
                    if (response.status == 200) {
                        onSuccess(response.data);
                    } else {
                        onError(response);
                    }
                };
                SENSEI.api.startProcess(id, data).then(onFulfilled, onError);
            }
        });

        this.ProcessItemModel = Backbone.Model.extend({

        });

        this.CreateTaskItem = this.ProcessItemModel.extend({

        });

        this.ConditionItem = this.ProcessItemModel.extend({

        });

        this.ProcessItemResultModel = Backbone.Model.extend({

        });


        this.ProcessesCollection = Backbone.Collection.extend({
            model: this.ProcessModel,
            needOpenProcess: true,
            load: function () {
                let self = this;
                SENSEI.api.getAllProcesses().then(function (response) {
                    let cachedVersion = localStorage.getItem('sensei_widget_version');
                    let currentVersion = (response.version || {}).widget;
                    if (cachedVersion != currentVersion) {
                        APP.widgets.clear_cache();
                        localStorage.setItem('sensei_widget_version', currentVersion);
                    }

                    self.reset(response.data);
                });
            },
            addProcess: function (processData, onSuccess, onError) {
                let self = this;
                let onFulfilled = function (response) {
                    if (response.status == 200) {
                        onSuccess(self.add(response.data));
                    } else {
                        onError(response);
                    }
                };
                SENSEI.api.createProcess(processData).then(onFulfilled, onError);
            },
            removeProcess: function (id, onSuccess, onError) {
                let self = this;
                let onFulfilled = function (response) {
                    if (response.status == 200) {
                        self.remove(id);
                        onSuccess(response.data);
                    } else {
                        onError(response);
                    }
                };
                SENSEI.api.deleteProcess(id).then(onFulfilled, onError);
            },
        });

        this.ProcessItemsCollection = Backbone.Collection.extend({
            model: function (model, options) {
                switch (model.type) {
                    case 'task':
                        return new self.CreateTaskItem(model, options);

                    case 'condition':
                        return new self.ConditionItem(model, options);
                }
            }
        });

        this.ProcessItemResultsCollection = Backbone.Collection.extend({
            model: this.ProcessItemResultModel,
        });

        this.ProcessInstanceModel = Backbone.Model.extend({});
        this.ProcessInstanceCollection = Backbone.Collection.extend({
            model: this.ProcessInstanceModel,
            isLoading: false,
            load: function (entityId, entityType, withSubprocesses) {
                let self = this;
                this.isLoading = true;
                SENSEI.api.getInstances(entityId, entityType, withSubprocesses).then(function (response) {
                    if (!Array.isArray(response.data)) {
                        response.data = Object.values(response.data);
                    }
                    self.reset(response.data);
                    self.isLoading = false;
                }, function (error) { self.isLoading = false; });
            }
        });

        this.ProcessButtonModel = Backbone.Model.extend({});
        this.ProcessButtonsCollection = Backbone.Collection.extend({
            model: this.ProcessButtonModel,
            comparator: 'sort',
            load: function () {
                let self = this;
                SENSEI.api.getProcessButtons().then(function (response) {
                    self.reset(response.data);
                });
            },
            update: function (onSuccess, onError) {
                let self = this;
                let onFulfilled = function (response) {
                    if (response.status == 200) {
                        self.reset(response.data);
                        onSuccess(response.data);
                    } else {
                        onError(response);
                    }
                };
                SENSEI.api.setProcessButtons({ items: this.toJSON() }).then(onFulfilled, onError);
            },
        });
    };
});