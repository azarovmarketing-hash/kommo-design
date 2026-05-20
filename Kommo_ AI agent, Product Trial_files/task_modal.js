define([
    'jquery',
    'underscore',
    'lib/components/base/modal',
    'moment',
], function($, _, Modal, moment) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.templates = options.templates;
            this.config = options.config;
            this.version = APP.constant('account').version;
            
            this.openModal();
            this.render();
            return this;
        },
  
        events: {
            "click #deadline_save": "onSaveClick",
        },
  
        render: function() {
            return this;
        },
  
        openModal: function() {
            let view = this;
            this._modal = new Modal({
                class_name: 'modal-list sensei-fill_deadline-modal modal-todo',
                disable_overlay_click: true,
                init: async function($modalBody) {
                    view.$modalBody = $modalBody;
                    $modalBody.trigger('modal:loaded');
                    let data = {
                        title: SENSEI.locale.get('task_modal.title'),
                        version: view.version,
                        task_type: view.getTaskTypeParams(),
                        text: view.config.text,
                        complete_till: view.getCompleteTill(),
                        main_user: view.getResponsible()
                    };
                    
                    await SENSEI.widget.loadAmoTwigs();

                    let html = view.templates.task_modal.render(data);
                    $modalBody.html(html).trigger('modal:centrify');
                    view.setElement($modalBody[0]);
                },
                destroy: function() {
                    view.trigger('deadline:close');
                }
            });
        },
  
        onSaveClick: function() {
            let date = this.$el.find('input[name="date"]').val();
            let time = this.$el.find('input[name="time"]').val();
            let duration = 0;
            if (this.version == 6) {
                time = this.$el.find('input[name="time"]').attr('data-value-id');
            } else {
                duration = this.$el.find('input[name="duration"]').val();
            }
            let i = moment(date + ' ' + time, APP.system.format.date.full);
            let complete_till = moment().tz(APP.constant('account').timezone).set('year', i.get('year')).set('month', i.get('month')).set('date', i.get('date')).set('hour', i.get('hour')).set('minute', i.get('minute')).set('second', i.get('second')).set('millisecond', i.get('millisecond')).unix();
            if(!duration && time.includes('-')) {
                duration = '3600';
            }
            let deadline = {
                complete_till: complete_till,
                duration: duration
            }
            this._modal.destroy();
            this.trigger('deadline:save', deadline);
        },
        
        getResponsible: function() {
            if (this.config.responsible_user_id == 'current') {
                return APP.constant('user');
            }

            const user = APP.constant('managers')[this.config.responsible_user_id] || 
                APP.constant('managers')[APP.data.current_card.getMainUser()] || 
                APP.constant('user');

            return {
                id: user.id,
                name: user.option || user.name        
            };
        },

        getCompleteTill: function() {
            
            if (this.config.complete_till) {
                
                const date = moment.unix(this.config.complete_till).tz(APP.constant('account').timezone).format(APP.system.format.date.date);

                
                const start = moment.unix(this.config.complete_till).tz(APP.constant('account').timezone).format(APP.system.format.date.time);
                const finish = !this.config.duration ? start : moment.unix(this.config.complete_till + this.config.duration).tz(APP.constant('account').timezone).format(APP.system.format.date.time);
                const time = start === finish ? start : [start, finish].join(' - ');

                return {
                    date: moment.unix(this.config.complete_till).tz(APP.constant('account').timezone).format(APP.system.format.date.date),
                    time,
                    date_caption: this.getDateCaption(date),
                    time_caption: time == '23:59' ? '' : time,
                    time_hide: time == '23:59' ? 1 : 0
                };
            } else {
                let date = moment().tz(APP.constant('account').timezone).format(APP.system.format.date.date);
                let time = moment().tz(APP.constant('account').timezone).format(APP.system.format.date.time);
    
                if (this.config.complete_till_at == 'custom') {
                    let current_time = moment().tz(APP.constant('account').timezone).add(this.config.complete_till_at_custom.days, 'days').add(this.config.complete_till_at_custom.hours,'hours').add(this.config.complete_till_at_custom.minutes,'minute').format(APP.system.format.date.full).split(' ');
                    date = current_time[0];
                    time = current_time[1];    
                }
    
                if (this.config.complete_till_at == '1' || this.config.complete_till_at == '3') {
                    date = moment().add(this.config.complete_till_at,'days').format(APP.system.format.date.date);
                    time = '23:59';
                }
    
                if (this.config.complete_till_at == 'today') {
                    time = '23:59';    
                }
    
                if (this.config.complete_till_at == 'week') {
                    date = moment().day(7).format(APP.system.format.date.date);
                    time = '23:59';
                }
    
                if (this.config.complete_till_at == 'by_field') {
                    let field_id = this.config.complete_till_by_field.id;
                    let value = $('input[name="CFV[' + field_id + ']"]').val();
                    if (value) {
                        date = value;
                        time = '23:59';
                    } 
                }
    
                return {
                    date: date,
                    time: time,
                    date_caption: this.getDateCaption(date),
                    time_caption: time == '23:59' ? '' : time,
                    time_hide: time == '23:59' ? 1 : 0
                };
            }
        },

        getDateCaption: function(date) {
            let today = moment().format(APP.system.format.date.date);
            let yesterday = moment().subtract(1, 'days').format(APP.system.format.date.date);
            let tomorrow = moment().add(1, 'days').format(APP.system.format.date.date);
            if (date == today) 
                return APP.lang.Today;
            if (date == yesterday)
                return APP.lang.Yesterday;
            if (date == tomorrow) 
                return APP.lang.Tomorrow;
            return date;      
        },
        
        getTaskTypeParams: function() {
            let task_type = {
                name: this.config.task_type_text,
                id: this.config.task_type
            }
            if (this.config.task_type == "1") {
                task_type['icon_select'] = '<span class="task_type_select__icon icon icon-inline icon-follow-up"></span>';
                task_type['icon'] = '<span class="icon icon-inline icon-follow-up"></span>';
                return task_type;
            }
            if (this.config.task_type == "2") {
                task_type['icon_select'] = '<span class="task_type_select__icon icon icon-inline icon-case-red"></span>';
                task_type['icon'] = '<span class="icon icon-inline icon-case-red"></span>';
                return task_type;
            }
            if (this.version == 6) {
                task_type['icon_select'] = '<span class="task_type_select__icon icon icon-inline icon-clock-blue-big"></span>';
                task_type['icon'] = '<span class="icon icon-inline icon-clock-blue-big"></span>';
                return task_type;
            }

            let type = APP.constant('task_types')['key_' + this.config.task_type];
            let icon = '<svg class="svg-icon svg-tasks--types-icons--' + type.icon_id + '-dims" style="fill: #' + type.color + '"><use xlink:href="#tasks--types-icons--' + type.icon_id + '"></use></svg>';
            task_type['icon_select'] = '<span class="task_type_select__icon">' + icon + '</span>';
            task_type['icon'] = icon;
            return task_type;
            
        },

    });
});
