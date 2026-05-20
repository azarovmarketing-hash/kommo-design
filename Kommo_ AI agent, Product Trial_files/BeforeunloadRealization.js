define(['jquery'], function($){

    function preventDefaultBeforeunloadHandler(event){
        event.preventDefault();
    }

    return function(){

        this.preventOn = function(){
            $(window).on('beforeunload', preventDefaultBeforeunloadHandler);
        };

        this.preventOff = function(){
            $(window).off('beforeunload', preventDefaultBeforeunloadHandler);
        };
    }
});