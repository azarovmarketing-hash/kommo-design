define([], function(){
    return Backbone.View.extend({
        events: {
            'click .sensei-searchable-select__list__item:not(.disabled)': 'onItemSelect',
            'input .sensei-searchable-select__search': 'onSearchInput',
            'click .sensei-searchable-select__button': 'showList',
            'focusout .sensei-searchable-select__container': 'onFocusOut',
        },

        initialize({
            disableSearch = false, 
            disableSelection = false, 
            hideButton = false, 
            disableScroll = false, 
            disableCheck = true, 
            searchGroups = true,
            expandDirection = 'auto',
            emptyValues = ['0', ''],
        } = {}){
            this.options = {
                disableSearch, 
                disableSelection, 
                hideButton, 
                disableScroll, 
                disableCheck,
                searchGroups,
                expandDirection,
                emptyValues,
            };
        },

        showList(){
            this.$el.addClass('expand');
            this.$el.find('.sensei-searchable-select__search').focus();
            this.fitScreen();
        },

        onFocusOut(){
            setTimeout(() => {
                if(!this.el.contains(document.activeElement)){
                    this.hideList();
                }
            }, 10);
        },

        hideList(){
            this.$el.removeClass('expand');
        },

        onItemSelect(event) {
            event.stopPropagation();
            let id = event.currentTarget.attributes['data-id'].value;
            let option = event.currentTarget.attributes['data-option'].value;
            this.$el.find('.sensei-searchable-select__button')
                .attr('data-value', id)
                .removeClass('not-selected')
                .find('.sensei-searchable-select__button__inner')
                    .text(option);

            if(this.options.emptyValues.includes(id)){
                this.$el.find('.sensei-searchable-select__button').addClass('not-selected');
            }

            let hiddenInput = this.$el.find('.sensei-searchable-select__hidden-input');
            hiddenInput
                .attr('data-prev-value', hiddenInput.attr('value'))
                .attr('value', id)
                .attr('data-change-on-init', true);

            hiddenInput.trigger('input').trigger('change');

            this.$el.find('.sensei-searchable-select__list__item.selected').removeClass('selected');
            if(!this.options.disableSelection){
                this.$el.find(`.sensei-searchable-select__list__item[data-id="${id}"]`).addClass('selected');
            }
            
            this.hideList();
        },

        onSearchInput({currentTarget}) {
            if(this.options.disableSearch){
                return;
            }
            
            let query = currentTarget.value.toLowerCase();

            let groups = [];
            let groupFound = false;
            let lastGroup = '';
            let that = this;
            this.$el.find('.sensei-searchable-select__list__item:not(.hidden)').each(function(i, elem){
                elem = $(elem);
                let value = elem.attr('data-search');
                elem.addClass('search-hide');
                if(elem.attr('data-disabled') === "true") {
                    lastGroup = elem.attr('data-id');
                    groupFound = false;
                    if(value.indexOf(query) != -1){
                        groupFound = true;
                        if(!groups.includes(lastGroup)){
                            groups.push(lastGroup);
                        }
                    }
                } else {
                    if((groupFound && that.options.searchGroups) || value.indexOf(query) != -1 || (''+elem.attr('data-id')).indexOf(query) != -1){
                        elem.removeClass('search-hide');
                        if(!groups.includes(lastGroup)){
                            groups.push(lastGroup);
                        }
                    }
                }
            });

            this.$el.find('.sensei-searchable-select__list__item.disabled').each(function(i, elem){
                if(groups.includes($(elem).attr('data-id'))){
                    $(elem).removeClass('search-hide');
                }
            });
        },

        fitScreen() {
            let direction = 'down';
            if(this.options.expandDirection == 'up') {
                direction = 'up';
            }
            if(this.options.expandDirection == 'auto') {
                let container = this.$el.find('.sensei-searchable-select__container');
                if(container.offset().top - $(window).scrollTop() + container.height() > $(window).height()) {
                    direction = 'up';
                }
            }

            if(direction == 'down') {
                this.$el.find('.sensei-searchable-select__container').css({'top': '0', 'bottom': 'auto'});
            } else if(direction == 'up') {
                this.$el.find('.sensei-searchable-select__container').css({'top': 'auto', 'bottom': '0'});
            }
        },

        getSelectedId() {
            if(!!this.$el) {
                return this.$el.find('.sensei-searchable-select__hidden-input').val();
            }
            return undefined;
        },

        render(items, selected, class_name, name) {
            let selectedItem = 
                items.find((item) => item.id == selected || item.option == selected) 
                || items[0];

            const list = $('<ul>')
                .addClass(`sensei-searchable-select__list custom-scroll ${this.options.disableScroll ? '' : (this.options.disableSearch ? 'auto-scroll' : 'scroll')}`)
                .append(items.map(
                    (item) => $('<li>')
                        .addClass(`
                            sensei-searchable-select__list__item 
                            ${item.disabled ? ' disabled':''} 
                            ${(!this.options.disableSelection && (item.id == selected || item.option == selected)) ? ' selected':''}
                            ${item.hidden ? ' hidden' : ''}
                        `)
                        .attr('data-id', item.id)
                        .attr('data-option', item.option)
                        .attr('data-disabled', item.disabled)
                        .attr('data-search', item?.search?.toLowerCase() || item?.option?.toLowerCase() || '')
                        .attr('title', item.title ?? '')
                        .append(
                            (
                                this.options.disableCheck 
                                ? '' 
                                : (
                                    $('<span>')
                                        .addClass('check')
                                        .html('<svg width="10" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.15137 4.96423L4.15123 7.96414L9.96569 0.999907" stroke="#2D3641" stroke-linecap="round"/></svg>')
                                )
                            ),
                            $('<span>')
                                .addClass('sensei-searchable-select__list__item__inner')
                                .text(item.option)
                        )
                ));


                let $el = $('<div>')
                    .addClass(`sensei-searchable-select ${class_name} ${this.options.hideButton ? 'button-hidden' : ''}`)
                    .append(
                        $('<div>')
                        .addClass('sensei-searchable-select__container')
                        .attr('tabindex', 0)
                        .append($('<input>')
                            .addClass('sensei-searchable-select__search'+(this.options.disableSearch ? ' disabled' : ''))
                            .attr('type', 'text')
                            .attr('placeholder', SENSEI.locale.get('general.button.search'))
                        )
                        .append(list)
                    )
                    .append(
                        $('<input>')
                            .addClass('sensei-searchable-select__hidden-input sensei-validation sensei-validation__clear-on-change')
                            .attr('type', 'hidden')
                            .attr('value', selectedItem?.id)
                            .attr('data-prev-value', selectedItem?.id)
                            .attr('name', name)
                    )
                    .append(
                        $('<button>')
                            .addClass('sensei-searchable-select__button'+ (this.options.hideButton ? ' hidden' : '') + ((!selectedItem || selectedItem.disabled || this.options.emptyValues.includes(''+selectedItem.id))? ' not-selected' : ''))
                            .attr('type', 'button')
                            .attr('data-value', selectedItem?.id)
                            .append(
                                $('<span>')
                                    .addClass('sensei-searchable-select__button__inner')
                                    .text(selectedItem?.option)
                            )
                    )
                    .append(
                        $('<span>').addClass('sensei-validation sensei-validation-indicator__circle')
                    )

            this.$el.replaceWith($el);
            this.setElement($el);

            return this.$el;
        }
    });
});