import { IncomingMessage, ServerResponse } from "http";
import {
    login,
    logout,
    getAllPokemon,
    getHome,
    createPokemon,
} from "./controller";

interface RouteHandler {
    (req: IncomingMessage, res: ServerResponse): void;
}

interface Routes {
    [method: string]: {
        [path: string]: RouteHandler;
    };
}

export const routes: Routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
};

routes.GET["/"] = getHome;
routes.GET["/pokemon"] = getAllPokemon;
routes.POST["/pokemon"] = createPokemon;
routes.POST["/login"] = login;
routes.GET["/logout"] = logout;
