define([], function(){
    return function(){
        let lastElement = null;
        let firstElement = [];
        this.modal = null;

        this.runFirstElement = function(resolve) {
            firstElement[0](() => {
                firstElement.shift();
                if (!!firstElement.length) {
                    this.runFirstElement(resolve);
                } else {
                    resolve();
                }
            });
        };
        this.do = function(callback) {
            if(!lastElement){
                lastElement = new Promise((resolve) => {resolve()});
            }
            
            let func = () => {
                return new Promise((resolve) => {
                    if(!!lastElement) {
                        callback(() => {
                            if (!!firstElement.length) {
                                this.runFirstElement(resolve);
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            };
            lastElement = lastElement.then(func);
        };
        this.unshift = function(callback) {
            if (!lastElement) {
                this.do(callback);
            }
            firstElement.push(callback);
        };
        this.clear = function() {
            if (!!this.modal && (typeof this.modal.destroy === 'function')) {
                this.modal.destroy();
            }
            this.modal = null;
            lastElement = null;
            firstElement = [];
        };
    }
});

