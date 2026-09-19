const { User } = require('../models/models')

async function demo() {
    const users = await User.findAll()
    console.log('Пользователи:')
    users.forEach(u => console.log(`  #${u.id}  ${u.login}`))
    process.exit(0)
}
demo()