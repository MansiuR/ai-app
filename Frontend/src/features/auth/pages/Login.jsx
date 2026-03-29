import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'


const Login = () => {
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const { handleLogin } = useAuth()

    const navigate = useNavigate()

    const submitForm = async (event) => {
        event.preventDefault()

        const payload = {
            email,
            password,
        }

        await handleLogin(payload)
        // Wait a bit for state update before navigating
        setTimeout(() => {
            navigate("/")
        }, 500)
    }

    if(!loading && user){
        return <Navigate to="/" replace />
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-indigo-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
                <div  className="w-full max-w-md rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 p-8 shadow-[0_0_40px_rgba(99,102,241,0.25)] backdrop-blur-xl">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        Sign in with your email and password.
                    </p>

                    <form onSubmit={submitForm} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-indigo-400 
focus:shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-indigo-400 
focus:shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 font-semibold text-zinc-950 transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                        >
                            Login
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-300">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="font-semibold text-[#31b8c6] transition text-indigo-400 hover:text-purple-400">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login