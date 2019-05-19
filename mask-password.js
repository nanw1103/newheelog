'use strict'

function maskPwd(o, k) {
	const mask = '********'
	if (typeof o[k] === 'string'){
		o[k] = mask
	} else if (typeof o[k] === 'object'){
		if (o[k].value){
			o[k].value = mask
		} else {
			o[k] = mask
		}
	}
}

function maskObj(o) {
	let changed
	for (let k in o) {
		let tmp = k.toLowerCase()
		if (tmp.indexOf('password') >= 0 || tmp.indexOf('pwd') >= 0) {
			maskPwd(o, k)
			changed = true
			continue
		}

		let v = o[k]
		if (typeof v === 'object')
			changed |= maskObj(v)
	}
	return changed
}

function maskString(s) {
	let PATTERN = /(["'][^"']*password[^"']*["']\s*:\s*["'])([^'"]*)(["'])/img
	s = s.replace(PATTERN, '$1********$3')

	PATTERN = /(['][^']*pwd[^']*[']\s*:\s*['])([^']*)(['])/img
	s = s.replace(PATTERN, '$1********$3')

	//"/passwordd:VMware123"
	PATTERN = /(.* \/passwordd:)(.*)(\s*.*)/img
	s = s.replace(PATTERN, '$1********$3')
	return s
}

function maskPassword(args) {
	for (let k in args) {
		let v = args[k]

		try {
			if (typeof v === 'string') {
				args[k] = maskString(v)
				continue
			}

			if (typeof v !== 'object')
				continue

			let tmp = JSON.parse(JSON.stringify(v))	//make a copy to avoid changing passed-in object
			if (maskObj(tmp))
				args[k] = tmp
		} catch (e) { }
	}
}

module.exports = maskPassword