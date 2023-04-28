import { AuthError } from "@supabase/supabase-js";
import { useState } from "react";

export default function login(){
    const [error, setError] = useState(null as AuthError | null);
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const {email, password} = e.target.elements;

        const options : RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        }

        const res = await fetch('api/signup', options);
        const obj = await res.json();
        setError(obj?.error);
        console.log(obj?.error)

    }

    const handleSubmit2 = async (e: any) => {
        e.preventDefault();
        const {email, password} = e.target.elements;

        const options : RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        }

        const res = await fetch('api/login', options);
        const obj = await res.json();
        setError(obj?.error);
        console.log(obj?.error)

    }

    return(
        <main className="flex items-center w-full justify-center">
                {/* signup form */}

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2 w-64">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" />
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" />
                    <button type="submit">Sign up</button>
                    {error && <p className="text-red-500">{error.message}</p>}
                    </div>
                </form>

             

                <form onSubmit={handleSubmit2}>
                    <div className="flex flex-col gap-2 w-64">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" />
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" />
                    <button type="submit">Log in</button>
                    {error && <p className="text-red-500">{error.message}</p>}
                    </div>
                </form>
        </main>
    )
}