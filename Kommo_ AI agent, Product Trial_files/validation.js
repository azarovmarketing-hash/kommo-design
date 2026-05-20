define([], function(){
    return {
        init: function() {
            const definedIndicators = [];

            function findIndicatorRecordByElement(element) {
                return definedIndicators.find((item) => item.element === element);
            }

            function getIndicator(element) {
                let indicator = findIndicatorRecordByElement(element)?.indicator;
                if(!indicator) {
                    if(element.dataset.senseiValidationIndicatorSelector) {
                        let root = $(element).parent();
                        if(element.dataset.senseiValidationIndicatorParent) {
                            root = $(element).closest(element.dataset.senseiValidationIndicatorParent);
                        }

                        indicator = root.find(element.dataset.senseiValidationIndicatorSelector).get(0);
                    }
                }
                return indicator || element;
            }

            $(document).on('sensei:validation:set_indicator', '.sensei-validation', (e, argument) => {
                let indicator = e.target || argument || e.originalEvent?.detail;
                if(indicator instanceof JQuery) {
                    indicator = indicator.get(0);
                }
                if(!(indicator instanceof Element)) {
                    return false;
                }

                let record = findIndicatorRecordByElement(e.target);
                if(!record){
                    record = {element: e.target};
                    definedIndicators.push(record);
                }
                record.indicator = indicator;
            });

            $(document).on('sensei:validation:error', '.sensei-validation', (e) => {
                let indicator = getIndicator(e.target);
                $(indicator).addClass('sensei-validation__error');
            });

            const clearEventHandler = (e) => {
                let indicator = getIndicator(e.target);
                $(indicator).removeClass('sensei-validation__error');
            }

            $(document).on('sensei:validation:clear', '.sensei-validation', clearEventHandler);

            $(document).on('input', '.sensei-validation.sensei-validation__clear-on-input', clearEventHandler);
            $(document).on('click', '.sensei-validation.sensei-validation__clear-on-click', clearEventHandler);
            $(document).on('change', '.sensei-validation.sensei-validation__clear-on-change', clearEventHandler);

        }
    }
});