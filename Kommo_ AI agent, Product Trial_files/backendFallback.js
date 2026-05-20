define([
    'backbone'
], Backbone => {
    return Backbone.View.extend({
        el: '#work_area',
        initialize() {
            this.render();
        },

        render() {
            const src = window.SENSEI.config.getConstructorDomain() + '/amo/support_chat/' + APP.constant('account').id;
            this.setupStyles();
            const html = `<iframe scrolling="no" src="${src}" width="100%" height="100%" class="iframe_support-chat robocode-sensei-iframe">`;
            this.$el.append(html);
        },

        setupStyles() {
            $('#page_holder').addClass('sensei-support-chat');
            $('.content__top').addClass('hide');
        },

    });
});