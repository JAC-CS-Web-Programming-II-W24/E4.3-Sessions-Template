import { IncomingMessage } from "http";

/**
 * A session object contains an id and a data object.
 * Recall that a session is a way to store data between
 * HTTP requests. This is useful for storing user data
 * such as login status, username, and other information.
 */
export interface Session {
    id: number;
    data: Record<string, any>;
}

// The sessions object is a dictionary that maps session ids to session objects.
export const sessions: Record<string, Session> = {};

/**
 * @returns A new session object with a random id.
 */
export const createSession = (): Session => {
    return {
        id: Math.floor(Math.random() * 1000), // Random number between 0 and 999.
        data: {},
    };
};

/**
 * @returns The session object of the request.
 */
export const getSession = (req: IncomingMessage) => {
    const sessionId = getCookies(req)["session_id"];
    let session: Session | undefined;

    // If the session id exists, the session is retrieved from the sessions object.
    if (sessionId) {
        session = sessions[sessionId];
    }
    // If the session does not exist, a new session is created with a random id.
    else {
        session = createSession();
        sessions[session.id] = session;
    }

    if (!session) {
        throw new Error(
            "Session not found (you probably need to erase all browser cookies).",
        );
    }

    console.log("Sessions:", JSON.stringify(sessions, null, 2));

    return session;
};

/**
 * @returns The cookies of the request as a Record type object.
 * @example name=Pikachu;type=Electric => [{ name: "name", value: "Pikachu" }, { name: "type", value: "Electric" }]
 * @see https://vikramsinghmtl.github.io/420-4W6-Web-Programming-II/concepts/cookies/
 */
export const getCookies = (req: IncomingMessage) => {
    const cookieHeader = req.headers.cookie;
    const cookies: Record<string, string> = {};

    if (cookieHeader) {
        cookieHeader.split(";").forEach((cookie) => {
            const [name, value] = cookie.split("=");
            cookies[name.trim()] = value.trim();
        });
    }

    return cookies;
};
