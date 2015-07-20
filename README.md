# angular-http-quickerr
When working with Angular $http, how often do you write boiler-plate code to log error like this?...
```javascript
angular.module('app').factory('someFactory', function ($http, someLogger) {
  ...
  $http.get(...).then(successCallback, errorCallback);
  ...
  function errorCallback (response) {
    if (response.status === 404) {
      //do something
    }
    if (response.status === 500) {
      //do another
    }
    //...and so on~
  }
});
```
Wouldn't you rather be doing this?...
```javascript
  angular.module('app').factory('someFactory', function ($http, quickErr) {
    ...
    ...
    function errorCallback (response) {
      quickErr.handle(response);  // THIS!!
    }
  });
```

YES! This module will allow you to pre-define error handlers as JSON, and then replace your super long boiler-plate error handling code with a one-liner!

## Getting started

1) Download this repository...(Bower coming soon! Need to add some more parameter validations)

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
  Format:
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
  Format:
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
  -  Example response JSON:
    ```json
    {
      "status-code": 400,
      "description": "This is a 400 error",
      "data": {...}
    }
    ```
  -  Set the *key* to match the property that contains your error code
    ```javascript
    quickErrProvider.setResponseFormat({key: 'status-code'});
    ```

**Note:**
By default, the module is set to use `console.error` to log error. The module passes 2 argument when calling the log function - message and response object, respectively. 

Here is how to replace the global logger setting,
```javascript
quickErrProvider.setGlobalHandlers({
  DEFAULT: {
    logger: newLogger.logFunction   //provide function to call to log error
  }
});
```


### Configuration Options

- `'template'`: String -> message to log
  - Can be plain string, e.g. "Hello, I am your error". Or...
  - *Template String* to interpolate, e.g. "{{status-code}} - {{description}}". 
    - Anything with `{{Property Name}}` will be replaced with the value of that property from the Response JSON
  
- `'postLog'`: Action to perform after logging an error message. There are 3 options
  1. Boolean -> set to `true` to rethrow **rejected** promise
  2. String -> path to redirect, needs to start with '/'. For example, '/login'
  3. Function -> default callback function

- `'logger'`: Function -> custom logging function.


### Handle error

As seen in the example above, use `'quickErr'` service to handle an error. simply call `quickErr.handle()` inside the Angular promise `catch()` or errorCallback block

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

- Provide a callback to call after logging an error. *quickErr* will call the callback function **instead of** "postLog" action
    ```javascript
    quickErr.handle(res, undefined, someCallbackFn);
    ```
