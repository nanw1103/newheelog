const path = require('path')
const fs = require('fs')
const util = require('util')
const maskPassword = require('./mask-password.js')
const findModuleName = require('./find-module-name.js')
const EOL = require('os').EOL

const defaultOptions = {
	decorateConsole: true,
	writeToConsole: true,
	fileName: null,	//'./log/console.log',
	maxLength: 4 * 1024 * 1024,
	maxFiles: 3,
	//custom: () => 'custom label',
	maskPassword: false,
	moduleNamePadding: 0,
	longLevelName: true,
	colorizeConsole: true
}

const COLORS = {
	verbose:	'\u001b[34m',
	debug:		'\u001b[36m',
	info:		'\u001b[32m',
	warn:		'\u001b[33m',
	error:		'\u001b[91m',
	_closing:	'\u001b[39m'
}

function levelSymbol(level) {
	let s = level.toUpperCase()
	s = options.longLevelName ? s.substring(0, 5).padEnd(5) : s.substring(0, 1)
	let consoleSymbol = options.colorizeConsole ? COLORS[level] + s + COLORS._closing : s
	return [s, consoleSymbol]
}

let currentLogLength = 0

let options = Object.assign({}, defaultOptions)

let fullPath
let fdOut

let originalConsole = {
	log: console.log,
	debug: console.debug,
	info: console.info,
	warn: console.warn,
	error: console.error,
}

function config(overrides) {
	
	options = Object.assign(options, overrides)
	
	let refreshFiles = !fdOut && options.fileName
	if (refreshFiles) {
		let newPath = path.resolve(options.fileName)
		
		if (fullPath !== newPath) {
			fullPath = newPath
			try {
				fs.mkdirSync(path.dirname(fullPath))
			} catch (e) {
				//omit
			}
			
			rollLogs()
		}
	}
	
	decorateConsole(options.decorateConsole)
	
	return options
}

function decorateConsole(flag) {
	if (flag === false) {
		if (console.log !== originalConsole.log) {
			console.log = originalConsole.log
			console.debug = originalConsole.debug
			console.info = originalConsole.info
			console.warn = originalConsole.warn
			console.error = originalConsole.error
		}
	} else {
		if (console.log === originalConsole.log) {
			console.log = (...args) => _log('info', args)
			console.debug = (...args) => _log('debug', args)
			console.info = (...args) => _log('info', args)
			console.warn = (...args) => _log('warn', args)
			console.error = (...args) => _log('error', args)
		}
	}
}

function rollLogs() {
	
	if (fdOut)
		fs.closeSync(fdOut)
	
	currentLogLength = 0
	
	function rollOut(i) {
		let name = i === 0 ? fullPath : (fullPath + '.' + i)
		try {
			if (!fs.existsSync(name))
				return
			if (i >= options.maxFiles - 1) {
				fs.unlinkSync(name)
				return
			}
			rollOut(i + 1)
			fs.renameSync(name, fullPath + '.' + (i + 1))
		} catch (e) {
			process.stderr.write(e.toString())
		}
	}
	rollOut(0)
	fdOut = fs.openSync(fullPath, 'a')
}

function write(text) {
	try {
		fs.writeSync(fdOut, text)
	} catch (e) {
		process.stderr.write(e.toString())
		
		try {
			fs.closeSync(fdOut)
		} catch (e) {
			process.stderr.write('NWLOG: closing fd failed: ' + e.toString())
		}
		
		try {
			fdOut = fs.openSync(fullPath, 'a')
		} catch (e) {
			process.stderr.write('NWLOG: reopen fd failed: path=' + fullPath + ', error=' + e.toString())
		}
	}
	
	if (options.maxLength > 0) {
		currentLogLength += Buffer.byteLength(text)
		if (currentLogLength >= options.maxLength)
			rollLogs()
	}
}

function _log(level, args, moduleName) {
	options.maskPassword && maskPassword(args)
	let content = util.format.apply(null, args)
	
	let modulePart
	if (moduleName) {
		if (options.moduleNamePadding)
			moduleName = moduleName.padEnd(options.moduleNamePadding)
		modulePart = '[' + moduleName + '] '
	} else {
		modulePart = ''
	}
	
	let customPart
	if (options.custom) {
		if (typeof options.custom === 'function')
			customPart = options.custom()
		else
			customPart += options.custom
		customPart += ' '
	} else {
		customPart = ''
	}
	
	let contentPart = `${customPart}${modulePart}${content}${EOL}`
	let timePart = new Date().toISOString()
	
	const [plainSymbol, consoleSymbol] = levelSymbol(level)
	if (options.writeToConsole) {
		let text = `${timePart} ${consoleSymbol} ${contentPart}`
		if (level === 'error' || level === 'warn')
			process.stderr.write(text)
		else
			process.stdout.write(text)
		//FIXME
		//Do not use console log/error here. It has trouble when using cluster/worker. 
		//The output are overlapped.
		//originalConsole[level](text)
	}
		
	
	if (options.fileName)
		write(`${timePart} ${plainSymbol} ${contentPart}`)		
}

//----------------------------------------------------------------------
//	Main logger export
//----------------------------------------------------------------------
function loggerFunc(moduleName) {

	moduleName = findModuleName(moduleName)
	
	function logF(...args) {
		_log('info', args, moduleName)
	}
	
	logF.log = logF	
	logF.info = logF
	logF.debug = (...args) => _log('debug', args, moduleName)	
	logF.warn = (...args) => _log('warn', args, moduleName)
	logF.error = (...args) => _log('error', args, moduleName)
	logF.verbose = (...args) => _log('verbose', args, moduleName)
	return logF
}

loggerFunc.config = config
loggerFunc.COLORS = COLORS

config()

module.exports = loggerFunc