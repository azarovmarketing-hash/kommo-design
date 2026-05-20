define([], function () {
    return function () {
        let self = this;
        let localeData = null;
        this.init = function(lang){
            return new Promise(function(resolve, reject) {
                SENSEI.api.send(`locale/${lang}/get`).then((data) => {
                    localeData = data;
                    self.triggerEvent();
                    resolve();
                }, (err) => {
                    self.triggerEvent(); 
                    reject(err);
                });
            }); 
        }
        this.initialized = function () {
            return !!localeData;
        }
        const replaceMasks = function (string, parts = {}) {
            Object.keys(parts).forEach(item => {
                string = string.replaceAll('{{' + item + '}}', parts[item]);
            });
            return string;
        }

        this.numeral = function (string, number, masks = {}) {
            string = self.get(string);

            if (typeof string != 'string' || typeof number != 'number') {
                console.debug('[Sensei] locale numeral неверные типы', string, number);
                return 'error';
            }
            let parts = string.split(',');
            if (parts.length < 3) {
                console.debug('[Sensei] locale numeral неверная строка', string);
                return string;
            }



            let parsedParts = [];
            if (parts.length >= 4) {
                parsedParts = parts;
            } else if (parts.length == 3) {
                parsedParts = [parts[0], parts[0], parts[1], parts[2]];
            }


            let result = '';
            if (number == 1) {
                result = parsedParts[0];

            } else if (Math.floor(number) != number) {
                result = parsedParts[3];

            } else if (number % 100 >= 11 && number % 100 <= 14) {
                result = parsedParts[3];

            } else if ((number % 10 > 1 && number % 10 <= 4)) {
                result = parsedParts[2];

            } else if (number % 10 == 1) {
                result = parsedParts[1];

            } else {
                result = parsedParts[3];
            }

            return replaceMasks(result, masks);
        }
        this.get = function (id, parts = {}) {
            if (typeof id !== 'string') {
                console.debug('[Sensei] locale: в качестве ключа передано не строковое значение. ', id);
                id = '' + id;
            }
            let localized = localeData;
            id.split('.').forEach(part => {
                if (localized && typeof localized === 'object') {
                    localized = localized[part];
                } else {
                    localized = undefined;
                }
            });
            if (typeof localized !== 'string') {
                console.debug('[Sensei] locale: значение с ключом ' + id + ' не найдено.', localized);
                return id;
            }


            return replaceMasks(localized, parts);
        };

        this.triggerEvent = function () {
            window.SENSEI.events.trigger('enable_locale', !!localeData);
        }
    };
});