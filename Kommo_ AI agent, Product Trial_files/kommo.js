define([], () => {
    let leftMenuObserver = null;
    let leftMenuItemObserver = null;

    const selector = 'a[href="/widget_page/sensei_locale_en/left_menu"], a[href="/widget_page/amo_sensei_en/left_menu"]';

    let menuItem = $(selector);
    let imgElemContainer = menuItem.find('img').parent();

    function updateMenuItem() {
        menuItem = $(selector);
        imgElemContainer = menuItem.find('img').parent();
    }

    const addActiveImg = () => {
        if (!imgElemContainer.length) {
            return;
        }

        const imgElem = imgElemContainer.find('img');

        const activeImg = imgElem.clone().attr('src', imgElem.attr('src').replace('disabled', 'enabled')).addClass('left_menu_sensei_active_icon hidden');

        imgElemContainer.append(activeImg);

        imgElem.addClass('left_menu_sensei_default_icon');
    }

    const enableMenuItem = () => {
        if (!imgElemContainer.length) {
            return;
        }

        imgElemContainer.find('.left_menu_sensei_active_icon').removeClass('hidden');
        imgElemContainer.find('.left_menu_sensei_default_icon').addClass('hidden');
    }

    const disableMenuItem = () => {
        if (!imgElemContainer.length) {
            return;
        }

        imgElemContainer.find('.left_menu_sensei_active_icon').addClass('hidden');
        imgElemContainer.find('.left_menu_sensei_default_icon').removeClass('hidden');
    }

    const checkMenuItemState = () => {
        const arrowElem = menuItem.find('svg');

        if (!arrowElem.length) {
            return;
        }

        const color = window.getComputedStyle(arrowElem[0]).color;

        if (color === 'rgb(55, 113, 214)') {
            enableMenuItem();
        } else {
            disableMenuItem();
        }
    }

    const observeMenuItem = () => {
        leftMenuItemObserver?.disconnect();

        if (!menuItem.length) {
            return;
        }

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === 'class') {
                    checkMenuItemState();
                }
            }
        }

        leftMenuItemObserver = new MutationObserver(callback);

        leftMenuItemObserver.observe(menuItem[0], { childList: false, attributes: true, subtree: false });
        leftMenuItemObserver.observe(menuItem.parent()[0], { childList: false, attributes: true, subtree: false });
    }

    const observeLeftMenu = () => {
        const leftMenu = $('#left_menu');

        if (!leftMenu.length) {
            return;
        }

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes?.length && $(mutation.addedNodes).find(selector).length) {
                    updateMenuItem();
                    addActiveImg();
                    checkMenuItemState();
                    observeMenuItem();
                }
            }
        }

        leftMenuObserver = new MutationObserver(callback);

        leftMenuObserver.observe(leftMenu[0], { childList: true, attributes: false, subtree: true });
    }

    const menuLogic = () => {
        if (!$('#nav_menu').length) {
            addActiveImg();
            checkMenuItemState();
            observeMenuItem();
            observeLeftMenu();
            return;
        }
        $('#nav_menu').find(selector).addClass('sensei_kommo_classic_menu_item');
    }

    return {
        menuLogic
    }
})