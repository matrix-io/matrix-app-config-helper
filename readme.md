
## Matrix Configuration Utility

Hello, welcome to Matrix Configuration. This module helps to verify, construct and validate MatrixOS Application configurations.

We use YAML to make configuration easy for humans.

https://en.wikipedia.org/wiki/YAML

###### Bugs
https://github.com/matrix-io/matrix-app-config-helper/issues

###### Questions
http://community.matrix.one

###### Documentation
http://matrix-io.github.io/matrix-documentation

## Ecosystem Touchpoints

- Matrix OS - Used to provide runtime variables, initialize sensors, integrations and watch for CrossTalk events.
- Dashboard - Used to Layout Dashboards, Provide widgets with formatted & filtered data, manage control events, provide display formatting information for widgets
- MXSS - Used to generate schemas and potentially configure vision services
- App Store - Images, icons, name, description, version, keywords
- MVF - Config Services describes CV algorithms and parameters.
- CLI - Matrix CLI can be used to view and modify the Firebase configuration

## Configuration Lifecycle

When a MatrixOS application starts, by default it loads the Firebase configuration. If there is no config saved, MatrixOS reads from `app.matrix/config.yaml`, then parses, validates and populates the Firebase record. The population step is important because it expands the configuration and makes it more accessible for humans to write powerful code with simple configuration commands. Functionally, this means **What is saved in Firebase WILL be slightly different from what is in config.yaml**. So don't be surprised.

Meta information is stripped from config when an application is installed to `deviceapps/` in firebase.

When a dashboard loads an application, it loads the configuration from Firebase.

When the CLI changes a configuration variable, it will restart the MatrixOS application.

Currently, you must manually delete an old application configuration from Firebase before loading a new one from `config.yaml`. Soon, there will be an CLI invalidate command of some sort to make this easier. `matrix config appname -x`

#### Development Note

To integrate new configuration features properly, they should be validated here first, then changes should be made to the MatrixOS and dashboard.

### Testing

To use this codebase to test if you have a valid Configuration

```
node index.js test config.yaml
```

These are also exposed via the `read()` and `validate()` methods.

# Configuration

Documentation: http://github.io/matrix-io/matrix-documentation/Configuration
