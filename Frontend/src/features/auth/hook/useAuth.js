
import { useDispatch } from "react-redux";
import { register, login, getMe } from "../services/authApi.js";
import { setUser, setLoading, setError } from "../authSlice.js";


export function useAuth() {


    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await register({ email, username, password })
            dispatch(setError("Registration successful! Please check your email to verify your account."))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message || "Registration failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            if (data.user) {
                dispatch(setUser(data.user))
                dispatch(setError(null))
            } else {
                throw new Error("No user data returned from server")
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Login failed"
            dispatch(setError(errorMsg))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            if (data.user) {
                dispatch(setUser(data.user))
            }
        } catch (err) {
            // Silently fail for get-me to prevent infinite errors
            console.log("User not authenticated", err.response?.status)
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
    }

}
