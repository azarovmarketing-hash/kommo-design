define(['jquery'], function($) {
    return function() {
        this.changeLeadStatus = function(statusId, pipelineId) {
            let statusFieldName = "lead[STATUS]";
            let pipelineFieldName = "lead[PIPELINE_ID]";
            let leadForm = APP.data.current_card.form;

            statusId = parseInt(statusId) || 0;
            pipelineId = parseInt(pipelineId) || 0;

            if(!statusId || !pipelineId) {
                console.debug("Change lead status: incorrect statusId or pipelineId values");
                return;
            }

            

            let inputPipelineElements = $(`input[name="${pipelineFieldName}"]`);

            if(!inputPipelineElements.length || !(inputPipelineElements[0] instanceof Element)) {
                console.debug("Change lead status: pipeline elements not found on page");
                return;
            }

            let firstInputPipelineElement = inputPipelineElements.first();
            firstInputPipelineElement.val(pipelineId);
        
            let filteredPipelineInputs = inputPipelineElements.filter(function() {
                let currentValue = parseInt($(this).removeAttr("checked").val());
                this.checked = false;
                return currentValue === pipelineId;
            });
        
            if(filteredPipelineInputs.length) {
                leadForm.model.defaults[pipelineFieldName] = pipelineId.toString();
                filteredPipelineInputs.prop("checked", true).attr("checked", true);
                filteredPipelineInputs.trigger("change");
            }

            

            let inputStatusElement = $(`input[name="${statusFieldName}"]`);

            if(!inputStatusElement.length || !(inputStatusElement[0] instanceof Element)) {
                console.debug("Change lead status: status elements not found on page");
                return;
            }

            leadForm.model.defaults[statusFieldName] = statusId.toString();

            inputStatusElement = inputStatusElement.filter(function() {
                this.checked = false;
                return $(this).val() == statusId && $(this).attr("id").indexOf("_" + pipelineId + "_") > -1;
            });

            if(inputStatusElement.length) {
                inputStatusElement.prop('checked', true).trigger("change");
            }
        }
    }
})