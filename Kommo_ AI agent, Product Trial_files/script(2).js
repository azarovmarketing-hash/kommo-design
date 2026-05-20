const sensei_widget_version = '1.9.26';
define([
    'jquery',
    'underscore',
    'lib/components/base/modal',
    'lib/components/base/confirm',
    'twigjs',
    'moment',
    './lib/sensei_api.js?v=' + sensei_widget_version,
    './lib/AmoApi.js?v=' + sensei_widget_version,
    './lib/models.js?v=' + sensei_widget_version,
    './lib/themeService.js?v=' + sensei_widget_version,
    'text!./templates/tab_logo.twig?v=' + sensei_widget_version,
    'text!./templates/tab_content.twig?v=' + sensei_widget_version,
    'text!./templates/process_buttons.twig?v=' + sensei_widget_version,
    'text!./templates/process_buttons_modal.twig?v=' + sensei_widget_version,
    'text!./templates/process_buttons_modal_item.twig?v=' + sensei_widget_version,
    'text!./templates/previewer_modal.twig?v=' + sensei_widget_version,
    'text!./templates/fields_modal.twig?v=' + sensei_widget_version,
    'text!./templates/task_modal.twig?v=' + sensei_widget_version,
    'text!./templates/fields_modal_budget_field.twig?v=' + sensei_widget_version,
    'text!./templates/fields_modal_contact_name_field.twig?v=' + sensei_widget_version,
    'text!./templates/dynseg/modal_old.twig?v=' + sensei_widget_version,
    'text!./templates/workplace_panel.twig?v=' + sensei_widget_version,
    'text!./templates/rollback_modal.twig?v=' + sensei_widget_version,
    'text!./templates/comment_modal.twig?v=' + sensei_widget_version,
    'text!./templates/script_element/script_modal.twig?v=' + sensei_widget_version,
    'text!./templates/cf_type_15.twig?v=' + sensei_widget_version,
    'text!./templates/description_task.twig?v=' + sensei_widget_version,
    'text!./templates/sensei_logo_for_task.twig?v=' + sensei_widget_version,
    'text!./templates/sensei_logo.twig?v=' + sensei_widget_version,
    'text!./templates/switcher.twig?v=' + sensei_widget_version,
    'text!./templates/select_form.twig?v=' + sensei_widget_version,
    'text!./templates/rocket.twig?v=' + sensei_widget_version,
    'text!./templates/pipeline/select.twig?v=' + sensei_widget_version,
    'text!./templates/pipeline/pipe_button.twig?v=' + sensei_widget_version,
    './lib/process_instances.js?v=' + sensei_widget_version,
    './lib/task_modal.js?v=' + sensei_widget_version,
    './lib/billing.js?v=' + sensei_widget_version,
    './lib/config.js?v=' + sensei_widget_version,
    './lib/socket.js?v=' + sensei_widget_version,
    './lib/alert.js?v=' + sensei_widget_version,
    './lib/modules.js?v=' + sensei_widget_version,
    './lib/crutches.js?v=' + sensei_widget_version,
    './lib/locale.js?v=' + sensei_widget_version,
    './lib/workqueue.js?v=' + sensei_widget_version,
    './lib/Events.js?v=' + sensei_widget_version,
    './lib/searchable_select.js?v=' + sensei_widget_version,
    './lib/LimiterElement.js?v=' + sensei_widget_version,
    './lib/dynseg/v1/loader.js?v=' + sensei_widget_version,
    './lib/dynseg/v2/loader.js?v=' + sensei_widget_version,
    './lib/dynseg/collection.js?v=' + sensei_widget_version,
    './lib/validation.js?v=' + sensei_widget_version,
    './lib/BlockTasks.js?v=' + sensei_widget_version,
    './lib/processStartModal.js?v=' + sensei_widget_version,
    './lib/TriggersHealer.js?v=' + sensei_widget_version,
    './lib/Logger.js?v=' + sensei_widget_version,
    './lib/enable_features.js?v=' + sensei_widget_version,
    'text!./templates/sensei_notification.twig?v=' + sensei_widget_version,
    './lib/BeforeunloadRealization.js?v=' + sensei_widget_version,
    './lib/LeadInteraction.js?v=' + sensei_widget_version,
    './lib/events/WindowMessageEvent.js?v=' + sensei_widget_version,
    './lib/LazyLoading.js?v=' + sensei_widget_version,
    './lib/robocode/main.js?v=' + sensei_widget_version,
    './lib/backendFallback.js?v=' + sensei_widget_version,
], function (
    $,
    _,
    Modal,
    ConfirmModal,
    twig,
    moment,
    SenseiApi,
    AmoApi,
    Models,
    ThemeService,
    tab_logo,
    tab_content,
    process_buttons,
    process_buttons_modal,
    process_buttons_modal_item,
    previewer_modal,
    fields_modal,
    task_modal,
    fields_modal_budget_field,
    fields_modal_contact_name_field,
    dynamic_segment_modal,
    workplace_panel,
    rollback_modal,
    comment_modal,
    script_modal,
    cf_type_15_twig,
    description_task_twig,
    sensei_logo_for_task_twig,
    sensei_logo_twig,
    switcher,
    sensei_searchable_select_twig,
    rocket_twig,
    pipeline_select_twig,
    pipe_button_twig,
    processInstances,
    TaskModal,
    billing,
    config,
    Socket,
    Alert,
    modules,
    Crutches,
    Locale,
    Workqueue,
    Events,
    SearchableSelect,
    LimiterElement,
    DynamicSegmentsV1,
    DynamicSegmentsV2,
    DynamicSegmentsCollection,
    SenseiValidation,
    BlockTasks,
    ProcessStartModal,
    TriggersHealer,
    Logger,
    EnableFeatures,
    sensei_notification_twig,
    BeforeunloadRealization,
    LeadInteraction,
    WindowMessageEvent,
    LazyLoadingModule,
    Robocode,
    BackendFallback
) {
    var CustomWidget = function () {
        var self = this,
            system = self.system(),
            langs = self.langs;

        config.setWidget(this);
        this.templates = {};
        this.choosedLeads = {};
        this.instances = null;
        this.isProcessStart = false;
        this.billing = null;
        this.init = false;
        this.socket = new Socket();
        this.bind_stats = false;
        this.bind_dynamic_segments = false;
        this.isMainStyleInit = false;
        this.tasks = {};
        this.elem_forms = {};
        this.locale = new Locale();
        this.postRenderPromise = null;
        this.modalQueue = new Workqueue();
        this.submittedModals = [];
        this.postRenderTries = 0;
        this.triggersHealer = new TriggersHealer();
        this.logger = new Logger();
        this.enableFeatures = new EnableFeatures();
        this.notification_number = 0;
        this.lazyLoadingModule = new LazyLoadingModule(this);
        this.Robocode = new Robocode(config);
        this.backendUnavailable = false;

        const callbacksModels = [];

        SenseiValidation.init();

        this.modules = {
            "limiter": LimiterElement,
            "task_block": BlockTasks,
            "process_start_modal_v2": ProcessStartModal,
        };

        this.modulesToLoad = [];
        this.allowedModules = [];
        this.modulesPromise = null;

        this.styles = [
            "lib/css/ui.css",
            "lib/css/salesbot.css",
            "lib/css/dynseg/process_start.css",
            "lib/css/dynseg/set_sequence.css",
            "lib/css/dynseg/edit_modal.css",
            "lib/css/dynseg/type_modal.css",
            "lib/css/dynseg/additional_filters.css",
            "lib/css/dynseg/dynseg.css",
            "lib/css/validation.css",
            "lib/css/searchable_select.css",
            "lib/css/dp.css",
            "lib/css/searchable_select_for_form.css",
            "lib/css/vars/dark.css",
            "lib/css/vars/light.css",
            "lib/css/notice.css",
            "lib/css/pipeline_select/pipeline.css",
            "lib/css/task/elements.css",
            "lib/css/robocode/style.css"
        ];

        this.isLogUpdateLead = false;

        const callbacksSenseiApi = [];

        this.loadModules = function () {
            self.modulesPromise = window.SENSEI.api.getAllowedWidgetModulesNamesList();

            self.modulesPromise.then(function (response) {
                const allowedModules = response.data;
                self.allowedModules = allowedModules;
                Object.entries(self.modules).forEach(([name, module]) => {
                    if (allowedModules.includes(name)) {
                        self.modulesToLoad.push(module);
                    }
                });
            });
        };

        this.processModules = function (methodName) {
            self.modulesPromise.then(function () {
                self.modulesToLoad.forEach(function (module) {
                    if (module[methodName] && typeof module[methodName] === 'function') {
                        module[methodName](self);
                    }
                });
            });
        };

        this.loadAmoTwigs = function () {
            return new Promise((res) => {
                if (!!Twig.Templates.registry['/tmpl/controls/select.twig']) {
                    res(true);
                    return;
                }
                require(['https://st1.amocrm.ru/frontend/build/templates.js'],
                    () => { res(true); },
                    () => { res(true); });
            });
        }

        this.elementFactoryCallback = (cb) => {
            if (window.SENSEI.ElementFactory) {
                cb();
                return;
            }
            require([self.get_settings().path + '/lib/elements/elements.js?v=' + sensei_widget_version], (ElementFactory) => {
                window.SENSEI.ElementFactory = ElementFactory;
                cb();
            });
        }

        this.callbacks = {
            settings: function (modal) {
                if (!self.isWidgetActive() && !self.isStyleInit) {
                    $('head').append($(`<link type="text/css" rel="stylesheet" href="${self.get_settings().path}/style.css?v=${sensei_widget_version}">`));
                    self.isStyleInit = true;
                }

                const code = self.get_settings().widget_code;

                const path = self.get_settings().path;

                modal.find('.widget_settings_block__controls button').addClass('sensei-mb-20');


                modal
                    .find('.widget_settings_block__fields .widget_settings_block__item_field')
                    .hide();


                let swiperHTML = `
                    <div class="widget-settings__service">`;
                let lang = 'en';
                if (APP.lang_id === 'ru') {
                    lang = 'ru';
                } else if (APP.lang_id === 'es') {
                    lang = 'es';
                }
                let getImagesHtml = (state = 'css') => {
                    let styles = '';
                    let classes = '';
                    if (state === 'css') {
                        styles = 'style="display: none;"';
                    } else {
                        classes = 'popular-chat-swiper__mini-opacity';
                    }
                    let images = '';
                    if (lang === 'ru') {
                        images = `
                            <img data-key="0" src="${path}/images/tour_1_${lang}.jpg" class="popular-chat-swiper__img">
                            <img data-key="1" src="${path}/images/tour_2_${lang}.jpg" class="popular-chat-swiper__img ${classes}" ${styles}>
                            <img data-key="2" src="${path}/images/tour_3_${lang}.jpg" class="popular-chat-swiper__img ${classes}" ${styles}>
                            <img data-key="3" src="${path}/images/tour_4_${lang}.jpg" class="popular-chat-swiper__img ${classes}" ${styles}>
                            <img data-key="4" src="${path}/images/tour_5_${lang}.jpg" class="popular-chat-swiper__img ${classes}" ${styles}>
                            <img data-key="5" src="${path}/images/tour_6_${lang}.jpg" class="popular-chat-swiper__img ${classes}" ${styles}>
                            <img data-key="6" src="${path}/images/tour_7_${lang}.jpg" class="popular-chat-swiper__img ${classes}" ${styles}>
                        `;
                    } else {
                        images = `
                            <img data-key="0" src="${path}/images/tour_1_${lang}.png" class="popular-chat-swiper__img">
                            <img data-key="1" src="${path}/images/tour_2_${lang}.png" class="popular-chat-swiper__img ${classes}" ${styles}>
                            <img data-key="2" src="${path}/images/tour_3_${lang}.png" class="popular-chat-swiper__img ${classes}" ${styles}>
                        `;
                    }
                    return images;
                }
                swiperHTML = swiperHTML + `
                    <div class="popular-chat-swiper">
                        <div class="popular-chat-swiper__show-container">
                            <svg class="svg-icon popular-chat-swiper__arrow-left svg-settings--widgets--arrow-left-dims">
                                <use xlink:href="#settings--widgets--arrow-left"></use>
                            </svg>
                            ${getImagesHtml()}
                            <svg class="svg-icon popular-chat-swiper__arrow-right svg-settings--widgets--arrow-left-dims ">
                                <use xlink:href="#settings--widgets--arrow-left"></use>
                            </svg>
                        </div>
                        <div class="popular-chat-swiper__mini-container">
                            ${getImagesHtml('classes')}
                        </div>`;

                swiperHTML = swiperHTML + `</div>`;

                $('.widget_settings_block').prepend(swiperHTML)

                const params = $.extend({
                    el: $('.popular-chat-swiper')
                });

                const swipe = require('lib/interface/settings/widgets/swiper');

                new (swipe.bind.apply(swipe, [swipe, params]));

                let addImageHowStartUsing = () => {
                    return `<div style="background-image: url('${path}/images/how_start_using_${lang}.jpg')" class="how_start_using__img">`
                }

                modal.find('.how_start_using').append(addImageHowStartUsing());
                modal.find('button.js-widget-save[id="save_' + code + '"]').attr('data-onsave-destroy-modal', 'false').hide();
                self.instaledWidget();
            },
            init: function () {
                if (!self.isWidgetActive()) {
                    return true;
                }
                self.instaledWidget();

                self.styles.map(style => {
                    self.loadCssFile(style)
                })

                self.initKommo();

                require('twig')._preload(['stylesheets/_chunks/todos.css', 'stylesheets/_chunks/settings.css', 'stylesheets/_chunks/pipeline.css'])();

                if (self.init) return true;
                self.init = true;
                self.billing = new billing(config);
                let changePipeline;

                $(document).on('change', '.pipeline-select-wrapper .pipeline-select__dropdown', function (event) {
                    changePipeline = false;
                    if (APP.data.is_card && APP.data.current_card.model.changed_fields.includes('lead[STATUS]')) {
                        if (!changePipeline) {
                            self.sendLogsBack('status', 'changeStatusManually');
                            self.statusChanged = undefined;
                            changePipeline = true;
                        }
                    }
                    event.stopPropagation();
                });

                const code = self.get_settings().widget_code;
                var path = self.get_settings().path;
                !$('.card-holder-compact').length && !$('#nav_menu').find(`[data-widget-code="${code}"]`).length && self.billing.getAccount().then((data) => {
                    const crutches = new Crutches();
                    !!data.fixes && !!data.fixes.clear_leftmenu_button_cache && crutches.rulesClearCatchLeftMenu();
                });
                $('#nav_menu').find(`[data-widget-code="${code}"]`).attr('data-entity', 'widget');
                const { is_admin } = APP.constant('managers')[APP.constant('user').id];
                $(`.nav__menu__item[data-widget-code="${code}"]`).removeClass('nav__menu__item__icon-integration').addClass(`sensei-nav__menu__item ${is_admin === 'Y' ? '' : 'hidden'}`);
                $('head').append($(`<link type="text/css" rel="stylesheet" href="${path}/style.css?v=${sensei_widget_version}">`));
                $('head').append(
                    `<style class="${code}">
                        div[data-action=send_widget_hook] > img[src="${path}/images/logo_main.png"],
                        div[data-action=send_widget_hook] > img[src="${path}/images/logo_dp.png"] 
                        { display: none; } 
                    </style>`);

                self.socket.createConnection();
                Backbone.history.on("route", function (route, router, e, w, r) {
                    self.socket.updateContext();
                    self.modalQueue.clear();
                    self.submittedModals = [];
                });

                self.addTemplate('tab_logo', tab_logo);
                self.addTemplate('tab_content', tab_content);
                self.addTemplate('process_buttons', process_buttons);
                self.addTemplate('process_buttons_modal', process_buttons_modal);
                self.addTemplate('process_buttons_modal_item', process_buttons_modal_item);
                self.addTemplate('previewer_modal', previewer_modal);
                self.addTemplate('fields_modal', fields_modal);
                self.addTemplate('task_modal', task_modal);
                self.addTemplate('fields_modal_budget_field', fields_modal_budget_field);
                self.addTemplate('fields_modal_contact_name_field', fields_modal_contact_name_field);
                self.addTemplate('dynamic_segment_modal', dynamic_segment_modal);
                self.addTemplate('workplace_panel', workplace_panel);
                self.addTemplate('comment_modal', comment_modal);

                self.addTemplate('script_modal', script_modal);
                self.addTemplate('cf_type_15_twig', cf_type_15_twig);
                self.addTemplate('sensei_logo_for_task_twig', sensei_logo_for_task_twig);
                self.addTemplate('sensei_logo_twig', sensei_logo_twig);
                self.addTemplate('sensei_searchable_select_twig', sensei_searchable_select_twig);
                self.addTemplate('switcher', switcher);

                self.addTemplate('description_task_twig', description_task_twig);
                self.addTemplate('rocket_twig', rocket_twig);

                self.addTemplate('pipeline_select_twig', pipeline_select_twig);
                self.addTemplate('pipe_button_twig', pipe_button_twig);
                self.addTemplate('sensei_notification_twig', sensei_notification_twig);

                const loadProcesses = () => {
                    if (!self.models) {
                        callbacksModels.push(loadProcesses);
                        return;
                    }
                    self.Processes.load();
                    self.socket.synchronizeCollection(self.Processes, "processListUpdated");
                }

                if (window.SENSEI.api) {
                    loadProcesses();
                } else {
                    callbacksSenseiApi.push(loadProcesses);
                }

                self.socket.onmessage('add_tags', self.socketAddTags);
                self.socket.onmessage('delete_tags', self.socketDeleteTags);
                self.socket.onmessage('new_note', self.socketNewNote);
                self.socket.onmessage('new_task', self.socketChangeTaskWrapper);
                self.socket.onmessage('show_form', function (data) {
                    if (APP.data.current_card.id == data.entity_id && APP.data.current_card.element_type == 2) {
                        self.renderFieldsModal(data.config, data.hash, data.results, data.instance_id, data.process_item_id, data.process_name);
                    }
                });
                self.socket.onmessage('lead_status_changed', self.switchLeadStatus);
                self.socket.onmessage('lead_field_changed', self.catchSocketMessage);
                self.socket.onmessage('start_hyperscript', self.startHyperScript);
                self.socket.onmessage('select_task_deadline', self.renderTaskModal);
                self.socket.onmessage('update_assistant_content', self.updateAssistantContent);
                self.socket.onmessage('update_lead_responsible', self.updateLeadResponsible);
                self.socket.onmessage('update_loss_reason', self.updateLossReason);
                self.socket.onmessage('update_tasks_and_forms_autoOpenNextPage', self.updateTasksAndFormsAutoOpenNextPage);

                self.socket.onmessage('js_code', ({ entity_id, JSCode, hash, result_code }) => {
                    if (APP.data && APP.data.current_card && APP.data.current_card.id === +entity_id) {
                        self.getCodeLauncher('js')(JSCode);
                        self.getElementFinisher('js')(hash, result_code);
                    }
                });

                self.socket.onmessage('css_code', ({ entity_id, CSSCode, hash, result_code }) => {
                    if (APP.data && APP.data.current_card && APP.data.current_card.id === +entity_id) {
                        self.getCodeLauncher('css')(CSSCode);
                        self.getElementFinisher('css')(hash, result_code);
                    }
                });

                self.socket.onmessage('start_script', function (data) {
                    self.renderScriptModal(data.config, data.hash, data.results, data.instance_id, data.process_item_id, data.process_name, data.result_items || {});
                });

                self.socket.onmessage('start_new_process', function (data) {
                    if (self.instances && data.result && Array.isArray(data.result)) {
                        data.result.forEach((result) => {
                            if (result.parent_instance_id) {
                                let parent = self.instances.processInstances.get(result.parent_instance_id);
                                if (parent) {
                                    parent.set('subprocess', [...parent.get('subprocess'), result.instance_data.id]);
                                }
                            }
                            self.instances.addInstance(result.instance_data);
                        });
                    }
                });
                self.socket.onmessage('newSupportChatMessage', function (data) {
                    self.notification_number += 1;
                    self.renderNotifications();
                });
                self.socket.onmessage('notificationsCleared', function (data) {


                    self.notification_number = data.message.notification_number
                    self.renderNotifications();
                });

                if (window.SENSEI.api) {
                    self.processModules("init");
                } else {
                    callbacksSenseiApi.push(() => self.processModules("init"));
                }

                const getAndRenderNotifications = () => {
                    self.getNotifications();
                    self.renderNotifications();
                }

                if (window.SENSEI.api) {
                    getAndRenderNotifications();
                } else {
                    callbacksSenseiApi.push(getAndRenderNotifications);
                }

                return true;
            },

            bind_actions: function () {
                if (!self.isWidgetActive()) {
                    return true;
                }

                window.addEventListener('error', (event) => {

                    self.logger.sendLogs('errors', 'error', {
                        account: APP.constant('account'),
                        user: APP.constant('user'),
                        widget: self,
                        error: {
                            filename: event.filename,
                            message: event.message,
                            line_number: event.lineno,
                            column_number: event.colno,
                            stack: event.error?.stack ?? 'no stack'
                        }
                    });
                });

                window.addEventListener('unhandledrejection', (event) => {
                    self.logger.sendLogError(event.reason);
                });

                self.triggersHealer.init(self);

                $(document).on('mousedown touchstart', '.sensei-processes-list > button.not_processes', function (e) {
                    $($('.sensei-processes-list').parent()).find('.sensei-element-field_field-error-text').removeClass('hidden');
                });

                $(document).on('mousedown touchstart', '#start-process-sensei:not([data-loading="Y"])', function (e) {
                    const button = $(e.currentTarget);
                    button.trigger('button:load:start');

                    if (!APP.data.is_card && !self.isProcessStart) {

                        var selectedProcessID = $('.sensei-processes-list li.selected').attr('data-id');
                        let selectedProcessName = $('.sensei-processes-list li.selected').attr('data-option');

                        if (!(+selectedProcessID)) {
                            button.trigger('button:load:stop');
                            return;
                        }


                        self.isProcessStart = true;


                        window.SENSEI.api.startProcess(selectedProcessID, { data: self.choosedLeads }).then((response) => {

                            self.isProcessStart = false;

                            $('.sensei-modal').remove();
                            $(document).trigger('overlay:unfix');

                            if (response.status === 200) {
                                self.showAlertModal(SENSEI.locale.get('general.alert_process_started', { name: selectedProcessName }), 1);
                            } else {
                                self.showAlertModal(SENSEI.locale.get('general.error.process_start', { name: selectedProcessName }));
                                button.trigger('button:load:stop');
                            }
                        });
                    } else {
                        button.trigger('button:load:stop');
                    }
                });

                $(document).on('mousedown', '.sensei_tab-instance_item-preview_link', function (e) {
                    const instanceId = $(e.currentTarget).parent().data('id');

                    let modal = new Modal({
                        class_name: 'modal-list sensei-previewer-modal',
                        init: function ($modal_body) {
                            $modal_body.trigger('modal:loaded');
                            if (window.SENSEI.constructorState == 2 || window.SENSEI.constructorState == 3) {
                                $modal_body.html(`<iframe src="${config.getConstructorDomain()}/constructor/${APP.constant('account').id}/${instanceId}?preview_mode=${instanceId}&close_available=1" width="100%" height="100%">`)
                                    .trigger('modal:centrify');
                                return;
                            }

                            window.SENSEI.api.getInstanceInfo(instanceId).then((e) => {
                                let version = (e.version || {}).element;
                                let param = version ? '?v=' + version : '';
                                let path = self.get_settings().path;
                                self.initStyles();

                                require([
                                    config.getElUrl() + param,
                                    config.getBaseJsUrl() + 'constructor.js' + param,
                                ], function (el, constructor) {
                                    config.setEl(el);
                                    self.renderPreviewer($modal_body[0], constructor, e.data);
                                    $modal_body.trigger('modal:centrify');
                                });
                            });

                        },
                        destroy: function () { }
                    });
                });

                new WindowMessageEvent(self, config);

                self.billing.bind_actions();
                let isJsonFunc = (str) => {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }
                    return true;
                };

                const handleAjaxComplete = async (_, { responseText = '{}' }, settings) => {

                    if (!window.SENSEI.api) {
                        callbacksSenseiApi.push(handleAjaxComplete.bind(undefined, _, { responseText }, settings));
                        return;
                    }

                    if (!!responseText && typeof responseText === 'string' && isJsonFunc(responseText)) {
                        response = JSON.parse(responseText);
                        if (settings.url.indexOf(SENSEI.api.baseUrl) !== -1 && !!response && !!response.features) {
                            self.enableFeatures.setEnableFeatures(response.features);
                            if (response.subscription) {
                                window.SENSEI.isDemo = !!response.subscription?.is_demo;
                            }
                            if (!SENSEI.widget.enableFeatures.getFetureEnableStatus('element_robocode') && !$('#styles-hide-robocode-multiactions').length) {
                                const stylesEl = document.createElement('style');
                                stylesEl.innerHTML = `.list-contacts .js-tips-item-widgets[data-id="${SENSEI.widget.get_settings().widget_code}"] { display: none !important; }`;
                                stylesEl.id = 'styles-hide-robocode-multiactions';
                                document.body.appendChild(stylesEl);
                            } else if (SENSEI.widget.enableFeatures.getFetureEnableStatus('element_robocode')) {
                                $('#styles-hide-robocode-multiactions').remove();
                            }
                        }
                    }

                    if (settings.url.includes(SENSEI.api.baseUrl)) {
                        const response = JSON.parse(responseText);
                        if (response && response.debugger) {
                            self.logger.debugger = response.debugger;
                        }
                    }

                    if (settings.url.indexOf("/ajax/v1/widgets/list/") != -1 && APP.data.current_entity == "leads-dp") {
                        setTimeout(() => {
                            self.triggersHealer.handleTriggersData();
                            self.renderDPTitles();
                        }, 10);
                    }

                    if (settings.url.includes('/ajax/v2_5/tasks') && (APP.data.current_entity === 'todo'
                        || APP.data.current_entity === 'todo-calendar' || APP.data.current_entity === 'todo-line')) {
                        const { _embedded: { items: [{ id, element_id, element_type }] } } = JSON.parse(responseText);

                        if (id && element_id && element_type === 2) {
                            let modal_todo = $('.modal.modal-list.modal-todo');
                            let modal_overlay = modal_todo.find('.default-overlay.modal-overlay.modal-overlay_white .modal-overlay__spinner');
                            let modal_scroller = modal_todo.find('.modal-scroller.custom-scroll');

                            modal_scroller.addClass('hidden');
                            modal_overlay.show();

                            try {
                                const { data } = await window.SENSEI.api.getInstances(element_id, element_type);

                                if (self.checkTaskElement(id, data)) {
                                    modal_todo.attr('sensei', 'true');


                                    modal_todo.on('modal:centrify', ({ currentTarget }) => {
                                        let el = $(currentTarget);
                                        if (el.find('.feed-compose_task-modal').length) {
                                            el.find('.feed-note__button_cancel').trigger('click');
                                            el.find('.modal-body').trigger('modal:centrify');
                                        }
                                    });
                                }
                            }
                            catch (err) {
                                self.logger.sendLogError(error);
                            }
                            finally {
                                modal_scroller.removeClass('hidden');
                                modal_overlay.hide();
                                modal_todo.find('.modal-body').trigger('modal:centrify');
                            }
                        }
                    }

                    if (
                        settings.url.includes('/leads/detail/')
                        && settings.type === 'GET'
                        && APP.data.is_card
                        && !APP.data.card_page.pipeline_id
                        && !!window.SENSEI
                        && self.userWorkplace.loadQueueTries() === 0
                        && self.userWorkplace
                        && self.userWorkplace.isButtonClicked
                        && (
                            await self.userWorkplace.checkCurrentTaskStatus(self.userWorkplace.data)

                            || !!responseText && self.jsonParse(responseText)?.response?.errors
                        )
                    ) {
                        self.userWorkplace.isNextButtonClicking = false;
                        await self.userWorkplace.onNextButtonClick(true);
                    }
                }

                $(document).on('ajaxComplete', handleAjaxComplete);

                $(document).on('ajaxSend', (event, jqxhr, settings) => {
                    if (settings.url.includes('/ajax/leads/detail/')) {
                        let data = decodeURI(settings.data);

                        if (self.isLogUpdateLead) {
                            const id = (Math.random() + 1).toString(36).substring(2);

                            self.logger.sendLogs('forms', 'ajaxSendUpdateLead', {
                                account: APP.constant('account'),
                                user: APP.constant('user'),
                                widget: self,
                                requestData: {
                                    id,
                                    url: settings.url,
                                    method: settings.type,
                                    data
                                }
                            });

                            jqxhr.complete(() => {
                                SENSEI.logger.sendLogs('forms', 'ajaxSendUpdateLeadComplete', {
                                    account: APP.constant('account'),
                                    user: APP.constant('user'),
                                    widget: self,
                                    responseData: {
                                        id,
                                        url: settings.url,
                                        data: jqxhr.responseJSON ?? jqxhr.responseText ?? 'no response message',
                                        method: settings.type,
                                        status: jqxhr.status,
                                        statusText: jqxhr.statusText
                                    }
                                });
                            });
                        }

                        if (typeof self.statusChanged !== 'undefined'
                            && self.statusChanged.hasOwnProperty('status_id')
                            && APP.data.is_card
                            && self.statusChanged.lead_id === APP.data.current_card.id) {

                            let status_id = data.match('lead\\[STATUS\\]=([0-9]+)')[1];

                            const pipeline_match = data.match('lead\\[PIPELINE_ID\\]=([0-9]+)');
                            if (!pipeline_match) {
                                return;
                            }
                            let pipeline_id = pipeline_match[1];

                            let leadChanged = APP.data.current_card.model.changed_fields.includes('lead[STATUS]');

                            if (parseInt(status_id) !== parseInt(self.statusChanged.status_id) && !leadChanged) {
                                try {
                                    window.SENSEI.leadInteraction.changeLeadStatus(self.statusChanged.status_id, self.statusChanged.pipeline_id);
                                    self.sendLogsBack('status', 'ajaxSend');
                                } catch (e) {
                                    self.logger.sendLogError(error);
                                }
                            } else if (leadChanged) {
                                self.statusChanged = {
                                    status_id,
                                    pipeline_id,
                                    'lead_id': self.statusChanged.lead_id
                                };
                            }
                        }
                    }

                    if (/leads\/\d+\/save/.test(settings.url)) {
                        self.triggersHealer.updateTriggersData();
                    }

                });

                window.navigation.addEventListener('navigate', function (event) {
                    let fromUrl = event?.target?.currentEntry?.url;

                    if (fromUrl) {
                        fromUrl = fromUrl.split('?')[0];
                    }

                    let toUrl = event?.destination?.url;

                    if (toUrl) {
                        toUrl = toUrl.split('?')[0];
                    }

                    if (fromUrl !== toUrl) {
                        self.isLogUpdateLead = false;
                    }
                });

                $(document).on('ajaxSuccess', (event, xhr, settings) => {
                    if (settings.url && settings.url.includes('ajax/v1/widgets/list?filter[widget_locations]')) {
                        const originalSuccess = settings.success;
                        settings.success = function (data, textStatus, jqXHR) {
                            let widget = data.response.widgets.find((item) => {
                                return item.widget_code === self.get_settings().widget_code;
                            });


                            for (const lang in widget.langs) {
                                if (!widget.langs[lang]['widget.name'] || !widget.langs[lang]['widget.short_description']) {
                                    widget.langs[lang]['widget.name'] = self.locale.get("widget.name");
                                    widget.langs[lang]['widget.short_description'] = self.locale.get("widget.short_description");
                                    widget.langs[lang]['widget.tour_description'] = self.locale.get("widget.tour_description");
                                }
                            }

                            if (typeof originalSuccess === 'function') {
                                originalSuccess(data, textStatus, jqXHR);
                            }
                        };

                        settings.success(xhr.responseJSON, xhr.statusText, xhr)
                    }
                });


                $(document).on('sortstop', '.pipeline_cell .pipeline_items__list', () => $('#pipeline_manage').attr('style', ''));


                $(document).on('sortover', '.pipeline_cell .pipeline_items__list', async (_, { item }) => {
                    if (APP.data.current_entity === 'todo-line') {
                        const id = +$(item).attr('data-id');

                        const elementId = (APP.data.current_view.existed_items[`_${id}`].linked || {}).id;
                        const elementType = 2;

                        if (elementId) {
                            try {
                                const { data } = await api.getInstances(elementId, elementType);

                                const menu = $('#pipeline_manage');

                                if (self.checkTaskElement(id, data)) {
                                    menu.find('[data-status-id="delete"]').addClass('hidden');
                                    menu.find('[data-status-id="done"]').addClass('hidden');
                                } else {
                                    menu.find('[data-status-id="delete"]').removeClass('hidden');
                                    menu.find('[data-status-id="done"]').removeClass('hidden');
                                }

                                menu.attr('style', 'display: flex !important');
                            } catch (err) {
                                self.logger.sendLogError(error);
                            }
                        }
                    }
                });


                document.addEventListener('click', (event) => {
                    const { target } = event;

                    if (target.matches('.sensei-dynamic-segment')) {
                        event.stopPropagation();

                        let eventName = 'sensei:dynseg:create:leads';
                        if (APP.data.current_entity === 'contacts') {
                            eventName = 'sensei:dynseg:create:contacts';
                        }

                        document.dispatchEvent(new CustomEvent(eventName, {
                            detail: {
                                amo_filter: location.href,
                                createMode: true,
                            }
                        }));
                    }
                }, true);

                $(document).on("card:save:start", () => {
                    if (APP.data.is_card && APP.data.current_entity === 'leads' && APP.data.current_card && APP.data.current_card.id) {
                        let contact = APP.data.current_card.linked_forms.form_models.find(function (model) {
                            return model.get('ELEMENT_TYPE') == 1 && model.get('ID');
                        });
                        if (!contact) {
                            contact = APP.data.current_card.linked_forms.form_models.find(function (model) {
                                return model.get('ELEMENT_TYPE') == 1;
                            });
                        }
                        let changedFields = (!!contact && !!contact.changed_fields) ? contact.changed_fields : [];
                        let data = contact ? contact.toJSON() : {};

                        let company = APP.data.current_card.linked_forms.form_models.find(function (model) {
                            return model.get('ELEMENT_TYPE') == 3 && model.get('ID');
                        });
                        if (!company) {
                            company = APP.data.current_card.linked_forms.form_models.find(function (model) {
                                return model.get('ELEMENT_TYPE') == 3;
                            });
                        }
                        let comapnyChangedFields = (!!company && !!company.changed_fields) ? company.changed_fields : [];
                        changedFields = [...changedFields, ...comapnyChangedFields, ...(APP.data.current_card.model.changed_fields || [])];
                        data = { ...data, ...(company ? company.toJSON() : {}), ...APP.data.current_card.model.toJSON() };

                        if (!!changedFields) {
                            let changedData = {};
                            changedFields.forEach((item) => {
                                changedData[item] = data[item];
                            });
                            SENSEI.events.trigger('click_button_save_form_lead_amo', changedData);
                        }
                    }
                });

                if (window.SENSEI.api) {
                    self.processModules("bind_actions");
                } else {
                    callbacksSenseiApi.push(() => self.processModules("bind_actions"));
                }

                self.lazyLoadingModule.loadingModule('/lib/vRelease/fields_remove_control/fields_remove_control.js').then((fieldsRemoveControl) => {
                    fieldsRemoveControl.init();
                });

                return true;
            },
            render: function () {
                if (!self.isWidgetActive()) {
                    return true;
                }

                if (!window.SENSEI) {
                    window.SENSEI = {};
                    window.SENSEI.events = new Events;
                    window.SENSEI.beforeunload = new BeforeunloadRealization;
                    window.SENSEI.widget = self;
                    window.SENSEI.alert = Alert;
                    window.SENSEI.searchableSelect = SearchableSelect;
                    window.SENSEI.config = config;
                    window.SENSEI.socket = self.socket;
                    window.SENSEI.logger = self.logger;

                    if (SenseiApi) {
                        window.SENSEI.api = new SenseiApi();;
                    } else {
                        window.SENSEI.widget.lazyLoadingModule.loadingModule('/lib/sensei_api.js', {}).then((SenseiApiInstance) => {
                            window.SENSEI.api = SenseiApiInstance;
                            callbacksSenseiApi.forEach(cb => cb());
                        });
                    }

                    const initProcesses = () => {
                        self.Processes = new self.models.ProcessesCollection();
                        self.ProcessButtons = new self.models.ProcessButtonsCollection();
                    }

                    if (Models) {
                        self.models = new Models();
                        initProcesses();
                    } else {
                        callbacksModels.push(initProcesses);

                        window.SENSEI.widget.lazyLoadingModule.loadingModule('/lib/models.js', {}).then((ModelsInstance) => {
                            self.models = ModelsInstance;
                            callbacksModels.forEach(cb => cb());
                        });
                    }

                    if (AmoApi) {
                        window.SENSEI.widget.amoApi = new AmoApi();
                    } else {
                        window.SENSEI.widget.lazyLoadingModule.loadingModule('/lib/AmoApi.js', {}).then((AmoApiInstance) => {
                            window.SENSEI.widget.amoApi = AmoApiInstance;
                        });
                    }

                    if (ThemeService) {
                        self.themeService = new ThemeService();
                        self.themeService.init();
                    } else {
                        window.SENSEI.widget.lazyLoadingModule.loadingModule('/lib/themeService.js', {}).then((ThemeServiceIntance) => {
                            self.themeService = ThemeServiceIntance;
                            self.themeService.init();
                        });
                    }

                    window.SENSEI.leadInteraction = new LeadInteraction;

                    window.SENSEI.locale = self.locale;
                    Twig.functions.sensei_locale = self.locale.get;
                    Twig.functions.sensei_numeral = self.locale.numeral;
                    if (localStorage) {
                        window.SENSEI.testState = JSON.parse(localStorage.getItem('test_state') || '{}');
                    }
                }

                const getConstructorState = () => {
                    if (window.SENSEI.constructorState || window.SENSEI.subscription_expired) {
                        return;
                    }

                    window.SENSEI.api.send("constructor/state", "GET").then(
                        (constructorState) => {
                            if (constructorState?.subscription?.is_expired) {
                                window.SENSEI.subscription_expired = true;
                            }

                            if (constructorState?.version?.element) {
                                window.SENSEI.element_version = constructorState.version.element;
                            }

                            if (constructorState.data && constructorState.data.constructor) {
                                window.SENSEI.constructorState = constructorState.data.constructor;
                            } else {
                                window.SENSEI.constructorState = 0;
                            }
                            if (constructorState == 2 && window.SENSEI.config.isTest()) {
                                window.SENSEI.constructorState = 3;
                            }

                            if (constructorState.features) {
                                window.SENSEI.features = constructorState.features;
                                if (constructorState.features.dynamic_segments == 1) {
                                    DynamicSegmentsV1.init();
                                } else if (constructorState.features.dynamic_segments == 2) {
                                    DynamicSegmentsV2.init();
                                }
                            }

                            if (constructorState?.data?.module_versions) {
                                if (constructorState?.data?.module_versions.element_form_extended < 10) {
                                    self.loadCssFile("lib/css/script_element/script_modal.css");
                                }
                                SENSEI.config.initJsModules(constructorState.data.module_versions);
                            }

                            SENSEI.config.globalSettings = constructorState.data.global_settings;
                        },
                        (error) => {
                            self.backendUnavailable = true;
                            console.debug(error);
                        }
                    );
                }

                const initLocale = () => {
                    let lang = APP.lang_id;
                    if (!["ru", "es", "pt"].includes(lang)) {
                        lang = "en";
                    }

                    if (!window.SENSEI.locale.initialized()) {
                        self.postRenderPromise = window.SENSEI.locale.init(lang).then(
                            () => {
                                this.postRender();
                                self.observerNode($(".feed-note__header-inner-nowrap").find(`:contains(${SENSEI.locale.get("back.script.element")}: )`), self.changeSystemNotes);
                            },
                            (error) => {
                                self.backendUnavailable = true;
                                console.debug(error);
                            }
                        );
                    } else {
                        this.postRender();
                    }
                }

                const loadModules = () => {
                    if (!self.modulesPromise) {
                        self.loadModules();
                    }

                    self.processModules("render");
                }

                if (window.SENSEI.api) {
                    getConstructorState();
                    initLocale();
                } else {
                    callbacksSenseiApi.push(getConstructorState, initLocale);
                }

                window.SENSEI.render = true;
                self.sendLogsBack('status', 'renderWidgetStatusChange');
                self.statusChanged = undefined;

                let crutches = new Crutches();

                if (location.pathname.includes(`/widget_page/${self.get_settings().widget_code}/left_menu`)) {
                    crutches.fixLeftMenuLocale();
                }

                crutches.fixSenseiMenuButtonLocale();

                if (APP.data.current_entity === 'todo-line') {
                    $('#pipeline_manage').addClass('sensei-d-n');
                }

                if (APP.data.current_entity != 'advanced-settings') {
                    let old_chatra_id = localStorage.getItem('old_chatra_id');
                    if (old_chatra_id) {
                        window.ChatraID = old_chatra_id;
                        localStorage.removeItem('old_chatra_id');
                        window.ChatraSetup = JSON.parse(localStorage.getItem('old_chatra_setup'));
                        localStorage.removeItem('old_chatra_setup');
                        window.ChatraIntegration = JSON.parse(localStorage.getItem('old_chatra_integration'));
                        localStorage.removeItem('old_chatra_integration');
                        if (window.Chatra) window.Chatra.restart();
                    }
                }

                if (APP?.data?.current_entity === "leads-dp" && APP?.data?.current_view?.collection?.length > 0) {
                    self.triggersLocalization();
                }

                if (window.SENSEI.api) {
                    loadModules();
                } else {
                    callbacksSenseiApi.push(loadModules);
                }


                if (APP.data.current_entity === 'leads'
                    && APP.data.is_card
                    && typeof APP.data?.current_card?.notes?.notes !== "undefined"
                ) {
                    APP.data.current_card.notes.notes.on(
                        'views:added',
                        function (noteViews) {
                            noteViews.forEach(item => {
                                let findSystemNoteForm = item.view.$el.find('.feed-note__header-inner-nowrap').find(`:contains(${SENSEI.locale.get('back.script.element')}: )`)
                                if (findSystemNoteForm.length !== 0 && findSystemNoteForm.find('#system_node_sensei_logo').length === 0) {
                                    self.changeSystemNoteNode(findSystemNoteForm);
                                }
                            })
                        }
                    );
                }
                self.renderNotifications();

                return true;
            },

            postRender: function () {
                if (!!window.SENSEI && self.postRenderTries < 1) {


                    if (self.userWorkplace) {
                        self.userWorkplace.updateData();
                    } else {
                        let path = SENSEI.config.getJsModulePath('workplaces');
                        if (path) {
                            SENSEI.widget.lazyLoadingModule.loadingModule(path, {}).then((userWorkplace) => {
                                self.userWorkplace = userWorkplace;
                            });
                        }
                    }
                }

                if (APP.data.is_card && APP.data.current_entity === 'leads') {
                    if (!(APP.data.current_card && APP.data.current_card.id)) {

                        if (self.postRenderTries > 20) {
                            throw '[SENSEI] Не удалось вызвать postRender из-за того, что не инициализирована карточка.';
                        }
                        self.postRenderTries += 1;

                        setTimeout(async () => this.postRender(), 50 * self.postRenderTries);
                        return;
                    }
                    self.postRenderTries = 0;

                    (async () => {

                        let helper_content = `<span class="sensei-helper_no-content-text">${SENSEI.locale.get('advisor.no_advice')}</span>
                            <a href="${SENSEI.locale.get('advisor.link')}" target="_blank" class="sensei-helper_no-content-link">${SENSEI.locale.get('advisor.more')}</a>`;
                        self.instances && self.instances.destroy();
                        self.instances = new processInstances([
                            {
                                on: 'reset',
                                callback: (collection) => {
                                    collection.each((instance) => {
                                        let current_element = instance.get('current_element');

                                        if (current_element === 'js' || current_element === 'css') {
                                            self.getInstanceLauncher(instance)();
                                        }

                                        if (current_element === 'form') {
                                            self.renderFieldsModal(instance.get('element_data'), instance.get('hash'), instance.get('results'), instance.get('id'), instance.get('current_process_item_id'), instance.get('name'));
                                        }

                                        if (current_element === 'hyperscript') {
                                            let script_id = instance.get('element_data').script_id;
                                            window.dispatchEvent((new CustomEvent('HSShowScript', { detail: { id: script_id } })));
                                        }

                                        if (current_element === 'task') {
                                            let element_data = instance.get('element_data');
                                            if (!!element_data && element_data['config']) {
                                                self.renderTaskModal({
                                                    config: element_data.config,
                                                    hash: instance.get('hash'),
                                                    entity_type: '1',
                                                    entity_id: APP.data.current_card.id,
                                                    process: {
                                                        instance_id: instance.get('id')
                                                    }
                                                });
                                            }
                                        }

                                        if (current_element === 'script') {
                                            self.renderScriptModal(instance.get('element_data'), instance.get('hash'), instance.get('results'), instance.get('id'), instance.get('current_process_item_id'), instance.get('name'), instance.get('result_items') || {});
                                        }
                                    });

                                    let helper_instances = collection.where({ date_end: null });
                                    if (helper_instances) {

                                        const timer = setTimeout(tick = () => {
                                            if ($('#nano-card-widgets .sensei-helper-logo').length) {
                                                clearTimeout(timer);

                                                for (key in helper_instances) {
                                                    if (helper_instances[key].get('assistant_content')) {
                                                        helper_content = helper_instances[key].get('assistant_content');
                                                        $('#nano-card-widgets #sensei-helper').html(helper_content);


                                                        self.assistantButtonsCallback();
                                                        self.showAssistantContent();

                                                        break;
                                                    }
                                                }
                                            } else {
                                                setTimeout(tick, 100);
                                            }
                                        }, 100);
                                    }
                                }
                            }
                        ]);


                        let helper_card_widget = $('#nano-card-widgets .card-widgets__widget-sensei-helper-block');
                        if (!helper_card_widget.length) {
                            self.render_template({
                                caption: {
                                    class_name: 'js-ac-caption sensei-helper-logo',
                                    html: ''
                                },
                                block_class_name: 'sensei-helper-block',
                                body: '',
                                render: '<div class="sensei-helper-wrapper custom-scroll" id="sensei-helper">' + helper_content + '</div> <div class="sensei-helper-wrapper custom-scroll sensei-advisor-buttons" id="sensei-helper-advisor"> <div class="sensei-start_process_buttons"> </div> </div> '
                            });
                        }
                        self.renderAssistantButtons();


                    })();
                }

                if (APP.data.current_entity == "leads-dp" &&
                    APP.data.current_view.collection.some((model) => model.has('name'))) {
                    self.renderDPTitles();
                }


                if (APP.data.current_entity === 'leads' || APP.data.current_entity === 'leads-pipeline' || APP.data.element_type === 'contacts') {
                    self.addDynamicSegmentButton();
                }
            },

            dpSettings: function () {
                if (!self.isWidgetActive()) {
                    return true;
                }

                var processes = self.Processes.toJSON();

                var code = self.get_settings().widget_code;


                var senseiDPTile = $('.digital-pipeline__short-task_widget-style_' + code)
                    .parent()
                    .parent()
                    .find('[data-action=send_widget_hook]');

                senseiDPTile
                    .addClass('digital-pipeline__sensei-modal')
                    .find('.digital-pipeline__edit-delay-new-process')
                    .addClass('sensei-margin-bottom');

                let inputProcessDirection = senseiDPTile.find('input[name="process_direction"]');
                let currentProcessDirection = inputProcessDirection.val() || 'start';
                let firstWordTitleProcessname = currentProcessDirection !== 'stop' ? SENSEI.locale.get('salesbot.direction_select.start') : SENSEI.locale.get('salesbot.direction_select.stop');
                let divCloseTasks = senseiDPTile.find('input[name="close_tasks"]').parents('.widget_settings_block__item_field');
                divCloseTasks.addClass('sensei-dp-mb-16px');

                let divTitle = senseiDPTile.find('input[name=process_id]')
                    .parents('.widget_settings_block__item_field')
                    .find('.widget_settings_block__title_field.form-group__title.h-text-overflow');

                let titleProcessname = divTitle.html();

                divTitle.html('&nbsp;' + titleProcessname).attr('title', firstWordTitleProcessname + ' ' + titleProcessname);

                let processIdParentDiv = senseiDPTile.find('input[name=process_id]').parents('.widget_settings_block__item_field');
                processIdParentDiv.addClass('sensei-dp-mb5');
                processIdParentDiv.prepend(`<div class="widget_settings_block__title_field form-group__title sensei-dp-inline-block" title="${firstWordTitleProcessname + ' ' + titleProcessname}">` + twig({
                    ref: '/tmpl/controls/select.twig'
                }).render({
                    'items': [
                        { id: 'start', option: SENSEI.locale.get('salesbot.direction_select.start') },
                        { id: 'stop', option: SENSEI.locale.get('salesbot.direction_select.stop') }
                    ],
                    'selected': currentProcessDirection,
                    'name': 'process_direction_select',
                    'class_name': 'sensei-underlined-select sensei-start-modal-mode-select'
                }) + '</div>');

                let close_tasks = senseiDPTile.find('input[name="close_tasks"]').val() === "true";
                divCloseTasks.empty().append(twig({
                    ref: '/tmpl/controls/checkbox.twig'
                }).render({
                    'name': 'close_tasks',
                    'checked': close_tasks,
                    'text': SENSEI.locale.get('dp.start_modal.close_tasks'),
                    'value': 'true',
                    'class_name': 'sensei-process-stop-close-tasks'
                }));
                if (currentProcessDirection == 'start') {
                    divCloseTasks.hide();
                }

                inputProcessDirection.parents('.form-group').addClass('hidden');
                senseiDPTile.find('input[name="process_direction_select"]').on('change', (e) => {
                    inputProcessDirection.val(e.currentTarget.value).trigger("change");
                    let isStopDirection = e.currentTarget.value === 'stop';
                    let firstWordTitleProcessname = !isStopDirection ? SENSEI.locale.get('salesbot.direction_select.start') : SENSEI.locale.get('salesbot.direction_select.stop');
                    divTitle.attr('title', firstWordTitleProcessname + ' ' + titleProcessname);
                    senseiDPTile.find('.sensei-dp-inline-block').attr('title', firstWordTitleProcessname + ' ' + titleProcessname);
                    if (isStopDirection) {
                        divCloseTasks.show();
                        renderDpProcessSelect(e.currentTarget.value);
                    } else {
                        divCloseTasks.hide();
                        renderDpProcessSelect(e.currentTarget.value);
                    }
                });


                let selectedProcessId = senseiDPTile.find('input[name=process_id]').val();
                let selectedProcess = selectedProcessId;
                if (selectedProcessId !== 'all') {
                    selectedProcess = processes.find((item) => item.id == selectedProcessId);
                    if (processes.length > 0 && (!selectedProcessId || !(+selectedProcessId)) || !selectedProcess?.enabled) {
                        selectedProcessId = processes.find((item) => !!item.enabled)?.id;
                    }
                }

                let divProcessIdContainer = senseiDPTile.find('input[name=process_id]').parent();

                let renderDpProcessSelect = (direction) => {
                    let selectedProcess = senseiDPTile.find('input[name=process_id]').val();
                    let processes = self.Processes.toJSON().filter(process => process.enabled);
                    let selected = selectedProcess || -1;
                    let selectedId = selectedProcess;



                    let notSelected = { id: -1, name: SENSEI.locale.get('salesbot.not_selected'), hidden: true, disabled: true };
                    let notFound = { id: -2, name: SENSEI.locale.get('dp.process_deleted', { id: selectedId }), enabled: true, hidden: true, disabled: true };

                    if (direction == 'stop') {
                        processes = [
                            notSelected,
                            { id: 'all', name: SENSEI.locale.get('salesbot.all_processes'), enabled: true },
                            ...processes
                        ];
                    } else {
                        processes = [
                            notSelected,
                            ...processes
                        ];
                        if (selected === 'all') {
                            selected = -1;
                        }
                    }

                    if (selected === undefined) {
                        if (selectedId === '') {
                            selected = -1;
                        } else {
                            processes = [
                                notFound,
                                ...processes
                            ];
                            selectedProcessId = -2;
                            selected = notFound;
                        }
                    }

                    let tileContent = self.renderTabContent('dp', processes, selectedProcessId);
                    divProcessIdContainer.empty().append(tileContent);
                    senseiDPTile.find('input[name=process_id]').on('change', function () {
                        if ($(this).val() != 0) {
                            let value = $(this).val();
                            let processName = '';
                            if (value !== 'all') {
                                processName = self.Processes.get(value).get('name');
                            } else {
                                processName = SENSEI.locale.get('salesbot.all_processes');
                            }
                            nameInput.val(processName);
                            self.changeAttributesModelDP(model, processName);
                        } else {
                            senseiDPTile.find('button.js-trigger-save').trigger('button:save:disable');
                        }
                    });


                    senseiDPTile.find('.sensei-dp-inline-block').off('change.direction');
                    senseiDPTile.find('.sensei-dp-inline-block').on('change.direction', function () {
                        model.get('settings').widget.settings.process_direction = direction;
                        self.changeAttributesModelDP(model, model.get('settings').widget.settings.process_name);
                    });
                }

                renderDpProcessSelect(currentProcessDirection);


                const version = APP.constant('account').version;
                const nameInput = senseiDPTile.find('input[name=process_name]');
                if (version >= 5) {
                    nameInput.parents('.form-group').addClass('hidden');
                } else {
                    nameInput.parents('.widget_settings_block__item_field').addClass('hidden');
                }

                const $accountId = senseiDPTile.find('input[name="account_id"]');

                $accountId.closest('.form-group').addClass('hidden');
                $accountId.val(APP.constant('account').id).trigger('change');

                const process = self.Processes.get(senseiDPTile.find('input[name=process_id]').val());
                if (process) {
                    nameInput.val(process.get('name'));
                }

                const dpProcessId = senseiDPTile.parents('.digital-pipeline__item').attr('data-process-id');
                if (senseiDPTile.find('input[name=process_id]').val() == 0) {
                    senseiDPTile.find('button.js-trigger-save').trigger('button:save:disable');
                    APP.data.current_view.rows.forEach(function (result, index) {
                        if (result.action_id == dpProcessId) {
                            result.form.hasChanges = () => false;
                            APP.data.current_view.collection.get(dpProcessId).hasChanges = () => false;
                        }
                    });
                }

                let model;
                try {
                    model = APP.data.current_view.collection.get(dpProcessId);
                    !!process && self.changeAttributesModelDP(model, process.get('name'));
                } catch (e) {
                    self.logger.sendLogError(error);
                }

                if (model?.attributes?.settings) {
                    model.attributes.settings =
                        JSON.parse(JSON.stringify(model.attributes.settings));
                }

                if (model && model.get('fake')) {
                    model.on('change:settings', function (changedModel, settings) {
                        const newName = settings.widget.settings.process_name;
                        if (newName) {
                            let newProcessName = self.getNewProcessName(changedModel, newName);
                            changedModel.set('name', newProcessName, { silent: true });
                        }
                    });
                }

                return true;
            },
            async initMenuPage({ subitem_code: page }) {
                if (!location.pathname.includes(`/widget_page/${self.get_settings().widget_code}/left_menu`)) {
                    return;
                }

                const { is_admin } = APP.constant('managers')[APP.constant('user').id];

                if (is_admin === 'N') {
                    return APP.router.navigate('dashboard', { trigger: true });
                }

                if (self.backendUnavailable) {
                    new BackendFallback();
                    return;
                }

                if (page !== 'billing' && page !== 'support') {
                    $('#work_area').addClass('sensei-block-loading');
                }

                try {
                    if (localStorage.getItem('sensei_element_version') != window.SENSEI.element_version) localStorage.setItem('sensei_element_version', window.SENSEI.element_version);
                    const param = window.SENSEI.element_version ? '?v=' + window.SENSEI.element_version : '';
                    self.initStyles();

                    require([
                        config.getElUrl() + param,
                        config.getBaseJsUrl() + 'app.js' + param,
                    ], (el, App) => {

                        if (self.backendUnavailable) {
                            new BackendFallback();
                            return;
                        }

                        config.setEl(el);

                        new App({ page, processes: self.Processes, templates: self.templates, widget: self, DynamicSegmentsCollection });
                    });
                } catch (error) {
                    self.logger.sendLogError(error);

                    $('#work_area').removeClass('sensei-block-loading');
                }
                self.renderNotifications();

                if (page === 'sensei_robocode') {
                    const scriptId = new URLSearchParams(window.location.search).get("script_id");
                    if (scriptId) {
                        self.Robocode.actions.open_modal_scenario_by_id(null, scriptId);
                    }
                }
            },
            leads: {
                selected: function () {
                    self.widgetsOverlay(false);

                    let processes = self.Processes.toJSON();
                    let selected = self.list_selected();

                    if (self.allowedModules.includes('process_start_modal_v2')) {
                        self.modules['process_start_modal_v2'].open(processes, selected);

                    } else {
                        new Modal({
                            class_name: 'sensei-modal',
                            init: function (modalBody) {

                                self.choosedLeads = selected.selected.map((choosedLead) => {
                                    return {
                                        entity_id: choosedLead.id,
                                        entity_type: 1
                                    };
                                });


                                var modalContent = self.renderTabContent('leads-list', processes);

                                modalBody.trigger('modal:loaded').empty().append(modalContent).trigger('modal:centrify');
                            },
                            destroy: function () { }
                        });
                    }
                }
            },
            contacts: {
                selected: function () {
                    self.widgetsOverlay(false);

                    let selected = self.list_selected().selected;

                    let path = SENSEI.config.getJsModulePath('robocode_multy_action');
                    if (path) {
                        SENSEI.widget.lazyLoadingModule.loadingModule(path, selected);
                    }
                }
            },
            onSave: function () {
                return true;
            },
            loadPreloadedData: function () {
                return new Promise(_.bind(function (resolve, reject) {
                    resolve({});



                    if (self.postRenderPromise) {
                        self.postRenderPromise.then(() => {
                            self.instances.renderTabContent();
                        });
                    } else {

                    }
                }), this);
            },
            loadCatalogElement: function (e) {
                return new Promise(_.bind(function (resolve) {
                    resolve({});
                }), this);
            },
            loadElements: function () {
                return new Promise(_.bind(function (resolve) {
                    resolve({});
                }), this);
            },
            linkCard: function () {
                return new Promise(_.bind(function (resolve) {
                    resolve({});
                }), this);
            },
            salesbotDesignerSettings: function ($body, renderRow, params) {

                let renderSalesbotProcessSelect = (direction) => {
                    let processes = self.Processes.toJSON().filter(process => process.enabled);
                    let selected = params.params.params.params.process_id;



                    let notSelected = { id: -1, name: SENSEI.locale.get('salesbot.not_selected'), hidden: true, disabled: true };

                    if (direction == 'stop') {
                        processes = [
                            notSelected,
                            { id: 'all', name: SENSEI.locale.get('salesbot.all_processes') },
                            ...processes
                        ];
                    } else {
                        processes = [
                            notSelected,
                            ...processes
                        ];
                        if (selected === 'all') {
                            selected = -1;
                        }
                    }

                    if (selected === undefined) {
                        selected = -1;
                    }
                    $select = self.renderProcessesList(processes, selected, 'sensei-processes-list sensei-salesbot__process-select', 'process_id');



                    $select.find('.custom-scroll').on('wheel', (e) => { e.stopPropagation() });
                    $select.addClass('sensei-salesbot__process-select');

                    $body.find('[data-field-name="process_id"]').empty().append($select);
                }

                let divCloseTasks = $body.find('[data-field-name="close_tasks"]');
                let divProcessDirection = $body.find('div[data-field-name="process_direction"]');
                $body.parents('.salesbot-designer__block').addClass('sensei-salesbot-block');
                let headerParent = $body.parents('.salesbot-designer__block').find('.salesbot-designer__block-header-name_text').parent();

                let currentProcessDirection = params.params.params.params.process_direction;
                headerParent.prepend(twig({
                    ref: '/tmpl/controls/select.twig'
                }).render({
                    'items': [
                        { id: 'start', option: SENSEI.locale.get('salesbot.direction_select.start') },
                        { id: 'stop', option: SENSEI.locale.get('salesbot.direction_select.stop') }
                    ],
                    'selected': currentProcessDirection,
                    'name': 'process_direction',
                    'class_name': 'sensei-underlined-select sensei-start-modal-mode-select'
                }));

                divProcessDirection.empty().append(twig({
                    ref: '/tmpl/controls/input.twig'
                }).render({
                    name: 'process_direction',
                    class_name: 'hidden',
                    value: currentProcessDirection
                }));
                $body.find('div[data-field-name="process_direction"]').hide();

                headerParent.find('input[name="process_direction"]').on('change', (e) => {
                    $body.find('input[name="process_direction"]').val(e.currentTarget.value).trigger("change");
                    if (e.currentTarget.value == 'stop') {
                        divCloseTasks.show();
                        renderSalesbotProcessSelect(e.currentTarget.value);
                    } else {
                        divCloseTasks.hide();
                        renderSalesbotProcessSelect(e.currentTarget.value);
                    }
                });

                let close_tasks = params.params.params.params.close_tasks === "true";
                divCloseTasks.empty().append(twig({
                    ref: '/tmpl/controls/checkbox.twig'
                }).render({
                    'name': 'close_tasks',
                    'checked': close_tasks,
                    'text': SENSEI.locale.get('salesbot.close_tasks'),
                    'value': 'true',
                    'class_name': 'sensei-process-stop-close-tasks'
                }));
                if (currentProcessDirection != 'stop') {
                    divCloseTasks.hide();
                }

                renderSalesbotProcessSelect(currentProcessDirection);

                $body.addClass('sensei-salesbot__body');
                $body.prepend(
                    $('<div>').addClass('sensei-salesbot__custom-logo')
                        .append(
                            $('<img>').attr('src', config.getBaseUrl() + 'svg/salesbot_logo.svg')
                        )
                );

                return {
                    exits: []
                };
            },
            onSalesbotDesignerSave: function (handler, params) {
                let url = config.getBaseApiUrl() + 'process/start-via-salesbot';

                return JSON.stringify([{
                    question: [{
                        handler: 'widget_request',
                        params: {
                            url: url,
                            method: 'POST',
                            json: false,
                            data: params,
                        }
                    }]
                }]);
            },
        };

        this.addDynamicSegmentButton = () => {
            let timer = setTimeout(tick = () => {
                const notice = $('.notice__hover-wrapper');

                if (notice.length) {
                    const doesAddDynamicSegmentButtonExist = notice.find('.sensei-dynamic-segment').length === 1;

                    clearTimeout(timer);

                    if ((APP.data.current_entity === 'leads' || APP.data.current_entity === 'leads-pipeline') && !doesAddDynamicSegmentButtonExist) {
                        notice.append('<span class="notice__text sensei-dynamic-segment">' + SENSEI.locale.get('dynamic_segment.new_segment') + '</span>').find('span').css({ display: 'block' });
                    } else if (APP.data.element_type === 'contacts' && !doesAddDynamicSegmentButtonExist && SENSEI.features.dynamic_segments == 2) {
                        notice.append('<span class="notice__text sensei-dynamic-segment">' + SENSEI.locale.get('dynamic_segment.new_segment') + '</span>').find('span').css({ display: 'block' });
                    }
                } else {
                    timer = setTimeout(tick, 100);
                }
            }, 100);

            let noticeDashboard = $('#create_dashboard_widget, .list-top-search__summary-text');
            noticeDashboard.on('mouseover', () => {
                self.observerNode(noticeDashboard, self.changePositionNotesDashboardWidget, { childList: true, subtree: true, attributes: true })
            });
        };

        this.isWidgetActive = function () {
            var active = false;

            try {
                active = APP.constant("widgets").widgets.all[self.params.widget_code].active;
            } catch (e) {

            }

            if (
                self.params.widget_active !== 'N'
                && (
                    (self.params.login !== '' && typeof self.params.login !== 'undefined')
                    || self.params.widget_active === 'Y'
                    || active
                )
            ) {
                return true;
            }

            return false;
        };

        this.initStyles = function () {
            if (!self.isMainStyleInit) {
                const version = localStorage.getItem('sensei_element_version') || sensei_widget_version;
                $('head').append($(`<link type="text/css" crossorigin="anonymous" rel="stylesheet" href="${config.getBaseStyleUrl()}main.css?v=${version}">`));
                const mxPath = config.getBaseJsUrl() + 'vendor/mxgraph';
                $('head').append(`<link rel="stylesheet" href="${mxPath}/src/css/common.css?v=${version}" charset="UTF-8" type="text/css">`);
                $('head').append(`<link rel="stylesheet" href="${mxPath}/src/css/explorer.css?v=${version}" charset="UTF-8" type="text/css">`);
                self.isMainStyleInit = true;
            }
        };

        this.loadCssFile = function (pathToFile) {
            var settings = self.get_settings();

            if ($('link[href="' + settings.path + '/' + pathToFile + '?v=' + sensei_widget_version + '"').length < 1) {

                $("head").append('<link href="' + settings.path + '/' + pathToFile + '?v=' + sensei_widget_version + '" type="text/css" rel="stylesheet">');
            }
        }

        this.renderConstructor = function (account, MainView) {
            let main = new MainView({
                collection: self.Processes,
                api: window.SENSEI.api,
                widget: self,
                account: account,
                config: config,
                templates: self.templates
            });
        };

        this.renderPreviewer = function (container, Constructor, data) {
            $container = $(container);
            $container.prepend(self.templates.previewer_modal.render({}));

            let graphContainer = document.getElementById('sensei-previewer');
            let constructor = new Constructor(graphContainer, config);

            constructor.previewMode = true;
            constructor.init();
            constructor.renderProcess(data);

            constructor.dispatcher.on('preview:element:click', function (instanceId, elementId) {
                let confirmModal = new ConfirmModal({
                    class_name: 'start-instance__modal-confirm',
                    accept_text: SENSEI.locale.get('general.button.confirm'),
                    decline_text: SENSEI.locale.get('general.button.cancel'),
                    text: SENSEI.locale.get('preview.start_process'),
                    message: [
                        { text: SENSEI.locale.get('preview.confirm_start') },
                    ],
                    destroy: function () {
                        return false;
                    },
                    accept: function () {
                        $button = this.$modal_body.find('.js-modal-accept');
                        $button.trigger('button:load:start');

                        let modal = this;
                        window.SENSEI.continueInstance(instanceId, elementId)
                            .then(function (response) {
                                $button.trigger('button:load:stop');
                                modal.destroy();
                                $('.sensei-previewer-modal .icon-modal-close').trigger('click');
                            });
                    }
                });
            });

            $container.find('.sensei-constructor__zoom-in').on('click', function (e) {
                constructor.zoomIn();
            });

            $container.find('.sensei-constructor__zoom-out').on('click', function (e) {
                constructor.zoomOut();
            });
        };

        this.renderFieldsModal = function (data, hash, results, instance_id, process_item_id, process_name) {
            self.modalQueue.do((finish) => {
                if (self.submittedModals.includes(hash)) {
                    finish();
                    return;
                }
                self.submittedModals.push(hash);

                let check_resp = data['check_resp'] || '0';
                if (check_resp == '0' || (check_resp == '1' && APP.data.current_card.getMainUser() == APP.constant('user').id)) {

                    self.elem_forms[process_item_id] = {
                        autoOpenNextPage: data.autoOpenNextPage || 0
                    };
                    let path = SENSEI.config.getJsModulePath('fields_modal');
                    if (path) {
                        SENSEI.widget.lazyLoadingModule.loadingModule(path, {
                            templates: self.templates,
                            fields: data.fields,
                            title: data.title,
                            instance_id,
                            process_item_id,
                            process_name,
                            hash: hash,
                            result: _.keys(results)[0]
                        }).then((modal) => {
                            modal.once('fields:close', () => {
                                finish();
                            });
                            modal.once('fields:save', async function (immediatelyContinue, currentModal, param_values, update_values) {
                                if (immediatelyContinue) {
                                    currentModal.destroy();

                                    await window.SENSEI.api.send('process/element_result', 'POST', {
                                        "hash": hash,
                                        "result": _.keys(results)[0],
                                        param_values,
                                        update_values
                                    });

                                    if (self.elem_forms[process_item_id].autoOpenNextPage == 1 && $('.sensei-next-lead .button-input-inner__text').text() == SENSEI.locale.get('workplace.button.next')) {
                                        $('.sensei-next-lead').trigger('click');
                                    }

                                    APP.router.preventPageChange(false);
                                } else {
                                    let check_contact = false;
                                    let check_company = false;
                                    let fields = data.fields;

                                    _.each(fields, function (field) {
                                        if (field.entity_type == '1') {
                                            check_contact = true;
                                        }
                                        if (field.entity_type == '3') {
                                            check_company = true;
                                        }
                                    });

                                    let time = 1;

                                    if (check_contact) {
                                        time += 1000;
                                    }

                                    if (check_company) {
                                        time += 1000;
                                    }

                                    $(document).one('card:save:success', 'div#card_holder.card-holder', () => {
                                        setTimeout(() => {
                                            currentModal.destroy();
                                            window.SENSEI.api.send('process/element_result', 'POST', {
                                                "hash": hash,
                                                "result": _.keys(results)[0],
                                                param_values,
                                                update_values
                                            });

                                            APP.router.preventPageChange(false);
                                        }, time);
                                    });

                                    APP.data.current_card.toggleSaveBlock(true);
                                    $('.card-fields__button-block .card-top-save-button').trigger('click');
                                };
                                if ($("#validation_counter").length) {
                                    currentModal.destroy();
                                }
                            });
                        });
                    }
                }
            });
        };

        this.startHyperScript = function (data) {
            if (APP.data.current_card.id == data.entity_id &&
                APP.data.current_card.element_type == 2) {
                let script_id = data.config.script_id;
                window.dispatchEvent((new CustomEvent('HSShowScript', { detail: { id: script_id } })));
            }
        };

        this.renderTaskModal = function (data) {
            if (APP.data.current_card.id == data.entity_id &&
                APP.data.current_card.element_type == 2) {
                self.modalQueue.do((finish) => {
                    if (self.submittedModals.includes(data.hash)) {
                        finish();
                        return;
                    }
                    self.submittedModals.push(data.hash);
                    let modal = new TaskModal({ templates: self.templates, config: data.config });
                    modal.once('deadline:close', () => {
                        finish();
                    });
                    modal.once('deadline:save', async result => {
                        let request = {
                            "instance_id": data.process.instance_id,
                            "hash": data.hash,
                            "entity_type": data.entity_type,
                            "entity_id": data.entity_id,
                            "task_complete_till": result.complete_till,
                        };
                        if (result.duration) request["task_duration"] = result.duration;

                        try {
                            const { status } = window.SENSEI.api.setTaskWithDeadline(request);

                            if (status && status !== 200) {
                                throw new Error(SENSEI.locale.get('general.error.reload'));
                            }
                        } catch (error) {
                            Alert.showAlertModal(error.message);
                            self.logger.sendLogError(error);
                        }
                    });
                });
            }
        };

        this.renderScriptModal = (data, hash, results, instance_id, process_item_id, process_name, nextSriptModals, param_values = {}) => {
            if (self.submittedModals.includes('script_modal_next_result_' + process_item_id)) {
                self.submittedModals.splice(self.submittedModals.indexOf('script_modal_next_result_' + process_item_id), 1);
                self.submittedModals.push(hash);
                self.modalQueue.modal.nextSriptModals = nextSriptModals;
                self.modalQueue.modal.hash = hash;
                return;
            }
            let event = 'do';
            if (hash.includes('script_modal_next_result_')) {
                event = 'unshift';
            }
            self.modalQueue[event]((finish) => {
                if (self.submittedModals.includes(hash)) {
                    finish();
                    return;
                }
                self.submittedModals.push(hash);

                self.elem_forms[process_item_id] = {
                    autoOpenNextPage: data.autoOpenNextPage || 0
                };
                let path = SENSEI.config.getJsModulePath('element_form_extended');
                if (path) {
                    SENSEI.widget.lazyLoadingModule.loadingModule(path, {
                        templates: self.templates,
                        fields: data.fields,
                        title: data.title,
                        result: data.result,
                        hash: hash,
                        instance_id,
                        process_item_id,
                        process_name,
                        results,
                        param_values
                    }).then((ScriptModal) => {
                        self.modalQueue.modal = ScriptModal;
                        self.modalQueue.modal.nextSriptModals = nextSriptModals;
                        self.modalQueue.modal.once('script:save', async (hash, idNextResult, param_values, update_values = {}) => {

                            self.isLogUpdateLead = true;

                            let time = 2000;

                            if (!!self.modalQueue.modal.nextSriptModals[idNextResult]) {
                                time = 1;
                                nextSriptModals = self.modalQueue.modal.nextSriptModals[idNextResult];
                                self.renderScriptModal(nextSriptModals.config, 'script_modal_next_result_' + nextSriptModals.id, nextSriptModals.results, instance_id, process_item_id, process_name, nextSriptModals.result_items || {}, param_values);
                            }

                            window.SENSEI.beforeunload.preventOn();

                            setTimeout(() => {
                                let resultSaveRequest = window.SENSEI.api.send('process/element_result', 'POST', {
                                    "hash": hash,
                                    "result": idNextResult,
                                    param_values,
                                    update_values,
                                    "user_name": APP.constant('user').name
                                });
                                resultSaveRequest.finally(() => {
                                    window.SENSEI.beforeunload.preventOff();
                                }).catch(reportError => {
                                    console.debug(reportError);
                                    self.logger.sendLogError(reportError);
                                });
                            }, time);

                            finish();
                        });

                        self.modalQueue.modal.once('script:finish', () => {
                            finish();
                        })
                    });
                }
            });
        }

        this.updateAssistantContent = ({ entity_id, config: { content = '' } }) => {
            if (APP.data.current_card.id == entity_id &&
                APP.data.current_card.element_type == 2) {
                $('#nano-card-widgets #sensei-helper').html(content);


                self.showAssistantContent();
                self.assistantButtonsCallback();
            }
        };

        this.updateLeadResponsible = (message) => {
            if (APP.data.is_card && APP.data.current_card.id == message.element_id) {
                var model = {
                    created_by: message.created_by,
                    data: { text: "", params: { old: message.data.params.old, 'new': message.responsible_user_id } },
                    date_create: message.date_create,
                    deletable: false,
                    editable: false,
                    element_id: message.element_id,
                    element_type: APP.data.current_card.element_type,
                    object_type: { id: 6, code: "systemnotes" },
                    responsible_user_id: message.responsible_user_id,
                    type: 14
                };
                APP.data.current_card.form._handleAUMessage(self.setModelTaskData(model, message));
                let disabledData = [];
                APP.data.current_card.getLinkedForms().form_models.map((model, index) => {
                    disabledData.push(model.get('disabled'));
                    model.set("disabled", true);
                });
                APP.data.current_card.checkMainUsers(() => {
                    APP.data.current_card.getLinkedForms().form_models.map((model, index) => {
                        if (disabledData[index] === undefined) {
                            model.unset("disabled");
                        } else {
                            model.set("disabled", disabledData[index]);
                        }
                    });
                });
            }
        }


        this.showAssistantContent = () => {

            if (!$('#card_holder').is('.js-widgets-active')) {
                $('.card-widgets__top').click();
            }

            const senseiLogo = $('#nano-card-widgets .sensei-helper-logo');
            !senseiLogo.find('+ div').is('.js-body-hide') && senseiLogo.click();
        };

        this.getDirectionString = (currentProcessDirection) => {
            return currentProcessDirection !== 'stop' ? SENSEI.locale.get('salesbot.direction_select.start') : SENSEI.locale.get('salesbot.direction_select.stop');
        }

        this.getNewProcessName = (model, processName) => {
            let direction = model.get('settings').widget.settings.process_direction;
            let processDirection = !!direction ? this.getDirectionString(direction) : '';
            if (!processDirection) {
                let processName = model.get('settings').widget.settings.process_name;
                processDirection = !!processName ? this.getDirectionString('start') : '';
            }
            return `Sensei: ${processDirection} ${processName}`;
        }

        this.changeAttributesModelDP = (model, processName) => {
            let newProcessName = this.getNewProcessName(model, processName);
            model.set('action_title', newProcessName, { silent: true });
            model.set('name', newProcessName, { silent: true });
        }

        this.renderDPTitles = function () {
            let dpItemsCollection;
            try {
                dpItemsCollection = APP.data.current_view.collection;
            } catch (e) {
                self.logger.sendLogError(error);
                return;
            }
            dpItemsCollection
                .where({ widget_code: self.params.widget_code })
                .forEach(function (model) {
                    let processName = model.get('settings').widget.settings.process_name;

                    if (!processName) {
                        processName = model.get('settings').widget_info.name;
                    }

                    if (processName) {
                        self.changeAttributesModelDP(model, processName);
                    }
                    APP.data.current_view.rerenderTrigger(model.get('id'));
                    model.on('change:settings', function (changedModel, settings) {
                        const newName = settings.widget.settings.process_name;
                        if (newName) {
                            let newProcessName = self.getNewProcessName(changedModel, newName);
                            changedModel.set('name', newProcessName, { silent: true });
                        }
                    });
                });
        };

        this.getInputHTML = function (name, placeholder, className, value = '') {
            return twig({
                ref: '/tmpl/controls/input.twig'
            }).render({
                name: name,
                placeholder: placeholder,
                class_name: className,
                value
            });
        };

        this.checkTaskElement = (taskId, items, restricted = false) => {
            return items.some(({ current_element, element_data }) => {
                if (current_element === 'task' && element_data && element_data.task_id && +element_data.task_id === +taskId && element_data.wait == '1') {
                    if (restricted) {
                        return element_data.task_change_restrictions === 1;
                    } else {
                        return true;
                    }
                }
            });
        }

        this.toggleConstructorButtons = function (active) {
            if (active) {
                $('#sensei-save-button').prop('disabled', false).removeClass('button-input-disabled');
                $('#sensei-cancel-button').prop('disabled', false).removeClass('button-input-disabled');
            } else {
                $('#sensei-save-button').prop('disabled', true).addClass('button-input-disabled');
                $('#sensei-cancel-button').prop('disabled', true).addClass('button-input-disabled');
            }
        };

        this.addTemplate = function (name, data) {
            var id = '/sensei/' + name + '.twig';
            if (Twig.Templates && Twig.Templates.registry && Twig.Templates.registry[id]) {
                self.templates[name] = Twig.Templates.registry[id];
                return;
            }
            self.templates[name] = twig({
                id: id,
                data: data,
                allowInlineIncludes: true
            });
        };

        this.showAlertModal = function (text, success, modal_class = '') {
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
            return new Modal({
                class_name: 'modal-window ' + modal_class,
                init: function ($modal_body) {
                    $modal_body
                        .trigger('modal:loaded')
                        .html(modal_html)
                        .addClass('sensei-alert-modal')
                        .trigger('modal:centrify');
                },
                destroy: function () { }
            });
        };

        this.showSenseiOverlay = function () {
            let overlay = $('#sensei-settings-overlay');
            if (overlay.length == 0) {
                overlay = $(
                    '<div class="default-overlay load-widget-overlay default-overlay-visible" id="sensei-settings-overlay">' +
                    '<span class="spinner-icon spinner-icon-abs-center"></span>' +
                    '</div>');
                $("body").append(overlay);
            }
            overlay.trigger("overlay:show");
        };

        this.hideSenseiOverlay = function () {
            $('#sensei-settings-overlay').trigger("overlay:hide", {
                instantly: !0
            });
        };

        this.setModelTaskData = (modelTask, task_data) => {
            for (var index in task_data) {
                if (typeof task_data[index] == "object") {
                    if (typeof modelTask[index] == "undefined") {
                        modelTask[index] = task_data[index];
                    } else {
                        self.setModelTaskData(modelTask[index], task_data[index]);
                    }
                } else {
                    modelTask[index] = task_data[index];
                }
            }
            return modelTask;
        }

        this.socketAddTags = function (p) {
            if (APP.data.is_card && APP.data.current_card.id == p.entity_id) {
                if (!APP.data.current_card._existed_tags) {
                    $.each($('#add_tags').find('li:not([data-id="lead_id"])'), function (index, elem) {
                        APP.data.current_card['_existed_tags'] = [...APP.data.current_card['_existed_tags'] || [], {
                            id: $(elem).attr('data-id'),
                            raw_title: $(elem).find('span').text(),
                            title: $(elem).find('span').attr('title'),
                            color: $(elem).attr('data-color')
                        }];
                    });
                }
                APP.data.current_card['_existed_tags'] = [...APP.data.current_card['_existed_tags'] || [], ...p.tags];
                p.tags.forEach((tag, index) => {
                    $('#add_tags').find('li[data-id="lead_id"]').after(`<li class=" multisuggest__list-item js-multisuggest-item" data-id="${tag.id}" data-color="${tag.color}">
                        <span class="tag" title="${tag.title}">${tag.raw_title}</span>
                    </li>`);
                });
            }
        };

        this.socketDeleteTags = function (p) {
            if (APP.data.is_card && APP.data.current_card.id == p.entity_id) {
                p.tags.forEach((id, index) => {
                    $('#add_tags').find(`li[data-id="${id}"]`).remove();
                    if (!!APP.data.current_card._existed_tags) {
                        try {
                            APP.data.current_card._existed_tags.forEach((tag, i) => {
                                if (tag.id == id) {
                                    APP.data.current_card._existed_tags.splice(i, 1);
                                    throw new Error('delete tag');
                                }
                            });
                        } catch (error) {
                            self.logger.sendLogError(error);
                        }
                    }
                })
            }
        };

        this.socketNewNote = function (p) {
            if (APP.data.is_card && APP.data.current_card.id == p.entity_id) {
                var model = {};
                APP.data.card_page.notes._addNotes(self.setModelTaskData(model, p.note_data));
            }
        };

        this.updateLossReason = function (p) {
            if (APP.data.is_card && APP.data.current_card.id == p.entity_id) {
                $('.pipeline-select-view__loss-reason.js-control-loss-reason-dropdown').append('<input type="radio" class="hidden"/>')
                    .find('input.hidden').val(p.id).click().remove();
            }
        };


        this.updateTasksAndFormsAutoOpenNextPage = function (p) {
            let socketData = JSON.parse(p.data);

            for (let i in self.tasks) {
                let itemID = self.tasks[i].itemID;
                if (socketData[itemID].length != 0) {
                    self.tasks[i].autoOpenNextPage = {};
                    for (let e in socketData[itemID]) {
                        let caption = socketData[itemID][e].caption;
                        self.tasks[i].autoOpenNextPage[caption] = socketData[itemID][e].autoOpenNextPage;
                    }
                }
            }
            for (let i in self.elem_forms) {
                if (socketData[i] == 1 || socketData[i] == 0) {
                    self.elem_forms[i].autoOpenNextPage = socketData[i];
                }
            }
        };

        this.socketChangeTaskWrapper = function (p) {
            const callback = self.socketChangeTask.bind(self, p);

            self.elementFactoryCallback(callback);
        }

        this.socketChangeTask = function (p) {
            const render = (p) => {
                if (APP.data.is_card && APP.data.current_card.id == p.entity_id) {
                    var modelTask = {
                        completable: true,
                        deletable: true,
                        editable: true,
                        element_id: p.entity_id,
                        element_type: APP.data.current_card.element_type,
                        failed: true,
                        id: p.element_data.task_id,
                        object_type: {
                            code: "tasks"
                        },
                        result: null,
                        status: 0,
                        type: 1
                    };
                    APP.data.card_page.notes._addNotes(self.setModelTaskData(modelTask, p.task_data));
                    let count = 100;
                    let timerID = setInterval(async () => {
                        if (count-- > 0) {
                            if ($(`.feed-note-wrapper-task[data-id="${p.task_id}"]`).length) {
                                clearTimeout(timerID);
                                const element = await window.SENSEI.ElementFactory.create('task');
                                if (p.element_data && p.element_data.wait) {
                                    let results = p.result_data;
                                    if (!results) {
                                        results = {};
                                        Object.keys(p.results).forEach((id, index) => {
                                            results[id] = { id: id, caption: p.results[id], is_continue: 0, sorting: index };
                                        });
                                    }
                                    let process_comments_enabled = p.process_comments_enabled || false;
                                    element.render(p.element_data, results, p.process_name, p.process_id, process_comments_enabled, p.element_instance_config);
                                    element.bind_actions();


                                    if (element.taskID) {
                                        self.tasks[element.taskID] = element;
                                    }
                                }
                            }
                        } else {
                            clearTimeout(timerID);
                        }
                    }, 200);
                }
            }


            const observer = new MutationObserver(mutationRecords => {
                const newElement = mutationRecords[0].addedNodes[0];
                if (!$(newElement).hasClass('card-task-wrapper')) {
                    return;
                }

                const parentElement = $(newElement).parent()
                if (parentElement.attr('sensei') && +(parentElement.attr('data-id')) === p.taskId && $(parentElement).find('.sensei-process-elements').length === 0) {
                    observer.disconnect();
                    render(p);
                }
            });
            observer.observe(document.querySelector('.notes-wrapper__scroller-inner'), { childList: true, subtree: true });
            render(p);
        };

        this.switchLeadStatus = function (data) {
            if (APP.data.is_card && APP.data.current_card.id == data.entity_id) {
                let pipeline_id = +data.pipeline_id;
                let status_id = +data.status_id;

                if (!pipeline_id || !status_id) {
                    return;
                }

                self.statusChanged = {
                    'status_id': status_id,
                    'pipeline_id': pipeline_id,
                    'lead_id': +data.entity_id
                };

                if (!!data.hard_mode && Number.isInteger(data.hard_mode)) {
                    let timeout;
                    clearInterval(timeout);
                    timeout = setTimeout(() => {
                        self.sendLogsBack('status', 'hardModeSwitchLeadStatus');
                        self.statusChanged = undefined;
                    }, data.hard_mode);
                }

                try {
                    self.sendLogsBack('status', 'switchLeadStatus');
                    window.SENSEI.leadInteraction.changeLeadStatus(status_id, pipeline_id);
                } catch (e) {
                    self.logger.sendLogError(error);
                }
            }
        };


        this.renderProcessesList = (processes, selectedProcess, class_name = 'sensei-processes-list', name = 'process_id', disabled = false, options = {}, title = SENSEI.locale.get('general.process_selector_header')) => {


            let processGroups = {};
            let processItemsGrouped = {};
            let ungroupedProcesses = [];

            for (let i in processes) {
                let process = processes[i];
                if (!process.group || process.group.id == -1) {
                    ungroupedProcesses.push({
                        id: process.id,
                        option: process.name,

                        hidden: !!process.hidden,
                        disabled: !!process.disabled,
                    });
                } else {
                    processGroups[process.group.id] = process.group.name;
                    if (processItemsGrouped[process.group.id] == undefined) {
                        processItemsGrouped[process.group.id] = [];
                    }
                    processItemsGrouped[process.group.id].push({
                        id: process.id,
                        option: process.name
                    });
                }
            }

            let processItems = [
                {
                    id: 0,
                    option: title,
                    disabled: true,
                    hidden: true,
                },
                ...ungroupedProcesses
            ];

            for (let i in processItemsGrouped) {
                processItems.push({
                    id: 'group_' + i,
                    option: processGroups[i],
                    disabled: true
                });
                for (let e in processItemsGrouped[i]) {
                    processItems.push(processItemsGrouped[i][e]);
                }
            }
            if (selectedProcess == undefined || selectedProcess == '') {
                selectedProcess = processItems[0].id;
            }



            return (new SearchableSelect(options))
                .render(
                    processItems,
                    selectedProcess,
                    class_name,
                    name
                );
        };


        this.renderTabContent = function (entity, processes, selectedProcess) {

            var path = self.get_settings().images_path;


            let logo = '';


            let startProcessButton = '';


            let beforeProcessesSelectorText = '';


            let processesSelector = '';
            let errorDiv = '';



            if (entity === 'lead') {
                logo = `
                <div class="sensei-logo-wrapper">
                    <img class="sensei-logo" src="${path}/logo_lead.png">
                    <a href="https://sensei.plus" class="sensei-logo-domain">sensei.plus</a>
                </div>`;
            } else if (entity === 'leads-list' || entity === 'dp' || entity === 'salesbot') {

                beforeProcessesSelectorText = (APP.data && APP.data.current_entity === 'leads-dp' || entity === 'salesbot') ?
                    '' : '<h2 class="modal-body__caption head_2">' + SENSEI.locale.get('dp.trigger_process_selector_caption') + '</h2>';


                let processesFiltered = [];
                for (let i in processes) {
                    if (processes[i].enabled) {
                        processesFiltered.push(processes[i]);
                    }
                }

                let needFakeProcess = processesFiltered.length < 1;
                if (entity === 'leads-list') {

                    startProcessButton = twig({
                        ref: '/tmpl/controls/button.twig'
                    }).render({
                        class_name: 'button-input_blue button-input sensei-mt-20',
                        text: SENSEI.locale.get('general.button.start'),
                        id: 'start-process-sensei',
                        disabled: needFakeProcess,
                        additional_data: needFakeProcess ? 'data-loading="Y"' : ''
                    });
                }

                if (needFakeProcess) {
                    errorDiv = '<div class="sensei-element-field_field-error-text hidden">' + SENSEI.locale.get('general.no_active_processes') + '</div>';
                }
                processesSelector = self.renderProcessesList(processesFiltered, selectedProcess, 'sensei-processes-list', 'process_id', needFakeProcess);
            }


            return $(logo).add(beforeProcessesSelectorText).add(processesSelector).add(errorDiv).add(startProcessButton);
        };

        this.getInstanceLauncher = instance => {
            let account = APP.constant('account');

            self.logger.sendLogs('js_code', 'getInstanceLauncher', {
                account: account,
                user: APP.constant('user'),
                lead: APP.data.current_card,
                jsCodeInfo: {
                    current_element: instance.get('current_element') ?? null,
                    element_data: instance.get('element_data') ?? null,
                    results: instance.get('results') ?? null,
                    hash: instance.get('hash') ?? null
                }
            });

            const types = {
                js: 'JSCode',
                css: 'CSSCode'
            };

            const type = instance.get('current_element');
            const hash = instance.get('hash');
            const code = instance.get('element_data')[types[type]];
            const [result_code] = Object.keys(instance.get('results'));

            const codeLauncher = self.getCodeLauncher(type);
            const elementFinisher = self.getElementFinisher(type);

            return () => {
                codeLauncher(code);
                elementFinisher(hash, result_code);
            }
        };

        this.getCodeLauncher = type => {
            const launchers = {
                js: code => {
                    require([`sensei-js!${code};versionForCorrectSecondRun=` + Math.random()], [], () => { });
                },
                css: code => {
                    const style = document.createElement('style');
                    style.innerHTML = code;
                    style.type = 'text/css';
                    document.head.append(style);
                }
            };

            return launchers[type];
        }

        this.getElementFinisher = type => (hash, result_code) => {
            try {
                const { status } = window.SENSEI.api.finishElement(type, { hash, result_code });

                if (status && status !== 200) {
                    throw new Error(SENSEI.locale.get('general.error.reload'));
                }
            } catch (error) {
                Alert.showAlertModal(error.message);
                self.logger.sendLogError(error);
            }
        }

        this.doFieldChange = (data, entity_type, element_type) => {
            if (data.params.field_type == APP.cf_types.multiselect || data.params.field_type == APP.cf_types.chained_list) {
                const { field_id, enums } = data.params;

                this.changeMultiselect(entity_type, field_id, enums);
            } else {
                APP.data.current_card.form._handleAUMessage({
                    data,
                    element_type,
                    created_by: APP.constant('user').id
                });
            }
        };

        this.catchSocketMessage = info => {
            const { entity_id, event } = info;

            if (APP.data.is_card && APP.data.current_card.id == entity_id) {
                const { update, field } = info;

                if (_.isArray(update)) {
                    _.each(update, ({ data, element_type }, ind) => {
                        const { entity_type } = data.params;

                        this.doFieldChange(data, entity_type, element_type);
                    })
                } else {
                    const { data, element_type } = update;
                    const { entity_type } = field;

                    this.doFieldChange(data, entity_type, element_type);
                }
            }
        };

        this.changeMultiselect = (entity_type, field_id, enums) => {
            _.each(enums, (new_value, id) => {
                const name_field = 'CFV[' + field_id + '][' + id + ']';
                const name_field_selector = '[name="' + name_field + '"]';


                const forms = []
                if (entity_type == "1") {
                    forms.push(APP.data.current_card.form);
                } else {
                    _.each(APP.data.current_card.linked_forms.form_views, view => {
                        if (entity_type == "2" && view.entity == "contact") {
                            forms.push(view);
                        };
                        if (entity_type == "3" && view.entity == "company") {
                            forms.push(view);
                        }
                    });
                }

                _.each(forms, form => {
                    const $field_el = form.$el.find(name_field_selector);

                    if ($field_el.length) {


                        form.model.set(name_field, new_value === '1' ? id : '', { update_default: true });


                        $field_el.prop('checked', new_value === '1');
                        $field_el.trigger('change');
                    }
                });
            });
        };



        this.navigate = function (url) {
            window.SENSEI.render = false;



            APP.router.navigate(url, { trigger: true });


            setTimeout(function () {
                if ($('#page_change_progress:not(.stopped)').length != 0) {
                    location.pathname = url;
                }
            }, 5 * 1000);
        }

        this.renderAssistantButtons = function () {
            let path = SENSEI.config.getJsModulePath('process_buttons_view');
            if (path) {
                SENSEI.widget.lazyLoadingModule.loadingModule(path, {
                    el: $('#nano-card-widgets .card-widgets__widget-sensei-helper-block .sensei-helper-wrapper .sensei-start_process_buttons')[0],
                    collection: self.ProcessButtons,
                    templates: self.templates,
                    processes: self.Processes,
                    advisor: true,
                    callback: self.assistantButtonsCallback
                });
            }
        }

        this.assistantButtonsCallback = function () {
            let is_hidden = $('#nano-card-widgets .card-widgets__widget-sensei-helper-block .sensei-helper-wrapper .sensei-start_process_buttons').find('div')[0]
            let no_button_text = $('#nano-card-widgets .card-widgets__widget-sensei-helper-block #sensei-helper-advisor .no-buttons-div');
            let senseiHelperAdvisor = $('#nano-card-widgets .card-widgets__widget-sensei-helper-block #sensei-helper-advisor');
            let helperContent = $('#nano-card-widgets .card-widgets__widget-sensei-helper-block #sensei-helper');
            let advisorEmpty = $('#nano-card-widgets .card-widgets__widget-sensei-helper-block .sensei-helper-wrapper .sensei-helper_no-content-link')[0];
            if (is_hidden) {
                self.showAssistantContent();
                senseiHelperAdvisor.removeClass('hidden');
                if (no_button_text.length != 0) {
                    no_button_text.remove();
                }
                if (advisorEmpty) {
                    helperContent.addClass('hidden');
                }
                else {
                    helperContent.removeClass('hidden');
                }
            }
            else {
                if (no_button_text.length == 0) {
                    if (!advisorEmpty) {
                        let empty_buttons_content = `<div class="no-buttons-div"> Sensei Buttons <span class="sensei-helper_no-buttons-text">${SENSEI.locale.get('buttons.placement-no-buttons')}</span> </    div>`;
                        senseiHelperAdvisor.append(empty_buttons_content);
                        senseiHelperAdvisor.removeClass('hidden');
                        helperContent.removeClass('hidden');
                    }
                    else {
                        senseiHelperAdvisor.addClass('hidden');
                        helperContent.removeClass('hidden');
                    }
                }
            }
        }

        this.instaledWidget = () => {
            if (self.get_install_status() === 'not_configured') {
                setTimeout(() => {
                    $.ajax({
                        url: '/api/v4/widgets/' + self.get_settings().widget_code,
                        method: 'POST',
                        data: {}
                    }).done((data, textStatus, response) => {

                    }).fail((jqXHR, textStatus) => {

                    });
                }, 1000);
            }
        }

        this.observerNode = (target, callback, options = { childList: true, subtree: true, attributes: false }) => {
            return new Promise(resolve => {
                if (target.length > 0) {
                    resolve(target)
                }
                new MutationObserver((mutationRecords, observer) => {
                    Array.from(target).forEach(element => {
                        resolve(element)
                        callback(target)
                        observer.disconnect()
                    })

                }).observe(document.documentElement, options)
            })
        }

        this.changeSystemNotes = (target) => {
            target.each((index, el) => {
                if ($(el).find('#system_node_sensei_logo').length !== 0 || el.id === 'system_node_sensei_logo') {
                    return;
                }
                this.changeSystemNoteNode($(el));
            })
        }
        this.changePositionNotesDashboardWidget = (target) => {
            let $senseiRole = $('.sensei-role');
            if (target.eq(1).length > 0 && $senseiRole.length > 0) {
                target.get(1).getBoundingClientRect();
                let top = target.eq(1).height() + $senseiRole.height();
                target.eq(1).css({ 'top': top + 'px' });
            }
        }
        this.changeSystemNoteNode = ($element) => {
            let empty_title = SENSEI.locale.get('constructor.elements.script.titles.name.default');
            let textContent = $element.text();
            textContent = textContent.replace(`${SENSEI.locale.get('back.script.element')}: `, ``);
            textContent = textContent.replace(`«${empty_title}»`, `${empty_title.toLowerCase()}`)

            let sensei_logo = window.SENSEI.widget.templates.sensei_logo_twig.render();
            $element.css('display', 'flex');
            $element.parents('[data-id]').find('.feed-note__icon').append(sensei_logo);
            $element.parents('.feed-note__header').removeClass('expandable');
            $element.parents('.feed-note__header-inner').addClass('h-feed-note__header-expanded');
            $element.html(`<div id="system_node_sensei_logo">
                    <div><p class="logo-sensei__description_color">${textContent}</p></div>
                </div>`);
            $element.parent().find('.feed-note__date').text((index, text) => {
                return `${text} Sensei`
            });
            $element.find('#system_node_sensei_logo').prepend($element.parent().find('.feed-note__date'));
            $element.parent().find('.feed-note__date').css('color', '#6C6E73');
        }
        this.sendLogsBack = (typeLog, trigger) => {
            let account = APP.constant('account');

            self.logger.sendLogs(typeLog, trigger, {
                account: account,
                user: APP.constant('user'),
                lead: APP.data.current_card,
                widget: self
            });
        }
        this.renderNotifications = () => {
            let iconSelector = $('.sensei-nav__menu__item').find('.js-notifications_counter');
            let supportSelector = $(`[href="/widget_page/${self.get_settings().widget_code}/left_menu/support"]`).parent();
            if (self.notification_number > 0) {
                let notification = window.SENSEI.widget.templates.sensei_notification_twig.render({ notification_number: self.notification_number });
                if (supportSelector.length !== 0) {
                    let leftMenuNotification = supportSelector.parent().find('.js-notifications_counter');
                    if (leftMenuNotification.length === 0) {
                        supportSelector.addClass('support_chat');
                        supportSelector.append(notification);
                    }
                    else {
                        leftMenuNotification.text(self.notification_number);
                    }
                }
                if (iconSelector.length === 0) {
                    $('.sensei-nav__menu__item').find('.nav__menu__item__icon').append(notification);
                }
                else {
                    iconSelector.text(self.notification_number);
                }
            }
            else {
                iconSelector.remove()
                supportSelector.parent().find('.js-notifications_counter').remove()
            }
        }
        this.getNotifications = () => {
            window.SENSEI.api.getNotificationNumber().then((value) => {
                self.notification_number = value.data.notification_number;
                self.renderNotifications();
            });
        }

        this.triggersLocalization = () => {
            APP.data.current_view.collection.where({ widget_code: self.get_settings().widget_code }).forEach(model => {
                if (!model.get('name') || !model.get('action_title')) {

                    let name = model.get("settings").widget.settings.process_name;
                    name = name ? self.getNewProcessName(model, name) : self.locale.get("widget.name");

                    model.set('name', name, { silent: true });
                    model.set('action_title', name, { silent: true });
                    
                    model.set('template_params', this.templateParams(model), { silent: true });
                    APP.data.current_view.rerenderTrigger(model.get('id'));
                }
            });
        }

        this.templateParams = (model) => {
            return {
                fields: {
                    account_id:
                        { name: self.locale.get("widget.id_account"), type: 'text', required: false, value: APP.constant('account').id },
                    close_tasks:
                        { name: self.locale.get("widget.id_account"), type: 'text', required: false, value: '' },
                    process_direction:
                        { name: self.locale.get("widget.id_account"), type: 'text', required: false, value: '' },
                    process_id:
                        { name: self.locale.get("widget.business_process"), type: 'custom', required: true, value: model.get('settings')?.widget?.settings?.process_id },
                    process_name:
                        { name: self.locale.get("widget.business_process_name"), type: 'text', required: false, value: model.get('settings')?.widget_info?.name }
                },
                settings: {
                    logo: self.get_settings().images_path + "/logo_main.png"
                }
            }
        }

        this.jsonParse = value => {
            try {
                return JSON.parse(value) || {};
            } catch (e) {
                self.logger.sendLogError(error);
                return {};
            }
        }

        this.initKommo = function() {
            if (APP.constant('is_kommo')) {
                require([self.get_settings().path + '/lib/kommo.js?v=' + sensei_widget_version], (kommo) => {
                    kommo.menuLogic();
                });
            }
        }

        return this;
    };

    return CustomWidget;
});
