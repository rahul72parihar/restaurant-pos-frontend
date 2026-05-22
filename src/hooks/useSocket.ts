"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket: Socket | null = null;

export const useSocket = () => {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
        transports: ["websocket"],
      });
    }

    if (user) {
      if (user.outletId) socket.emit("join:outlet", user.outletId);
      socket.emit("join:role", user.role);
      if (user.role === "KITCHEN_STAFF") socket.emit("join:kitchen", "Main Kitchen");
    }

    return () => {
      // Don't disconnect on component unmount — keep single connection
    };
  }, [user]);

  return socket;
};

export const getSocket = () => socket;
