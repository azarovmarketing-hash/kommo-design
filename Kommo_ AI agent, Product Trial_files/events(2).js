define([], function() {
    return function() {
        let events = {};
        this.trigger = async function(event, ...args) {
            if (!events[event]) {
                return this;
            }

            events[event].forEach((func)=>{
                func(...args);
            });
            return this;
        }

        this.subscribe = function(event, func) {
            if (typeof event !== 'string') {
                throw Error('event name not string');
            }
            if (typeof func !== 'function') {
                throw Error('two parameter not function');
            }
            events[event] = [...events[event] || [], func];

            return {
                unsubscribe: () => {
                    for (i in events[event]) {
                        if (events[event][i] == func) {
                            events[event].splice(i , 1);
                            break;
                        }
                    }
                }
            }
        }
    }
});