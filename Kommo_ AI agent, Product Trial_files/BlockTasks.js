define([
    'jquery',
    'underscore'
], function ($, _) {
    class BlockTasks {


        blockTasks = [];
        page = 0;
        tasksCalendar = [];
        instances = [];
        subscribes = [];

        init(widget) {
        }

        bind_actions(widget) {
            $(document).ajaxSend((event, jqxhr, settings) => {
                const current_entity = APP.data.current_entity;
                const close_task = 6;
                if (settings.url.search('multiactions\/set') !== -1
                    && settings.data.search(`multiaction_type%5D=${close_task}`) !== -1
                    && settings.data.search(`filter`) !== -1
                    && this.blockTasks.length === 0) {
                    let el = '.js-modal-error';
                    let textLocale = SENSEI.locale.get('task_modal.task_block.error_message_block_all');
                    this.observerErrorModal(el, textLocale, this.changeMultiselectModalError);
                    jqxhr.abort();
                } else if (this.blockTasks.length === 0
                    || (current_entity !== 'todo-line' && current_entity !== 'todo')
                ) {
                    return;
                }

                if (settings.url.search('todo\/multiple\/close') !== -1) {
                    let textLocale = SENSEI.locale.get('task_modal.task_block.error_message_block_one');
                    this.blockTasksTodoList(settings.data.match('ID%5B%5D=([0-9]+)')[1], jqxhr, textLocale);
                } else if (settings.url.search('multiactions\/set') !== -1 && settings.data.search(`multiaction_type%5D=${close_task}`) !== -1) {
                    let textLocale = SENSEI.locale.get('task_modal.task_block.error_message_block_all');
                    this.checkMultiactionsBlockTask(settings.data, jqxhr, textLocale);
                }
            });

            $(document).ajaxComplete(async (event, { responseText = '{}' }, settings) => {
                self = this;


                if (APP.data.current_entity === 'todo'
                    && settings.url.search('ajax\/todo\/list') !== -1
                    && settings.url.search('page=') !== -1
                    && this.page !== settings.url.match('page=([0-9]+)')[1]) {
                    this.page = settings.url.match('page=([0-9]+)')[1];
                    this.entityTodoList(APP.data.current_view.list_items.models);
                }

                if (settings.url.includes('/ajax/v2_5/tasks') && (APP.data.current_entity === 'todo'
                    || APP.data.current_entity === 'todo-calendar' || APP.data.current_entity === 'todo-line')
                    && this.blockTasks.includes(parseInt(settings.url.match('id=([0-9]+)')?.[1]))) {
                    const { _embedded: { items: [{ id, element_id, element_type }] } } = JSON.parse(responseText);

                    if (id && element_id && element_type === 2) {
                        let modal_todo = $('.modal.modal-list.modal-todo');

                        this.renderDescriptionTask(modal_todo);
                        let modalTodoCardInner = modal_todo.find('.card-task__inner ');
                        modalTodoCardInner.on('click', (e) => {
                            e.preventDefault();
                            return false;
                        });
                        modalTodoCardInner.css('cursor', 'default');
                        modal_todo.find('.task-modal__description').css('cursor', 'default');
                    }
                }

                if (settings.url.includes('/ajax/todo/list/')
                    && APP.data.current_entity === 'todo'
                    && $('.sensei-task').length === 0
                    && APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
                    self.renderTaskChangeRestrictions();
                } else if (settings.url.includes('/ajax/todo/line/')
                    && APP.data.current_entity === 'todo-line'
                    && $('.sensei-task').length === 0
                    && APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
                    self.taskChangeCardRestrictions();
                } else if (
                    (settings.url.includes('/ajax/todo/calendar/day/')
                        || settings.url.includes('/ajax/todo/calendar/week/')
                        || settings.url.includes('/ajax/todo/calendar/month/'))
                    && APP.data.current_entity === 'todo-calendar'
                    && $('.sensei-task').length === 0
                    && APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
                    self.changeTaskInTodoCalendar();
                }

                if (settings.url.includes('ajax/v2_5/tasks')
                    && $('.sensei-task').length === 0
                    && this.tasksCalendar.length > 0
                    && APP.data.current_entity === 'todo-calendar') {
                    this.reAddClassEventsForCalendar();
                }
            })
        }

        reAddClassEventsForCalendar() {
            const state = 'calendar';
            const $calendarTasks = $('a.fc-event');
            this.tasksCalendar = _.map($calendarTasks, el => {
                return $(el).data('fc-seg');
            });
            let [taskIds, []] = this.receivingTaskLeads(state);
            this.addClassSenseiTask(taskIds, state);
            this.setEventSenseiTaskClass();
        }

        blockTasksTodoList(id, jqxhr, textLocale) {
            if (this.blockTasks.includes(parseInt(id))) {
                let modal = $('.modal-body');
                modal.css({ 'width': '560px', 'height': '162px' });
                let caption = modal.find('.modal-body__caption');
                caption.text(textLocale)
                modal.find('.modal-body__inner').addClass('modal-body__inner modal-body__inner-error js-modal-error')
                caption.addClass('modal-body__caption-error');
                caption.css('padding', '0 70px')
                return jqxhr.abort();
            }
        }

        changeMultiselectModalError(el, textLocale) {
            $(el).find('.js-modal-try-again').on('click', () => {
                $(el).find('.modal-body__close').trigger('click');
                $(el).find('.js-modal-try-again').off('click');
            });
            let modal = $('.modal-body');
            modal.css({ 'width': '560px', 'height': '162px' });
            let caption = modal.find('.modal-body__caption');
            caption.css('padding', '0 40px')
            $(el).find('.modal-body__caption-error').text(textLocale);
            $(el).find('button').remove();
        }

        checkMultiactionsBlockTask(data, jqxhr, textLocale) {
            let rp = /ids%5D%5B%5D=([0-9]+)/gm;
            let ids = [...data.matchAll(rp)];
            let el = '.js-modal-error';
            for (const idsKey in ids) {
                if (this.blockTasks.includes(parseInt(ids[idsKey][1]))) {
                    this.observerErrorModal(el, textLocale, this.changeMultiselectModalError);
                    return jqxhr.abort();
                }
            }
        }

        render() {
            const current_entity = APP?.data?.current_entity;
            if (current_entity === 'todo-line' && APP?.data?.current_view?.existed_items && typeof APP?.data?.current_view?.existed_items === 'object') {
                this.entityTodoLine(APP.data.current_view.existed_items);
            } else if (current_entity === 'todo' && APP?.data?.current_view?.list_items?.models) {
                this.entityTodoList(APP.data.current_view.list_items.models);
            }

            if (current_entity === 'todo' && APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
                this.renderTaskChangeRestrictions();
            } else if (current_entity === 'todo-line' && APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
                this.taskChangeCardRestrictions();
            } else if (current_entity === 'todo-calendar' && $('.sensei-task').length === 0
                && APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
                this.changeTaskInTodoCalendar();
            }
        }

        entityTodoLine(tasks) {
            if (!tasks || !Object.keys(tasks).length) return;
            let tasksId = [];
            for (const tasksKey in tasks) {
                let manager = tasks[tasksKey].manager.created_by;
                if (!manager.id && (manager.name.toLowerCase() === 'sensei'
                    || manager.name.toLowerCase() === 'sensei_local')) {
                    tasksId.push(tasksKey.replace('_', ''));
                }
            }
            if (tasksId.length > 0) {
                this.getBlockTask(tasksId);
            }
        }

        entityTodoList(tasks) {
            if (!Object.keys(tasks).length) return;
            let tasksId = [];
            for (const tasksKey in tasks) {
                let manager = tasks[tasksKey].attributes.author;
                if (!manager.id && (manager.name.toLowerCase() === 'sensei'
                    || manager.name.toLowerCase() === 'sensei_local')) {
                    tasksId.push(tasks[tasksKey].id);
                }
            }
            if (tasksId.length > 0) {
                this.getBlockTask(tasksId);
            }
        }

        observerErrorModal(target, textLocale, callback) {
            return new Promise(resolve => {
                let el = $(target);
                if (el.length > 0) {
                    resolve(el)
                }
                new MutationObserver((mutationRecords, observer) => {
                    Array.from($(target)).forEach(element => {
                        resolve(element)
                        callback(target, textLocale)
                        observer.disconnect()
                    })

                }).observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                })
            })
        }

        observerTasksAttr(target) {
            return new Promise(resolve => {
                let el = $(target);
                if (el.length > 0) {
                    resolve(el);
                }
                new MutationObserver((mutationRecords, observer) => {
                    if ($(target).length === 0) {
                        if (this.tasksCalendar.length > 0 && APP.data.current_entity === 'todo-calendar') {
                            this.reAddClassEventsForCalendar();

                            if ($(target).length > 0) {
                                this.observerTasksAttr('.sensei-task');
                            }
                        }

                        observer.disconnect();
                    }
                }).observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                })
            })
        }

        getBlockTask(tasks) {
            let data = {
                tasks: JSON.stringify(tasks)
            }
            const statusApi = SENSEI.api.getBlockTasks(data);
            statusApi.then((value) => {
                this.blockTasks = value.data;
            })
        }

        renderDescriptionTask(modal_todo) {
            let description = window.SENSEI.widget.templates.description_task_twig.render({
                link_lead: modal_todo.find('a').attr('href')
            });

            let sensei_logo = window.SENSEI.widget.templates.sensei_logo_for_task_twig.render({
                class_for_logo: 'logo-sensei__position'
            });

            modal_todo.find('.card-task__result-wrapper').remove();
            modal_todo.find('.card-task').append(description);
            modal_todo.find('.card-task').append(sensei_logo);
        }

        async renderTaskChangeRestrictions() {
            if (!await this.setTasksClass('list')) {
                return;
            }
            $('.sensei-task .list-row__cell:not(:first-child)')
                .removeClass('js-list-row__cell')
                .attr('title', SENSEI.locale.get('constructor.elements.task.titles.task_change_restrictions.change_disabled'))
                .children().removeAttr('title');
            $('.list__table [type="checkbox"]').on('change', () => {
                setTimeout(() => {
                    if (($('.list__table > #list_multiple_actions').length || $('.sensei-task .list-multiple-actions__item').length)
                        && $('.sensei-task [type="checkbox"]').is(':checked')) {
                        $('.list__table > #list_multiple_actions .list-multiple-actions__item, .sensei-task .list-multiple-actions__item')
                            .removeClass('js-list-multiple-actions__item')
                            .addClass('sensei-task_change-restricted')
                            .on('click', () => {
                                SENSEI.widget.showAlertModal(SENSEI.locale.get('constructor.elements.task.titles.task_change_restrictions.change_disabled_alert'));
                                $('.sensei-alert-modal').width(360);
                            });
                    }
                }, 50);
            });
        };


        async taskChangeCardRestrictions() {
            if (!await this.setTasksClass('line')) {
                return;
            }
            this.setEventSenseiTaskClass();
        };

        async changeTaskInTodoCalendar() {
            if (!await this.setTasksClass('calendar')) {
                return;
            }
            this.setEventSenseiTaskClass();
            if ($('.sensei-task').length > 0) {
                this.observerTasksAttr('.sensei-task')
            }
        }

        setEventSenseiTaskClass() {
            $('.sensei-task').each((index, elem) => {
                $(elem).on('mousedown', function (event) {

                    if (APP?.data?.current_entity && APP?.data?.current_entity.includes('todo')) {
                        event.stopPropagation();
                        $(event.target).click();
                    }

                });
            });
        }

        async setTasksClass(state) {

            if (!['list', 'line', 'calendar'].includes(state)) {
                console.debug(`Invalid state: ${state}`);
                return false;
            }

            if (state === 'list') {
                if (APP?.data?.current_list) {
                    this.tasksCalendar = APP.data.current_list.toJSON();
                } else {
                    console.debug('APP.data.current_list is not defined.');
                    return false;
                }
            } else if (state === 'line') {
                if (APP?.data?.current_view?.existed_items && typeof APP.data.current_view.existed_items === 'object') {
                    this.tasksCalendar = Object.values(APP.data.current_view.existed_items);
                } else {
                    console.debug('APP.data.current_view.existed_items is not a valid object.');
                    return false;
                }
            } else if (state === 'calendar') {
                const $calendarTasks = $('a.fc-event');

                if ($calendarTasks.length === 0) {
                    console.debug('No calendar tasks found.');
                    return false;
                }

                this.tasksCalendar = _.map($calendarTasks, el => {
                    const segData = $(el).data('fc-seg');
                    if (!segData) {
                        console.debug('fc-seg data not found on element.');
                        return null;
                    }
                    return segData;
                }).filter(Boolean);
            }

            if (!this.tasksCalendar || this.tasksCalendar.length === 0) {
                return false;
            }

            let [taskIds, leadIds] = this.receivingTaskLeads(state);

            leadIds = [...new Set(leadIds)];
            let instances = [];
            for (const leadId of leadIds) {
                const { data } = await window.SENSEI.api.getInstances(leadId, 2);
                instances.push(data);
            }
            this.instances = instances.flat();
            this.addClassSenseiTask(taskIds, state);
            return true;
        }

        receivingTaskLeads(state) {
            let leadIds = [], taskIds = [];

            if (state === 'list') {
                this.tasksCalendar.forEach((item) => {
                    if (item.id && item.object.id && item.object.entity === "leads") {
                        leadIds.push(item.object.id);
                        taskIds.push(item.id);
                    }
                });
            } else if (state === 'line') {
                this.tasksCalendar.forEach((item) => {
                    if (item.id && item.linked.id && item.linked.entity === "leads") {
                        leadIds.push(item.linked.id);
                        taskIds.push(item.id.slice(3));
                    }
                });
            } else if (state === 'calendar') {
                this.tasksCalendar.forEach((item) => {
                    if (item.event.id && item.event.linked.id && item.event.linked.element_type == 2) {
                        leadIds.push(item.event.linked.id);
                        taskIds.push(item.event.id);
                    }
                });
            }

            return [taskIds, leadIds]
        }

        checkTaskElement(taskId, items, restricted = false) {
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
        addClassSenseiTask(taskIds, state) {
            taskIds.forEach((id) => {
                if (this.checkTaskElement(+id, this.instances, true)) {
                    if (state === 'calendar') {
                        const $calendarTask = this.tasksCalendar.find($el => {
                            return $el.event.id === id;
                        });
                        $calendarTask.el.addClass('sensei-task');
                    } else {
                        $(`[data-id="${id}"]`).addClass('sensei-task');
                    }
                }
            });
        }

        destroy() {
            this.subscribes.forEach((subscribe) => { subscribe.unsubscribe() });
        }
    }

    return new BlockTasks();
})