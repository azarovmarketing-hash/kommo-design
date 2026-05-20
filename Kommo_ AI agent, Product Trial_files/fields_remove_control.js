define([
    'jquery',
    'twigjs',
    'lib/components/base/modal',
    'text!../../../templates/field_remove_modal.twig?v=' + sensei_widget_version
], function ($, twig, Modal, field_remove_modal_tmpl) {

    const modalTemplate = twig({
        id: '/sensei/field_remove_modal.twig',
        data: field_remove_modal_tmpl,
        allowInlineIncludes: true
    });

    class FieldsRemoveControl {

        static isInitialized = false;

        init() {
            if (FieldsRemoveControl.isInitialized) {
                return;
            }

            this.bindEvents();

            FieldsRemoveControl.isInitialized = true;
        }

        bindEvents() {
            const self = this;
            
            $(document).off('mousedown.fieldsRemoveControl');
            $(document).off('click.fieldsRemoveControl');
            
            $(document).on('mousedown.fieldsRemoveControl', '.js-modal-trash.cf-field-edit__remove', function(e) {
                if (!APP.data.is_card) {
                    return;
                }

                e.stopPropagation();
                e.preventDefault();
                
                const $button = $(this);
                
                self.showLoadingOverlay();
                
                self.showCustomModal($button);
                
                return false;
            });
            
            $(document).on('click.fieldsRemoveControl', '.js-modal-trash.cf-field-edit__remove', function(e) {
                if (!APP.data.is_card) {
                    return;
                }
                
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        };

        async showCustomModal($button) {
            const self = this;
            
            const fieldName = this.getFieldName($button);
            const fieldId = this.getFieldId($button);
            
            const response = await SENSEI.api.send(`element-search/find-all?query=${fieldId}`, 'GET');

            const processesResponse = await SENSEI.api.getAllProcesses();
            const processNames = {};
            if (processesResponse && processesResponse.data && Array.isArray(processesResponse.data)) {
                processesResponse.data.forEach(function (p) {
                    if (p && p.id && p.name) {
                        processNames[p.id] = p.name;
                    }
                });
            }

            this.hideLoadingOverlay();

            const process_matches = response.data.process_matches || {};

            const dynamic_segments = response.data.dynamic_segments || [];

            const workplaces = response.data.workplaces || [];

            const total_matches = Object.keys(process_matches).filter(key => !!key).length + dynamic_segments.length + workplaces.length;
            
            this.modal = new Modal({
                class_name: 'sensei-field-remove-modal',
                init: function($modalBody) {
                    const html = modalTemplate.render({
                        field_name: fieldName,
                        field_id: fieldId,
                        process_matches,
                        process_names: processNames,
                        dynamic_segments,
                        workplaces,
                        total_matches: total_matches || 0,
                        widget_code: SENSEI.widget.get_settings().widget_code,
                        constructor_domain: SENSEI.config.getConstructorDomain(),
                        account_id: APP.constant('account').id
                    });
                    
                    $modalBody.trigger('modal:loaded').html(html).trigger('modal:centrify');
                    
                    $modalBody.data('field-name', fieldName);
                    $modalBody.data('field-id', fieldId);
                    
                    self.bindModalEvents($modalBody, $button);
                }
            });
        };

        getFieldName($button) {
            let fieldName =  window.SENSEI.locale.get('fields_remove_control.unknown_field');
            
            const $fieldContainer = $button.closest('.cf-field-wrapper');
            if ($fieldContainer.length) {
                const $nameInput = $fieldContainer.find('input[name="name"]');
                if ($nameInput.length) {
                    const inputValue = $nameInput.val();
                    if (inputValue && inputValue.trim()) {
                        fieldName = inputValue.trim();
                    }
                }
            }
            return fieldName;
        };

        getFieldId($button) {
            let fieldId = null;
            
            const $fieldContainer = $button.closest('.cf-field-wrapper');
            if ($fieldContainer.length) {
                const $copyElement = $fieldContainer.find('.js-copy-cf-id');
                if ($copyElement.length) {
                    fieldId = $copyElement.data('clipboard-text');
                }
            }
            return fieldId;
        };

        bindModalEvents($modalBody) {
            const self = this;
            
            $modalBody.find('.js-modal-accept').on('click', async function() {
                const fieldId = $modalBody.data('field-id');

                await self.deleteCustomField(fieldId);
                
                self.modal.destroy();

                $('.default-overlay.default-overlay-visible.card-cf__overlay').remove();

                self.hideLoadingOverlay();
            });
            
            $modalBody.find('.button-cancel').on('click', function() {
                self.modal.destroy();
            });
            
            $modalBody.find('.modal-body__close').on('click', function() {
                self.modal.destroy();
            });
            
            $modalBody.find('.sensei-field-remove-modal-list-more').on('click', function() {
                const $button = $(this);
                const sectionType = $button.data('toggle');
                const total = $button.data('total');
                const $list = $modalBody.find('[data-list="' + sectionType + '"]');
                const isExpanded = $button.hasClass('expanded');
                
                if (isExpanded) {
                    $list.find('[data-item-index]').each(function() {
                        const index = parseInt($(this).data('item-index'));
                        if (index > 3) {
                            $(this).hide();
                        }
                    });
                    $button.text('+ ещё ' + (total - 3));
                    $button.removeClass('expanded');
                } else {
                    $list.find('[data-item-index]').show();
                    $button.text('Скрыть');
                    $button.addClass('expanded');
                }
            });
        };

        async deleteCustomField(id) {

            let entityType = APP.constant('account').cf[id].ELEMENT_TYPES[0];

            entityType = entityType == 1 ? 'contacts' : (entityType == 2 ? 'leads' : 'companies')

            await $.ajax({
                url: `/api/v4/${entityType}/custom_fields/${id}`,
                type: "DELETE"
            });

            $(`.cf-field-wrapper[id^="cf_field_${id}"]`).remove();
            $(`.linked-form__field[data-id="${id}"]`).remove();

            delete APP.constant('account').cf[id];
        }

        showLoadingOverlay() {
            if ($('.sensei-field-delete-loading').length === 0) {
                $('body').append(`
                    <div class="sensei-field-delete-loading default-overlay load-widget-overlay default-overlay-visible" style="z-index: 10000;">
                        <span class="spinner-icon spinner-icon-abs-center"></span>
                    </div>
                `);
            }
        };

        hideLoadingOverlay() {
            $('.sensei-field-delete-loading').remove();
        };
    }

    return FieldsRemoveControl;
});