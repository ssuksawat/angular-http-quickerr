# angular-http-quickerr
Simple angular module for handling http error response

## Getting started

1) Download this repository...(Bower coming soon! Need to run some more tests)

2) Include script
```html
...
<script src="PATH/TO/SCRIPT/angular-http-quickerr.min.js"></script>
...
```

3) Add `'ngHttpQuickErr'` module to your main Angular module
```javascript
var app = angular.module('app', ['ngHttpQuickErr']);
```


## Usage
### Configure Error Handlers
`'quickErrProvider'` will be injected during angular configuration phase
```javascript
angular.module('app').config(function (quickErrProvider) {
...
});
```

- Use `setGlobalHandlers()` to set default handlers to be use across the app
  - Format:
    ```javascript
    quickErrProvider.setGlobalHandlers({
      400: {
        //See "Configuration Options" section below for description
        template: 'This is a {{status}}: {{description}}',
        postLog: true
        logger: customLogger.error
      },
      ...
      ...
    });
    ```
- Use `setCustomHandlers()` to set error handlers with specific "namespace"
  - Format:
    ```javascript
    quickErrProvider.setCustomHandler({
      'some-namespace': {
        400: {  // This will override global settings if namespace is provided during error handling
          ...
        }
      },
      ...
    });
    ```
- Use `setResponseFormat` to set the property name of the response JSON to be use as the key - DEFAULT: *'status'*
  - Example response JSON:
    ```json
    {
      "status-code": 400,
      "description": "This is a 400 error"
      "data": {...some data...}
    }
    ```
  - Set the *key*  to match the property that contains your error code
    ```javascript
    quickErrProvider.setResponseFormat({key: 'status-code'});
    ```

### Configuration Options
- `'template'`: String -> message to log
  - Can be plain string, e.g. "Hello, I am your error". Or...
  - *Template String* to interpolate, e.g. "{{status-code}} - {{description}}". Anything with `{{Property Name}}` will be replaced with the value of that property from the Response JSON
- `'postLog'`: Action to perform after logging an error message. There are 3 options
  1. 
- `'logger'`

### Handle error
Use `'quickErr'` to handle an error. simply call `quickErr.handle()` inside the Angular promise `catch()` or errorCallback block
- handle error with Global settings, pass `handle()` the response object
  ```javascript
  angular.module('app').service(function ($http, quickErr) {
    ...
    function someFunctionThatCallsHTTP() {
      $http.get(...)
        .then(successCallback)
        .catch(function (res) {
          quickErr.handle(res);
        });
      ;
    }
  });
  ```
- handle error with Custom settings, pass `handle()` the response object AND namespace
  ```javascript
  angular.module('app').service(function ($http, quickErr) {
    ...
    function someFunctionThatCallsHTTP() {
      $http.get(...)
        .then(successCallback)
        .catch(function (res) {
          quickErr.handle(res, 'some-namespace');
        });
      ;
    }
  });
  ```
- have *quickErr* call a callback after logging an error. *quickErr* will call the callback function instead of "postLog" action
  ```javascript
  quickErr.handle(res, undefined, someCallbackFn);
  ```
