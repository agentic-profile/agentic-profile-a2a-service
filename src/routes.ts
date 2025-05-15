import express, {
    Response,
    Request,
    Router
} from "express";
import { prettyJson } from "@agentic-profile/common";
import {
    asyncHandler,
    baseUrl,
    isAdmin,
} from "@agentic-profile/express-common";

import { UnifiedStore } from "./storage/models.js";


export interface Status {
    name?: string,
    version?: number[]
}

export interface CommonRouteOptions {
    status?: Status,
    store?: UnifiedStore
}

export function commonRoutes( { status = {}, store }: CommonRouteOptions ): Router {
    var router = express.Router();

    // simple status page, also used for server health
    const runningSince = new Date();
    router.get( "/status", function( req: Request, res: Response ) {
        res.json({ name:"Agentic Profile Node Service", version:[1,0,0], ...status, started:runningSince, url:baseUrl(req) }); 
    });

    router.get( "/storage", asyncHandler( async (req: Request, res: Response) => {
        if( !isAdmin( req ) )
            throw new Error( "/storage only available to admins" );

        const data = await store?.dump();
        res.status(200)
            .set('Content-Type', 'application/json')
            .send( prettyJson(data) ); // make easier to read ;)
    }));

    router.post( "/accounts", asyncHandler( async (req: Request, res: Response) => {
        if( !isAdmin( req ) )
            throw new Error( "POST /accounts only available to admins" );

        const account = await store?.createAccount( req.body );
        res.json({ account });
    }));

    console.log( "Open routes are ready" );
    return router;
}