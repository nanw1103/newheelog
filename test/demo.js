const nwlog = require('../index.js')

nwlog.config({
	//decorateConsole: true,			//whether decorate console.log/console.error. Default: true
	//writeToConsole: true,				//whether write to console for log operations. Default: true
	fileName: './log/console.log',		//log file. If null, no log file will be created. Default: null
	//maxLength: 4 * 1024 * 1024,		//max file length
	//maxFiles: 3,						//max log files to keep
	custom: () => 'P' + process.pid,	//A function to append custom label. E.g. add pid
	maskPassword: true					//If enabled, tries to identify password string fields in log objects and mask them. Default: false.
										//An array of custom patterns can also be specified for the replacement.
	//moduleNamePadding: 0,				//Padding for module name. 0 for no padding. Default: 0
	//longLevelName: true				//Use long level name (e.g. "ERROR") instead of short level name (e.g. "E"). Default: true
})

const log = nwlog()

console.log('console.log')
console.debug('console.debug')
console.info('console.info')
console.warn('console.warn')
console.error('console.error')

log('log')
log.debug('log.debug')
log.info('log.info')
log.warn('log.warn')
log.error('log.error')

let obj = {
	a: 1,
	password: 'You must not see me',
	password1: 'You must not see me, too',
	adminPassword: 'You must not see me',
	secretAccessKey: 'You must not see me',
	awsSecretKey: 'You must not see me',
	nested: {
		password: 'I am a nested password'
	}
}
log('Demo mask password in obj', obj)
log('Demo mask password in string', JSON.stringify(obj))

//formatting
log('Formatting: %d %s %j', 12345, 'welcome to', {location:'Transylvania'})
log('test error with stack:', new Error('demo'))

const log2 = nwlog('another module')
log2('Hello from another module')
/*
const deleteOldFiles = require('./nwlog/delete-old-files.js')
let pattern = /^task-\d+\.log$/
let nameFilter = name => pattern.test(name)
deleteOldFiles('./log', nameFilter, 2).catch(console.error)
*/