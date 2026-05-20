define([], function() {
    return function (widget, config) {
        $(window).on("message", (e) => {
            let origin = e.originalEvent.origin;
            let data = typeof e.originalEvent.data[0] !== 'undefined' ? e.originalEvent.data[0] : '';
            if (origin == config.getConstructorDomain()) {
                if(data == 'close_api_key_page') {
                    window.SENSEI.events.trigger('close_api_key_page');
                }if(data == 'close_error_log_page') {
                    window.SENSEI.events.trigger('close_error_log_page');
                } else if(data == 'close_work_calendar_page') {
                    window.SENSEI.events.trigger('close_work_calendar_page');
                } else if(data == 'copy_api_key_event') {
                    navigator.clipboard.writeText(e.originalEvent.data[1]);
                } else if(data == 'close_modal'){
                    $('div.modal.modal-list.sensei-previewer-modal').remove();
                } else if(e.originalEvent.data == 'ready'){
                    if (window.SENSEI.events) {
                        window.SENSEI.events.trigger('constructor_ready');
                    }
                } else if(data == 'billing__form__header__session_modal') {
                    window.SENSEI.events.trigger('billing__form__header__session_modal');
                } else if (data == 'close_billing_page') {
                    window.SENSEI.events.trigger('close_billing_page');
                } else if (data?.key === 'get_leads') {
                    widget.amoApi.getLeads({filter: {id: (data.ids || [])}}).then((response) => {
                        let responseData = {};
                        if (response?._embedded?.leads) {
                            response._embedded.leads.forEach((lead) => {
                                responseData[lead.id] = lead.name;
                            });
                        }
                        this.getFraime().get(0).contentWindow.postMessage({
                            key: "get_leads_response",
                            leads: responseData
                        }, config.getConstructorDomain());
                    });
                } else if (data?.key === 'fraime_table_load') {
                    this.getFraime().css('height', data.height + 'px').css('max-height', data.height + 'px');
                } else if (data?.key === 'open_start_process_modal') {
                    let path = `/lib/lazyLoadingModules/StartProcessesModal.js?v=${sensei_widget_version}`
                    SENSEI.widget.lazyLoadingModule.loadingModule(path, (data.instance_data || []))
                } else if (data?.key === 'open_stop_process_modal') {
                    let path = `/lib/lazyLoadingModules/StopProccessesModal.js?v=${sensei_widget_version}`
                    SENSEI.widget.lazyLoadingModule.loadingModule(path, (data.instance_data || []))
                } else if (data?.key === 'get_id_leads_for_name') {
                    widget.amoApi.getAjaxV1LeadsListWithTerm(data.name || '').then((response) => {
                        let responseData = [];
                        if (response?.response?.leads && Array.isArray(response.response.leads)) {
                            response.response.leads.filter(lead => lead.name.toLowerCase().includes(data.name || '')).forEach((lead) => {
                                responseData.push(lead.id);
                            });
                        }
                        this.getFraime().get(0).contentWindow.postMessage({
                            key: "get_id_leads_for_name_response",
                            leads: responseData
                        }, config.getConstructorDomain());
                    });
                } else if (data?.key === 'redirect') {
                    const page = data.page ? `/${data.page}` : '';
                    
                    window.location.pathname = `/widget_page/${SENSEI.widget.params.widget_code}/left_menu${page}`;

                } else if (data?.type === 'sensei_get_language') {

                    this.getFraime().get(0).contentWindow.postMessage({
                        key: "get_amocrm_lang",
                        lang: APP.lang_id
                    }, config.getConstructorDomain());
                }
            }

            if (origin === config.robocode.getUrl()) {
                data = e.originalEvent.data;

                const action = widget.Robocode.actions[data[0]];
                
                if (action && typeof action === 'function') {
                    action(origin, ...data.slice(1));
                }
            }
        });

        this.getFraime = () => {
            return $(document).find("iframe.sensei-api-key-iframe, iframe.robocode-sensei-iframe")
        };
    };
});