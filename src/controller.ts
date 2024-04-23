import { IncomingMessage, ServerResponse } from "http";
import { database } from "./model";
import { renderTemplate } from "./view";
import { getSession } from "./session";

export const getHome = async (req: IncomingMessage, res: ServerResponse) => {
    const session = getSession(req);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Set-Cookie", `session_id=${session.id}`);
    res.end(
        await renderTemplate("src/views/HomeView.hbs", {
            title: session.data.isLoggedIn
                ? `Welcome ${session.data.name}!`
                : "Welcome Guest!",
            isLoggedIn: session.data.isLoggedIn,
        }),
    );
};

export const login = async (req: IncomingMessage, res: ServerResponse) => {
    const session = getSession(req);
    const body = await parseBody(req);

    session.data.isLoggedIn = true;
    session.data.name = body.name;

    res.statusCode = 303;
    res.setHeader("Location", "/");
    res.setHeader("Set-Cookie", `session_id=${session.id}`);
    res.end();
};

export const logout = async (req: IncomingMessage, res: ServerResponse) => {
    const session = getSession(req);

    // Set the cookie to expire by setting the Expires attribute to a date in the past.
    const expires = new Date(new Date().getTime() - 5000).toUTCString();

    // Destroy the session data.
    session.data = {};

    res.statusCode = 303;
    res.setHeader("Location", "/");
    res.setHeader("Set-Cookie", [
        `session_id=${session.id}; Expires=${expires}`,
    ]);
    res.end();
};

export const getAllPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const session = getSession(req);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Set-Cookie", `session_id=${session.id}`);
    res.end(
        await renderTemplate("src/views/ListView.hbs", {
            title: "All Pokemon",
            pokemon: database,
            isLoggedIn: session.data.isLoggedIn,
        }),
    );
};

export const createPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const session = getSession(req);

    // Check if the user is logged in.
    if (!session.data.isLoggedIn) {
        res.statusCode = 401; // 401 Unauthorized
        res.setHeader(
            "Content-Type",
            req.headers["user-agent"]?.includes("curl")
                ? "application/json"
                : "text/html",
        );
        res.end(
            req.headers["user-agent"]?.includes("curl")
                ? JSON.stringify(
                      {
                          statusCode: 401,
                          message: "You must be logged in to view this page",
                      },
                      null,
                      2,
                  )
                : await renderTemplate("src/views/ErrorView.hbs", {
                      title: "Unauthorized",
                      message: "You must be logged in to view this page",
                  }),
        );
        return;
    }

    const body = await parseBody(req);
    const newPokemon = {
        id: database.length + 1, // ID "auto-increment".
        name: body.name,
        type: body.type,
    };

    database.push(newPokemon);

    res.statusCode = 303;
    res.setHeader("Location", "/pokemon");
    res.setHeader("Set-Cookie", `session_id=${session.id}`);
    res.end();
};

const parseBody = async (req: IncomingMessage) => {
    return new Promise<Record<string, string>>((resolve) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            let parsedBody: Record<string, string>;

            if (
                req.headers["content-type"]?.includes("x-www-form-urlencoded")
            ) {
                // application/x-www-form-urlencoded => name=Pikachu&type=Electric
                parsedBody = Object.fromEntries(
                    new URLSearchParams(body).entries(),
                );
            } else {
                // application/json => {"name":"Pikachu","type":"Electric"}
                parsedBody = JSON.parse(body);
            }

            resolve(parsedBody);
        });
    });
};
