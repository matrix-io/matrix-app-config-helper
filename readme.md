## Matrix Configuration Documentation

Hello, welcome to Matrix Configuration.

We use YAML to make MatrixOS application configuration easy for humans.

https://en.wikipedia.org/wiki/YAML

## Ecosystem Touchpoints

- Matrix OS - Used to provide runtime variables, initialize sensors, integrations and watch for CrossTalk events.
- Dashboard - Used to Layout Dashboards, Provide widgets with formatted & filtered data, manage control events, provide display formatting information for widgets
- MXSS - Used to generate schemas and potentially configure vision services
- App Store - Images, icons, name, description, version, keywords
- MVF - Config Services describes CV algorithms and parameters.
- CLI - Matrix CLI can be used to view and modify the Firebase configuration

## Configuration Lifecycle

When a MatrixOS application starts, by default it loads the Firebase configuration. If there is no config saved, MatrixOS reads from `app.matrix/config.yaml`, then parses, validates and populates the Firebase record. The population step is important because it expands the configuration and makes it more accessible for humans to write powerful code with simple configuration commands. Functionally, this means **What is saved in Firebase WILL be slightly different from what is in config.yaml**. So don't be surprised.

When a dashboard loads an application, it loads the configuration from Firebase.

When the CLI changes a configuration variable, it will restart the MatrixOS application.

Currently, you must manually delete an old application configuration from Firebase before loading a new one from `config.yaml`. Soon, there will be an CLI invalidate command of some sort to make this easier. `matrix config appname -x`

#### Development Note
This is a work in progress. This documentation is a target, but full functionality is not yet enabled across all properties. `config.yaml` is an example of the targeted spec, which includes multiple controls and displays per widget. We also want to provide the capacity for applications to be purely configuration driven.

To integrate features properly, they should be validated here first, then changes should be made to the dashboard. The config is also used by the MXSS to create table schemas.

### Testing

To use this codebase to test if you have a valid Configuration

```
node index.js test config.yaml
```

These are also exposed via the `read()` and `validate()` methods.

# Configuration

## First Level - App Meta Information
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
  - bigtime-event

# which sensors to use with this application
sensors:
  - camera
  - gps

# indicates what version of the configuration is being used
configVersion: 2
```

## First Level - Runtime Information
```
# these variables are available in the application, this can be end user set
# is intended for API keys and the like
configuration:
foo: bar

# indicates the types of data to expect from the application,
# used to make explicit data tables and validate widget type requests
dataTypes:
  temperature: float
  cloudy: boolean
  face:
    smile: float
    gender: integer
    age: integer
  name: string
  count: integer
```

## First Level - Dashboard Information
```
# data structure determines layout
screens:
  # main is the default, we want to support multiple screens per app soon
  main:
    # each nested array here is a row
    - - widget1
    # widget1 must refer to a key in widgets
    # thirds
    - - widget13
      - widget23
      - widget33
    # full width
    - - widget2


# widgets are defined here, this is the meat of the dashboard configuration
widgets:

  # widget1 key must exist in screens arrays
  # a line chart of temperature over time
  widget1:
    # every data driven widget must have a type
    # type is made available by using matrix.type('temperature').send( t )
    type: temperature

    # display controls the type of widget which interprets the data
    # line, bar, list, digit, list-group, gauge, list-details, indicator,
    # radar, heat-map, map, pie, label
    display: line

  # data from a face recognition algorithm, charted with bars
  widget13:
    # using an object enables key selection
    type: face

    # key / keys is what data to display from your type
    # matrix.type('face').send({ age: 17, gender: 0, smile: 0.722 })
    key: smile

    # or for multiple key selection
    keys: age, smile
    # is equivalent to
    keys:
      - age
      - smile

    # bar charts
    display: bar

    # adds a title to your widgets
    label: age and smiles

    # filters, described below, are date ranges to display for a given data set
    filter: recent

    # formats filter numerical data
    # round, percent, fixed, avg, mean, max, min, count
    format: round

    # different formats for data
    format:
      age: round
      smile: percent

  # trigger event in application
  widget23:

    # control is for interactive controls, they trigger events in applications
    # input, keyboard, button, switch, range, xy, radial, radio, select,
    # video, audio, label, picture, upload

    control: button
    options:
      label: trigger
      event: doEvent
    label: action
```
### First Level - filters
Filters are a way to express and reuse date ranges at this time. More functionality is planned to match `matrix-eventfilter-sdk`.
```
filters:
  # recent key used in widget format definition above
  recent:
    # only filter planned for now
    dateRange: 5 minutes

    # all widgets will have this filter by default to start
    default: true

```
Should format info be moved here? Is date + data formatting too much responsibility overlap?

### First Level - services
Services describe external data providers, currently CV.
```
services:
  # name used to refer to face in widget service definition
  face:
    # which CV algorithm to use
    # crowd-analytics, face-recognition, vehicle-count, gesture
    engine: face-analytics

    # specify algorithm parameters (TODO: define when available)
    engineParams:
      distanceThreshold: 50
      minAge: 18
      minSmile: 0.2

      # example of zone detection
      zones:
        entrance:
        - - 24
          - 33
        - - 24
          - 42
        - - 42
          - 100
        - - 100
          - 110

    # what is the data type ( if not set in application )
    type: face
```
