const path = require('path')

function findModuleName(fileName) {

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