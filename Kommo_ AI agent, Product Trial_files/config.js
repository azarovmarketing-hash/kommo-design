define(['lib/common/cookie'], function (cookie) {
    function Config() {}

    Config.prototype = {
        baseDomain: 'api.sensei.plus',
        testBaseDomain: 'test.api.sensei.plus',
        constructorDomain: 'https://my.sensei.plus',
        testConstructorDomain: 'https://my.test.sensei.plus',
        testCookieName: 'sensei_test',
        widgetCode: '',
        widget: {},
        token: null,
        el: null,
        prefixLaziLoading: '/lib',
        robocode: null
    };

    Config.prototype.isTest = function () {
        return cookie.get(this.testCookieName) == 1;
    };

    Config.prototype.isNewArc = function() {
        let accId = parseInt(APP.constant('account').id);
        let isNewAcc = ([29394505, 29413210].indexOf(accId) !== -1);
        let isNewDomain = (this.baseDomain == 'upstream.sensei.plus');
        return (isNewAcc || isNewDomain);
    };

    Config.prototype.isDemo = function() {
        let accId = parseInt(APP.constant('account').id);
        let isDemoAcc = ([23300665].indexOf(accId) !== -1);
        return isDemoAcc;
    };

    Config.prototype.getConstructorDomain = function () {
        if (this.isTest()) {
            return this.testConstructorDomain;
        }

        return (localStorage.getItem('senseiConstructorUrl') || this.constructorDomain);
    };
    
    Config.prototype.getBaseDomain = function () {
        if (this.isTest()) {
            return this.testBaseDomain;
        }

        if (this.isDemo()) {
            return 'demo.upstream.sensei.plus';
        }

        return this.baseDomain;
    };

    
    Config.prototype.loadBaseDomain = async function () {
        if ( this.baseDomain == 'api.sensei.plus' ){
            if (this.isTest()) {
                this.setBaseDomain(this.testBaseDomain);
                this.saveBaseDomainToLS();
                return;
            }
            function timeout(ms, promise) {
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        reject('timeout error')
                    }, ms)
                    promise.then(resolve, reject)
                })
            }
            
            
            await timeout(2000, fetch('https://api.sensei.plus/v1/shard/' + APP.constant('account').id)).then(async (response) => {
                let responseJson = await response.json();
                if (response.ok && responseJson.status == 200){
                    this.setBaseDomain(responseJson.server);
                    this.saveBaseDomainToLS();

                } else {
                    
                }

            }).catch(function(error) {
                console.debug(error);
                window.SENSEI.logger.sendLogError(error);
            });
        }
    };

    Config.prototype.getSocketUrl = function () {
        const socketDomain = localStorage.getItem('sensei_socket_domain') ??
            (this.isTest() ? 'test.socket1.sensei.plus' : 'socket1.sensei.plus');

        return 'wss://' + socketDomain + '/socket/main';
    };

    Config.prototype.getBaseUrl = function () {
        return 'https://' + this.getBaseDomain() + '/';
    };
    
    Config.prototype.getBaseApiUrl = function () {
        return this.getBaseUrl() + 'v1/';
    };

    Config.prototype.getBaseBillingUrl = function () {
        return 'https://' + this.getBaseDomain() + '/billing/';
    };

    Config.prototype.getBaseJsUrl = function () {
        return this.getBaseUrl() + 'v2/js/';
    };

    Config.prototype.getBaseTwigUrl = function () {
        return this.getBaseUrl() + 'v2/templates/';
    };
    
    Config.prototype.getBaseStyleUrl = function () {
        return this.getBaseUrl() + 'v2/css/';
    };
    
    Config.prototype.getElUrl = function () {
        return this.getBaseUrl() + 'element';
    };
    
    
    Config.prototype.getWidget = function () {
        return this.widget;
    };

    Config.prototype.setWidget = function (widget) {
        this.widget = widget;
    };

    Config.prototype.getToken = function () {
        return this.token;
    };

    Config.prototype.setToken = function (token) {
        this.token = token;
    };

    Config.prototype.getEl = function () {
        return this.el;
    };

    Config.prototype.setEl = function (el) {
        this.el = el;
    };

    Config.prototype.setBaseDomain = function (baseDomain) {
        this.baseDomain = baseDomain;
    }

    Config.prototype.saveBaseDomainToLS = function () {
        localStorage.setItem('sensei_server_domain', this.baseDomain);
    };

    Config.prototype.getJsModulePath = function(moduleName) {
        if (!this.isInitJsModule(moduleName)) {
            return '';
        }
        
        return `${this.prefixLaziLoading}/v${this.jsModules[moduleName].version}/${this.jsModules[moduleName].path}?v=${sensei_widget_version}`;
    }

    Config.prototype.getJsModuleVersion = function(moduleName) {
        if (!this.isInitJsModule(moduleName)) {
            return '';
        }

        return this.jsModules[moduleName].version;
    }

    Config.prototype.initJsModules = function(dataModules = {}) {
        this.jsModules = {
            element_form_extended: {
                version: '1',
                path: 'element_form_extended/element_form_extended.js',
            },
            fields_modal: {
                version: '1',
                path: 'fields_modal/fields_modal.js'
            },
            robocode_multy_action: {
                version: '1',
                path: 'robocode_multy_action/robocode_multy_action.js'
            },
            process_buttons_view: {
                version: '1',
                path: 'process_buttons_view/process_buttons_view.js'
            },
            workplaces: {
                version: '1',
                path: 'workplace/workplace.js'
            }
        };
        for (var moduleName in dataModules) {
            if (this.jsModules[moduleName]) {
                this.jsModules[moduleName].version = dataModules[moduleName];
            } else {
                this.jsModules[moduleName] = {
                    version: dataModules[moduleName],
                    path: moduleName + '.js',
                };
            }
            
        }
    }

    Config.prototype.isInitJsModule = function(moduleName) {
        return !!this.jsModules[moduleName];
    }

    Config.prototype.robocode = {
        
        getOrigin() {
            return "robocode.bz";
        },

        getLkOrigin() {
            return (localStorage.getItem("robocode-lc-environment") ?? "https://lk.robocode.bz");
        },

        getUrl() {
            return (localStorage.getItem("robocode-triggers-environment") ?? "https://web.prod.robocode.bz");
        },

        getApiUrl() {
            return (localStorage.getItem("robocode-triggers-server-url")?.split('/')?.slice(0, -1)?.join('/') ?? "https://api.prod.robocode.bz/api");
        },

        getTokenUrl() {
            return (localStorage.getItem("robocode-triggers-server-url") ?? "https://api.prod.robocode.bz/api/token");
        },

        getWebhookHost() {
            return (localStorage.getItem("robocode-triggers-webhook-host") ?? "https://hook.prod.robocode.bz");
        },

        getStatndartClass(className) {
            let classes = {
                modal: "robocode-sensei-modal",
                iframe: "robocode-sensei-iframe",
            };
            return classes[className] || '';
        }
    }

    return new Config();
});
