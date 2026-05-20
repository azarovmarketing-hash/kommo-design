define(function() {
	"use strict";
	
	let L = {};
	L['widget.name'] = 'Leads Distribution';
	L['yes'] = 'Yes';
	L['managers'] = 'Managers';
	L['no'] = 'No';
	L['rub'] = 'USD';
	L['valut'] = 'USD';
	L['valut.rub'] = 'RUB';
	L['valut.usd'] = 'USD';
	L['comf5'] = 'Komanda F5';
	L['select.action'] = 'Choose action';
	L['select.event'] = 'Choose event';
	L['confirm.header'] = 'Confirm action';
	L['keep.text'] = 'Enter text';
	L['placeholder.no.chosen'] = 'Not chosen';
	L['placeholder.search'] = 'Search...';
	L['close.confirm'] = 'Are you sure you want to exit?';
	L['track.attachs'] = 'Track attachment downloads';
	L['footer.logo.text'] = 'Widget "Leads Distribution" - development';
	L['feedback.and.idea'] = 'Feedback';
    L['reference'] = 'Help';
	L['contact.phone.placeholder'] = '+1(000)000-00-00';
	L['inactive.user.area'] = 'To be able to control the widget,<br>activate the current user in the widget settings';
	L['settings.check.all.title'] = 'All';
	L['settings.admin_users.title'] = 'Possibility of self-disconnection from distribution';
	L['today'] = 'Today',
	L['week'] = 'This week',
	L['previous_week'] = 'Past week',
	L['month'] = 'Per month',
	L['quarter'] = 'Per quarter',
	L['note_type'] = {
		4: 'Text note',
		25: 'System note',
		15: 'Mail',
		10: 'Call in',
		11: 'Call out',
		102: 'SMS in',
		103: 'SMS out',
	};
	L['entity'] = {
		contact: 'Contact',
		lead: 'Lead',
		company: 'Company',
		task: 'Task',
		note: 'Note',
		message: 'Message'
	};
	L['entity.declensions'] = {
		contact: ['Contact','Contacts','Contacts'],
		lead: ['Lead','Leads','Leads'],
		company: ['Company','Companies','Companies']
	};
	L['follow'] = 'Go to';
	L['open'] = 'Open';
	L['refresh.widget.token'] = 'Refresh';
	L['payment.info'] = 'The cost of the widget is <span class="respool-widget-cost">{{price}} USD per month</span> for each user in the Kommo account, minimum 5 users.';
	L['payment.status.-1'] = 'The subscription has expired';
	L['payment.status.0'] = 'Trial period till';
	L['payment.status.1'] = 'Subscribed till';
	L['payment.choise.months1'] = 'Payment for {{months1}} months';
	L['payment.choise.months2'] = 'Payment for {{months2}} months';
	L['payment.months.gift'] = '+ {{monthsgift}} months free';
	L['payment.user.count'] = '{{user_count}} user to';
	L['billing.status.users'] = 'for {{user_count}} users';
	L['billing.subscription.users'] = '{{user_count}} users';
	L['billing.requestinvoice.title'] = 'Request an invoice';
	L['billing.requestinvoice.phone.label'] = 'Your contact phone number:';
	L['billing.requestinvoice.phone.placeholder'] = ' ';
	L['billing.requestinvoice.message'] = 'We will be in touch soon';
	L['billing.sum'] = 'Total';
	L['billing.from_text'] = 'Subscription until';

	L['payment.button'] = 'Pay online';
	L['payment.alter.text'] = 'If you want to pay for the widget, <a href="https://cmdf5.com/?utm_source=respool" target="_blank">contact</a> us in any way.';
	L["billing.button.payonline"] = "Pay online",
	L['groups'] = 'Groups';
	L['lead,leads,leads'] = 'lead,leads,leads';
	L['online'] = 'Online';
	L['redistrib'] = 'Redistribution';
	L['repeated_by_contact'] = 'Repeated by contact';
	L['repeated_by_company'] = 'Repeated by company';
	L['param.required'] = 'Fill in the required field';
	L['completed'] = 'Done';
	L['in_work'] = 'In work';
	L['start'] = 'Start';
	L['from'] = 'from';
	L['until'] = 'until';
	L['at'] = 'at';
	L['rest'] = 'weekend';
	L['distrib.template.warning'] = 'It is recommended to move the distribution settings to the templates under <a href="/widget_page/amo_comf5_respool_dp/respool_status/respool_schedule" target="_blank">the work schedule</a>';
	L['distrib.template.notify'] = 'Add the distribution settings to the templates under <a href="/widget_page/amo_comf5_respool_dp/respool_status/respool_schedule" target="_blank">the work schedule</a>';
	L['not_found'] = 'Not found';
	L['select_days'] = 'Select days to set the working hours';

	L['distrib.types'] = {
        evenly: 'Even distribution',
        percent: 'Load distribution',
    };
	L['distrib.repeat_leads_control_types'] = {
		'': 'Do not distribute recurring leads',
		contact: 'Distribute recurring leads for the same Contact to the responsible',
        company: 'Distribute recurring leads for the same Company to the responsible',
        auto: 'Distribute recurring leads for the same Contact or Company to the responsible'
    };

	L['tab.settings.settings'] = 'Settings';
	L['tab.settings.roles'] = 'Users';
	L['tab.settings.payment'] = 'Payment';

	L['status.0'] = 'You are off the distribution';
    L['status.1'] = 'You are in the distribution';
    L['status.2'] = 'You are off the distribution by the supervisor';
    L['status.3'] = 'You are on the distribution by the supervisor';
	L['status.4'] = 'You are turned off by the system';
	L['status.disabled'] = 'Control is not available';
	L['managers'] = 'Users';

	L['user_not_found'] = 'User not found';
	L['group_not_found'] = 'Group not found';

	L['settings.status.description'] = 'Select the current status for the user. The status on this page is a priority. If the user is disabled here, the leads will not be distributed to him, regardless of the work schedule and other settings';
	L['settings.status.user_list.id'] = 'ID';
	L['settings.status.user_list.name'] = 'Name';
	L['settings.status.user_list.group'] = 'Group';
	L['settings.status.user_list.status'] = 'Status';
	L['settings.status.user_list.status.change'] = 'Change status';
	L['settings.status.user_list.statuses'] = [
		'Off',
		'On',
		'Forced Off',
		'Forced On',
	];
	L['settings.status.user_list.status.0'] = 'Off';
    L['settings.status.user_list.status.1'] = 'On';
    L['settings.status.user_list.status.2'] = 'Forced Off';
    L['settings.status.user_list.status.3'] = 'Forced On';
	L['settings.status.user_list.status.4'] = 'Off by the system';
	
	L['stats.distrib.history.date'] = 'Date';
	L['stats.distrib.history.status'] = 'Status';
	L['stats.distrib.history.name'] = 'Name';
	L['stats.distrib.history.group'] = 'Group';
	L['stats.distrib.history.lead'] = 'Lead';
	L['stats.distrib.history.description'] = 'The report shows only the fact of distribution and redistribution of the lead. For example, if a lead is distributed to the first user, then redistributed to another user, then both of them will have leads distribution records added to the report. Reports do not show the actual acceptance of the lead and are intended for checking the accuracy of the widget\'s performance';

	L['stats.status.history.date'] = 'Date';
	L['stats.status.history.name'] = 'Name';
	L['stats.status.history.group'] = 'Group';
	L['stats.status.history.author'] = 'Author';
	L['stats.status.history.description'] = 'The report shows the time of user status change';

	L['dp.delay.types'] = {
		'': 'No delay',
		second: 'In seconds',
		minut: 'In minutes',
		hour: 'In hours',
		day: 'In days',
		week: 'In weeks',
		mounth: 'In months'
    };
    L['dp.respool_type'] = 'Select a group or users';
    L['dp.respool_help'] = 'If the entire group is selected, the distribution will take place within the group, even if users later change in the group. If specific users are selected, the distribution will only occur among the selected users';
    L['dp.respool_redistrib'] = 'Distribute again if the lead stage does not change';
	L['dp.respool_redistrib_once'] = 'Redistribute only once';
    L['dp.respool_redistrib_minutes'] = 'Within (min.)';
    L['dp.respool_check_online'] = 'Distribute to online users first';
    L['dp.respool_redistrib_only_work'] = 'Only during working hours';
    L['dp.respool_distrib_only_work'] = 'Distribute only during working hours';
	L['dp.respool_work_time_title'] = 'The work schedule';
    L['dp.respool_work_time_from'] = 'from';
    L['dp.respool_work_time_to'] = 'till';
    L['dp.respool_work_sunday'] = 'Sun';
    L['dp.respool_work_saturday'] = 'Sat';
    L['dp.respool_work_friday'] = 'Fri';
    L['dp.respool_work_thursday'] = 'Thu';
    L['dp.respool_work_wednesday'] = 'Wed';
    L['dp.respool_work_tuesday'] = 'Tue';
    L['dp.respool_work_monday'] = 'Mon';
	L['dp.respool_change_linked'] = 'Change the responsible of the contact and the company';
    L['dp.respool_change_tasks'] = 'Change the responsible for the open tasks of the lead';
	L['dp.respool_change_contact_leads'] = 'Change the responsible for open leads by contact';
    L['dp.respool_change_company_leads'] = 'Change the responsible for open leads by company';
    L['dp.respool_change_contacts_tasks'] = 'Change the responsible for the open tasks of the contact';
	L['dp.respool_change_company_tasks'] = 'Change the responsible for the open tasks of the company';
	L['dp.respool_check_online.need_widget'] = 'To keep track of online users, you need to install the widget';
	L['dp.respool_check_online.title'] = 'With this distribution method, users who are currently online and active in Kommo get an advantage';

	/* ADVANCED SETTINGS */
	L['tab.advanced_settings.distrib_templates'] = 'Templates';
	L['tab.advanced_settings.distrib_templates.list.name'] = 'Name';
	L['tab.advanced_settings.distrib_templates.list.head_title'] = 'Distribution templates';
	L['tab.advanced_settings.distrib_templates.list.textinfo'] = 'Create templates for different distribution methods and use them in the digital pipeline and Salesbot';
	L['tab.advanced_settings.distrib_templates.list.type'] = 'Distribution type';
	L['tab.advanced_settings.distrib_templates.list.created'] = 'Creation date';
	L['tab.advanced_settings.distrib_templates.form.field.another_template_id'] = 'Another redistribution template';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_count'] = 'Number of redistributions';
	L['tab.advanced_settings.distrib_templates.form.field.another_template'] = 'Use another template after the redistribution cycle is completed';
	L['tab.advanced_settings.distrib_templates.form.field.offline_default_user_id'] = 'Priority user';
	L['tab.advanced_settings.distrib_templates.form.field.check_online'] = 'Distribute to online users first';
	L['tab.advanced_settings.distrib_templates.form.field.check_online.note'] = 'If at least one user from the distribution list is online (Kommo tab is open in the browser), the distribution will only occur among those users. If nobody is online, everyone will be included in the distribution';
	L['tab.advanced_settings.distrib_templates.form.field.check_user_schedule'] = 'Distribute according to an individual schedule';
	L['tab.advanced_settings.distrib_templates.form.field.check_user_schedule.note'] = 'The distribution will take place according to the individual work schedule. The user will be included in the distribution only if the work schedule is set for this user and he/she currently has working hours at the time of distribution';
	L['tab.advanced_settings.distrib_templates.form.field.check_responsible'] = 'Consider the current responsible';
	L['tab.advanced_settings.distrib_templates.form.field.check_responsible.note'] = 'Use to redistribute a lead, for example, when a new request from the client comes while a responsible  employee has a day off. In this case, the lead can be sent to redistribution among employees that are currently at work';
	L['tab.advanced_settings.distrib_templates.form.field.name'] = 'Template name';
	L['tab.advanced_settings.distrib_templates.form.field.name.placeholder'] = 'Template name';
	L['tab.advanced_settings.distrib_templates.form.field.type'] = 'Distribution type';
	L['tab.advanced_settings.distrib_templates.form.field.responsibles'] = 'Distribution list';
	L['tab.advanced_settings.distrib_templates.form.field.repeat_leads_control'] = 'Recurring leads control';
	L['tab.advanced_settings.distrib_templates.form.block.distrib_list'] = 'Distribution list';
	L['tab.advanced_settings.distrib_templates.form.field.change_attached_responsible'] = 'Change the responsible for the linked entities';
	L['tab.advanced_settings.distrib_templates.form.field.change_attached_responsible.info'] = 'After distribution, the widget will transfer the linked entities to a new responsible';
	L['tab.advanced_settings.distrib_templates.form.field.linked_change'] = 'Contact and company';
	L['tab.advanced_settings.distrib_templates.form.field.contact_leads_change'] = 'All open leads of the contact';
	L['tab.advanced_settings.distrib_templates.form.field.company_leads_change'] = 'All open leads of the company';
	L['tab.advanced_settings.distrib_templates.form.field.tasks_change'] = 'All open tasks of the lead';
	L['tab.advanced_settings.distrib_templates.form.field.contacts_tasks_change'] = 'All open tasks of all the contacts linked';
	L['tab.advanced_settings.distrib_templates.form.field.company_tasks_change'] = 'All open tasks of the company';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_timing'] = 'Running time of this distribution';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_timing.info'] = 'Use a time limit if you need to distribute leads differently at different times and on different days';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_only_work'] = 'Distribute only during working hours';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_timing'] = 'Redistribute by time';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_timing.info'] = 'Use redistribution if you want to pass the lead to the next user if the current one hasn\'t processed it in time';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib'] = 'Distribute again if the lead stage does not change';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_once'] = 'Redistribute N times';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_once.help'] = 'The maximum number of redistribution cycles is determined by the number of licenses purchased for the widget. If the license for using the widget was purchased for 5 users, then the maximum possible number of cycles will be 5 + 1.';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_minutes'] = 'Within (min.)';
	L['tab.advanced_settings.distrib_templates.form.field.another_template.help'] = 'You can set up the consecutive launch of 3 distribution templates.';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_only_work'] = 'Only during working hours';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_work_days'] = 'Distribution workdays';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_work_days'] = 'Redistribution workdays';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_work_time_from'] = 'Working hours of distribution from';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_work_time_to'] = 'Working hours of distribution till';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_work_time_from'] = 'Working hours of redistribution from';
	L['tab.advanced_settings.distrib_templates.form.field.redistrib_work_time_to'] = 'Working hours of redistribution till';
	L['tab.advanced_settings.distrib_templates.form.field.clear_distrib'] = 'Reset distribution queue';
	L['tab.advanced_settings.distrib_templates.form.field.clear_distrib_days'] = 'Every N days';
	L['tab.advanced_settings.distrib_templates.form.field.clear_distrib.info'] = 'Specify the number of days until the distribution queue needs to be reset';
	L['tab.advanced_settings.distrib_templates.form.history.title'] = 'History log';
	L['tab.advanced_settings.distrib_templates.form.block.events'] = 'History log';
	L['tab.advanced_settings.distrib_templates.form.events.list.created'] = 'Date';
	L['tab.advanced_settings.distrib_templates.form.events.list.name'] = 'Name';
	L['tab.advanced_settings.distrib_templates.form.events.list.author'] = 'Author';
	L['tab.advanced_settings.distrib_templates.form.events.list.event'] = 'Event';
	L['tab.advanced_settings.work_times'] = 'Work schedule';
	L['tab.advanced_settings.work_times.list.name'] = 'Name';
	L['tab.advanced_settings.work_times.list.head_title'] = 'Work schedule';
	L['tab.advanced_settings.work_times.list.textinfo'] = 'Set up a work schedule for each employee or the entire group';
	L['tab.advanced_settings.work_times.list.name'] = 'Name';
	L['tab.advanced_settings.work_times.list.week'] = 'Schedule for current week';
	L['tab.advanced_settings.work_times.list.time'] = 'Current status';
	L['tab.advanced_settings.work_times.list.last_date'] = 'Schedule set to';
	L['tab.advanced_settings.work_times.list.modified'] = 'Modified date';
	L['tab.advanced_settings.work_times.form.title'] = 'Work schedule';
	L['tab.advanced_settings.work_times.form.set_time'] = 'Set working hours';
	L['tab.advanced_settings.work_times.form.set_time.title'] = 'Set schedule for';
	L['tab.advanced_settings.work_times.form.set_rest'] = 'Weekend';
	L['tab.advanced_settings.work_times.form.history.title'] = 'History log';
	L['tab.advanced_settings.work_times.form.block.events'] = 'History log';
	L['tab.advanced_settings.work_times.form.events.list.created'] = 'Date';
	L['tab.advanced_settings.work_times.form.events.list.name'] = 'Name';
	L['tab.advanced_settings.work_times.form.events.list.author'] = 'Author';
	L['tab.advanced_settings.work_times.form.events.list.event'] = 'Event';
	L['tab.advanced_settings.distrib_templates.form.field.individual'] = 'Queue by Individual Schedule';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_mode'] = 'Distribution mode';
	L['tab.advanced_settings.distrib_templates.form.field.distrib_mode.help'] = 'Queue by Individual Schedule: Already received leads within the individual schedule will be taken into account while distributing the new ones. If multiple templates use the individual schedule, an employee included in them may not receive leads from certain templates, as they may have already received leads through other templates. Queue by Template: The distribution of leads is based exclusively on this specific template that uses the individual schedule. In this case, it does not consider whether the employee might have received leads from other templates with the individual schedule.';
	L['tab.advanced_settings.distrib_templates.form.field.general'] = 'Queue by Template';
	L['tab.settings.users.active'] = 'ACTIVE';
	L['tab.settings.users.admin'] = 'HOS';

	L['btn.add_time'] = 'Add time interval';
    L['btn.save'] = 'Save';
	L['btn.leave'] = 'Close';
	L['btn.cancel'] = 'Cancel';
	L['btn.reset'] = 'Reset';
	L['btn.reset_selected'] = 'Reset selection';
	L['btn.confirm'] = 'Confirm';
	L['btn.send'] = 'Send';
	L['btn.search'] = 'Search';
	L['btn.remove'] = 'Delete';
	L['btn.prev'] = 'Back';
	L['btn.continue'] = 'Continue';
	L['btn.template.delete'] = 'Delete template';
	L['btn.set_time'] = 'Set working hours';
	L['btn.set_time.title'] = 'Set working time for the selected days';
	L['btn.clear_selected'] = 'Clear schedule';
	L['btn.clear_selected.title'] = 'Clear time for the selected days';
	L['btn.set_rest.title'] = 'Weekend';
	L['btn.unset_rest.title'] = 'Clear weekend';

	L['action.new_template'] = "Add a new template";
	L['action.more'] = "more";
	L['action.chosen'] = "Chosen";
	L['action.reset'] = "Reset";
	L['action.submit'] = "Submit";
	L['action.check'] = "Check";
	L['action.search'] = "Search";
	L['action.back'] = "Back";

	L['confirm.header'] = "Save changes?";
	L['confirm.text_1'] = "There are unsaved changes in the schedule";
	L['confirm.text_2'] = "";
	L['confirm.accept'] = "Save";
	L['confirm.cancel'] = "Cancel";
	L['confirm.no_save'] = "Don\'t save";
	L['confirm.delete.header'] = "Delete";
	L['confirm.delete.text_1'] = "Do you really want to delete?";
	L['confirm.delete.text_2'] = "It will be impossible to restore the template";
	L['confirm.delete.accept'] = "Delete";
	L['confirm.delete.cancel'] = "Cancel";
	L['confirm.calendar_toggle.header'] = "Save changes?";
	L['confirm.calendar_toggle.text_1'] = "Save the settings for the current month before switching to another one";
	L['confirm.calendar_toggle.text_2'] = "";
	L['confirm.calendar_toggle.save'] = "Save";
	L['confirm.calendar_toggle.no_save'] = "Don\'t save";
	L['confirm.calendar_toggle.cancel'] = "Cancel";
	
    L['modal.settings.header'] = 'Settings';
    L['modal.sign.clear'] = 'Clear';

    L['msg.success'] = 'Success';
	L['msg.success.created'] = 'Successfully created';
	L['msg.success.saved'] = 'Successfully saved';
	L['msg.success.removed'] = 'Successfully deleted';
	L['msg.success.activated'] = 'Successfully activated';
	L['msg.success.deactivated'] = 'Successfully deactivated';
	L['msg.settings.saved'] = 'The settings have been changed';
	L['msg.refresh.page'] = 'Refresh the page';
	L['msg.status.extend'] = 'Renew the subscription';
	L['msg.status.expired'] = 'The subscription expired';
	L['msg.work_time.not_selected'] = 'Not selected';

    L['errors.error'] = 'error';
	L['errors.init.error'] = 'Widget initialization failed';
	L['errors.get.error'] = 'Failed to get data';
	L['errors.pay.get.error'] = 'Failed to get payment status';
	L['errors.response.error'] = 'Request failed';
	L['errors.create.error'] = 'Creation failed';
	L['errors.save.error'] = 'Failed to save data';
	L['errors.send.error'] = 'Message not sent';
	L['errors.remove.error'] = 'Failed to remove data';
	L['errors.fileupload.error'] = 'Failed to upload files';
	L['errors.fileupload.max.size'] = 'Max size of files';
	L['errors.file.link.error'] = 'Failed to attach files';
	L['errors.no.smtp.error'] = 'No sender specified';
	L['errors.no.recipients.error'] = 'No recipients specified';
	L['errors.error.agree.1'] = 'You must agree';
	L['errors.error.agree.2'] = 'to use the data of Kommo account';
	L['errors.error.save.1'] = 'Failed to save settings';
	L['errors.error.save.2'] = 'Try again later';
    L['errors.linked.1'] = 'Group selected';
    L['errors.linked.2'] = 'user selection is denied';
    L['errors.payed.users.exceeded'] = 'Limit of paid users exceeded';
	L['errors.user.permision.denied'] = 'Permission denied for this user';
	
	return function(term) {
		return L[term] ? L[term] : false;
	};
});