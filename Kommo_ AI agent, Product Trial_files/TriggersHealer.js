class TriggersHealer {
    triggersData = [];
    widgetCode = "";

    init(widget) {
        this.widgetCode = widget.get_settings().widget_code;
        this.updateTriggersData();
    }

    updateTriggersData() {
        if(APP.data?.current_view?.data) {
            this.triggersData = this.getTriggersData();
        }
    }

    handleTriggersData(){
        const currentTriggerData = this.getTriggersData();
        if (JSON.stringify(this.triggersData) !== JSON.stringify(currentTriggerData)) {
            const isBroken = currentTriggerData.some(data => !data.process_name);
            if(isBroken) {
                this.restoreTriggersData();
            } else {
                this.triggersData = JSON.parse(JSON.stringify(currentTriggerData));
            }
        }
    }

    getTriggersData() {
        const collection = [];
        APP.data.current_view.collection.where({widget_code: this.widgetCode}).forEach(model => {
            const sett = model.get('settings');
            if(sett?.widget_info?.name) {
                collection.push({
                    trigger_id: model.get('id'),
                    process_id: sett.widget.settings.process_id,
                    process_name: sett.widget.settings.process_name,
                    account_id: sett.widget.settings.account_id,
                    process_direction: sett.widget.settings.process_direction
                });
            }
        });
        return collection;
    };

    restoreTriggersData(){
        APP.data.current_view.collection.where({widget_code: this.widgetCode}).forEach((model, i) => {
            const foundTrigger = this.triggersData.find(item => item.trigger_id === model.get('id'));
            const sett = model.get('settings');
            if(foundTrigger) {
                this.updateWidgetSettings(sett.widget.settings, foundTrigger);
                model.set(sett);
            } else {
                if(sett.widget_info.name) {
                    const command = sett.widget_info.name.trim().replaceAll("Sensei: ", "");
                    if (!sett.widget.settings.process_id) {
                        let process = APP.widgets.list[this.widgetCode].Processes.where({name: command.replace(new RegExp(`(${SENSEI.locale.get('salesbot.direction_select.start')} |${SENSEI.locale.get('salesbot.direction_select.stop')} )`) , "")})[0];
                        if (!!process) {
                            this.updateWidgetSettings(sett.widget.settings, {
                                process_id: process.get('id'),
                                process_name: process.get('name'),
                                account_id: APP.constant('account').id + '',
                                process_direction: this.extractDirectionFromCommand(command)
                            });
                            model.set(sett);
                        }
                    }
                }
            }
        });
        $('.button-input_add').click();
    }

    updateWidgetSettings(widgetSettings, data) {
        widgetSettings.process_id = data.process_id;
        widgetSettings.process_name = data.process_name;
        widgetSettings.account_id = data.account_id;
        widgetSettings.process_direction = data.process_direction;
    }

    extractDirectionFromCommand(command) {
        if(command.indexOf(SENSEI.locale.get('salesbot.direction_select.start') + ' ') === 0) {
            return 'start';
        }
        if(command.indexOf(SENSEI.locale.get('salesbot.direction_select.stop') + ' ') === 0) {
            return 'stop';
        }
        return "";
    }
}

define(['jquery'], function ($) {
    return TriggersHealer;
});