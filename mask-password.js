function maskPwd(o, k) {
	const mask = '*****'
	if (o[k].value)
		o[k].value = mask
	else
		o[k] = mask
}

function maskObj(o) {
	let changed
	for (let k in o) {
		let tmp = k.toLowerCase()
		if (tmp.indexOf('password') >= 0
				|| tmp.indexOf('pwd') >= 0
				|| (tmp.indexOf('secret') >= 0 && tmp.indexOf('key') >= 0)) {
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

const PATTERNS = [
	/(["'][^"']*password[^"']*["']\s*:\s*["'])([^"']*)(["'])/img,
	/(["'][^"']*pwd[^"']*["']\s*:\s*["'])([^"']*)(["'])/img,
	/(["'][^"']*secret[^"']*key[^"']*["']\s*:\s*["'])([^"']*)(["'])/img
]

function maskString(s, additionalPatterns) {
	for (let p of PATTERNS)
		s = s.replace(p, '$1********$3')
	if (Array.isArray(additionalPatterns) && additionalPatterns[0] instanceof RegExp) {
		for (let p of additionalPatterns)
			s = s.replace(p, '$1********$3')
	}
	return s
}

function maskPassword(args, patterns) {
	for (let k in args) {
		let v = args[k]

		try {
			if (typeof v === 'string') {
				args[k] = maskString(v, patterns)
				continue
			}

			if (typeof v !== 'object')
				continue

			let tmp = JSON.parse(JSON.stringify(v))	//make a copy to avoid changing the passed-in object
			if (maskObj(tmp))
				args[k] = tmp
		} catch (e) { }
	}
}

module.exports = maskPassword