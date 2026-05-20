define([], function () {
    class Logger {
        data = {};
        debugger = {};
        hash;

        addWidgetData(widget) {
            this.data['statusChanged'] = widget.statusChanged ?? "undefined";
            this.data['changedData'] = widget.changedData;
        }

        addUserData(user) {
            this.data['user'] = {
                id: user.id,
                login: user.login,
                name: user.name
            };
        }

        addAccountData(account) {
            this.data['account'] = {
                id: account.id,
                name: account.name,
            }
        }

        addLeadData(lead) {
            this.data['lead'] = {
                id: lead.id,
                changes: lead.changes,
                is_unsorted: lead.is_unsorted,
                model: lead.model,
                model_changed: lead.model.changed
            };
        }
        addCompanyData(company) {
            this.data['company'] = company;
        }
        addContactData(contact) {
            this.data['contact'] = contact;
        }
        addTaskInformation(task) {
            this.data['taskInfo'] = task;
        }
        addCurrentUser(user) {
            this.data['current_user'] = {
                id: user.id,
                name: user.name
            }
        }
        addChangesData(changes) {
            this.data['changes'] = changes;
        }
        addJsCodeInfo(jsCodeInfo) {
            this.data['jsCodeInfo'] = jsCodeInfo;
        }
        generateHash() {
            return this.hash = (Math.random() + 1).toString(36).substring(2);
        }

        sendLogError(error) {

            const sendError = {};

            if (error.message) {
                sendError.message = error.message;
            }

            if (error.stack) {
                sendError.stack = error.stack;
            }

            if (error.jqXHR) {
                sendError.responseJSON = error.jqXHR.responseJSON;
                sendError.responseText = error.jqXHR.responseText;
                sendError.status = error.jqXHR.status;
            }

            this.sendLogs('errors', 'error', {
                account: APP.constant('account'),
                user: APP.constant('user'),
                widget: SENSEI.widget,
                error: sendError
            });
        }

        sendLogs(typeLog, trigger, logs) {
            if (!this.debugger[typeLog]) {
                return;
            }
            this.data = {
                userAgent: window.navigator.userAgent,
                hash: this.hash ?? this.generateHash(),
                url: window.location.href,
                trigger: trigger
            };

            if (typeLog === 'status') {
                this.data['statusChanged'] = logs?.widget?.statusChanged ?? "undefined";
            }
            logs.lead && this.addLeadData(logs.lead);
            logs.company && this.addCompanyData(logs.company);
            logs.contact && this.addContactData(logs.contact);
            logs.changes && this.addChangesData(logs.changes);
            logs.taskInfo && this.addTaskInformation(logs.taskInfo);
            logs.current_user && this.addCurrentUser(logs.current_user);
            logs.jsCodeInfo && this.addJsCodeInfo(logs.jsCodeInfo);

            if (logs.requestData) {
                this.data['requestData'] = logs.requestData;
            }

            if (logs.responseData) {
                this.data['responseData'] = logs.responseData;
            }

            if (logs.error) {
                this.data['error'] = logs.error;
            }

            if (Object.keys(this.data).length > 0) {
                SENSEI.api.setLogs({ frontEndLog: this.data });
            }
        };
    }

    return Logger;
});


