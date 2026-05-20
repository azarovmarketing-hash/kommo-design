define([
    'twig',
], function(twig) {
    return Backbone.View.extend({
        initialize() {
            return this;
        },
        renderList(list, class_name = '') {
            return twig({
                ref: '/tmpl/controls/select.twig'
            }).render({
                class_name,
                items: list.map(element => ({ ...element, option: element.name })),
            }); 
        },
        getDateFieldsList() {
            let allowedEntites = [1,2,3];
            let dateFormats = {
                14: APP.constant('account').date_format,
                6: APP.constant('account').date_format,
                19: APP.constant('account').date_pattern
            };
            return Object.values(APP.constant('account').cf).filter(({ ELEMENT_TYPES, TYPE_ID }) => allowedEntites.includes(ELEMENT_TYPES[0]) && (TYPE_ID in dateFormats)).map(({ NAME, ID, ELEMENT_TYPES, TYPE_ID }) => ({name: NAME, id: ID, entity_type: ELEMENT_TYPES[0], format: dateFormats[TYPE_ID]}))
        },
        prepareListForSelect(list) {
            return list.map(element => ({ ...element, option: element.name }));
        },
        numberToWords(number) {
            number = Math.abs(number);
            if(number == 0){
                return SENSEI.locale.get('general.numbers.zero');
            }

            function parseThousandGroup(number, singlesLocalePath = 'singles') {
                number = Math.floor(number % 1000);
                let single = number % 10;
                let tens = Math.floor(number/10) % 10;
                let hundreds = Math.floor(number/100) % 10;

                let out = '';

                if(tens >= 1 && tens < 3){
                    let special = SENSEI.locale.get('general.numbers.special.'+tens+single);
                    if(special){
                        out = special;
                    }
                } 
                
                if(tens >= 2 && out == '') {
                    out = SENSEI.locale.get('general.numbers.tens.'+tens);
                    if(single > 0){
                        let joiner = SENSEI.locale.get('general.numbers.tens.joiner');
                        if(joiner){
                            out += ' '+joiner;
                        }
                        out += ' '+SENSEI.locale.get('general.numbers.'+singlesLocalePath+'.'+single);
                    }
                } else if(tens == 0){
                    out += SENSEI.locale.get('general.numbers.'+singlesLocalePath+'.'+single);
                }

                if(hundreds > 0){
                    let joiner = SENSEI.locale.get('general.numbers.hundreds.joiner');
                    if(joiner){
                        joiner = ' '+joiner;
                    }
                    if(out) {
                        out = SENSEI.locale.get('general.numbers.hundreds.'+hundreds)+joiner+' '+out;
                    } else {
                        out = SENSEI.locale.get('general.numbers.hundreds.'+hundreds);
                    }
                }

                return out;
            }
            let out = parseThousandGroup(number % 1000);

            ['thousands_group', 'millions_group', 'billions_group', 'trillions_group'].forEach((groupPath) => {
                number = Math.floor(number/1000);

                if(number % 1000 > 0){
                    out = parseThousandGroup(number % 1000, groupPath) + ' ' + SENSEI.locale.numeral('general.numbers.'+groupPath+'.title', number % 1000) + ' ' + out;
                }
            });
            
            return out;
        }
    });
});
