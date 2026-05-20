define([
    'jquery',
    'lib/components/base/modal',
    './alert.js?v=' + sensei_widget_version,
], function ($, Modal, Alert) {
    function Billing(config) {
        var self = this;
        this.baseUrl = config.getBaseBillingUrl();
        var widget = config.getWidget();
        config.billing_is_bind = typeof config.billing_is_bind === 'undefined' 
            ? false 
            : config.billing_is_bind;

        try {
            var widgetCode = widget.get_settings().widget_code;
        } catch (e) {
            var widgetCode = config.widgetCode;
        }

        this.billingLink = 'settings/widgets/'+ widgetCode +'?billing';

        try {
            APP.router.addRoute(this.billingLink, 'sensei_billing', function () {
                var handler = this;

                handler.destroy = self.destroy;
                self.renderBillingPage();
            });
        } catch(e) {
            
        }

        this.isDomainSet = false;

        this.send = function (url, method, data) {
            if (!this.isDomainSet) {
                this.isDomainSet = true;

                const senseiServerDomain = localStorage.getItem('sensei_server_domain') || config.getBaseDomain();

                config.setBaseDomain(senseiServerDomain);
                config.saveBaseDomainToLS();
            }

            data = data || {};

            this.baseUrl = config.getBaseBillingUrl();

            var params = {
                url: this.baseUrl + url,
                data: data,
                method: method,
            };

            return new Promise(function (resolve, reject) {
                const onSuccess = function(data) {
                    if (typeof data === 'object' && data.data) {
                        if (data.hasOwnProperty('server')) {
                            config.setBaseDomain(data.server);
                            config.saveBaseDomainToLS();
                        }
						
                        resolve(data.data);
                    } else {
                        resolve(data);
                    }
                };
                const onError = function(jqXHR, textStatus, errorThrown) {
                    reject(errorThrown);
                    var msg = SENSEI.locale.get('billing.error.text');

                    if (jqXHR.responseJSON && jqXHR.responseJSON.status) {
                        msg = SENSEI.locale.get('billing.error.code', {code: jqXHR.responseJSON.status});
                    }

                    config.getWidget().showAlertModal(msg, 0);
                };

                const widget = config.getWidget();
                if (typeof widget.$authorizedAjax == 'function') {
                    params.headers = {
                        'X-Account': APP.constant('account').id,
                    };

                    widget.$authorizedAjax(params).done(onSuccess).fail(onError);

                } else {
                    
                    params.headers = {
                        'X-Domain': APP.widgets.system.domain,
                        'X-Login': APP.widgets.system.amouser,
                        'X-Api-Key': '',
                        'X-Api-Key-Set': 0,
                        'X-Account': APP.constant('account').id,
                    };

                    $.ajax(params).success(onSuccess).error(onError);
                }
            });
        };

        this.getAccount = function() {
            return self.send('account', 'GET');
        };

        this.getPageHtml = function(type) {
            return self.send('view', 'GET', {type: type, widget_code: widgetCode, lang: APP.lang_id});
        };

        this.goToBillingPage = function () {
            if (window.location.href.indexOf(this.billingLink) > -1) {
                this.renderBillingPage();
            } else {
                try {
                    APP.router.navigate(self.billingLink, {trigger: true});
                } catch (e) {
                    
                }
            }
        };

        this.renderBillingPage = function () {
            $('#work_area').addClass('sensei-position-static').html('<span class="spinner-icon spinner-icon-abs-center"></span>');
            this.getPageHtml('page').then(function (html) {
                $('#work_area').html(html).removeClass('sensei-position-static');
            });
        };

        this.bind_actions = function () {
            if (!config.billing_is_bind) {
                $(document).on('click', '.sensei-prolong-button', function (e) {
                    return new Modal({
                        class_name: 'modal-window',
                        init: function ($modal_body) {
                            $modal_body.html('<span class="spinner-icon spinner-icon-abs-center"></span>');
                            self.getPageHtml('modal').then(function (html) {
                                $modal_body.trigger('modal:loaded').html(html).trigger('modal:centrify');
                            });
                        },
                        destroy: function () {
                        }
                    });
                });

                config.billing_is_bind = true;
            }
        };

        this.destroy = function () {
            $(document).off('click', '.sensei-prolong-button')
        };
    }

    return Billing
});
