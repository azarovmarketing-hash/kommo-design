define([
    './dynamic_segment_modal.js?v=' + sensei_widget_version,
    './model.js?v=' + sensei_widget_version,
], function(
    Modal,
    Model
){
    function segmentModal(model) {
        return new Modal({segment: model.toJSON()});
    }

    function handleEvents() {
        if(window.sensei_dynseg1_events_handler) {
            return;
        }
        window.sensei_dynseg1_events_handler = true;

        document.addEventListener('sensei:dynseg_v1:edit', (event) => {
            if(!!event.detail?.model) {
                segmentModal(event.detail?.model);
            }
        });
    }

    handleEvents();
    
    function init() {    
        if(window.sensei_dynseg_create_events_handler) {
            return;
        }   
        window.sensei_dynseg_create_events_handler = true;  
         
        document.addEventListener('sensei:dynseg:create:leads', (event) => {
            segmentModal(new Model());
        });
    }    

    return {
        segmentModal,
        init,
    };
});