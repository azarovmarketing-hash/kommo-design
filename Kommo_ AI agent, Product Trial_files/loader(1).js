define([
    './edit_modal.js?v=' + sensei_widget_version,
    './type_modal.js?v=' + sensei_widget_version,
    './model.js?v=' + sensei_widget_version,
    './launch_modal.js?v=' + sensei_widget_version,
], function(
    EditModal,
    TypeModal,
    Model,
    LaunchModal,
){
    function editSegmentModal(model) {
        return new EditModal({model});
    }

    function createSegmentModal(options) {
        return new TypeModal(options);
    }

    function createSegment(type, amo_filter) {
        editSegmentModal(new Model({type, config: {amo_filter}}));
    }

    function handleEvents() {
        if(window.sensei_dynseg2_events_handler) {
            return;
        }
        window.sensei_dynseg1_events_handler = true;

        document.addEventListener('sensei:dynseg_v2:edit', (event) => {
            if(!!event.detail?.model) {
                editSegmentModal(event.detail?.model);
            }
        });

        document.addEventListener('sensei:dynseg_v2:edit_test', (event) => {
            if(!!event.detail) {
                editSegmentModal(new Model(event.detail));
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
            createSegmentModal({location: 'leads', createMode: true, dynseg: {config: {amo_filter: event.detail.amo_filter}}});
        });

        document.addEventListener('sensei:dynseg:create:contacts', (event) => {
            createSegmentModal({location: 'contacts', createMode: true, dynseg: {config: {amo_filter: event.detail.amo_filter}}});
        });       
        
        document.addEventListener('sensei:dynseg:create:multisegment', (event) => {
            if(!!event.detail) {
                new TypeModal(event.detail);
            }
        });

        document.addEventListener('sensei:dynseg_v2:launch', (event) => {
            if(!!event.detail) {
                new LaunchModal(event.detail);
            }
        });
    }    

    return {
        editSegmentModal,
        createSegmentModal,
        createSegment,
        init,
    };
});