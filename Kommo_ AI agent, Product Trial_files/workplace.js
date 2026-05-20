define([
    'backbone',
    'moment',
    './timer.js?v=' + sensei_widget_version,
    './break_switch.js?v=' + sensei_widget_version,
    '../../indexeddbService.js?v=' + sensei_widget_version
], (Backbone, moment, Timer, BreakSwitch, indexeddbService) => {
    return Backbone.View.extend({
        async initialize() {
            var self = this;
            this.$el = $('body');
            this.data = null;
            this.updateInterval = null;
            this.task_poll_interval = 90;

            this.isNextButtonClicking = false;
            this.isButtonClicked = false;

            this.timer = new Timer({ format: 'm:s' });
            this.dbService = new indexeddbService();
            this.triesId = 1;
            this.broadcastChannel = new BroadcastChannel('sensei_workplace_channel');
            this.sensei_indexeddb_version = 2;

            this.dropdownObservable = null;

            SENSEI.widget.loadCssFile("lib/css/workplace/top_bar.css");

            this.breakSwitch = new BreakSwitch();

            SENSEI.events.subscribe('workplace_break_switch', (isOnBreak) => this.updateButtonStatus(isOnBreak));

            await this.dbService.openDatabase('senseiDB', this.sensei_indexeddb_version, 'senseiWorkplaceData');

            await this.updateData();


            this.broadcastChannel.addEventListener('message', async function (event) {
                if (event.data.key === 'sensei_workplace_data') {
                    let senseiWorkplaceData = event.data.value;
                    if (senseiWorkplaceData.data !== null) {
                        self.data = senseiWorkplaceData.data;
                        self.task_poll_interval = self.data.task_poll_interval + 10;
                    }
                    self.refreshUpdateInterval();
                    await self.render();
                }
            });

            return this;
        },

        updateWorkplaceData(value) {

            this.broadcastChannel.postMessage({
                key: 'sensei_workplace_data',
                value: value
            });
        },

        applyData(data) {
            this.refreshUpdateInterval();

            this.data = data;
            this.task_poll_interval = data.task_poll_interval;

            if (this.breakSwitch && !this.breakSwitch.updatePending) {
                this.breakSwitch.isOnBreak = data.is_paused;
                this.breakSwitch.switchBreakSwitcherTwig(data.is_paused);
            }

            try {
                this.updateWorkplaceData({ data: this.data, task_poll_interval: this.task_poll_interval });
            } catch (error) {
                console.debug('Ошибка, не отправили сообщение во все вкладки:', error);
                window.SENSEI.logger.sendLogError(error);
            }
        },

        async saveQueueTries(tries) {
            try {
                let db = await this.dbService.openDatabase('senseiDB', this.sensei_indexeddb_version, 'senseiWorkplaceData');
                await this.dbService.updateItem(db, 'senseiWorkplaceData', {
                    id: this.triesId,
                    queue_tries: tries
                });
            } catch (error) {
                console.debug('Ошибка сохранения количества попыток в IndexedDB:', error);
                window.SENSEI.logger.sendLogError(error);
            }
        },

        async loadQueueTries() {
            try {
                let db = await this.dbService.openDatabase('senseiDB', this.sensei_indexeddb_version, 'senseiWorkplaceData');
                let result = await this.dbService.getItem(db, 'senseiWorkplaceData', this.triesId);
                return result ? result.queue_tries : 0;
            } catch (error) {
                console.debug('Ошибка загрузки количества попыток из IndexedDB:', error);
                window.SENSEI.logger.sendLogError(error);
                return 0;
            }
        },

        isPaused() {
            if (this.data.current) {
                if (
                    !APP.data.current_card
                    || APP.data.current_card.id != this.data.current.entity_id
                    && !this.isNextButtonClicking
                ) {
                    return true;
                }
            }
            return false;
        },

        render() {

            if (window.SENSEI.render !== true) {
                return;
            }



            if (!this.data.current && !this.data.next) {
                if (!this.data.user_roles || !$('.sensei-next-lead').hasClass('button_opacity_disable')) {
                    this.hidePanel();
                }

                if (this.data.user_roles && (this.$el.find('.sensei-role').length === 0 || this.$el.find('.sensei-role.hidden').length === 1)) {
                    let endTime = '' + Math.max.apply(null, this.data.current_role.periods.map((period) => period.time.daytime.to.replace(':', '')));
                    const workplace_panel = window.SENSEI.widget.templates.workplace_panel.render({
                        role_name: this.data.current_role.name,
                        button_text: SENSEI.locale.get('workplace.button.start'),
                        count_uncompleted_tasks: 0,
                        count_all_tasks: 0,
                        role_end_time: endTime.slice(0, 2) + ':' + endTime.slice(2),
                        target_name: '',
                        entity_name: '',
                        icon: '',
                        button_class: 'button_opacity_disable',
                        tooltip_text: SENSEI.locale.get('workplace.errors.no_leads_for_role'),
                    });

                    this.$el.append(workplace_panel);

                    this.$el.find('.sensei-role-break-wrapper').append(this.breakSwitch.render());

                    this.checkPagesHidePanel();
                }

                return;
            }

            let isPaused = this.isPaused();



            let target_name = '';
            let entity_name = '';
            let icon = '';
            let button = '';

            let nextTask = this.data.next;
            let currentTask = this.data.current;
            if (isPaused) {
                nextTask = this.data.current;
            }
            if (!currentTask) {
                currentTask = this.data.next;
            }

            let nextRole;
            if (nextTask) {
                entity_name = nextTask.entity_name;
                icon = nextTask.workplace_task_type;
                nextRole = nextTask.role;

                let next_target_id = nextTask.target_id?.sort()[0] ?? '';
                target_name = nextRole.periods.flatMap((period) => period.targets).find((target) => target.target_id == next_target_id)?.title ?? '';
            } else {
                nextRole = currentTask.role;
            }

            if (isPaused) {
                button = 'workplace.button.return';
            } else if (!this.data.current && this.data.next) {
                button = 'workplace.button.start';
            } else if (this.data.current && !this.data.next) {
                button = 'workplace.button.finish';
            } else {
                button = 'workplace.button.next';
            }

            let endTime = '' + Math.max.apply(null, currentTask.role.periods.map((period) => period.time.daytime.to.replace(':', '')));

            const workplace_panel = window.SENSEI.widget.templates.workplace_panel.render({
                role_name: nextRole.name,
                button_text: SENSEI.locale.get(button),
                count_uncompleted_tasks: this.data.count.left,
                count_all_tasks: this.data.count.total,
                role_end_time: endTime.slice(0, 2) + ':' + endTime.slice(2),
                target_name: target_name,
                entity_name: entity_name,
                icon: icon,
                button_class: ((this.breakSwitch.isOnBreak ?? this.data.is_paused) && !this.isPaused()) ? 'button_opacity_disable' : '',

            });

            $('.sensei-role').remove();

            this.$el.append(workplace_panel);

            this.$el.find('.sensei-role-break-wrapper').append(this.breakSwitch.render());

            SENSEI.events.trigger('open_workplace_panel');

            this.checkPagesHidePanel();

            $('.sensei-next-lead')
                .on('click', (e) => { this.onNextButtonClick(false); })
                .trigger("button:save:enable");

            if (this.isNextButtonClicking) {
                $('.sensei-next-lead').trigger("button:load:start").addClass('events-off');
            }


            this.timer.setEl($('.sensei-role-current-task .sensei-role-param-value'));
            if (this.timer) {
                this.timer.stop();
            }
            let datestart = 0;
            if (this.data.current) {
                datestart = this.data.current.view_start_at;
            }
            this.timer.setDateStart(datestart);
            if (this.data.current && !this.isNextButtonClicking) {
                this.timer.setTime();
                this.timer.start();
            } else {
                this.timer.update('00:00');
            }

            if ($('.list__body-right').length) {
                this.dropdownObservable?.disconnect();

                this.dropdownObservable = new MutationObserver(this.uppDropDown);

                this.dropdownObservable.observe(document.querySelector('.list__body-right'), {
                    childList: true,
                });
            }
        },

        updateButtonStatus(isOnBreak) {
            let status = (this.data?.current || this.data?.next) && (!isOnBreak || this.isPaused());

            if (!status) {
                $('.sensei-show-next-lead .sensei-next-lead').addClass('button_opacity_disable');
            } else {
                $('.sensei-show-next-lead .sensei-next-lead').removeClass('button_opacity_disable');
            }
        },

        hidePanel() {
            $('body').removeClass('sensei-role-mode-on');
            $('.sensei-role').addClass('hidden');
            $('.sensei-next-lead').trigger("button:save:disable");
            SENSEI.events.trigger('open_workplace_panel');
        },

        checkPagesHidePanel() {
            if (location.pathname.startsWith('/amo-market') || location.pathname.startsWith('/settings')) {
                $('body').removeClass('sensei-role-mode-on');
                $('.sensei-role').addClass('hidden');
            } else {
                $('body').addClass('sensei-role-mode-on');
                $('.sensei-role').removeClass('hidden');
            }
        },

        getRequestParams() {
            let userId = APP.constant('user').id
            let group = +(APP.constant('managers')[userId]?.group ?? 'group_0').split('group_')[1];
            let timezoneOffset = moment().tz(APP.constant('account').timezone)._offset * 60
            return {
                'user_id': userId,
                'group_id': group,
                'timezone_offset': timezoneOffset
            }
        },

        async checkLeadExists(leadId) {
            try {
                const response = await $.ajax({
                    url: `/api/v2/leads?id=${leadId}`,
                    dataType: 'json'
                });

                return !!response._embedded.items[0] || false;
            } catch(error) {
                window.SENSEI.logger.sendLogError(error);
                return false;
            }
        },

        async updateData() {
            let result = null;
            try {
                result = await window.SENSEI.api.send('workplace/task/get', 'GET', this.getRequestParams());
            } catch (ex) {
                window.SENSEI.logger.sendLogError(ex);
                throw ex;
            }

            if (result && result.data) {
                this.applyData(result.data);

                let systemData = window.SENSEI.widget.system();
                if (this.data.current) {
                    let commonTargets = this.data.current.role.periods.flatMap(
                        (period) => period.targets
                            .filter((target) => target.common_tasks)
                            .map((target) => target.target_id)
                    );
                    if (
                        location.pathname.includes('/leads/add/') && this.isButtonClicked
                    ) {
                        let tries = await this.loadQueueTries();

                        if (
                            commonTargets.filter((id) => this.data.current.target_id.includes(id)).length
                            && tries < 5
                        ) {
                            await this.saveQueueTries(tries + 1);
                            setTimeout(() => {
                                window.SENSEI.widget.navigate('leads/detail/' + this.data.current.entity_id);
                            }, 1000);

                            this.isNextButtonClicking = true;
                            this.render();
                            return;
                        } else {

                            this.isNextButtonClicking = false;
                            await this.onNextButtonClick(true);
                            return;
                        }
                    } else if (
                        location.pathname.includes('/leads/detail/')
                        && (systemData.area != "lcard" || !APP.data.current_card)
                        && this.isButtonClicked
                    ) {
                        let incorrectLeadId = location.pathname.split('/leads/detail/')[1];

                        if (incorrectLeadId == this.data.current.entity_id) {
                            this.isNextButtonClicking = false;
                            await this.onNextButtonClick(true);
                            return;
                        }
                    }
                }

                this.isButtonClicked = false;
                this.render();
            }
        },


        async checkCurrentTaskStatus(data) {
            if (data.current && data.current.task_id && data.current.workplace_task_type === "task") {
                return new Promise((resolve) => {
                    let success = (result, textStatus, jqXHR) => {

                        if (jqXHR.status === 204) {
                            console.debug('Task was deleted');
                            resolve(true);
                        } else if (jqXHR.status === 200) {
                            const items = result._embedded.items;
                            if (items[0] === undefined) {
                                throw new Error(`Task ${data.current.task_id} not found`);
                            }
                            resolve(items[0].is_completed);
                        }
                    };
                    let fail = (jqXHR) => {
                        throw new Error('Error with getting task. ' + jqXHR.responseText);
                    };
                    $.ajax(`/ajax/v2_5/tasks/?id=${data.current.task_id}`).done(success).fail(fail);
                }).catch((message) => {
                    console.debug(message);
                    window.SENSEI.logger.sendLogError(message);
                    return false;
                });
            } else if (data.current && data.current.workplace_task_type !== "task") {
                return false;
            }
        },



        async onNextButtonClick(ignorePause, tryNumber) {
            await this.saveQueueTries(0);
            if (this.isNextButtonClicking || tryNumber >= 3) {
                if (tryNumber >= 3) {
                    $('.sensei-next-lead').trigger("button:load:stop").removeClass('events-off');
                }
                return;
            }

            $('.sensei-next-lead').trigger("button:load:stop").removeClass('events-off');
            $('.sensei-next-lead').trigger("button:load:start").addClass('events-off');
            this.isButtonClicked = true;

            try {
                if (!ignorePause && this.isPaused()) {
                    if (await this.checkLeadExists(this.data.current.entity_id)) {
                        window.SENSEI.widget.navigate('leads/detail/' + this.data.current.entity_id);
                        return;
                    }
                    this.onNextButtonClick(ignorePause, 0);
                }

                this.isNextButtonClicking = true;

                let result = await window.SENSEI.api.send('workplace/task/next', 'GET', this.getRequestParams());

                while (result.data?.current?.entity_id && !(await this.checkLeadExists(result.data.current.entity_id))) {
                    if (result.data?.current?.task_id) {
                        await window.SENSEI.api.send(`workplace/task/complete?task_id=${this.data.current.task_id}`, 'GET');
                    }
                    result = await window.SENSEI.api.send('workplace/task/next', 'GET', this.getRequestParams());
                }

                if (result.data) {
                    const isCompleted = await this.checkCurrentTaskStatus(result.data);
                    if (isCompleted || (typeof isCompleted === 'undefined' && (result.data.current || result.data.next))) {
                        await window.SENSEI.api.send(`workplace/task/complete?task_id=${result.data.current.task_id}`, 'GET');
                        throw new Error();
                    }

                    this.applyData(result.data);

                    if (this.data.current && this.data.current.entity_id != location.pathname.split('/leads/detail/')[1]) {
                        this.render();
                        if (await this.checkLeadExists(this.data.current.entity_id)) {
                            window.SENSEI.widget.navigate('leads/detail/' + this.data.current.entity_id);
                            this.isNextButtonClicking = false;
                            return;
                        }
                        this.onNextButtonClick(ignorePause, 0);
                    } else {
                        this.isNextButtonClicking = false;
                        this.render();
                    }
                }
            } catch (error) {
                window.SENSEI.logger.sendLogError(error);

                this.render();
                this.isNextButtonClicking = false;

                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.onNextButtonClick(ignorePause, (tryNumber ?? 0) + 1)
                            .then(() => {
                                resolve();
                            });
                    }, 1000);
                });
            } finally {
                $('.sensei-next-lead').trigger("button:load:stop").removeClass('events-off');
            }
        },

        refreshUpdateInterval() {
            clearInterval(this.updateInterval);
            this.updateInterval = setInterval(async () => {
                this.updateData();
            }, this.task_poll_interval * 1000);
        },
        async uppDropDown() {
            let workplaceRoleBar = $('.sensei-role');
            let dropdown = $('.list__body-right').find('.tips');
            if (
                dropdown.length
                && workplaceRoleBar.length
                && !workplaceRoleBar.hasClass('hidden')
            ) {
                const currentTop = parseInt(dropdown.css('top'));

                let expectedTop = currentTop - 65;

                if (expectedTop < 65) {
                    expectedTop = 66;
                }

                dropdown.css('top', expectedTop + 'px');
            }
        },
    });
});