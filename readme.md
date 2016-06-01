## Matrix Configuration Documentation

Hello, welcome to Matrix Configuration.

### Testing

To use this codebase to test if you have a valid Configuration

```
node index.js test config.yaml
```

These are also exposed via the `read()` and `validate()` methods.

# Configuration

## First Level
```
# this is used to identify your application to the system and to users
name:
description:
version:
images:
icon:
keywords:

# which external devices are integrating with your app
integrations:
  - nest

# which events does this app emit or listen for
crosstalk:
  -

# these variables are available in the application, this can be end user set and is intended for API keys and the like
configuration:
  foo: bar

# indicates what version of the configuration is being used
configVersion: 2

# indicates the types of data to expect from the application, used to make data tables 
dataTypes:
  temperature: 'float',
  cloudy: 'boolean',
  face: 'object',
  name: 'string',
  count: 'integer'
```
