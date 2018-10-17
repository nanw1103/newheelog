# newheelog
A new-wheel-logger for NodeJs. Simple do its task.

A previous version was based on winston and winston daily rotate file. There are some traps when used with cluster based workers. So New-wheel Logger is created.

* Short logging api: as it should be
* Self contained tiny code. No additional dependencies
* Optionally write log to file, with rotation based on size
* Optionally decorate console, with colors
* Log time, level, and auto-detected file/module name.
* support custom label (for cluster mode workers, etc)
* NodeJs default console.log/util.format convension

```javascript

//easy api
const log = require('newheelog')()

log('log')

//explicit level
log.debug('log.debug')
log.info('log.info')
log.warn('log.warn')
log.error('log.error')

//formatting
let d = {a: 1, b:'Transylvania'}
log('Formatting: %d %s %j', 12345, 'welcome to', d)
log('test error with stack:', new Error('demo'))

//alternatives
const {info, warn, error} = require('newheelog')()
Promise.reject('Hello, mortal')
	.then(info)
	.catch(error)
```
![newheelog screenshot](https://github.com/nanw1103/newheelog/blob/master/docs/screenshot.png?raw=true)

# Options

```javascript
const nwlog = require('newheelog')

nwlog.config({
	//decorateConsole: true,		//whether decorate console.log/console.error. Default: true
	//writeToConsole: true,			//whether write to console for log operations. Default: true
	fileName: './log/console.log',	//If not null, a log file will be created. Default: null
	//maxLength: 4 * 1024 * 1024,		//max file length
	//maxFiles: 3,				//max log files to keep
	//custom: () => 'custom-label-' + process.pid,	//A function to append custom label. E.g. add pid
	//maskPassword: true			//If enabled, tries to identify password string fields in logged objects and mask them. Default: false
	//moduleNamePadding: 12,		//Padding for module name. 0 for no padding. Default: 12
	//longLevelName: false			//Use long level name (e.g. "ERROR") instead of short level name (e.g. "E"). Default: false
})

const log = nwlog()
log('log')
```

