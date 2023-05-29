import MenuButton from "@/components/menubutton";
import Rooms from "@/components/rooms";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useEffect } from "react";

export default function Play() {
    const supabase = useSupabaseClient();
    const session = useSession();

    if(!session) return (
        <div className='w-full h-full p-8 flex flex-col items-center justify-center'>
            <a href="/" className="w-[40vw] h-[30vh]">
            <MenuButton text='Log in' />
            </a>
        </div>
    );
    if(!supabase) return;   

    return (
        <>
            <Head>
                <title>TKK</title>
                <meta name="description" content="Többjátékos kártyajáték keretrendszer" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className='w-screen h-screen bg-[#e0e0e0]' style={{height: '100svh'}}>
                <Rooms supabase={supabase} session={session} />
            </main>
        </>
    )

    return (
        <>
            <Head>
                <title>TKK</title>
                <meta name="description" content="Többjátékos kártyajáték keretrendszer" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className='w-full h-full'>
                <div className="w-full h-full flex flex-col">
                    <div className='w-full h-full'>
                        <Rooms supabase={supabase} session={session} />
                    </div>
                </div>
                <button onClick={async () => {
                    let { error } = await supabase.auth.signOut()
                }}>
                    logout
                </button>
            </main>
        </>
    )
}