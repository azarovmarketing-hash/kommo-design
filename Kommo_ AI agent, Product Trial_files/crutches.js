define([
    'jquery',
    './config.js?v=' + sensei_widget_version,
    './storageService.js?v=' + sensei_widget_version,
], function($, config, StorageService) {
    return function Crutches() {
        
        this.storageService = new StorageService();
        this.key = 'clear_leftmenu_button_cache';
        this.minutesForClearCatch = 5;
        
        this.rulesClearCatchLeftMenu = () => {
            !$('#nav_menu').find(`[data-widget-code="${config.getWidget().get_settings().widget_code}"]`).length 
                    && this.diffTime() && this.clearCatchLeftMenu();
        };
        
        this.diffTime = () => {
            const time = this.storageService.getItem(this.key, false);
            return !!time ? (new Date().getTime() - time) > (1000 * 60 * this.minutesForClearCatch) : true;
        };
        
        this.clearCatchLeftMenu = () => {
            $.get( `https://${APP.widgets.system.domain}/ajax/settings/`, (data) => {
                data = data.response.params;
                let data$ = {
                    'ACTION': 'EDIT_ACCOUNT',
                    'account': {
                        'time_zone': APP.constant('account').timezone,
                        'name': APP.constant('account').name,
                        'subdomain': APP.constant('account').subdomain,
                        'country': APP.constant('account').country,
                        'date_format': data.date_formats.selected,
                        'time_format': data.time_formats.selected,
                        'deals_currency': APP.constant('account').currency,
                        'contact_name_display_order': data.contact_name_display_order.selected,
                        'customers_enabled': !!data.customers_enabled.checked ? "Y" : "",
                        'products_enabled': APP.constant('account').products.enabled ? "Y" : "",
                        'amojo_direct_enabled': !!data.amojo.direct_enabled.checked ? "Y" : "",
                        'amojo_group_chat_create_rights': data.amojo.group_chat_create_rights.selected,
                        'left_menu_hidden_items': {}
                    },
                    'session_token': APP.constant("session_token")
                }
                $.each(data.left_menu_hidden_items.items, function(index, elem) {
                    if (!!elem.is_role_shown || index == 'all_users') {
                        let param = {};
                        $.each(elem.items, function(i, item) {
                            param[i] = !item.is_hidden ? 1 : 0;
                        });
                        data$.account.left_menu_hidden_items[index] = param;
                    } else {
                        data$.account.left_menu_hidden_items[index] = '';
                    }
                });
                this.storageService.setItem(this.key, new Date().getTime());
                $.post( `https://${APP.widgets.system.domain}/ajax/settings/`, data$, () => { location.reload() });
            });
        };

        this.fixLeftMenuLocale = () => {
            if (SENSEI.widget.isGotCurrentLangs) {
                this.setLeftMenuText();
                return;
            }

            const onSuccess = function(data) {
                SENSEI.widget.langs = data;
                this.setLeftMenuText();
                SENSEI.widget.isGotCurrentLangs = true;
            }.bind(this);

            const onError = function(jqXHR, textStatus, errorThrown) {
                console.debug(jqXHR.responseText);
                this.setLeftMenuText();
            }.bind(this);

            let accountDomain = APP.widgets.system.domain;
            let widgetPath = SENSEI.config.widget.params.path;
            let widgetVersion = SENSEI.config.widget.params.version;
            let languageCode = APP.lang_id;

            let params = {
                "url": `https://${accountDomain}${widgetPath}/i18n/${languageCode}.json?v=${widgetVersion}`,
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json"
                }
            };

            $.ajax(params).success(onSuccess).error(onError);
        };

        this.setLeftMenuText = () => {
            $('#widget_page_sidebar #settings_aside .aside__list-item')
            .each((i, elem) => {
                let text = $(elem).attr('title');
                if(typeof text === 'string') {
                    text = text.match(/^left_menu\.[a-z_]+$/) ? text.replace('left_menu.', '') : $(elem).attr('id');
                    text = SENSEI.widget.langs.left_menu[text];
                    $(elem).attr('title', text);
                    $(elem).find('.aside__list-item-link').text(text);
                }
            });
            $('#widget_page_sidebar .aside__top .aside__head').text(SENSEI.widget.langs.left_menu.left_title);
            let $header = $('#page_holder #work_area .content__top__preset__caption');
            if($header.text().match(/^left_menu\.[a-z_]+$/)){
                let text = $header.text().replace('left_menu.', '');
                $header.text(SENSEI.widget.langs.left_menu[text]);
            }
        };

        this.fixSenseiMenuButtonLocale = () => {
            $('.nav__menu__item[data-widget-code="' + SENSEI.widget.params.widget_code + '"] .nav__menu__item__title')
                .text(SENSEI.widget.langs.left_menu.left_title);
        };
    };
});