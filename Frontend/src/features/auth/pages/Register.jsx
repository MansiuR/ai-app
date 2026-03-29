import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth.js'
import { useSelector } from 'react-redux'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleRegister } = useAuth()
  const navigate = useNavigate()
  const loading = useSelector(state => state.auth.loading)

  const submitForm = async (event) => {
    event.preventDefault()

    const payload = {
      username,
      email,
      password,
    }

    await handleRegister(payload)
    setTimeout(() => {
      navigate('/login')
    }, 1000)
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-indigo-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div  className="w-full max-w-md rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 p-8 shadow-[0_0_40px_rgba(99,102,241,0.25)] backdrop-blur-xl">
          <h1  className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Register with your username, email, and password.
          </p>

          <form onSubmit={submitForm} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-200">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Choose a username"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-indigo-400 focus:shadow-[0_0_10px_rgba(99,102,241,0.6)]"
              />
            </div>

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
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-indigo-400 focus:shadow-[0_0_10px_rgba(99,102,241,0.6)]"
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
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition from-indigo-500 to-purple-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
             className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 font-semibold text-white transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Register