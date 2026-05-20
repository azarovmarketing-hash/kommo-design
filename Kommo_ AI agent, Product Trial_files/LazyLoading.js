define([], function(widget) {
    class LazyLoading {
        widget;
        constructor(widget) {
            this.widget = widget;
        }

        loadingModule = (path, ...restArgs) => {
            
            return new Promise((resolve, reject) => {
                if (typeof path !== 'string' || !path.startsWith('/')) {
                    throw new Error("path must be a string or start with '/'");
                }
                if (!widget) {
                    this.widget = SENSEI.widget
                }
                path = `${this.widget.get_settings().path}${path}`;

                if (!require.defined(path)) {
                    
                    require([path], (module) => {
                        if (module) {
                            resolve(new module(...restArgs));
                        }
                    });
                    return;
                }
                
                
                let module = require(path);
                resolve(new module(...restArgs));
            });
        };
    }
    

    return LazyLoading;
});
