define([
    'jquery',
    'underscore',
    './alert.js?v=' + sensei_widget_version,
    './storageService.js?v=' + sensei_widget_version,
], function ($, _, Alert, StorageService) {
    const KEY_STORAGE = "limit_data_leads";
    const KEY_TIME_STORAGE = "limit_data_leads_update_time";
    const CACHE_TTL = 60 * 60 * 1000; // 1 час в миллисекундах

    class LimiterElement {
        _dataLeads = {};
        storageService = new StorageService();

        set dataLeads(v) {
            this._dataLeads = Object.assign({}, v);
        }

        get dataLeads() {
            return this._dataLeads;
        }

        init(widget) {
            this.getAllLimitLeads();

            widget.socket.onmessage('limiter_event', (data) => {
                let entity_id = data.entity_id;
                if (data.config.action === 'disable') {
                    this.addLeadData(data.add);
                } else if (data.config.action === 'allow') {
                    this.deleteLeadData(data.delete);
                }
            });

            widget.socket.onmessage('limiter_instance_end', (data) => {
                // Поддержка инкрементального обновления (новый формат)
                if (data.lead_ids) {
                    // Удаляем только указанные сделки
                    this.removeLeadDataBatch(data.lead_ids);
                } else if (data.limited) {
                    // Старый формат (обратная совместимость) - полная замена
                    this.updateLeadData(data.limited);
                }
            });
        }

        bind_actions(widget) {
            $(document).ajaxSend((event, jqxhr, settings) => {
                if (settings.url.search('multiactions\/set') !== -1) {
                    settings.data = this.replaceListSendStatus(settings.data, jqxhr);
                } else if (settings.url.search('multiple\/change_status') !== -1) {
                    this.abortSendStatus(
                        settings.data,
                        jqxhr,
                        'parties%5Bid%5D%5B%5D=([0-9]+)',
                        'STATUS_ID=([0-9]+)'
                    )
                } else if (
                    settings.url.search('leads\/detail\/') !== -1
                    && typeof APP.constant('card_element') !== "undefined"
                    && APP.data.is_card
                    && APP.data.current_entity === 'leads'
                ) {
                    this.abortSendStatusInCard(settings.data, jqxhr, '&ID=([0-9]+)', 'STATUS%5D=([0-9]+)');
                }
            });
        }

        getAllLimitLeads() {
            const statusApi = SENSEI.api.getLimitLeads([]);
            statusApi.then((value) => {
                this.dataLeads = value.data;
                this.setLocalStorageData(this.dataLeads);
            });
        }

        addLeadData(data) {
            this.dataLeads = Object.assign(this.dataLeads, data);
            this.setLocalStorageData(this.dataLeads);
        }

        deleteLeadData(dataKey) {
            if (this.dataLeads[dataKey]) {
                delete this.dataLeads[dataKey];
                this.setLocalStorageData(this.dataLeads);
            }
        }

        updateLeadData(data) {
            this.dataLeads = data;
            this.setLocalStorageData(this.dataLeads);
        }

        /**
         * Удалить несколько сделок из локального состояния (инкрементальное обновление)
         * @param {Array<number>} leadIds - массив ID сделок для удаления
         */
        removeLeadDataBatch(leadIds) {
            if (!Array.isArray(leadIds) || leadIds.length === 0) {
                return;
            }

            let hasChanges = false;
            leadIds.forEach(leadId => {
                if (this.dataLeads[leadId]) {
                    delete this.dataLeads[leadId];
                    hasChanges = true;
                }
            });

            // Обновляем localStorage только если были изменения
            if (hasChanges) {
                this.setLocalStorageData(this.dataLeads);
            }
        }

        limiterSendCreateNote(leads) {
            let data = {
                leads: JSON.stringify(leads)
            }
            const { statusApi } = SENSEI.api.limiterSendCreateNote(data);
        }

        abortSendStatusInCard(data, jqxhr, regexpLead, regexpStatus) {
            if (typeof data === "undefined" || !data.match(regexpLead)) return jqxhr;


            let leadChanged = APP.data.current_card.model.changed_fields.includes('lead[STATUS]');
            let leadId = data.match(regexpLead)[1];
            const text = SENSEI.locale.get('back.limited.note_card');
            let dataLeads = this.getLocalStorageData();
            if (!!dataLeads[leadId] && leadChanged) {
                this.limiterSendCreateNote(leadId);
                if (APP.data.is_card) {
                    Alert.showAlertModal(text);
                } else {
                    this.errorAlert(text);
                }
                return jqxhr.abort();
            }
            return jqxhr;
        }

        abortSendStatus(data, jqxhr, regexpLead, regexpStatus) {
            if (!data.match(regexpLead)) return jqxhr;
            let leadId = data.match(regexpLead)[1];
            const text = SENSEI.locale.get('back.limited.note');
            let dataLeads = this.getLocalStorageData();
            if (!!dataLeads[leadId] && dataLeads[leadId] !== parseInt(data.match(regexpStatus)[1])) {
                this.limiterSendCreateNote(leadId);
                if (APP.data.is_card) {
                    Alert.showAlertModal(text);
                } else {
                    this.errorAlert(text);
                }
                return jqxhr.abort();
            }
            return jqxhr;
        }

        replaceListSendStatus(data, jqxhr) {
            let is_status = data.match('%5BSTATUS_ID%5D=([0-9]+)');
            let is_modal = false;
            if (!is_status) return data;
            let rp = /%5Bid%5D%5B%5D=([0-9]+)/gm;
            let leads = [...data.matchAll(rp)];
            let leadsForSend = [];
            let dataLeads = this.getLocalStorageData();
            for (const lead in leads) {
                if (!!dataLeads[leads[lead][1]]) {
                    data = data.replaceAll(new RegExp('.[^&]+' + leads[lead][1], 'gm'), '');
                    leadsForSend.push(leads[lead][1]);
                    is_modal = true;
                }
            }

            const isEmptyLeads = [...data.matchAll(rp)].length === 0;

            if (isEmptyLeads) {
                this.cancelMultiactionChangeStatusRequest(jqxhr);
                this.limiterSendCreateNote(leadsForSend);
                return data;
            }

            if (is_modal) {
                const text = SENSEI.locale.get('back.limited.note');
                setTimeout(() => {
                    let progressMessages = $('.progress__messages');
                    progressMessages.css({ 'display': 'block', 'color': '#f37575' })
                    progressMessages.html(progressMessages[0].innerHTML + ' ' + text);
                }, 500)
            }

            this.limiterSendCreateNote(leadsForSend);

            return data;
        }

        errorAlert(text) {
            setTimeout(() => {
                let modalError = $('.js-modal-error');
                modalError.find('h2').html(text);
                let lang = 'Ok';
                if (APP.lang_id == 'ru') {
                    lang = 'Понятно';
                }
                modalError.find('.button-input-inner__text').html(lang);
            });
        }

        setLocalStorageData(data, isNeedSetTime = true) {
            isNeedSetTime && this.storageService.setItem(KEY_TIME_STORAGE, (new Date()).getTime());
            this.storageService.setItem(KEY_STORAGE, JSON.stringify(data));
        }

        getLocalStorageData() {
            const lastUpdateTime = parseInt(this.storageService.getItem(KEY_TIME_STORAGE, "0"));
            const currentTime = (new Date()).getTime();

            // Если прошло больше часа, обновляем данные
            if (currentTime - lastUpdateTime > CACHE_TTL) {
                this.getAllLimitLeads();
            }

            return JSON.parse(this.storageService.getItem(KEY_STORAGE, "{}"));
        }

        removeLocalStorageData() {
            this.storageService.remove(KEY_STORAGE);
        }

        cancelMultiactionChangeStatusRequest(jqxhr) {
            jqxhr.abort();
            $('.action_modal').remove();
            window.SENSEI.alert.showAlertModal(SENSEI.locale.get('back.limited.empty_leads'));
        }
    }

    return new LimiterElement();
});
