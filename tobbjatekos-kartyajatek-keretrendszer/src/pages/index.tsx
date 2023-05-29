import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Rooms from '@/components/rooms'
import Card2 from '@/components/card2'
import MenuButton from '@/components/menubutton'

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
      <main className='w-full h-full bg-[#e0e0e0]'>
        <div className="w-full h-full p-8 flex flex-col items-center justify-center">
          {!session ? (
            <div className='w-full max-w-md'>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa, variables: {default: {colors: {brand: 'rgb(93 222 239)', brandAccent: 'rgb(34 211 238)', inputBackground: 'white'}}} }} magicLink={false} providers={[]} theme="default" />
            </div>
          ) : (
            <div className='w-full h-full flex flex-col items-center justify-center gap-6'>
              <a href="/play" className="max-w-[20rem] w-full max-h-16 h-full">
                <MenuButton text='Play' />
              </a>

              <a href="/editor" className="max-w-[20rem] w-full max-h-16 h-full">
                <MenuButton text='Editor' />
              </a>

              <button className="max-w-[20rem] w-full max-h-16 h-full" onClick={async () => {
                let { error } = await supabase.auth.signOut()
              }}>
                <MenuButton text='Log out' />
              </button>
            </div>
          )}
        </div>

      </main>
    </>

  )
}

export default Home