define(['jquery', 
        'underscore', 
        'twigjs', 
        'moment', 
        'lib/interface/users_select',
        'lib/common/fn',
        'lib/common/browserdetect',
        'lib/components/base/modal',
    ], function($, _, Twig, moment, UsersSelect, Fn, BrowserDetect, Modal) {
    "use strict";

    let $this,
        Widget,
        Lang;

    function F5respool(CustomWidget) {
        $this = this;
        Widget = CustomWidget;
        this.managers = this.getManagers();
        this.account = this.getAccount();
        this.system = this.getSystem();
        this.groups = this.getGroups();
        this.user = this.getUser();
        this.area = this.getArea();

        this.w_code = Widget.get_settings().widget_code
        this.w_version = Widget.get_version()
        this.w_class_name = 'f5_respool';
        this.tpl_format = '.twig';
        this._lib = {};
        this._tpls = {};
        this.modals = {};
        this._modals = {};
        this._checkElems = {};
        this._timestamp = this.currentTime();
        this.Lang;
        this._account_current;
        this.list_available_rows_count = [10, 50, 100];
		this.list_selected_rows_count_value = 100;

        this.ctrl_key = BrowserDetect.os === 'mac' ? 'altKey' : 'ctrlKey',
        this.lr_keys = {
            left: 37,
            right: 39,
        };

        this.run();
    };

    F5respool.prototype.run = function() {
        this.linkCSS('f5_respool_css', Widget.script_url + '/lib/f5.css');
        this.insertHTML('f5_modal_loader', '<div class="f5_respool_modal" id="f5_modal_loader" style="display:none;z-index:10001;"><div class="modal-scroller custom-scroll"><div class="default-overlay modal-overlay default-overlay-visible"><div class="f5_respool_msg_wrap"><span></span></div><div class="f5_respool_percents"></div><span class="modal-overlay__spinner spinner-icon spinner-icon-abs-center"></span></div></div></div>')
    };

    F5respool.prototype.hostUrl = function() {
        return 'https://' + Widget.host;
    };

    F5respool.prototype.setLangPack = function(LangPack) {
        Lang = LangPack;
    };

    F5respool.prototype.linkCSS = function(id, link, cache) {
        if (!$('#f5_style_link_' + id).get(0)) {
            $('body').append('<link id="f5_style_link_' + id + '" rel="stylesheet" href="' + link + '?v=' + Widget.get_version() + (!cache ? '&_=' + Date.now() : '') + '">');
        }
    };

    F5respool.prototype.insertCSS = function(id, styles) {
        if (!$('#f5_style_css_' + id).get(0)) {
            $('body').append('<style id="f5_style_css_' + id + '">' + styles + '</style>');
        }
    };

    F5respool.prototype.removeCSS = function(id) {
        $('#f5_style_css_' + id).remove();
    };

    F5respool.prototype.insertHTML = function(id, html) {
        if (!$('#' + id).get(0)) {
            $('body').append(html);
        }
    };

    F5respool.prototype.buildMultiSelectForInput = function($typeInput, $input, elements) {
        var html = `
				<div class="checkboxes_dropdown__list custom-scroll checkboxes_dropdown__expanded-to-top" style="position: static; display: block; margin-top: 10px; width: 100%; margin-bottom: 10px">
					<div class="checkboxes_dropdown__list__wrapper__inner respool_checkboxes">
			`,
            arElements = {},
            selectedIds = $input ? $input.val().split(',') : [];

        elements.forEach(function(element) {
            if (!element.is_active) return;
            if (arElements[element.group_id] != undefined) {
                arElements[element.group_id].users.push({
                    id: element.id,
                    value: element.value,
                });
            } else {
                arElements[element.group_id] = {
                    group_name: element.group_name,
                    users: [{
                        id: element.id,
                        value: element.value,
                    }]
                };
            }
        });
        for (var e in arElements) {
            html += `
				<div class="respool_w group_checkbox checkboxes_dropdown__item" style="">
					<label class="control-checkbox checkboxes_dropdown__label ${selectedIds.indexOf(e.toString())!=-1?'is-checked':''}">
						<div class="control-checkbox__body">
							<input class="js-item-checkbox respool_input" ${selectedIds.indexOf(e.toString())!=-1?'checked':''} data-type="group" value="${e}" data-value="1" type="checkbox">
							<span class="control-checkbox__helper"></span>
						</div>
						<div class="control-checkbox__text element__text checkboxes_dropdown__label_title" title="${arElements[e].group_name}">
							${arElements[e].group_name}
						</div>
					</label>
			`;
            arElements[e].users.forEach(function(user) {
                html += `
					<div class="respool_w user_checkbox checkboxes_dropdown__item" style="">
						<label class="control-checkbox checkboxes_dropdown__label ${selectedIds.indexOf((user.id).toString())!=-1?'is-checked':''}">
							<div class="control-checkbox__body">
								<input class="js-item-checkbox respool_input" ${selectedIds.indexOf((user.id).toString())!=-1?'checked':''} data-type="user" value="${user.id}" data-value="1" type="checkbox">
								<span class="control-checkbox__helper"></span>
							</div>
							<div class="control-checkbox__text element__text checkboxes_dropdown__label_title" title="${user.value}">
								${user.value}
							</div>
						</label>
					</div>
				`;
            });
            html += `</div>`;
        };

        html += `
				</div>
			</div>
		`;
        $input.after(html);
        $input.hide();
        $typeInput.hide();
        $typeInput.parents().eq(1).hide();
        let $hiddenInput = $input.parent().find('.control--select .control--select--input');
        $hiddenInput.on('change', function() {
            $input.val($(this).val()).trigger('change');
        });
        $hiddenInput.trigger('change');
        setTimeout(() => {
            $('.group_checkbox>label input:checked').trigger('change');
        }, 100);
    };

    F5respool.prototype.buildSbUsersMultiSelectForInput = function($hiddenTypeInput, $typeInput, $hiddenInput, $input, $field, users) {
        let groups = [];
        users.forEach(User => {
            if (!User.is_active) return;
            if (groups[User.group_id] != undefined) {
                groups[User.group_id].users.push({
                    id: User.id,
                    name: User.name,
                });
            } else {
                groups[User.group_id] = {
                    id: User.group_id,
                    name: User.group_name,
                    users: [{
                        id: User.id,
                        name: User.name,
                    }]
                };
            }
        });
        $this.renderTemplate('dp/users', {
            groups,
            selected: $input ? _($input.val().split(',')).map(i => +i) : []
        }).then(output => {
            $field.append(output);

            $field.find('.respool_input').on('change', function() {
                var _input = $(this),
                    type = _input.data('type'),
                    is_checked = _input.prop('checked');
                if (type == 'group' && is_checked) {
                    _input.parents('.group_checkbox').find('.user_checkbox label input').attr('disabled', 1).prop('checked', 1);
                    _input.parents('.group_checkbox').find('.user_checkbox').addClass('disabled_checkbox');
                    _input.parents('.group_checkbox').siblings().each(function() {
                        if (!_input.find('label input').prop('checked')) {
                            _input.find('.user_checkbox label input').prop('checked', 0).attr('disabled', 1);
                            _input.find('.user_checkbox').addClass('disabled_checkbox');
                        }
                    });
                    $typeInput.val('group').trigger('change');
                    $hiddenTypeInput.val('group').trigger('change');
                } else if (type == 'group' && !is_checked) {
                    _input.parents('.group_checkbox').find('.user_checkbox label input').prop('checked', 0)
                    if (!$('.group_checkbox>label input:checked').length) {
                        _input.parents('.group_checkbox').find('.user_checkbox label input').removeAttr('disabled');
                        _input.parents('.group_checkbox').find('.user_checkbox').removeClass('disabled_checkbox');
                    }
                    _input.parents('.group_checkbox').siblings().each(function() {
                        if (!_input.find('label input').prop('checked') && !$('.group_checkbox>label input:checked').length) {
                            _input.find('.user_checkbox').removeClass('disabled_checkbox');
                            _input.find('.user_checkbox label input').removeAttr('disabled');
                            if (_input.find('.user_checkbox label input').prop('checked') && !$('.group_checkbox>label input:checked').length) {
                                $typeInput.val('user').trigger('change');
                                $hiddenTypeInput.val('user').trigger('change');
                            } else {
                                $typeInput.val('').trigger('change');
                                $hiddenTypeInput.val('').trigger('change');
                            }
                        }
                    });
                } else if (type == 'user' && is_checked && $('.group_checkbox>label input:checked').length) {
                    F5.error(Lang('dp.respool_change_linked'), Lang('dp.respool_change_linked'));
                    _input.prop('checked', 0);
                    return false;
                }

                switch (true) {
                    case !$('.user_checkbox>label input:checked').length && !$('.group_checkbox>label input:checked').length:
                        $typeInput.val('').trigger('change');
                        $hiddenTypeInput.val('').trigger('change');
                        break;
                    case $('.user_checkbox>label input:checked').length && !$('.group_checkbox>label input:checked').length:
                        $typeInput.val('user').trigger('change');
                        $hiddenTypeInput.val('user').trigger('change');
                        break;
                    default:
                        break;
                }

                let arr_ids = [];
                $field.find(`.${$typeInput.val()}_checkbox>label input:checked`).each(function() {
                    arr_ids.push($(this).val());
                });
                $input.val(arr_ids.join(',')).trigger('change');
                $hiddenInput.val(arr_ids.join(',')).trigger('change');
            });
        });
    }

    F5respool.prototype.buildSelectForInput = function($input, elements) {
        var options = {
            id: $input.attr('id') || '',
            class_name: $input.attr('class') || '',
            name: $input.attr('name') || '',
            selected: $input.val() || '',
            items: elements
        };
        $input.after(
            Widget.render({ ref: '/tmpl/controls/select.twig' }, options)
        );
        $input.hide();
        let $hiddenInput = $input.parent().find('.control--select .control--select--input');
        $hiddenInput.on('change', function() {
            $input.val($(this).val()).trigger('change');
        });
        $hiddenInput.trigger('change');
    };

    F5respool.prototype.buildSbSelectForField = function($field, $input, elements) {
        var options = {
            id: $input.attr('id') || '',
            class_name: $input.attr('class') || '',
            name: $field.attr('data-field-name') || '',
            selected: $input.val() || '',
            items: elements
        };
        $field.append(
            Widget.render({ ref: '/tmpl/controls/select.twig' }, options)
        );
        let $control = $field.find('.control--select'),
            $hiddenInput = $control.find('.control--select .control--select--input');
        $control.addClass(`${this.w_class_name}-control-select ${this.w_class_name}-control-input`);
        $hiddenInput.on('change', function() {
            $input.val($(this).val()).trigger('change');
        });
        $hiddenInput.trigger('change');
    };

    F5respool.prototype.buildSbCheckboxForField = function($field, $input, disabled = false) {
        var input_val = $input.val(),
            options = {
                id: $input.attr('id') || '',
                class_name: $input.attr('class') || '',
                name: $field.attr('data-field-name') || '',
                checked: input_val === 'Y',
                value: $input.val(),
                disabled,
            };
        $field.append(
            Widget.render({ ref: '/tmpl/controls/checkbox.twig' }, options)
        );
        let $control = $field.find('.control-checkbox'),
            $hiddenInput = $control.find('input[type="checkbox"]');
        $control.addClass(`${this.w_class_name}-control-checkbox ${this.w_class_name}-control-input`);
        $hiddenInput.on('change', function() {
            var is_checked = $(this).prop('checked'),
                val = is_checked ? 'Y' : 'N';
            $input.val(val).trigger('change');
            $hiddenInput.val(val);
        });
        $hiddenInput.trigger('change');
    };

    F5respool.prototype.buildSbWorkTimeForInput = function($from, $to) {
        return new Promise(function(resolve, reject) {
            $this.renderTemplate('dp/work_time', {
                value_from: $from.val(),
                valeu_to: $to.val()
            }).then(output => {
                resolve(output);
            });
        });
    }
    F5respool.prototype.buildCheckboxForInput = function($input, label) {
        var options = {
            id: $input.attr('id') ? $input.attr('id') + '_checkbox' : '',
            class_name: $input.attr('class') || '',
            checked: $input.val() === 'Y',
            disabled: $input.data('disabled') || '',
            value: $input.val() || '',
            text: label,
            additional_data: 'title="' + ($input.attr('title') || '') + '"',
        };
        $input.after(
            Widget.render({ ref: '/tmpl/controls/checkbox.twig' }, options)
        );
        $input.hide();
        let $checkbox = $input.parent().find('input[type=checkbox]');
        $checkbox.on('change', function() {
            let val = 'N';
            if ($(this).prop('checked')) val = 'Y';
            $input.val(val).trigger('change');
        });
        $checkbox.trigger('change');
    };

    F5respool.prototype.buildWeekdaysForInput = function($input, $field = null) {
        let checked_work_days = {},
            days = $input.val() || 'Monday,Tuesday,Wednesday,Thursday,Friday',
            days_arr = days.split(',');

        days_arr.forEach(d => {
            if (d) checked_work_days[d] = true;
        });

        let options = {
            input_class_name: 'dp_respool_work_days',
            checked: checked_work_days
        };
        if ($field) {
            options.name = $field.attr('data-field-name') || '';
        }

        $input.val(days_arr.join(',')).trigger('change');

        $this.renderTemplate('dp/work_days', options)
            .then(output => {
                if ($field) {
                    $field.append(output);
                    $input = $(`[name="${options.name}"]`);
                } else {
                    $input.hide();
                    $input.after(output);
                    $field = $input.parents('.form-group');
                }

                $field.on('change', '.dp_respool_work_days', function() {
                    let is_checked = $(this).prop('checked'),
                        index = days_arr.indexOf($(this).data('id'));

                    if (is_checked && index == -1) days_arr.push($(this).data('id'));
                    if (!is_checked && index > -1) days_arr.splice(index, 1);

                    $input.val(days_arr.join(',')).trigger('change');
                });
            })
            .catch(r => {
                $this.error(Lang('errors.response.error'));
            });
    };

    F5respool.prototype.elementSelectRender = function($select) {
        var options = {
                id: $select.attr('id') || '',
                class_name: $select.attr('class') || '',
                name: $select.attr('name') || '',
                selected: $select.find('option:selected').val() || '',
                items: []
            },
            Widget = APP.widgets.list[Object.keys(APP.widgets.list)[0]];

        $select.find('option').each(function() {
            options.items.push({
                option: $(this).html().trim(),
                id: $(this).val()
            });
        });
        $select.replaceWith(
            Widget.render({ ref: '/tmpl/controls/select.twig' }, options)
        );
    };

    F5respool.prototype.getTwigTemplate = function(template, params, callback = () => {}) {
        params = (typeof params == 'object') ? params : {};
        params = Object.assign(params, $this.getTemplateHelpers());
        template = template || '';

        return Widget.render({
            href: '/tpl/twig/' + template + '.twig',
            base_path: Widget.script_url,
            v: Widget.get_version(),
            load: callback
        }, params);
    }

    F5respool.prototype.getTemplateHelpers = function() {
        return {
            tpl_format: $this.tpl_format,
            translate: $this.translate,
            i18n: $this.i18n,
            numeralWord: $this.numeralWord,
            pluralize: $this.pluralize,
            include_tmpl: $this.includeTmpl,
            _: _,
            moment: moment,
            widget_class_name: $this.w_class_name,
        }
    }

    F5respool.prototype.getTemplate = function(template, params, callback) {
        params = typeof params == 'object' ? params : {}
        template = template || ''

        return Widget.render({
                href: template + $this.tpl_format,
                base_path: Widget.script_url + '/tpl/twig/',
                load: callback,
            },
            params,
        )
    }

    F5respool.prototype.renderTemplate = function(template, params) {
        let key_tpl = template.replace('/', '_')
        params = Object.assign(params, $this.getTemplateHelpers());
        return new Promise(function(resolve, reject) {
            try {
                if ($this._tpls[key_tpl] === undefined) {
                    $this.getTemplate(template, {}, function(tpl) {
                        $this._tpls[key_tpl] = tpl
                        resolve(tpl.render(params));
                    })
                } else {
                    resolve($this._tpls[key_tpl].render(params))
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    F5respool.prototype.getAmoTemplate = (template, params = {}) => {
		return Twig({ref: `/tmpl/${template}${$this.tpl_format}`}).render(params);
	}

    F5respool.prototype.elementsCheckboxRender = function(selector) {
        $(selector).each(function() {
            $this.elementCheckboxRender($(this));
        });
    };

    F5respool.prototype.elementCheckboxRender = function($input) {
        let id = $input.attr('id') || '',
            class_name = $input.attr('class') || '',
            name = $input.attr('name') || '',
            value = $input.val() || '',
            checked = $input.prop('checked');

        $input.replaceWith('<label id="' + id + '" class="control-checkbox f5-control-checkbox ' + class_name + '">' +
            '<div class="control-checkbox__body">' +
            '<input type="checkbox" name="' + name + '" value="' + value + '" ' + (checked ? 'checked' : '') + '>' +
            '<span class="control-checkbox__helper"></span>' +
            '</div>' +
            '</label>');
    };

    F5respool.prototype.elementsSelectRender = function(selector) {
        $(selector).each(function() {
            $this.elementSelectRender($(this));
        });
    };

    F5respool.prototype.side = function(arg, callback) {
        var param = {
                code: arg.code || 'respool',
                side_bg: arg.side_bg || '#ECA140',
                body_bg: arg.body_bg || '#fff',
                contents: arg.contents || '',
                opened: arg.opened || false
            },
            id = param.code + '_widget_side',
            callback = callback || function() {};

        if ($('#' + id).get(0)) {
            $('#' + id).remove();
        }
        if ($('#card_holder').hasClass('js-widgets-hidden')) {
            $('#card_holder').removeClass('js-widgets-hidden');
        }
        Widget.render_template({
            body: '',
            render: param.contents,
            caption: {
                class_name: 'js-aci-caption-respool',
                html: ''
            }
        });
        this.onElementReady('.card-widgets__widget.card-widgets__widget-' + Widget.params.widget_code, function($Side) {
            let $Body = $Side.find('.card-widgets__widget__body');
            $Side.attr({ id: id });
            $Side.find('.card-widgets__widget__caption').css('background', param.side_bg);
            $Side.find('.card-widgets__widget__body').css('background', param.body_bg);
            if (param.opened && !$Body.hasClass('js-body-hide')) {
                $Body.addClass('js-body-hide').show();
            }
            $Body.css('padding', 0);
            return callback($Side);
        });
    };

    F5respool.prototype.modal = function(arg) {
        var $Modal,
            arg = arg || {},
            load_cheker_id = 'f5_modal_load_cheker_' + (arg.id || 'f5_' + Date.now()),
            param = {
                id: arg.id || 'f5',
                classname: arg.classname || '',
                width: arg.width || 500,
                minheight: arg.minheight || false,
                header: arg.header || '',
                html: (arg.html || '') + '<div id="' + load_cheker_id + '"></div>',
                noclose: arg.noclose || false,
                close_confirm: arg.close_confirm || false,
                close_confirm_text: arg.close_confirm_text || Lang('close.confirm'),
                callback: arg.callback || false,
                hide: arg.hide || false,
                destroy: arg.destroy || false,
                disable_overlay_click: arg.disable_overlay_click === undefined ? true : arg.disable_overlay_click
            };
        require(['lib/components/base/modal'], function(Modal) {
            new Modal({
                custom_id: param.id,
                class_name: 'f5_respool_modal ' + param.classname,
                close_confirm: param.close_confirm,
                disable_overlay_click: param.disable_overlay_click,
                init: function(modal_window) {
                    $Modal = modal_window.parents('.f5_respool_modal');
                    $Modal.find('.modal-overlay__spinner').replaceWith(`
						<div class="f5-modal-loader f5_respool-modal-loader">
							<div class="f5-modal-loader-spinner f5_respool-modal-loader-spinner">
								<div class="bubble-1"></div>
								<div class="bubble-2"></div>
							 </div>
						</div>`);
                    modal_window.attr({ id: 'modal_' + param.id }).css('width', param.width + 'px').html(param.html).trigger('modal:centrify');

                    if (arg.hide) {
                        modal_window.css('display', 'none');
                    }
                    if (param.minheight) {
                        modal_window.css('min-height', param.minheight + 'px');
                    }
                    if (!param.noclose) {
                        modal_window.append('<span id="modal_closer_' + param.id + '" class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                    }
                    if (param.header) {
                        modal_window.prepend('<div class="f5-modal-header">' + param.header + '</div>');
                    }
                    $this._modals[param.id] = this;
                    $this.modals[param.id] = modal_window;
                    setTimeout(function(modal_window, arg) {
                        $this.modals[param.id].trigger('modal:centrify');
                        if (arg.hide) {
                            modal_window.css('display', 'none');
                        }
                    }, 100, modal_window, arg);
                },
                destroy: function() {
                    if (param.destroy) {
                        if (typeof param.destroy == 'object') {
                            return param.destroy.object[param.destroy.method](this);
                        }
                        return param.destroy(this);
                    }
                    return !this.close_confirm ? true : true;
                }
            });
            var modal_rendered = setInterval(function() {
                if ($('#' + load_cheker_id).get(0)) {
                    clearInterval(modal_rendered);
                    $('#' + load_cheker_id).remove();
                    if (!arg.hide) {
                        $Modal.find('.f5-modal-loader').hide();
                    }
                    if (param.callback) {
                        if (typeof param.callback == 'object') {
                            return param.callback.object[param.callback.method]($this.modals[param.id], $this._modals[param.id]);
                        }
                        return param.callback($this.modals[param.id], $this._modals[param.id]);
                    }
                }
            }, 101);
        });
    };

    F5respool.prototype.declension = function(num, expressions) {
        let result,
            count = num % 100;
        if (count >= 5 && count <= 20) {
            result = expressions[2];
        } else {
            count = count % 10;
            if (count == 1) {
                result = expressions[0];
            } else if (count >= 2 && count <= 4) {
                result = expressions[1];
            } else {
                result = expressions[2];
            }
        }
        return result;
    };

    F5respool.prototype.getTpl = function(name = false) {
        return name ? $this._tpls[name] : $this._tpls;
    }

    F5respool.prototype.tpl = function(name, replace = {}, callback = false) {
        if (typeof replace == 'function') {
            callback = replace;
            replace = {};
        }
        if ($this._tpls[name]) {
            return $this.parseTpl($this._tpls[name], replace, callback);
        }
        this.requireTpl(name, function(tpls) {
            return $this.parseTpl(tpls[name], replace, callback);
        });
    };

    F5respool.prototype.parseTpl = function(data, replace = {}, callback = false) {
        replace['script_url'] = Widget.script_url;
        let contents = data.replace(/{{([^}]+)}}/g, function(s, key) {
            if ($this.key_exists(key, replace)) {
                return '' + replace[key];
            } else {
                if (Lang(key) !== false) {
                    return $this.parseTpl(Lang(key), replace);
                }
                return s;
            }
        });
        if (!callback) {
            return contents;
        }
        callback(contents);
    }

    F5respool.prototype.tplModal = function(tpl_name, modal_opts) {
        let replace = modal_opts.replace || {};
        modal_opts.id = tpl_name.replace(/\./g, '_');
        this.tpl(tpl_name, replace, function(data) {
            modal_opts.html = data;
            $this.modal(modal_opts);
        })
    };

    F5respool.prototype.requireTpl = function(names = [], callback) {
        if (typeof names == 'string') {
            names = [names];
        }
        $.each(names, function(i, name) {
            if (!$this._tpls[name]) {
                $.get(Widget.script_url + '/tpl/' + name.replace(/\./g, '/') + '.html')
                    .done(function(data) {
                        $this._tpls[name] = data;
                    });
            }
        })
        this.onFunctionTrue(function() {
            let tpls = $this.getTpl(),
                exists_all = $this.key_exists(names, tpls);
            if (exists_all) {
                callback(tpls);
            }
            return exists_all;
        }, function() {});
    };

    F5respool.prototype.onElementReady = function(selector, callback, arg, delay, id) {
        var $this = this,
            callback = callback || false,
            arg = arg || false,
            delay = parseInt(delay) || 100,
            id = id || selector + '_' + Date.now();

        if ($this._checkElems[id]) {
            clearInterval($this._checkElems[id]);
        }
        $this._checkElems[id] = setInterval(function(selector, id, callback, arg) {
            if ($(selector).length > 0) {
                clearInterval($this._checkElems[id]);
                $this._checkElems[id] = false;
                if (callback) {
                    if (typeof callback == 'object') {
                        return callback.object[callback.method](arg || $(selector));
                    }
                    return callback(arg || $(selector));
                }
            }
        }, delay, selector, id, callback, arg);
        return $this._checkElems[id];
    };

    F5respool.prototype.onFunctionTrue = function(f, callback, arg, delay) {
        var $this = this,
            callback = callback || function() {},
            arg = arg || false,
            delay = parseInt(delay) || 100,
            _checkVar;
        if (f()) {
            if (typeof callback == 'object') {
                return callback.object[callback.method](arg);
            }
            return callback(arg);
        }
        _checkVar = setInterval(function(funct, arg) {
            if (funct()) {
                clearInterval(_checkVar);
                if (typeof callback == 'object') {
                    return callback.object[callback.method](arg);
                }
                return callback(arg);
            }
        }, delay, f, arg);
        return _checkVar;
    };

    F5respool.prototype.loaderShow = function(delay, msg) {
        var msg = msg || '',
            delay = parseInt(delay || 500);
        $('#f5_modal_loader .f5_ml_msg_wrap > span').html(msg);
        $('#f5_modal_loader').fadeIn(delay);
    };

    F5respool.prototype.loaderHide = function(delay) {
        var delay = parseInt(delay || 500);
        $('#f5_modal_loader').fadeOut(delay);
        $('#f5_modal_loader .f5_ml_msg_wrap > span').html('');
        $('#f5_modal_loader .f5_ml_percents').html('');
    };

    F5respool.prototype.loaderPrc = function(prc) {
        var prc = parseInt(prc || 0);
        $('#f5_modal_loader .f5_ml_percents').html(prc + '%');
    };

    F5respool.prototype.loaderMsg = function(msg) {
        var msg = msg || '';
        $('#f5_modal_loader .f5_ml_msg_wrap > span').html(msg);
    };

    F5respool.prototype.currentTime = function() {
        return Date.now() / 1000 | 0;
    };

    F5respool.prototype.successModal = function(msg = 'Готово!') {
        this.modal({
            width: 550,
            noclose: true,
            html: '<div class="modal-body__inner modal-body__inner-success js-modal-success"><div class="modal-body__inner__success"><span class="icon icon-inline icon-modal-success"></span></div><p class="modal-body__innner__message-success">' + msg + '</p></div>',
            callback: function($Body, Modal) {
                setTimeout(function(Modal) {
                    Modal.destroy();
                }, 1000, Modal);
            }
        });
    };

    F5respool.prototype.confirm = (opts = {}, callback, failback, customback) => {
        var callback = callback || function () { },
            failback = failback || function () { },
            customback = customback || function () { };

        $this.renderTemplate('controls/confirm', {
            header: opts.header || '',
            confirm_text_1: opts.confirm_text_1 || "",
            confirm_text_2: opts.confirm_text_2 || "",
            accept_text: opts.accept_text || Lang('action.accept'),
            cancel_text: opts.cancel_text || Lang('action.cancel'),
            custom_text: opts.custom_text || Lang('action.custom'),
            accept_id: opts.accept_id || "",
            accept_class_name: opts.accept_class_name || "",
            cancel_id: opts.cancel_id || "",
            cancel_class_name: opts.cancel_class_name || "",
            custom_id: opts.custom_id || "",
            custom_class_name: opts.custom_class_name || "",
            custom: opts.custom || false
        }).then(output => {
            let modal_params = {
                width: 500,
                html: output,
                callback: ($Body, Modal) => {
                    $Body.html(output);
                    $Body.on('click', '.js-modal-accept', function () {
                        callback();
                        Modal.options.destroy = function () { }
                        Modal.destroy();
                        return false;
                    }).on('click', '.button-cancel', () => {
                        Modal.destroy();
                    }).on('click', '.button-custom', () => {
                        customback($Body, Modal);
                        return true;
                    });
                    Modal.options.destroy = test => {
                        failback();
                        return true;
                    }

                },
            }
            return $this.modal(modal_params)
        });
    };

    F5respool.prototype.notify = function(header, message, wait_time) {
        var h = header || 'Виджет',
            m = message || '',
            t = wait_time || 6000,
            id = 'sp_info_msg_' + Date.now();

        $('#popups_inbox .popup-inbox').append('<div id="' + id + '" class="notification__item notification-bot"><div class="notification-chat__non-select"><img class="notification-bot__avatar" src="/frontend/images/interface/inbox/mesage_bot_avatar.png"></div><div class="notification-bot__container_text"><div class="notification-bot__info_message"><h2 class="notification-bot__title">' + h + '</h2></div><p class="notification-bot__text__message is-truncated" style="word-wrap: break-word;">' + m + '</p></div></div>');

        $('#popups_inbox').css('z-index', 9001);
        setTimeout(function() {
            $('#popups_inbox').css('z-index', 101);
        }, t);

        setTimeout(function(id) {
            $('#' + id).fadeOut(100).remove();
        }, t, id);
    };

    F5respool.prototype.error = function(header, message, wait_time) {
        var h = header || 'Виджет',
            m = message || '',
            t = wait_time || 6000,
            id = 'sp_info_msg_' + Date.now();

        $('#popups_inbox .popup-inbox').append('<div id="' + id + '" class="notification__item notification-bot"><div class="notification-chat__non-select"><img class="notification-bot__avatar" src="/frontend/images/interface/inbox/error_mesage_bot_avatar.png"></div><div class="notification-bot__container_text"><div class="notification-bot__info_message"><h2 class="notification-bot__title">' + h + '</h2></div><p class="notification-bot__text__message is-truncated" style="word-wrap: break-word;">' + m + '</p></div></div>');

        $('#popups_inbox').css('z-index', 9001);
        setTimeout(function() {
            $('#popups_inbox').css('z-index', 101);
        }, t);

        setTimeout(function(id) {
            $('#' + id).fadeOut(100).remove();
        }, t, id);
    };

    F5respool.prototype.requireAccountCurrent = function(callback) {
        if (this._account_current) {
            return callback(this._account_current);
        }
        require([Widget.script_url + '/model/AccountCurrent.js', Widget.script_url + '/support/Collection.js'], function(AccountCurrent, Collection) {
            $this.rest('GET', '/api/v2/account?with=pipelines,custom_fields')
                .done(function(data) {
                    $this._account_current = new AccountCurrent(data, Widget, $this, Lang, Collection);
                    callback($this._account_current);
                });
        });
    };

    F5respool.prototype.rest = function(method, url, data) {
        return $.ajax({
            type: method,
            url: url,
            data: { 'request': data },
            dataType: 'json'
        });
    };

    F5respool.prototype.form = function($form) {
        let k = {},
            c = $form.serializeArray();
        jQuery.each(c, function() {
            void 0 !== k[this.name] ? (k[this.name].push || (k[this.name] = [k[this.name]]),
                k[this.name].push(this.value || '')) : k[this.name] = this.value || ''
        });
        return k
    };

    F5respool.prototype.json_encode = function(a) {
        return JSON.stringify(a).replace(/&/g, '%26');
    };

    F5respool.prototype.setCookie = function(name, value, options) {
        options = options || {};
        options.domain = options['domain'] || window.location.host;
        options.path = options['path'] || '/';
        var expires = options.expires;
        if (typeof expires == 'number' && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 60 * 60 * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        document.cookie = updatedCookie;
        return this.getCookie(name);
    };

    F5respool.prototype.getCookie = function(name) {
        var nameEQ = name + '=',
            ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    F5respool.prototype.removeCookie = function(name) {
        return this.setCookie(name, '', { expires: -1 });
    };

    F5respool.prototype.htmlSO = function(obj, v) {
        var values = [],
            v = v || false;
        $.each(obj, function(key, val) {
            let d = [];
            if (typeof val == 'undefined') {
                return true;
            }
            if (val.id) {
                key = val.id;
            }
            if (typeof(val) == 'object') {
                if (val.data && typeof(val.data) == 'object') {
                    $.each(val.data, function(dk, dv) {
                        d.push('data-' + dk + '="' + dv + '"');
                    });
                }
                if (val.title) {
                    val = val.title;
                } else if (val.name) {
                    val = val.name;
                }
            }
            let selected = '';
            if (v) {
                if (typeof v == 'object') {
                    let isset = false;
                    $.each(v, function(i, val) {
                        if (key == val) {
                            isset = true;
                        }
                    });
                    if (isset) {
                        selected = ' selected';
                    }
                } else if (key == v) {
                    selected = ' selected';
                }
            }
            values.push('<option value="' + key + '"' + selected + ' ' + d.join(' ') + '>' + val + '</option>');
        })
        return values.join("\n");
    };

    F5respool.prototype.pageReload = function(callback) {
        var callback = callback || false,
            model = this.currentModel();
        if (model) {
            this.currentModel().changed = {};
        }
        this.currentCard().changes.has_changes = false;
        setTimeout(function(callback) {
            APP.router.navigate(location.pathname + '?r=' + Date.now(), {
                trigger: true,
                replace: true
            });
            if (callback) {
                if (typeof callback == 'object') {
                    return callback.object[callback.method]();
                }
                return callback();
            }
        }, 300, callback);
    };

    F5respool.prototype.accountUrl = function() {
        return 'https://' + this.getSystem().domain;
    }

    F5respool.prototype.currentCard = function() {
        return APP.data.current_card;
    };

    F5respool.prototype.currentModel = function() {
        return APP.data.current_card.model;
    };

    F5respool.prototype.ObjectToArray = function(o) {
        var arr = [];
        for (var key in o) {
            arr.push(o[key]);
        }
        return arr;
    };

    F5respool.prototype.ObjectSort = function(o) {
        return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    };

    F5respool.prototype.key_exists = function(key, obj) {
        if (typeof key == 'object') {
            let in_obj = true;
            $.each(key, function(i, k) {
                if (!$this.key_exists(k, obj)) {
                    in_obj = false;
                }
            });
            return in_obj;
        }
        return obj[key] !== undefined;
    };

    F5respool.prototype.in_array = function(val, arr) {
        if (typeof val == 'object') {
            let in_arr = true;
            $.each(val, function(i, item) {
                if (!$this.in_array(item, arr)) {
                    in_arr = false;
                }
            });
            return in_arr;
        }
        return arr.indexOf(val) > -1;
    };

    F5respool.prototype.merge = function() {
        let merged = {};
        $.each(arguments, function(i, arg) {
            $.each(arg, function(key, val) {
                merged[key] = val;
            });
        });
        return merged;
    };

    F5respool.prototype.number_format = function(number, decimals, dec_point, thousands_sep) {
        number = number * 1;
        var str = number.toFixed(decimals ? decimals : 0).toString().split('.');
        var parts = [];
        for (var i = str[0].length; i > 0; i -= 3) {
            parts.unshift(str[0].substring(Math.max(0, i - 3), i));
        }
        str[0] = parts.join(thousands_sep ? thousands_sep : ',');
        return str.join(dec_point ? dec_point : '.');
    };

    F5respool.prototype.fileSizeFormat = function(sizeInBytes) {
        let i = -1,
            byteUnits = [' KB', ' MB', ' GB'];
        do {
            sizeInBytes = sizeInBytes / 1024;
            i++;
        } while (sizeInBytes > 1024);

        return Math.max(sizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    };

    F5respool.prototype.getAccount = function() {
        return APP.constant('account');
    };

    F5respool.prototype.getSystem = function() {
        return APP.widgets.system;
    };

    F5respool.prototype.getManagers = function(id = null) {
        let managers = APP.constant('managers');
        if (!id) {
            return managers;
        }
        return managers[id] || null;
    };

    F5respool.prototype.getGroups = function(id = null) {
        let object = APP.constant('groups'),
            groups = {};
        _(object).each((name, code) => {
            let gid = code.match(/group_(.+)/i)[1];
            if (gid) groups[gid] = name;
        });
        if (_(id).isNull()) {
            return groups;
        }
        return groups[id] || null;
    };

    F5respool.prototype.getUser = function() {
        return APP.constant('user');
    };

    F5respool.prototype.getUserRights = function() {
        return APP.constant('user_rights');
    };

    F5respool.prototype.genStr = function(length = 5) {
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(
                possible.charAt(Math.floor(Math.random() * possible.length))
            );
        }
        return arr.join('');
    };

    F5respool.prototype.inArea = function(vals) {
        return this.in_array(this.getArea(), vals);
    };

    F5respool.prototype.hasArea = function(val) {
        return this.getArea() === val;
    };

    F5respool.prototype.getArea = function() {
        var area = this.getSystem().area || false;
        if (!area || area == 'outer_space') {
            if (location.href.indexOf(this.system.domain + '/leads/add') > 0) {
                area = 'addlcard';
            }
            if (location.href.indexOf(this.system.domain + '/leads/pipeline') > 0) {
                area = 'pipeline';
            }
            if (location.href.indexOf(this.system.domain + '/leads/list') > 0) {
                area = 'llist';
            }
            if (location.href.indexOf(this.system.domain + '/leads/detail') > 0) {
                area = 'lcard';
            }
            if (location.href.indexOf(this.system.domain + '/leads/list/unsorted') > 0) {
                area = 'unsorted_list';
            }
            if (location.href.indexOf(this.system.domain + '/todo/list') > 0) {
                area = 'tlist';
            }
            if (location.href.indexOf(this.system.domain + '/todo/line') > 0) {
                area = 'todoline';
            }
            if (location.href.indexOf(this.system.domain + '/todo/calendar') > 0) {
                area = 'calendar';
            }
            if (location.href.indexOf(this.system.domain + '/stats/') > 0) {
                area = 'analityc';
                if (location.href.indexOf(this.system.domain + '/stats/goals') > 0) {
                    area = 'analitycgoals';
                }
                if (location.href.indexOf(this.system.domain + '/stats/calls') > 0) {
                    area = 'analityccalls';
                }
                if (location.href.indexOf(this.system.domain + '/stats/by_activities') > 0) {
                    area = 'analitycactivities';
                }
                if (location.href.indexOf(this.system.domain + '/stats/consolidated') > 0) {
                    area = 'analitycconsolidated';
                }
            }
            if (location.href.indexOf(this.system.domain + '/events/list') > 0) {
                area = 'analitycevents';
            }
            if (location.href.indexOf(this.system.domain + '/mail/') > 0) {
                area = 'mail';
                if (location.href.indexOf(this.system.domain + '/mail/inbox') > 0) {
                    area = 'mailinbox';
                }
                if (location.href.indexOf(this.system.domain + '/mail/sent') > 0) {
                    area = 'mailsent';
                }
                if (location.href.indexOf(this.system.domain + '/mail/thread') > 0) {
                    area = 'mailthread';
                }
                if (location.href.indexOf(this.system.domain + '/mail/sent') > 0) {
                    area = 'maildeleted';
                }
            }
            if (location.href.indexOf(this.system.domain + '/settings/') > 0) {
                area = 'settings';
                if (location.href.indexOf(this.system.domain + '/settings/profile') > 0) {
                    area = 'profile';
                }
                if (location.href.indexOf(this.system.domain + '/settings/pay') > 0) {
                    area = 'settings_pay';
                }
            }
        } else {
            if (area == 'clist' && location.href.indexOf(this.system.domain + '/contacts/list') > 0) {
                area = 'clistall';
                if (location.href.indexOf(this.system.domain + '/contacts/list/contacts') > 0) {
                    area = 'clist';
                }
                if (location.href.indexOf(this.system.domain + '/contacts/list/companies') > 0) {
                    area = 'comlist';
                }
            }
            if (area == 'lcard' && location.href.indexOf(this.system.domain + '/leads/add') > 0) {
                area = 'addlcard';
            }
            if (area == 'ccard' && location.href.indexOf(this.system.domain + '/contacts/add') > 0) {
                area = 'addccard';
            }
            if (area == 'comcard' && location.href.indexOf(this.system.domain + '/companies/add') > 0) {
                area = 'addcomcard';
            }
        }
        return this.area = area;
    };

    F5respool.prototype.pluralize = function(num, text_forms) {
        text_forms = typeof text_forms == 'string' ? text_forms.split(",") : text_forms;
        let n = Math.abs(num) % 100;
        var n1 = n % 10;
        if (n > 10 && n < 20) { return num + " " + text_forms[2]; }
        if (n1 > 1 && n1 < 5) { return num + " " + text_forms[1]; }
        if (n1 == 1) { return num + " " + text_forms[0]; }
        return num + " " + text_forms[2];
    }

    F5respool.prototype.includeTmpl = function(name, params) {
        return Widget.render({ ref: '/tmpl/' + name + $this.tpl_format }, params);
    }

    F5respool.prototype.translate = function(key, replace = {}) {
        let text = Lang(key);
        if (text !== false) {
            text = text.replace(/{{([^}]+)}}/g, function(s, key) {
                if (replace.hasOwnProperty(key)) {
                    return '' + replace[key];
                } else {
                    if (Lang(key) !== false) {
                        return $this.translate(Lang(key), replace);
                    }
                    return s;
                }
            });
        }
        return text;
    }

    F5respool.prototype.buildChangersForUsersInputs = function($inputs) {
        $inputs.each(function() {
            $this.buildChangerForUsersInput($(this));
        });
    };

    F5respool.prototype.buildChangerForUsersInput = function($input) {
        let $box = $input.parent(),
            user_id = $input.attr('id'),
            input_name = $input.attr('name'),
            input_value = $input.val(),
            checked = input_value ? 'checked' : '';

        $box.append(`<label class="control-checkbox f5-user-changer">
			 <div class="control-checkbox__body">
				<input type="checkbox" class="f5-changer-user-btn" id="changer_usr_btn_` + user_id + `" data-inpname="` + input_name + `" ` + checked + `>
				<span class="control-checkbox__helper "></span>
			 </div>
		  </label>`);

        let $changer = $box.find('#changer_usr_btn_' + user_id);
        $input.hide();
        $changer.on('change', function() {
            $input.val(
                $(this).prop('checked') ? 1 : ''
            ).trigger('change');
        });
    };

    F5respool.prototype.md5 = function(d) {
        d = d.toString();

        function M(d) { for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) _ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _); return f };

        function X(d) { for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0; for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32; return _ };

        function V(d) { for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255); return _ };

        function Y(d, _) { d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _; for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) { var h = m,
                    t = f,
                    g = r,
                    e = i;
                f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e) } return Array(m, f, r, i) };

        function md5_cmn(d, _, m, f, r, i) { return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m) };

        function md5_ff(d, _, m, f, r, i, n) { return md5_cmn(_ & m | ~_ & f, d, _, r, i, n) };

        function md5_gg(d, _, m, f, r, i, n) { return md5_cmn(_ & f | m & ~f, d, _, r, i, n) };

        function md5_hh(d, _, m, f, r, i, n) { return md5_cmn(_ ^ m ^ f, d, _, r, i, n) };

        function md5_ii(d, _, m, f, r, i, n) { return md5_cmn(m ^ (_ | ~f), d, _, r, i, n) };

        function safe_add(d, _) { var m = (65535 & d) + (65535 & _); return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m };

        function bit_rol(d, _) { return d << _ | d >>> 32 - _ };
        return M(V(Y(X(d), 8 * d.length))).toLowerCase();
    };

    F5respool.prototype.jsonDecode = function(json, def = null) {
        try {
            return JSON.parse(json);
        } catch (error) {
            return def;
        }
    }

    F5respool.prototype.i18n = function(text) {
        return Fn.i18n(text);
    }

    F5respool.prototype.numeralWord = function(count, s, prepend) {
        return Fn.numeralWord(count, s, prepend);
    }

    F5respool.prototype.renderUsersSelect = function($el, params = {}, on_render_suggest) {
        return new UsersSelect(_.extend({
            el: $el,
            id: $el.attr('id'),
            title: 'sdfsdfsdfsfdsd',
            input_name: $el.data('name') || 'filter[user][]',
            class_name: this.w_class_name+'-users-select-wrapper',
            load_data: false,
            onRenderSuggest: on_render_suggest || function() {}
        }, params));
    }

    F5respool.prototype.getPeriods = function(format = APP.system.format.date.date) {
        let quarter_num = moment().quarter(),
            prev_quarter = quarter_num - 1;

        return {
            any_time: {},
            current_day: {
                from: moment().format(format),
                to: moment().format(format)
            },
            next_day: {
                from: moment().format(format),
                to: moment().add(1, 'days').format(format)
            },
            next_3_days: {
                from: moment().format(format),
                to: moment().add(3, 'days').format(format)
            },
            current_week: {
                from: moment().weekday(0).format(format),
                to: moment().weekday(6).format(format)
            },
            current_month: {
                from: moment().startOf('month').format(format),
                to: moment().endOf('month').format(format)
            },
            current_quarter: {
                from: moment().month(quarter_num * 3 - 3).startOf('month').format(format),
                to: moment().month(quarter_num * 3 - 1).endOf('month').format(format)
            },
            current_year: {
                from: moment().startOf('year').format(format),
                to: moment().endOf('year').format(format)
            },
            past_3_days: {
                from: moment().subtract(2, 'days').format(format),
                to: moment().format(format)
            },
            previous_month: {
                from: moment().subtract(1, 'month').startOf('month').format(format),
                to: moment().subtract(1, 'month').endOf('month').format(format)
            },
            previous_quarter: {
                from: moment().month(prev_quarter * 3 - 3).startOf('month').format(format),
                to: moment().month(prev_quarter * 3 - 1).endOf('month').format(format)
            },
            previous_year: {
                from: moment().subtract(1, 'year').startOf('year').format(format),
                to: moment().subtract(1, 'year').endOf('year').format(format)
            }
        };
    }

    F5respool.prototype.showErrorModal = string => {
        return new Modal()._showError(string.toString(), false);
    };

    F5respool.prototype.showSuccessModal = string => {
        return new Modal()._showSuccess(string.toString());
    };

    F5respool.prototype.clearWidgetStorage = () => {
        for (var key in localStorage) {
            if (key.indexOf('widgets_') === 0) {
                localStorage.removeItem(key);
            }
        }
    };

	F5respool.prototype.pageOverlayShow = () => {
		$('body').trigger('page:overlay:show');
	};

	F5respool.prototype.pageOverlayHide = () => {
		$('body').trigger('page:overlay:hide');
	};

	F5respool.prototype.loaderShow = () => {
        $('body').toggleClass("page-loading", true);
    };

    F5respool.prototype.loaderHide = () => {
        $('body').toggleClass("page-loading", false);
    };

    F5respool.prototype.widgetMenuPageSidebarToggler = () => {
        $('.sidebar_respool_burger').off('click.sidebar').on('click.sidebar', function(){
            $('#work_area.work_area_respool').toggleClass('aside-toggleable aside-toggleable_media-margin-left_0');
            $('#widget_page_sidebar.widget_page_sidebar_respool.aside.aside-toggleable').toggleClass('sidebar-expanded');
            $('#widget_page_sidebar.widget_page_sidebar_respool .icon.icon-list.filter-toggle-icon').toggle();
        });

        $('#widget_page_sidebar #sidebar_toggler').off('click.sidebar').on('click.sidebar', function(){
            $('#work_area.work_area_respool').toggleClass('aside-toggleable aside-toggleable_media-margin-left_0');
            $('#widget_page_sidebar.widget_page_sidebar_respool.aside.aside-toggleable').toggleClass('sidebar-expanded');
            $('#widget_page_sidebar.widget_page_sidebar_respool .icon.icon-list.filter-toggle-icon').toggle();
        });
    };

    F5respool.prototype.escapeHtml = unsafe => {
		return unsafe
			 .replace(/&/g, "&amp;")
			 .replace(/</g, "&lt;")
			 .replace(/>/g, "&gt;")
			 .replace(/"/g, "&quot;")
			 .replace(/'/g, "&#039;");
	};

    return F5respool;
});