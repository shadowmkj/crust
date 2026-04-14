import { auth } from '../src/lib/auth.js'

async function main() {
  console.log('🌱 Seeding database...')

  try {
    await auth.api.signUpEmail({
      body: {
        email: 'admin@wecode.com',
        password: 'password',
        name: 'Administrator',
      },
    })
    console.log(`✅ Created admin with email: admin@wecode.com, password: password`)
  } catch (e: unknown) {
    if ((e as Error).message?.includes('already exists')) {
     console.log('Admin already exists')
    } else {
      console.warn('Could not create admin via better-auth:', e)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
