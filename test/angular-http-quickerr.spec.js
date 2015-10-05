'use strict';

describe('Angular Http QuickErr', function () {

	var quickErr,
			mockCustomLogger, globalSetup, customSetup,
			mockQ, mockLocation;		//Angular dependencies

	// Set up spies
	beforeEach(function () {
		mockCustomLogger = {error: sinon.spy()};
		mockQ = {reject: sinon.spy()};
		mockLocation = {path: sinon.spy()};

		sinon.spy(console, 'error');

		globalSetup = {
			400: {
				template: 'This is default message without interpolation.'
			},
			401: {
				template: 'Hello, User! >>> {{data.description}}',
				postLog: '/login'
			},
			404: {
				template: 'Hello, User! This is a {{status}} error.',
				postLog: true
			},
			500: {
				template: 'Using custom logger for this error.',
				postLog: function () { console.log('I am a post-log function!'); },
				logger: mockCustomLogger.error
			},
			501: {
				template: 'This is message should NOT be displayed -> override by CUSTOM.'
			}
		};

		customSetup = {
			'Namespace': {
				501: { template: 'This is {{status}} in CUSTOM.' }
			}
		};

	});

	afterEach(function () {
		console.error.restore();
	});

	describe('Using quickErr handlers', function () {

		// Set up module & sample templates
		beforeEach(module('ngHttpQuickErr', function ($provide, quickErrProvider) {
			quickErrProvider.setGlobalHandlers(globalSetup);
			quickErrProvider.setCustomHandlers(customSetup);

			$provide.value('$q', mockQ);
			$provide.value('$location', mockLocation);
		}));

		// Inject service
		beforeEach(inject(function (_quickErr_) {
			quickErr = _quickErr_;
		}));

		it('should log normal message without extra options', function () {
			var testRes = {status: 400, data: {description: 'Should NOT log this'} };

			quickErr.handle(testRes);

			expect(console.error.calledWith(globalSetup['400'].template, sinon.match.object)).toBeTruthy();
		});

		it('should re-route to "/login" after logging', function () {
			var testRes = {status: 401, data: {description: 'Hello 401'} };

			quickErr.handle(testRes);

			expect(console.error.calledWith('Hello, User! >>> Hello 401', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.calledWith('/login')).toBeTruthy();
			expect(mockQ.reject.called).not.toBeTruthy();
		});

		it('should rethrow rejected promise after logging', function () {
			var testRes = {status: 404};

			quickErr.handle(testRes);

			expect(console.error.calledWith('Hello, User! This is a 404 error.', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.called).not.toBeTruthy();
			expect(mockQ.reject.called).toBeTruthy();
		});

		it('should use custom logger & call predefined "post-logging" callback', function () {
			var testRes = {status: 500};
			sinon.spy(console, 'log');

			quickErr.handle(testRes);

			expect(mockCustomLogger.error.calledWith('Using custom logger for this error.', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.called).not.toBeTruthy();
			expect(mockQ.reject.called).not.toBeTruthy();
			expect(console.log.calledWith('I am a post-log function!')).toBeTruthy();

			console.log.restore();
		});

		it('should use CUSTOM w/ Namespace handler', function () {
			var testRes = {status: 501};

			quickErr.handle(testRes, 'Namespace');

			expect(console.error.calledWith('This is 501 in CUSTOM.', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.called).not.toBeTruthy();
			expect(mockQ.reject.called).not.toBeTruthy();
		});

	});

	describe('Using quickErr as http error interceptor', function () {

		var $http, $httpBackend, $q, requestHandler;

		// Set up module & sample templates
		beforeEach(module('ngHttpQuickErr', function ($provide, quickErrProvider, $httpProvider) {
			quickErrProvider.setGlobalHandlers(globalSetup);
			quickErrProvider.setCustomHandlers(customSetup);

			//Add quickErr as interceptor
			$httpProvider.interceptors.push('quickErr');

			$provide.value('$location', mockLocation);
		}));

		beforeEach(inject(function (_$httpBackend_, _$http_, _$q_) {
			$httpBackend = _$httpBackend_;
			$http = _$http_;
			$q = _$q_;

			requestHandler = $httpBackend.whenGET('/test');

			sinon.spy($q, 'reject');
		}));

		afterEach(function () {
			$httpBackend.verifyNoOutstandingRequest();
			$q.reject.restore();
		});

		it('should log normal message without extra options', function () {
			requestHandler.respond(400, {description: 'Should NOT log this'});

			$http.get('/test');
			$httpBackend.flush();

			expect(console.error.calledWith(globalSetup['400'].template, sinon.match.object)).toBeTruthy();
		});

		it('should re-route to "/login" after logging', function () {
			requestHandler.respond(401, {description: 'Hello 401'});

			$http.get('/test');
			$httpBackend.flush();

			expect(console.error.calledWith('Hello, User! >>> Hello 401', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.calledWith('/login')).toBeTruthy();
			expect($q.reject.called).toBeTruthy();
		});

		it('should rethrow rejected promise after logging', function () {
			requestHandler.respond(404);

			$http.get('/test');
			$httpBackend.flush();

			expect(console.error.calledWith('Hello, User! This is a 404 error.', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.called).not.toBeTruthy();
			expect($q.reject.called).toBeTruthy();
		});

		it('should use custom logger & call predefined "post-logging" callback', function () {
			requestHandler.respond(500);
			sinon.spy(console, 'log');

			$http.get('/test');
			$httpBackend.flush();

			expect(mockCustomLogger.error.calledWith('Using custom logger for this error.', sinon.match.object)).toBeTruthy();
			expect(mockLocation.path.called).not.toBeTruthy();
			expect($q.reject.called).toBeTruthy();
			expect(console.log.calledWith('I am a post-log function!')).toBeTruthy();

			console.log.restore();
		});

	});

});
