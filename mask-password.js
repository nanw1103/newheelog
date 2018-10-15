'use strict'

function maskPassword(args) {

	function maskObj(o) {
		let changed
		for (let k in o) {
			if (k.toLowerCase().indexOf('password') >= 0) {
				o[k] = '********'
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

		//"/passwordd:VMware123"
		PATTERN = /(.* \/passwordd:)(.*)(\s*.*)/img
		s = s.replace(PATTERN, '$1********$3')
		return s
	}

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