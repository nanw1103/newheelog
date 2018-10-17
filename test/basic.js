const log = require('../index.js')()

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

log('an object', {
	a: 1,
	b: {
		c: 'asdf'
	}
})
