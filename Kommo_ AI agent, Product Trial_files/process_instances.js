define([
    'jquery',
    'underscore',
    'moment',
    'lib/components/base/modal'
], function($, _, moment, Modal) {
    return function(callbaсks) {
        const self = this;
        this.processInstances = new window.SENSEI.widget.models.ProcessInstanceCollection();

        callbaсks.forEach(function(item) {
            self.processInstances.on(item.on, item.callback);
        });

        this.processInstances.load(
            APP.data.current_card.id,
            APP.element_types[APP.data.current_entity],
            true
        );
        
        this.processInstances.on('reset', () => {

            SENSEI.widget.elementFactoryCallback(async() => {

                for (const instance of self.processInstances.models) {
                    let element = await window.SENSEI.ElementFactory.create(instance.get('current_element'));
                    instance.set('_element', element);
                }
                
                self.render();
                self.bind_actions();
                self.synchronizeActiveForms();
            });
            
        });

        this.checkedTaskForRollback = [];
        this.openRollbackModal = function() {
            let modalParams = { process_name: $(this).attr('process_name'), instance_id: $(this).attr('instance_id') };
            let modal = new Modal({
                class_name: 'modal-list sensei-rollback-modal',
                init: function($modalBody) {
                    $modalBody.trigger('modal:loaded');
                    let html = window.SENSEI.widget.templates.rollback_modal.render({
                        title: SENSEI.locale.get('instances.rollback.caption'),
                        description: SENSEI.locale.get('instances.rollback.description_1', {process: modalParams.process_name}),
                        description_continue: SENSEI.locale.get('instances.rollback.description_2'),
                        confirm: SENSEI.locale.get('general.button.confirm'),
                        cancel: SENSEI.locale.get('general.button.cancel')
                    });

                    $modalBody.html(html);
                    $('.js-rollback-accept-button').on('click', async function() {
                        let rollbackInfo = await window.SENSEI.api.send('instance/rollback', "POST", {instance_id: modalParams.instance_id});
                        modal.destroy();
                    })
                    $modalBody.trigger('modal:centrify');
                },
                destroy: function() {}
            });
        };
        
        this.render = function() {
            this.processInstances.each(function(instance) {
                if (instance.get('element_data') && instance.get('element_data').wait) {
                    let process_comments_enabled = instance.get('process_comments_enabled') || false;
                    let results = instance.get('result_data');
                    if(!results){
                        let results_old = instance.get('results');
                        results = {};
                        Object.keys(results_old).forEach((id) => {
                            results[id] = {id: id, caption: results_old[id], is_continue: 0};
                        });
                    }
                    instance.get('_element').render(
                        instance.get('element_data'),
                        results,
                        instance.get('name'),
                        instance.get('process_id'),
                        process_comments_enabled,
                    );

                    
                    let element = instance.get('_element');
                    if ( element.taskID ){
                        window.SENSEI.widget.tasks[element.taskID] = element;
                    }
                }
            });
        };
        
        this.refresh = function() {
            let models = new window.SENSEI.widget.models.ProcessInstanceCollection();
            
            models.on('reset', (e) => {
                e.each(function(instance) {
                    self.processInstances.each(function(oldInstance) {
                        if (
                            instance.get('id') === oldInstance.get('id')
                            && JSON.stringify(instance.get('element_data')) !== JSON.stringify(oldInstance.get('element_data'))
                        ) {
                            self.processInstances.remove(oldInstance);
                        }
                    });

                    self.processInstances.add(instance);
                }, models);
            });
            models.load(
                APP.data.current_card.id,
                APP.element_types[APP.data.current_entity],
                true
            );
        };
        
        this.destroy = function() {
            this.processInstances.each(function(instance) {
                if (instance.get('element_data') && instance.get('element_data').wait) {
                    instance.get('_element').destroy();
                }
            });
        };

        this.bind_actions = function () {
            this.processInstances.each(function (instance) {
                if (instance.get('element_data') && instance.get('element_data').wait) {
                    instance.get('_element').bind_actions();
                }
            });

            $(document).off('mousedown.render_sensei_tab');
            $(document).on('mousedown.render_sensei_tab', (event) => {
                if(
                    $(event.target).hasClass('card-cf__close') && $(event.target).parents('.card-cf-wrapper.prepared').length > 0 ||
                    $(event.target).parents('.card-cf-wrapper.prepared .card-cf__close').length > 0 ||
                    $(event.target).hasClass('card-cf-wrapper prepared')
                ) {
                    self.setDisplayBlockInSenseiTab();
                }
            });

        };

        this.setDisplayBlockInSenseiTab = function () {
            const widgetCode = window.SENSEI.widget.params.widget_code;
            if ($(`.card-tabs__item[data-id="${widgetCode}"]`).hasClass('selected')) {
                $('#' + widgetCode + '.linked-form-holder.catalog_elements-in_card.sensei_tab').css('display', 'block');
            }
        }

        
        this.renderTabContent = async function() {
            const widgetCode = window.SENSEI.widget.params.widget_code;
            const tabWidget = $('#' + widgetCode + '.linked-form-holder.catalog_elements-in_card');

            tabWidget.addClass('sensei_tab');
            tabWidget.addClass('sensei-margin-top');
            if (APP.constant('account').version < 8) {
                tabWidget.addClass('sensei_tab_old');
            }

            const logo = window.SENSEI.widget.templates.tab_logo.render({
                img_src: 'https://api.sensei.plus/svg/logo.svg'
            });

            tabWidget.append(logo);
            if (APP.data.current_card.id == 0) {    
                let html = window.SENSEI.widget.templates.tab_content.render({
                    empty_content: true,
                    d: SENSEI.locale.get('time.short.day'),
                    h: SENSEI.locale.get('time.short.hour'),
                    m: SENSEI.locale.get('time.short.minute'),
                });
                tabWidget.find('.sensei_tab_logo').after(html);
                return;                        
            }

            window.SENSEI.widget.initStyles();
            const renderInstances = function(instances) {
                const oldElement = tabWidget.find('.sensei_tab_content');
                if (oldElement.length) {
                    oldElement.remove();
                }

                let instancesArr = instances.toJSON(),
                    childrenInstances = [],
                    filteredInstances = {};

                const instanceDate = function(instance) {
                    if (!!instance && !!instance.date_end_int &&  instance.date_end_int != 0) {
                        let date = new moment(instance.date_end_int * 1000);
                        instance.date_format = date.format('DD.MM.YYYY');
                    }
                    return instance;
                };

                instancesArr.forEach((instance) => {
                    if (!!instance && !!instance.id) {
                        instance.result = (instance.results 
                            && Object.keys(instance.results).length != 0 
                            && instance.process_item_state !== 4) ? Object.values(instance.results)[0] : null;
                        filteredInstances[instance.id] = instanceDate(instance);
                        if (instance.subprocess) {
                            instance.subprocess.forEach((subprocessId) => {
                                childrenInstances.push(subprocessId);
                            });    
                        }
                    }
                });

                instancesArr.forEach((instance, index) => {
                    if (!!instance && !!instance.id && !childrenInstances.includes(instance.id)) {
                        let subprocess = filteredInstances[instance.id].subprocess;
                        filteredInstances[instance.id].subprocess = [];
                        !!subprocess.length && subprocess.forEach((subprocessId) => {
                            filteredInstances[instance.id].subprocess.push(filteredInstances[subprocessId]);
                        });
                    }
                });

                childrenInstances.forEach((subprocessId) => {
                    delete filteredInstances[subprocessId];
                });

                sortedInstances = _.sortBy(Object.values(filteredInstances), 'date_create_int');
                sortedInstances.reverse();

                let html = window.SENSEI.widget.templates.tab_content.render({
                    instances: sortedInstances,
                    preview_icon: 'https://api.sensei.plus/svg/eye.svg',
                    empty_content: false,
                    d: SENSEI.locale.get('time.short.day'),
                    h: SENSEI.locale.get('time.short.hour'),
                    m: SENSEI.locale.get('time.short.minute'),
                });

                tabWidget.find('.sensei_tab_logo').after(html);

                let path = SENSEI.config.getJsModulePath('process_buttons_view');
                if (path) {
                    SENSEI.widget.lazyLoadingModule.loadingModule(path, {
                        el: tabWidget.find('.sensei-start_process_buttons')[0],
                        collection: window.SENSEI.widget.ProcessButtons,
                        templates: window.SENSEI.widget.templates,
                        processes: window.SENSEI.widget.Processes,
                        advisor: false,
                    }).then((processButtonsView) => {
                        processButtonsView.on('process:start', function(data) {
                            self.processInstances.add(data);
                        });
                    });
                }
            };

            if (!self.processInstances.isLoading) {
                renderInstances(self.processInstances);
            }
            self.processInstances.on('reset', renderInstances);
            self.processInstances.on('add', function() {
                renderInstances(self.processInstances);
            });
        };
        this.addInstance = function(instance){
            if(instance.id && !self.processInstances.find(instance.id)){
                self.processInstances.add(instance)
            }
        };

        this.synchronizeActiveForms = function() {
            if(self.processInstances.isEmpty()) {
                return;
            }
            
            let activeForms = [];
            self.processInstances.forEach((instance) => {
                if(instance.get('current_element') == 'form' || instance.get('current_element') == 'script') {
                    activeForms.push(instance.get('id'));
                }
            });

            window.SENSEI.api.send(`instance/sync-forms`, 'POST', {'entity_id': APP.data.current_card.id, 'instance_ids': activeForms});
        };
    };   
});
