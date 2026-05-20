define(['jquery', 'underscore', 'lib/components/base/modal', 'twigjs'], function ($, _, Modal, twig) {
    return {
        showAlertModalPromise: function(callback) {
            let Alert = this;
            if (_.isFunction(callback)) {
                return new Modal({
                    class_name: 'modal-window',
                    init: function($modal_body) {
                        let self = this,
                            promise = callback(),
                            handler = function(result) {
                                let text = result['text'] ? result['text'] : '';
                                let success = result['success'] ? result['success'] : false;
                                let timeToClose = result['timeout'] ? result['timeout'] : null;
                                let html = Alert.getModalHTML(text, success);
                                $modal_body.trigger('modal:loaded').html(html).trigger('modal:centrify');
                                if (timeToClose && _.isNumber(timeToClose)) {
                                    setTimeout(_.bind(function() { self.destroy(); }, self), timeToClose);
                                }
                            };
                        promise.then(handler,handler);
                    },
                    destroy: function() {}
                });        
            }
            return false;
        },
        showAlertModal: function(text, success, timeToClose, destroy = () => {}, disableOverlayClick = false) {
            const that = this;

            return new Modal({
                class_name: 'modal-window',
                disable_overlay_click: disableOverlayClick,
                init: function($modal_body) {
                    let html = that.getModalHTML(text, success);
                    $modal_body.trigger('modal:loaded').html(html).trigger('modal:centrify');
                    if (timeToClose && _.isNumber(timeToClose)) {
                        setTimeout(_.bind(function() { this.destroy(); }, this), timeToClose);
                    }
                },
                destroy: function() { destroy(); }
            });
        },
        showErrorModal: function() {
            const langMap = {
                'ru': 'В сервисе Sensei возникла ошибка, обратитесь к разработчикам.',
                'en': 'Sensei encountered an error. Please contact the developers.',
                'es': 'Un error ocurrió en Sensei, ponte en contacto con desarrolladores.',
                'pt': 'Ocorreu um erro no serviço. Contate o desenvolvedor.'
            };

            this.showAlertModal(langMap[APP.lang_id] ?? 'Sensei encountered an error. Please contact the developers.');
        },
        getModalHTML: function(text, success) {
            let modal_html;
            if (success) {
                modal_html = twig({
                    ref: '/tmpl/common/modal/success.twig'
                }).render({
                    msg: text
                });
            } else {
                modal_html = twig({
                    ref: '/tmpl/common/modal/error.twig'
                }).render({
                    text: text,
                    no_retry: '1'
                });
            }
            return modal_html;
        }
    };
});
