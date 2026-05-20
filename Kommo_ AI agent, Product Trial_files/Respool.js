define(['underscore', 'twigjs'], function(_, Twig) {
	"use strict";
	
	let $this,
		F5, 
		Widget,
		Lang,
		UserStatus;
	
	function Respool(CustomWidget, F5js, LangPack)
	{
		$this = this;
		F5 = F5js;
		Widget = CustomWidget;
		Lang = LangPack;
		F5.setLangPack(LangPack);
		
		this.F5 = F5;
		this.Widget = Widget;
		this.id = +Widget.get_settings().widget_id;
		this.token = Widget.get_settings().token;

		this.active = false;
		this.status = -1;
		this.expired = true;
		
		this.config = {};
		this.users = {};
        this.User = null;
		this.Config = null;
		this.AdvancedSettings = null;
		
		this.has_notifier = false;
		
		this.dp_settings_area = 'leads_dp_settings';
		this.dp_area = 'digital_pipeline';

		this.defaults = {
			redistrib_minutes: 5
		};

		this.status_classnames = {
			0: 'disabled',
			1: 'enabled',
			2: 'disabled_forced',
			3: 'enabled_forced',
			4: 'disabled_forced',
		};
		this.disabled_statuses = [2, 3, 4];
		this.online_statuses = [1, 3];
		
		F5.linkCSS('f5_respool', Widget.script_url+'/style/respool.css');
		window.Respool = () => {
			return $this;
		};
            
		if (!this.id || !this.token || Widget.params.widget_active == 'N') {
			return true;
		}
	};

	Respool.prototype.initMenuPage = function(code)
	{
		$this.initStatusButton();
		require([
			Widget.script_url+'/model/User.js', 
			Widget.script_url+'/model/Config.js',
			Widget.script_url+'/support/Collection.js'
		], function(User, Config, Collection) {
			$this.load(function(resp) {
				$this.users = new Collection();
				$.each(resp.users, function(i, usr) {
					$this.users.push(new User(usr, $this, Widget, F5, Lang));
				});
				if (resp.has_notifier) $this.has_notifier = true;
				$this.User = $this.users.find('id', F5.user.id).first();
				$this.config = new Config([], $this, Widget, F5, Lang);

				const work_area = $('#work_area');
				work_area.addClass('work_area_respool');
				const widget_page_sidebar = $('#widget_page_sidebar');
				widget_page_sidebar.addClass('widget_page_sidebar_respool');
				if (window.screen.width <= 1279) {
					const title_inner = work_area.find('.content__top__preset');
					if (code != 'respool_schedule') {
						title_inner.addClass('content_top_title_respool');
					}
					title_inner.prepend(`<svg class="sidebar_respool_burger svg-icon svg-common--list-dims "><use xlink:href="#common--list"></use></svg>`)
				}

				F5.widgetMenuPageSidebarToggler();
				switch (code) {
					case 'settings_respool_status':
						$this.initSettingsMenuPage();
						break;
					case 'respool_distrib_stats':
						$this.initDistribStatsMenuPage();
						break;
					case 'respool_status_stats':
						$this.initStatusStatsMenuPage();
						break;
					case 'respool_schedule':
						$this.initScheduleMenuPage();
						break;
					default:
						F5.loaderHide();
						break;
				}
			});
		});
	}

	Respool.prototype.initSettingsMenuPage = function()
	{
		require([
			Widget.script_url+'/controller/SettingsMenuPage.js',
			Widget.script_url+'/model/Config.js',
		], function(SettingsMenuPage, Config) {
			F5.loaderHide();
			$this.config = new Config([], $this, Widget, F5, Lang);
			$this.SettingsMenuPage = new SettingsMenuPage($this, Widget, F5, Lang);
		});
	}

	Respool.prototype.initDistribStatsMenuPage = function()
	{
		require([
			Widget.script_url+'/controller/DistribStatsMenuPage.js'
		], function(DistribStatsMenuPage) {
			F5.loaderHide();
			$this.DistribStatsPage = new DistribStatsMenuPage($this, Widget, F5, Lang);
		});
	}

	Respool.prototype.initStatusStatsMenuPage = function()
	{
		require([
			Widget.script_url+'/controller/StatusStatsMenuPage.js'
		], function(StatusStatsMenuPage) {
			F5.loaderHide();
			$this.StatusStatsMenuPage = new StatusStatsMenuPage($this, Widget, F5, Lang);
		});
	}

	Respool.prototype.initScheduleMenuPage = function()
	{
		require([
			Widget.script_url+'/controller/ScheduleMenuPage.js'
		], function(ScheduleMenuPage) {
			F5.loaderHide();
			$this.ScheduleMenuPage = new ScheduleMenuPage($this, Widget, F5, Lang);
		});
	}

	Respool.prototype.initStatusButton = function()
	{
		if (!Widget.active_users[F5.user.id]) return;
		if ($('#respool_status_settings_opener').length) return;
		let $ul = $('.filter__list');
		$this.getStatus(status => {
			UserStatus = null;
			if (_(status).isUndefined()) return;
			UserStatus = status;
			$this.initSidebarStatus();
			F5.getTwigTemplate('/status_nav_element', {}, template => {
				let $html = $(template.render({
					online: $this.online_statuses.includes(status),
					status_class_name: $this.status_classnames[status],
					disabled: $this.disabled_statuses.includes(status),
					status_text: Lang('status.'+status),
					disabled_text: Lang('status.disabled')
				}));

				if ($ul.find('#respool_status_settings_opener').length) return; 
				$ul.prepend($html);

				$ul.off('change.rstatus').on('change.rstatus', '[name="respool_status_online"]', function(){
					let status = $(this).prop('checked') ? 1 : 0;
					$this.setStatus(r => {
						UserStatus = status;
						$this.setSidebarStatus();
						$html = $(template.render({
							online: $this.online_statuses.includes(status),
							status_class_name: $this.status_classnames[status],
							disabled: false,
							status_text: Lang('status.'+status),
							disabled_text: Lang('status.disabled')
						}));
						$('#respool_status_settings_opener').replaceWith($html);
					}, {status});
				})
			});
		});
    };

	Respool.prototype.initSidebarStatus = function()
	{
		if (!Widget.active_users[F5.user.id]) return;
		$this.getStatus(status => {
			UserStatus = null;
			if (_(status).isUndefined()) return;
			UserStatus = status;
			$this.setSidebarStatus();
		});
    };

	Respool.prototype.setSidebarStatus = function()
	{
		let $nav_item = $(`[data-widget-code=${Widget.params.widget_code}].nav__menu__item`);
		$nav_item.find('.js-notifications_counter').attr('data-respool_status', UserStatus).html('&nbsp;').show();
	}
	
	Respool.prototype.initDpSettings = function()
	{
		require([
			Widget.script_url+'/controller/Dp.js',
			Widget.script_url+'/model/User.js', 
			Widget.script_url+'/model/Config.js',
			Widget.script_url+'/support/Collection.js'
		], function(Dp, User, Config, Collection) {
			$this.load(function(resp) {
				$this.users = new Collection();
				$.each(resp.users, function(i, usr) {
					$this.users.push(new User(usr, $this, Widget, F5, Lang));
				});
				if (resp.has_notifier) $this.has_notifier = true;
				$this.User = $this.users.find('id', F5.user.id).first();
				$this.config = new Config([], $this, Widget, F5, Lang);
				$this.distrib_templates = resp.distrib_templates;
				$this.Dp = new Dp($this, Widget, F5, Lang);
			});
		});
    };

	Respool.prototype.initSalesbotDesignerSettings = function($body, renderRow, params)
	{
		require([
			Widget.script_url+'/controller/SalesbotDesigner.js',
			Widget.script_url+'/model/User.js', 
			Widget.script_url+'/model/Config.js',
			Widget.script_url+'/support/Collection.js'
		], function(SalesbotDesigner, User, Config, Collection) {
			$this.load(function(resp) {
				$this.users = new Collection();
				$.each(resp.users, function(i, usr) {
					$this.users.push(new User(usr, $this, Widget, F5, Lang));
				});
				if (resp.has_notifier) $this.has_notifier = true;
				$this.User = $this.users.find('id', F5.user.id).first();
				$this.config = new Config([], $this, Widget, F5, Lang);
				$this.distrib_templates = resp.distrib_templates;
				$this.SalesbotDesigner = new SalesbotDesigner($this, Widget, F5, Lang);
				$this.SalesbotDesigner.open($body, renderRow, params);
			});
		});
    };
    
    Respool.prototype.initConfig = function()
	{
		require([
			Widget.script_url+'/controller/Config.js'
		], function(Config) {
			$this.Config = new Config($this, Widget, F5, Lang);
		});
	};

	Respool.prototype.initAdvancedSettings = function()
	{
		require([
			Widget.script_url+'/controller/AdvancedSettings.js',
			Widget.script_url+'/model/User.js',
			Widget.script_url+'/model/Config.js',
			Widget.script_url+'/support/Collection.js'
		], function(AdvancedSettings, User, Config, Collection) {
			$this.loadAdvanced(function(resp) {
				$this.users = new Collection();
				$.each(resp.users, function(i, usr) {
					$this.users.push(new User(usr, $this, Widget, F5, Lang));
				});
				$this.config = new Config([], $this, Widget, F5, Lang);
				$this.AdvancedSettings = new AdvancedSettings($this, Widget, F5, Lang);
			});
		});
	}

	Respool.prototype.getStatus = function(callback)
	{
		if (!_(UserStatus).isUndefined()) return callback(UserStatus);
		this.get('/getStatus')
		 .done((data) => {
			if (data.status !== true || !data.response) {
				if (data.error && data.error.message) {
					if (data.error.code && data.error.code == 401) {
						for (var key in localStorage) {
							if (key.indexOf('widgets_') === 0) {
								localStorage.removeItem(key);
							}
						}
						return $this.error(Lang('msg.refresh.page'), Lang('msg.settings.saved'));
					}
					if (data.error.code && data.error.code == 402) {
						return $this.error(Lang('msg.status.extend'), Lang('msg.status.expired'));
					}
					return $this.error(data.error.message);
				}
				return $this.error(Lang('errors.get.error'));
			}
			callback(data.response.status);
		 })
		 .fail(() => {
			$this.error(Lang('errors.get.error'));
		 });
	};

	Respool.prototype.setStatus = function(callback, args = {})
	{
		this.post('/setStatus', args)
		 .done((data) => {
			if (data.status !== true || !data.response) {
				if (data.error && data.error.message) {
					if (data.error.code && data.error.code == 401) {
						for (var key in localStorage) {
							if (key.indexOf('widgets_') === 0) {
								localStorage.removeItem(key);
							}
						}
						return $this.error(Lang('msg.refresh.page'), Lang('msg.settings.saved'));
					}
					if (data.error.code && data.error.code == 402) {
						return $this.error(Lang('msg.status.extend'), Lang('msg.status.expired'));
					}
					return $this.error(data.error.message);
				}
				return $this.error(Lang('errors.save.error'));
			}
			callback(data.response);
		 })
		 .fail(() => {
			$this.error(Lang('errors.save.error'));
		 });
	};
	
	Respool.prototype.load = function(callback)
	{
		this.get('/load')
		 .done((data) => {
			if (data.status !== true || !data.response) {
				if (data.error && data.error.message) {
					if (data.error.code && data.error.code == 401) {
						for (var key in localStorage) {
							if (key.indexOf('widgets_') === 0) {
								localStorage.removeItem(key);
							}
						}
						return $this.error(Lang('msg.refresh.page'), Lang('msg.settings.saved'));
					}
					if (data.error.code && data.error.code == 402) {
						return $this.error(Lang('msg.status.extend'), Lang('msg.status.expired'));
					}
					return $this.error(data.error.message);
				}
				return $this.error(Lang('errors.init.error'));
			}
			callback(data.response);
		 })
		 .fail(() => {
			F5.loaderHide();
			$this.error(Lang('errors.init.error'));
		 });
	};

	Respool.prototype.loadAdvanced = function(callback)
	{
		this.get('/loadAdvanced')
		 .done((data) => {
			if (data.status !== true || !data.response) {
				if (data.error && data.error.message) {
					if (data.error.code && data.error.code == 401) {
						return $this.error(Lang('msg.refresh.page'), Lang('msg.settings.saved'));
					}
					if (data.error.code && data.error.code == 402) {
						return $this.error(Lang('msg.status.extend'), Lang('msg.status.expired'));
					}
					return $this.error(data.error.message);
				}
				return $this.error(Lang('errors.init.error'));
			}
			callback(data.response);
		 })
		 .fail(() => {
			$this.error(Lang('errors.init.error'));
		 });
	};

    Respool.prototype.getGroups = (selected = false) => {
        let groups = {};
        $this.users.each(User => {
            if (!User.is_active) return;
			if (selected && !_(selected).contains(User.id)) return;
            if (groups[User.group_id] != undefined) {
                groups[User.group_id].users.push(User);
            } else {
                groups[User.group_id] = {
                    id: +User.group_id,
                    name: User.group_name,
                    users: [User]
                };
            }
        });

		_(groups).each((g, id) => {
			groups[id].users = _(groups[id].users).sortBy('id');
		});
        return _(groups).sortBy('id');
    };	

	Respool.prototype.actionUrl = function(action)
	{
		return Widget.url+'/crm/'+F5.getAccount().id+'/'+F5.getUser().id+'/'+Widget.name+'/v'+Widget.version+'/'+$this.id+action+'?token='+$this.token;
	};
    
    Respool.prototype.configUrl = function(action)
	{
		return 'https://'+Widget.host+'/crm/widget/'+Widget.name+'/v'+Widget.version;
	};
	
	Respool.prototype.get = function(action, args = {}, custom_options = {})
	{
		return this.action('GET', action, args, custom_options);
	};
	
	Respool.prototype.post = function(action, args = {}, custom_options = {})
	{
		return this.action('POST', action, args, custom_options);
	};

	Respool.prototype.$authorizedAjax = function(method, action, args = {}, custom_options = {}) {
		let options = {
			method: method,
			url: this.authorizedAjaxUrl(action),
			data: args
		};
		return Widget.$authorizedAjax(_.extend({}, options, custom_options));
	};
	
	Respool.prototype.action = function(method, action, args = {}, custom_options = {})
	{
		let options = {
			method: method,
			url: this.actionUrl(action),
			dataType: 'json',
			data: args
		};
		return $.ajax(
			F5.merge(options, custom_options)
		);
	};

	Respool.prototype.notify = function (header, text) {
		if (arguments.length === 1) {
			return F5.notify(Lang('widget.name'), header);
		}
		F5.notify(Lang('widget.name')+' - '+header, text);
	};
	
	Respool.prototype.error = function (header, text) {
		if (arguments.length === 1) {
			return F5.error(Lang('widget.name')+' - '+Lang('errors.error'), header);
		}
		F5.error(Lang('widget.name')+' - '+header, text);
	};
	
	return Respool;
});
