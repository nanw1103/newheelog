const path = require('path')

const pattern = /^.*\((.*\.js):.*\)$/
function identifyStackFiles() {
	let e = new Error
	let lines = e.stack.split('\n').slice(2)
	let files = []
	for (let i = 0; i < lines.length; i++) {
		let m = pattern.exec(lines[i])
		if (m && m[1])
			files.push(m[1])
	}
	return files
}

function findModuleName(fileName) {

	if (!fileName)
		fileName = identifyStackFiles()[2]

	let name = path.basename(fileName)
	if (name.endsWith('.js'))
		name = name.substr(0, name.length - 3)

	if (name === 'index') {
		let dir = path.dirname(fileName)
		name = path.basename(dir)
		if (name === 'lib')
			name = path.basename(path.dirname(dir))
	}
	return name
}


module.exports = findModuleName