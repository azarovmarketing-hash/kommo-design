define([
    'lib/components/base/modal',
    './lib/models.js?v=' + sensei_widget_version,
    './lib/api.js?v=' + sensei_widget_version,
    '../searchable_select.js?v=' + sensei_widget_version,
    './lib/planner/plannerModal.js?v=' + sensei_widget_version
], function (Modal, Models, ROBOCODE_API, SearchableSelect, RobocePlannerFactory) {
    class Robocode {
        constructor(config) {
            this.config = config;

            this.models = new Models(this);
            this.Scripts = new this.models.ScriptsCollection();
            this.ScriptsGroups = new this.models.GroupsCollection();

            const API = new ROBOCODE_API(config);
            this.API = API;

            const self = this;

            this.renderProcessesList = (scripts, selectedScript, class_name = 'robocode-scripts-list', name = 'process_id', disabled = false, options = {}) => {
                let scriptGroups = {};
                let scriptItemsGrouped = {};
                let ungroupedScripts = [];

                for (let i in scripts) {
                    let script = scripts[i];
                    if (typeof script.scenario_group_id === 'undefined') {
                        ungroupedScripts.push({
                            id: script.id,
                            option: script.name,

                            hidden: !!script.hidden,
                            disabled: !!script.disabled,
                        });
                    } else {
                        let scenarioGroupId = script.scenario_group_id ?? 'general';
                        scriptGroups[scenarioGroupId] = (scenarioGroupId === 'general') ? SENSEI.locale.get('process_list.default_group_title') : SENSEI.widget.Robocode.ScriptsGroups.groupsRecord[script.scenario_group_id];
                        if (typeof scriptItemsGrouped[scenarioGroupId] === 'undefined') {
                            scriptItemsGrouped[scenarioGroupId] = [];
                        }
                        scriptItemsGrouped[scenarioGroupId].push({
                            id: script.id,
                            option: script.name
                        });
                    }
                }

                let scriptItems = [
                    {
                        id: 0,
                        option: SENSEI.locale.get('dp.start_modal.robocode.select_title'),
                        disabled: true,
                        hidden: true,
                    },
                    ...ungroupedScripts
                ];

                for (let i in scriptItemsGrouped) {
                    scriptItems.push({
                        id: 'group_' + i,
                        option: scriptGroups[i],
                        disabled: true
                    });
                    for (let e in scriptItemsGrouped[i]) {
                        scriptItems.push(scriptItemsGrouped[i][e]);
                    }
                }
                if (typeof selectedScript === 'undefined' || selectedScript === '') {
                    selectedScript = scriptItems[0].id; //"Выбрать скрипт"
                }

                // возвращаем верстку списка селекторов
                return (new SearchableSelect(options)).render(scriptItems, selectedScript, class_name, name);
            };

            this.actions = {
                request_authorization: async (origin, uuid) => {
                    let tokenData = await API.getActualToken();
                    self.postMessageToIframe(origin, uuid, tokenData);
                    self.postMessageToIframe(origin, uuid, {
                        key: 'actual_token',
                        tokenData
                    });
                },
                open_modal_scenario_by_id(origin, id) {
                    new Modal({
                        class_name: `modal-list ${config.robocode.getStatndartClass('modal')}`,
                        disable_overlay_click: true,
                        init($modal_body) {
                            const accountId = APP.constant("account").id;
                            const path = `${config.robocode.getUrl()}/script/${accountId}/${id}`;

                            $modal_body
                                .trigger("modal:loaded")
                                .html(self.createIframeHtml(path))
                                .trigger("modal:centrify");

                            window.history.replaceState({}, null, `?script_id=${id}`);
                        },
                        destroy() { },
                    });
                },
                close_modal_scenario_by_id(origin) {
                    $(`div.modal.modal-list.${config.robocode.getStatndartClass('modal')}`).remove();
                    window.history.replaceState({}, null, window.location.pathname);
                },
                set_iframe_style(origin, uuid, css) {
                    self.getIframe(uuid).css(css);
                },
                redirect_to_tariff_page(origin, uuid) {
                    const $iframe = self.getIframe(uuid);
                    if ($iframe.length) {
                        $iframe
                            .parent()
                            .siblings()
                            .find("#settings_aside #subscription a")
                            .trigger('click');
                    }
                },
                render_planner_modal(origin, options) {
                    const Modal = RobocePlannerFactory.createModal(options);
                    Modal?.render();
                }
            };

            this.postMessageToAllRobocodeIframes = (data) => {
                const iframes = document.body.querySelectorAll(`iframe.${SENSEI.widget.Robocode.config.robocode.getStatndartClass('iframe')}`);

                for (let i = 0; i < iframes.length; ++i) {
                    iframes[i].contentWindow.postMessage(data, SENSEI.widget.Robocode.config.robocode.getUrl());
                }
            }
        }

        createIframeHtml(src) {
            return `<iframe class="${this.config.robocode.getStatndartClass('iframe')
                }" src="${src}" width="100%" name="${crypto.randomUUID()}" allow="clipboard-read; clipboard-write"></iframe>`;
        }

        getIframe(uuid) {
            return $(`iframe.${this.config.robocode.getStatndartClass('iframe')}[name="${uuid}"]`);
        }

        postMessageToIframe(origin, uuid, data) {
            const iframe = this.getIframe(uuid)[0];
            if (iframe) {
                iframe.contentWindow.postMessage(data, origin);
            }
        }
    }

    return Robocode;
});