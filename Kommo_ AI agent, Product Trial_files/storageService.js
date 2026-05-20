define(['jquery', './config.js?v=' + sensei_widget_version,], function($, config) {
    return function storageService() {
        
        this.key = 'SENSEI';
        
        this.setAllItem = (object, session = false) => {
            (session ? sessionStorage : localStorage).setItem(this.key, JSON.stringify(object));
        };

        this.getAllItem = (session = false) => {
            const json = (session ? sessionStorage : localStorage).getItem(this.key);

            if (!json) {
                return {};
            }

            return JSON.parse(json);
        };

        this.getItem = (key, defaultValue = {}, session = false) => {
            const data = this.getAllItem(session);

            if (!data[key]) {
                return defaultValue;
            }

            return data[key] || defaultValue;
        };
        
        this.setItem = (key, object, session = false) => {
            const data = this.getAllItem(session);
            data[key] = object; 
            this.setAllItem(data, session);
        };
        
        this.patchItemObject = (key, object, session = false) => {
            const current = this.getItem(key, {}, session);
            this.setItem(key, {...current, ...object}, session);
        };

        this.remove = (key, session = false) => {
            const data = this.getAllItem(session);
            delete data[key];
            this.setAllItem(data, session);
        };

    };
});