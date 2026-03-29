import { io } from "socket.io-client";
import { getApiUrl } from "../../../config/apiConfig.js";


export const initializeSocketConnection = () => {
    const socketURL = getApiUrl()
    const socket = io(socketURL, {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

    return socket
}