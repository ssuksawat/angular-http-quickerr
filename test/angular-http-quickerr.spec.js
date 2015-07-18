'use strict';

describe('Angular Http QuickErr', function() {
	
	describe('Using GLOBAL handlers', function() {
		
		beforeEach(module('ngHttpQuickErr', function(quickErrProvider) {
			quickErrProvider.setGlobalHandlers({
					logger: 'after',
					400: {
						message: 'This is a 400 error',
						rethrow: true
					},
					401: {
						message: 'This is a 401 error',
						redirect: '/login'
					},
					500: {
						message: 'This is a 500 error',
						callback: function() { console.log('callback 500 called'); }
					}
				});
		}));
		
		var quickErr;
		beforeEach(inject(function(_quickErr_) {
			quickErr = _quickErr_;
		}));
		
		it('should say "hi"', function() {
			console.log('hi');
			quickErr.handle();
			
			expect(true).toBeTruthy();
		});
	});
	
});