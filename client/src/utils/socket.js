import { io } from "socket.io-client";
import { BASE_URL } from "../config";

const socket = io(BASE_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 5000,
});

export default socket;
