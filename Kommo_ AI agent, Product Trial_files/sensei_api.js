define(['jquery', './config.js?v=' + sensei_widget_version], function($, config) {
    return function() {
        var self = this;
        this.baseUrl = config.getBaseApiUrl();
        this.isDomainSet = false;

        this._send = function(widget, params, onSuccess, onError) {
            if (!SENSEI.isSetAmoToken) {
                setTimeout(() => {
                    this._send(widget, params, onSuccess, onError);
                }, 100);
            } else {
                widget.$authorizedAjax(params).done(onSuccess).fail(onError);
            }
        }

        this.send = function (url, method, data) {
            if (!this.isDomainSet) {
                this.isDomainSet = true;

                const senseiServerDomain = localStorage.getItem('sensei_server_domain') || config.getBaseDomain();

                config.setBaseDomain(senseiServerDomain);
                config.saveBaseDomainToLS();
            }

            data = data || {};
            
            this.baseUrl = config.getBaseApiUrl();

            var params = {
                url: this.baseUrl + url,
                method: method,
                dataType: 'json',
                xhrFields: {
                    withCredentials: true,  
                },
            };

            if (method == 'POST') {
                if ( data instanceof FormData ){
                    params.data = data;
                    params.contentType = false;
                } else {
                    params.data = JSON.stringify(data);
                    params.contentType = 'application/json';
                }
                params.processData = false;
            } else {
                params.data = data;
            }

            return new Promise((resolve, reject) => {
                let checkError = function(jqXHR, textStatus, errorThrown) {
                    reject(errorThrown);
                };

                const onSuccess = function(data, textStatus, jqXHR) {
                    SENSEI.isSetAmoToken = true;
                    if (jqXHR.getResponseHeader('X-Session-Token')) {
                        config.setToken(jqXHR.getResponseHeader('X-Session-Token'));
                    }

                    if (data && data.hasOwnProperty('server')) {
                        config.setBaseDomain(data.server);
                        config.saveBaseDomainToLS();
                    }

                    resolve(data);
                };
                const onError = function(jqXHR, textStatus, errorThrown) {

                    reject({jqXHR, textStatus, errorThrown});
                };

                
                const widget = config.getWidget();
                if (typeof widget.$authorizedAjax == 'function') {
                    params.headers = {
                        'X-Account': APP.constant('account').id,
                        'X-Locale': APP.lang_id,
                    };

                    
                    if (SENSEI.isSetAmoToken === undefined) {
                        SENSEI.isSetAmoToken = false;
                        widget.$authorizedAjax(params).done(onSuccess).fail(onError);
                    } else {
                        this._send(widget, params, onSuccess, onError);
                    }
                } else {
                    
                    params.headers = {
                        'X-Session-Token': config.getToken(),
                        
                        'X-Domain': APP.widgets.system.domain,
                        'X-Login': APP.widgets.system.amouser,
                        'X-Api-Key': '',
                        'X-Api-Key-Set': 0,
                        'X-Account': APP.constant('account').id,
                        'X-Locale': APP.lang_id,
                    };

                    $.ajax(params).success(onSuccess).error(onError);
                }
            });
        };

        this.getProcesses = function () {
            return self.send('process/list', 'GET');
        };

        this.getAllProcesses = function () {
            return self.send(`process/list?filter[status]=all`, 'GET');
        };

        this.createProcess = function(processData) {
            return self.send('process/create', 'POST', processData);
        };

        this.deleteProcess = function(id) {
            return self.send('process/delete/' + id, 'POST');
        };

        this.updateProcess = function(id, processData) {
            return self.send('process/update/' + id, 'POST', processData);
        };

        this.getProcessInfo = function(id) {
            return self.send('process/get/' + id + '?with=params', 'GET');
        };

        this.setProcessInfo = function(id, processData) {
            return self.send('process/set/' + id, 'POST', processData);
        };

        this.orderProcesses = function(ordereIds) {
            return self.send('process/order', 'POST', ordereIds);
        };

        this.startProcess = function(id, data) {
            return self.send('process/start/' + id, 'POST', data);
        };

        this.getElements = function() {
            return self.send('element/list', 'GET');
        };

        this.getInstances = function(entityId, entityType, withSubprocesses=false) {
            return self.send('instance/list', 'GET', {
                entity_id: entityId,
                entity_type: this.getEntityTypeByAmoType(entityType),
                with_subprocesses: withSubprocesses
            });
        };

        this.getInstanceInfo = function(id) {
            return self.send('instance/get/' + id + '?with=params', 'GET');
        };

        this.continueInstance = function(id, elementId) {
            return self.send('instance/continue', 'POST', {
                id: id,
                process_item_id: elementId
            });
        };

        this.stopInstance = id => self.send(`instance/stop/${id}`, 'POST', {});

        this.getProcessButtons = function() {
            return self.send('process/buttons/get', 'GET');
        };

        this.setProcessButtons = function(data) {
            return self.send('process/buttons/set', 'POST', data);
        };
        
        this.getEntityTypeByAmoType = function (type) {
            let types = {1: 2, 2: 1, 3: 3};
            return types[type];
        };

        this.getProcessStats = function(id, data) {
            const formData = new FormData();
            data = data || {};
            for (let key in data) {
                formData.append(key, data[key]);
            }
            return self.send('process/stats/' + id, 'POST', formData);
        };

        this.getProcessResults = function(id) {
            return self.send('process/' + id + '/element/end', 'GET');
        };

        this.createDynamicSegment = function (data) {
            return self.send('dynamic-segment/create', 'POST', data);
        };

        this.getDynamicSegments = function () {
            return self.send('dynamic-segment/list', 'GET');
        };

        this.getDynamicSegment = function (id) {
            return self.send(`dynamic-segment/get/${id}`, 'GET');
        };

        this.updateDynamicSegment = function (id, data) {
            return self.send(`dynamic-segment/update/${id}`, 'POST', data);
        };

        this.createDynamicSegment = function (data) {
            return self.send(`dynamic-segment/create`, 'POST', data);
        };

        this.deleteDynamicSegment = function (id) {
            return self.send(`dynamic-segment/delete/${id}`, 'POST');
        };

        this.recountDynamicSegment = function (id) {
            return self.send(`dynamic-segment/content-update/${id}`, 'POST');
        };
        
        this.launchDynamicSegment = function (id, process_id, pipeline_id) {
            return self.send(`dynamic-segment/start/${id}`, 'POST', {
                process_id,
                pipeline_id,
            });
        };

        this.setTaskResult = function (data) {
            return self.send('element/task/set_result', 'POST', data);
        };

        this.setTaskWithDeadline = function (data) {
            return self.send('element/task/set_task_with_deadline', 'POST', data)
        };

        this.finishElement = function (type, data) {
            return self.send(`element/${type}/finish_element`, 'POST', data);
        };

        this.setScriptResult = function (data) {
            return self.send(`element/script/set_result`, 'POST', data);
        };

        this.limiterSendCreateNote = function (data) {
            return self.send(`element/limiter/limiter_send_create_note`, 'POST', data);
        };

        this.getLimitLeads = function (data) {
            return self.send(`element/limiter/get_limit_leads`, 'POST', data);
        };

        this.getAllowedWidgetModulesNamesList = function (data) {
            return self.send(`widget/modules/list`, 'GET');
        };

        this.getBlockTasks = function (data) {
            return self.send(`element/task/get_block_tasks`, 'POST', data);
        }

        this.getFlagForm = function (data) {
            return self.send(`element/script/set_event_form`, 'POST', data);
        }

        this.setLogs = function (data) {
            return self.send(`front-logger/start`, 'POST', data);
        }

        this.getPauseModeFlag = function (userId) {
            return self.send(`pause-mode/${userId}`, 'GET');
        }

        this.setPauseModeFlag = function (userId, data) {
            return self.send(`pause-mode/${userId}`, 'POST', data);
        }
        
        this.getNotificationNumber = function () {
            return self.send(`support-chat/account-notifications`, 'GET');
        }

        this.instanceHistoryContinue = function(instancesData) {
            return self.send('instance-history/continue', 'POST', instancesData);
        };

        this.instanceHistoryStop = function(instancesData) {
            return self.send('instance-history/stop', 'POST', instancesData);
        };
    };
});
