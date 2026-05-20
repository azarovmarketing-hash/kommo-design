define(['jquery'], function($) {
    return function() {
        this.send = (url, method, data = {}, options = {}) => {

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: url,
                    method: method,
                    data: data,
                    ...options,
                    success: function(response) {
                        resolve(response);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        reject({jqXHR, textStatus, errorThrown});
                    }
                });
            });
        }

        this.getLeads = (filter = {}) => {
            return this.send('/api/v4/leads', 'GET', filter);
        };

        this.getAjaxV1LeadsListWithTerm = (term = '') => {
            return this.send(`/ajax/v1/leads/list?term=${term}&skip_filter=Y`, 'GET');
        };
    }
});