/**
 * @author: Sompop Suksawat <ssuksawat21@gmail.com>
 */

(function(){

	'use strict';

	angular.module('ngHttpQuickErr', [])
		.provider('quickErr', function() {
			var config = {
				key: 'status'
			};
			var handlers = {
				GLOBAL: {
					DEFAULT: {
						logger: console.error,
						template: '{{status}}: {{description}}!'
					}
				},
				CUSTOM: {}
			};

			return {
				setResponseFormat: setResponseConfig,
				setGlobalHandlers: setGlobalHandlers,
				setCustomHandlers: setCustomHandlers,
				$get: ['$q', '$location', instantiateFactory]
			};

			/* ----- PUBLIC ----- */

			function setResponseConfig(newConfig) {
				angular.extend(config, newConfig);
			}

			function setGlobalHandlers(newHandlers) {
				angular.extend(handlers.GLOBAL, newHandlers);
			}

			function setCustomHandlers(newHandlers) {
				angular.extend(handlers.CUSTOM, newHandlers);
			}

			/* ----- FACTORY API ----- */

			function instantiateFactory($q, $location) {
				var service = {
					handle: handle,
					responseError: handle
				};

				return service;

				/* ----- FACTORY PUBLIC ----- */

				function handle(res, customType, callback) {
					var message, logger, postLog;

					if (res) {
						// Retrieve all parameters
						message = getTemplate(res, customType);
						message = interpolateMessage(message, res);
						logger = getLogger(res, customType);
						postLog = getPostLogAction(res, customType);

						// Log error message
						logger(message, res);

						// Either callback or 'post-log' action
						if (callback && typeof callback === 'function') {
							callback(res);
						} else if (postLog) {	//Perform predefined post-log action
							// rethrow error promise
							if (typeof postLog === 'boolean') {
								return $q.reject(res);
							}
							// redirect to specified path
							if (typeof postLog === 'string' && postLog.length > 0) {
								$location.path(postLog);
							}
							// call predefined postlog function
							if (typeof postLog === 'function') {
								postLog(res);
							}
						}
					} else {
						return $q.reject(res);		//rethrow the rejected promise if response is undefined
					}
				}

				/* ----- FACTORY PRIVATE ----- */

				function interpolateMessage(str, res) {
					return str.replace(/{{(.*?)}}/g, function (_, prop) {
						if(prop.indexOf('.') > -1) {
							var target = res;
							var iter = prop.split('.');
							while (iter.length) {
								target = target[iter.shift()];
							}
							return target;
						}
						return res[prop] || '';
					});
				}

				function getTemplate(res, customType) {
					if (customType && handlers.CUSTOM[customType][res[config.key]].template) {
						return handlers.CUSTOM[customType][res[config.key]].template;
					} else if (handlers.GLOBAL[res[config.key]].template) {
						return handlers.GLOBAL[res[config.key]].template;
					} else {
						return handlers.GLOBAL.DEFAULT.template;
					}
				}

				function getLogger(res, customType) {
					if (customType && handlers.CUSTOM[customType][res[config.key]].logger) {
						return handlers.CUSTOM[customType][res[config.key]].logger;
					} else if (handlers.GLOBAL[res[config.key]].logger) {
						return handlers.GLOBAL[res[config.key]].logger;
					} else {
						return handlers.GLOBAL.DEFAULT.logger;
					}
				}

				function getPostLogAction(res, customType) {
					if (customType && handlers.CUSTOM[customType][res[config.key]].postLog) {
						return handlers.CUSTOM[customType][res[config.key]].postLog;
					} else if (handlers.GLOBAL[res[config.key]].postLog) {
						return handlers.GLOBAL[res[config.key]].postLog;
					} else {
						return ;
					}
				}

			}

		});

}());
