define([
    'jquery', 
    './config.js?v=' + sensei_widget_version,
    './collection_sync.js?v=' + sensei_widget_version,
], function(
    $, 
    config,
    Sync) {
    return function Socket() {
        var self = this;

        this.socket = null;
        this.reconnectTimeout = 1000;
        this.connected = false;

        this.oncloseStack = [];
        this.onmessageStack = [];
        this.onerrorStack = [];

        this.createConnection = async function () {
            await config.loadBaseDomain();

            const url = config.getSocketUrl() + '?key=' + APP.constant('account').id;

            self.socket = new WebSocket(url);

            self.socket.onclose = function (event) {
                self.connected = false;

                if (event.wasClean) {
                    
                } else {
                    
                    setTimeout(function () {
                        self.createConnection();
                    }, self.reconnectTimeout);

                    self.reconnectTimeout = self.reconnectTimeout * 2;

                    
                }

                $.each(self.oncloseStack, function (i, func) {
                    try {
                        func(event);
                    } catch (e) {
                        self.log(e);
                        window.SENSEI.logger.sendLogError(e);
                    }
                });
            };

            self.socket.onmessage = function (event) {
                var data = {};

                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    self.log(e);
                    window.SENSEI.logger.sendLogError(e);
                    return;
                }

                $.each(self.onmessageStack, function (i, obj) {
                    try {
                        if (obj.event && data.event == obj.event) {
                            obj.callback(data);
                        } else if (!obj.event) {
                            obj.callback(data);
                        }
                    } catch (e) {
                        self.log(e);
                        window.SENSEI.logger.sendLogError(e);
                    }
                });
            };


            
            return new Promise(function(resolve, reject) {
                self.socket.onopen = async function (event) {
                    self.reconnectTimeout = 1000;
                    self.connected = true;

                    self.updateContext();
                    self.send({"action": "setUserId", "user_id": APP.constant('user').id});
                    await new Promise(r => setTimeout(r, 100));


                    resolve(self.socket);
                };

                self.socket.onerror = function (error) {
                    $.each(self.onerrorStack, function (i, func) {
                        try {
                            func(event);
                        } catch (e) {
                            self.log(e);
                            window.SENSEI.logger.sendLogError(e);
                        }
                    });

                    self.log(error.message);
                    window.SENSEI.logger.sendLogError(error);
                    reject(error);
                };
            });
        };

        this.log = function (msg) {
            if (config.isTest()) {
                console.debug(msg)
            }
        };

        this.send = function (data) {
            self.socket.send(JSON.stringify(data));
        };

        this.updateContext = function () {
            const replacePatternsMap = [
                {'pattern': /imbox\/\d+\//, 'value': ''},
            ];
            const path = replacePatternsMap.reduce((path, replace) => path.replace(replace.pattern, replace.value), location.pathname);
            const context = 'amo' + path.split('/').join(':');
            window['SENSEI'] = Object.assign(window['SENSEI'] || {}, {context: context});
            self.send({"action": "setContext", "context": context});
        };

        this.close = function () {
            self.socket.close();
        };

        this.onclose = function (callback) {
            self.oncloseStack.push(callback);
        };

        this.onerror = function (callback) {
            self.onerrorStack.push(callback);
        };

        this.onmessage = function (event, callback) {
            if (typeof event == 'function') {
                self.onmessageStack.push({callback: event});
            } else {
                self.onmessageStack.push({callback: callback, event: event});
            }
        };

        

        this.unsubscribeMessage = function (callback) {
            let i = self.onmessageStack.findIndex((item) => item.callback === callback);
            if(i != -1){
                self.onmessageStack.splice(i,1);
                return true;
            }
            return false;
        }

        this.synchronizeCollection = (collection, event) => {
            return new Sync(self, collection, event);
        };
    }
});