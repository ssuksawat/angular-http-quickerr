(function(){
	
	'use strict';
	
	angular.module('ngHttpQuickErr', [])
		.provider('quickErr', function($provide) {
			var handlers = {
				GLOBAL: {},
				CUSTOM: {}
			};
			
			return {
				setGlobalHandlers: setGlobalHandlers,
				setCustomHandlers: setCustomHandlers,
				$get: instantiateFactory
			};
			
			/* ----- PUBLIC ----- */
			
			function setGlobalHandlers(newHandlers) {
				angular.extend(handlers.GLOBAL, newHandlers);
			}
			
			function setCustomHandlers(newHandlers) {
				angular.extend(handlers.CUSTOM, newHandlers);
			}
			
			/* ----- FACTORY API ----- */
			
			function instantiateFactory() {
				var service = {
					handle: handle
				};
				
				return service;
				
				/* ----- PUBLIC ----- */
				
				function handle() {
					console.log('print handlers: ', handlers);
				}
			}
			
		});
	
}());