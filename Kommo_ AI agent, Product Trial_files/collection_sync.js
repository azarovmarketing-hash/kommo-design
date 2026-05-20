define([], function() {
    return function(socket, collection, event){
        if(collection.socket_synchronizer && !collection.socket_synchronizer.stopped){
            return collection.socket_synchronizer;
        }
        var self = this;
        let listeners = [];
        this.stopped = false;
        this.event = event;

        collection.socket_synchronizer = self;

        let callback = (data) => {
            data.items.forEach((item) => {
                if(item.action == 'add' || item.action == 'update'){
                    let model = collection.get(item.model['id']);
                    if(model){
                        model.set(item.model);
                    } else {
                        collection.needOpenProcess = false;
                        collection.add(item.model);
                    }
                } else if(item.action == 'remove') {
                    collection.remove(item.model['id']);
                }
            });

            listeners.forEach((listener) => {
                listener(data);
            });
        }
        socket.onmessage(event, callback);

        this.onsync = (listener) => {
            if(typeof listener == 'function'){
                listeners.push(listener);
            }
        };

        this.unsubscribe = (listener) => {
            let i = self.listeners.findIndex((item) => item === listener);
            if(i != -1){
                self.listeners.splice(i,1);
                return true;
            }
            return false;
        }

        this.stop = () => {
            stopped = true;
            socket.unsubscribeMessage(callback);
            collection.socket_synchronizer = undefined;
            listeners = [];
        };

    };
});