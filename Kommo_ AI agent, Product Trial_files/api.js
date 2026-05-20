define([], function () {
	return function (config) {
		const widget = config.getWidget();

		this.send = async function (url, method, data) {
			data = data || {};

			const params = {
				url: `${config.robocode.getApiUrl()}/${url}`,
				method: method,
				dataType: 'json',
				xhrFields: {
					withCredentials: true,  // передаём куки
				},
			};

			if (method === 'POST' || method === 'PATCH') {
				if (data instanceof FormData) {
					params.data = data;
					params.contentType = false;
				} else {
					params.data = JSON.stringify(data);
					params.contentType = 'application/json';
				}
				params.processData = false;
			} else {
				params.data = data;
			}

			return new Promise((resolve, reject) => {
				const onSuccess = function (data, textStatus, jqXHR) {
					resolve(data);
				};

				const onError = function (jqXHR, textStatus, errorThrown) {
					reject({ jqXHR, textStatus, errorThrown });
				};

				widget.$authorizedAjax(params).done(onSuccess).fail(onError);
			});
		};

		this.getActualToken = async () => {
			const tokenKey = "robocode_triggers_sensei_token";
			let tokenData = JSON.parse(localStorage.getItem(tokenKey));
			let timeNow = new Date().getTime();
			let token = await widget.$authorizedAjax({
				headers: {
					'Authorization': 'Bearer ' + tokenData?.token ?? ''
				},
				url: config.robocode.getTokenUrl(),
			});
			let expiresIn = (token.expires_in ? timeNow + (token.expires_in - 600 * 1000) : timeNow + 85800000);
			tokenData = {
				expiresIn,
				token: token.token,
				expires_in: token.expires_in,
			};
			localStorage.setItem(tokenKey, JSON.stringify(tokenData));
			return tokenData;
		};

		this.getEnabledScripts = () => {
			if (APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
				return Promise.resolve([]);
			}
			return this.send('scenarios?onlyEnabled=true&onlyManual=true', 'GET');
		}

		this.getGroups = () => {
			if (APP.constant('managers')[APP.constant('user').id].is_admin !== 'Y') {
				return Promise.resolve([]);
			}
			return this.send('groups', 'GET');
		}

		this.sendMassLaunch = (scriptId, postData) => {
			return this.send(`mass-actions/${scriptId}`, 'POST', postData)
		}

		this.createScheduler = (postData) => {
			return this.send('schedules', 'POST', postData);
		}

		this.updateScheduler = (id, postData) => {
			return this.send(`schedules/${id}`, 'PATCH', postData);
		}

		this.deleteScheduler = (id) => {
			return this.send(`schedules/${id}`, 'DELETE');
		}
	}
});