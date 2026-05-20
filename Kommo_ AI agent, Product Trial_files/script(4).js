define(['jquery', 'underscore'], function($, _)
{
    let Widget = function()
	{
		let $this = this, F5,
			User = APP.constant('user'),
			Account = APP.constant('account');
		
		this.name = 'Respool';
		this.version = 1;
		this.host = 'widgets.cmdf5.com';
		this.url = 'https://'+$this.host;
		this.language = APP.lang_id;
		this.active_users = null;
		this.admin_users = null;
		this.script_url = null;
		
		this.callbacks = {
			
			render: function()
			{
				$this.script_url = $this.params.path + '/vendor';
				$this.active_users = $this.get_settings().respool_active_users ? JSON.parse($this.get_settings().respool_active_users) : {};
				$this.admin_users = $this.get_settings().respool_admin_users ? JSON.parse($this.get_settings().respool_admin_users) : {};
				return true;
			},
			init: function()
			{
				require([
					$this.script_url+'/lib/F5respool.js'
				], function(F5respool) {
					F5 = new F5respool($this);
					require([$this.script_url+'/'+$this.name+'.js', $this.script_url+'/lang/'+$this.language+'.js'], function(WidgetClass, LangPack) {
						$this[$this.name] = new WidgetClass($this, F5, LangPack);
						if (location.href.indexOf(`widget_page/${$this.params.widget_code}`) === -1) {
							$this[$this.name].initSidebarStatus();
						}
					});
				});
				return true;
			},
			bind_actions: function()
			{
				return true;
			},
			settings: function()
			{
				$(`.modal.${$this.params.widget_code} .modal-body`).addClass('hidden');
				require([
					$this.script_url+'/lib/F5respool.js',
					$this.script_url+'/'+$this.name+'.js',
					$this.script_url+'/lang/'+$this.language+'.js'
				], function(F5respool, WidgetClass, LangPack) {
					F5 = new F5respool($this);
					$this[$this.name] = new WidgetClass($this, F5, LangPack);
					$this[$this.name].initConfig();
				});
				return true;
			},
			onSave: function(settings)
			{
				return $this[$this.name].Config.onSave(settings);
			},
			dpSettings: function ()
			{
				let dp_modal_form = $(`.digital-pipeline__short-task_widget-style_${$this.params.widget_code}`)
					.parent().parent()
					.find('form.digital-pipeline__edit-forms')
					
				dp_modal_form.addClass('respool-covered');
				dp_modal_form.before(`<div class="respool-dp-loader"><span class="button-input__spinner__icon spinner-icon"></span></div>`)
				
				require([
					$this.script_url+'/lib/F5respool.js',
					$this.script_url+'/'+$this.name+'.js',
					$this.script_url+'/lang/'+$this.language+'.js'
				], function (F5respool, WidgetClass, LangPack) {
					F5 = new F5respool($this);
					if (!$this[$this.name] || !$this.active_users[User.id]) {
						$('.js-trigger-cancel').click();
						F5.error(LangPack('widget.name'), LangPack('inactive.user.area'));
						return false;
					}
					$this[$this.name] = new WidgetClass($this, F5, LangPack);
					$this[$this.name].initDpSettings();
				});

				return true;
			},
			advancedSettings: function ()
			{
				if (APP.getWidgetsArea() == `advanced-settings:${$this.get_settings().widget_code}`) {
					require([
						$this.script_url+'/lib/F5respool.js',
						$this.script_url+'/'+$this.name+'.js',
						$this.script_url+'/lang/'+$this.language+'.js'
					], function(F5respool, WidgetClass, LangPack) {
						F5 = new F5respool($this);
						$this[$this.name] = new WidgetClass($this, F5, LangPack);
						$this[$this.name].initAdvancedSettings();
					});
				}
				return true;
			},
			initMenuPage: function (params)
			{
				if (params.location === 'widget_page' && params.item_code === 'respool_status') {
					require([$this.script_url+'/lib/F5respool.js', $this.script_url+'/'+$this.name+'.js', $this.script_url+'/lang/'+$this.language+'.js'], function(F5respool, WidgetClass, LangPack) {
						F5 = new F5respool($this);
						$this[$this.name] = new WidgetClass($this, F5, LangPack);
						$this[$this.name].initMenuPage(params.subitem_code);
					});
				}

				return true;
			},
			destroy: function(){},
			contacts: {
				selected: function(){}
			},
			leads: {
				selected: function(){}
			},
			tasks: {
				selected: function(){}
			},
			salesbotDesignerSettings: function($body, renderRow, params) {
				$this[$this.name].initSalesbotDesignerSettings($body, renderRow, params);
				return {
					exits: [
						{ code: 'success', title: $this.i18n('salesbot').success_callback_title },
						{ code: 'fail', title: $this.i18n('salesbot').fail_callback_title }
				    ]
				};
			},
			onSalesbotDesignerSave: function(handler_code, params) {
				return JSON.stringify([{
					"question": [{
						"handler": 'widget_request',
						"params": {
							"url": `https://hooks.widgets.cmdf5.com/sb/${$this.name}/${APP.constant('account').id}/${$this.params.widget_id}`,
							"data": params
						}
					}, {
						"handler": 'goto',
						"params": {
							"type": 'question',
							"step": 1
						}
					}]
				}, {
					"question": [{
						"handler": "conditions",
						"params": {
							"logic": "and",
							"conditions": [{
								"term1": "{{json.status}}",
								"term2": "success",
								"operation": "="
            				}],
							"result": [{
								"handler": "exits",
								"params": {
									"value": "success"
								}
            				}]
						}
					}, {
						"handler": "exits",
						"params": {
							"value": "fail"
						}
				    }]
				}])
			}
		};
		return this;
    };
  return Widget;
});