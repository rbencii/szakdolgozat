import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Rooms from '@/components/rooms'

const Home = () => {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <>
      <Head>
        <title>TKK</title>
        <meta name="description" content="Többjátékos kártyajáték keretrendszer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className='w-full h-full'>
        <div className="w-full h-full flex flex-col">
          {!session ? (
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} magicLink={false} providers={[]} theme="dark" />
          ) : (
            <div className='w-full h-full flex flex-col items-center'>
              <div>Logged in</div>
              <a href="/play">Play</a>
              <a href="/editor">Editor</a>
              <button onClick={async () => {
                let { error } = await supabase.auth.signOut()
              }}>
                logout
              </button>
            </div>
          )}
        </div>

      </main>
    </>

  )
}

export default Home