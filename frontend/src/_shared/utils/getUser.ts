import { cookies } from "next/headers";

import type { IUser } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUser(): Promise<IUser | null> {
  if (!API_URL) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user as IUser;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}
