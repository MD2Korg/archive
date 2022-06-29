/*!
 * <%= meta.title %> v<%= meta.version %> Google Calendar Plugin
 * Docs & License: <%= meta.homepage %>
 * (c) <%= meta.copyright %>
 */
 
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery' ], factory);
	}
	else {
		factory(jQuery);
	}
})(function($) {


var fc = $.fullCalendar;
var applyAll = fc.applyAll;


fc.sourceNormalizers.push(function(sourceOptions) {
	if (sourceOptions.dataType == 'gcal' ||
		sourceOptions.dataType === undefined &&
		(sourceOptions.url || '').match(/^(http|https):\/\/www.googleapis.com\/calendar\/v3\/calendars/)) {
			sourceOptions.dataType = 'gcal';
			if (sourceOptions.editable === undefined) {
				sourceOptions.editable = false;
			}
		}
});


fc.sourceFetchers.push(function(sourceOptions, start, end, timezone) {
	if (sourceOptions.dataType == 'gcal') {
		return transformOptions(sourceOptions, start, end, timezone);
	}
});


function transformOptions(sourceOptions, start, end, timezone) {

	var success = sourceOptions.success;
	var data = $.extend({}, sourceOptions.data || {}, {
		'maxResults': 2500,
		'singleEvents': true
	});

	return $.extend({}, sourceOptions, {
		url: sourceOptions.url + '&callback=?',
		dataType: 'jsonp',
		data: data,
		timezoneParam: 'ctz',
		startParam: 'timeMin',
		endParam: 'timeMax',
		success: function(data) {
			var events = [];
			if (data.items) {
				$.each(data.items, function(i, entry) {
					if (typeof (entry.start) != 'undefined') {
						if (entry.description) {
							entry.description = entry.description.replace(/'/g, "&apos;");
							entry.description = entry.description.replace(/"/g, "&quot;");
						}
						if (sourceOptions.showBusy) {
							events.push({
									id: entry.iCalUID,
									title: sourceOptions.showBusy,
									start: entry.start.dateTime || entry.start.date,
									end: entry.end.dateTime || entry.end.date
							});
						} else {
							if (entry.description) {
								events.push({
									id: entry.iCalUID,
									title: entry.summary,
									start: entry.start.dateTime || entry.start.date,
									end: entry.end.dateTime || entry.end.date,
									url: 'index.php?option=com_vjcalendar&gcaleventid=' + entry.id + '&calid=' + sourceOptions.calendarid + '&gcaleventstr=' + Base64.encode(entry.summary + '|' + (entry.start.dateTime || entry.start.date) + '|' + (entry.end.dateTime || entry.end.date) + '|' + entry.location + '|' + entry.description),
									location: entry.location,
									description: entry.description
								});
							} else {
								events.push({
									id: entry.iCalUID,
									title: entry.summary,
									start: entry.start.dateTime || entry.start.date,
									end: entry.end.dateTime || entry.end.date,
									url: 'index.php?option=com_vjcalendar&gcaleventid=' + entry.id + '&calid=' + sourceOptions.calendarid + '&gcaleventstr=' + Base64.encode(entry.summary + '|' + (entry.start.dateTime || entry.start.date) + '|' + (entry.end.dateTime || entry.end.date) + '|' + entry.location + '|' + entry.description),
									location: entry.location
								});
							}
						}
					}

				});
			}
			var args = [events].concat(Array.prototype.slice.call(arguments, 1));
			var res = applyAll(success, this, args);
			if ($.isArray(res)) {
				return res;
			}
			return events;
		}
	});
	
}


// legacy
fc.gcalFeed = function(url, sourceOptions) {
	return $.extend({}, sourceOptions, { url: url, dataType: 'gcal' });
};


});
