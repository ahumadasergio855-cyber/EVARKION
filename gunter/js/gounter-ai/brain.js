
/* =============================================
   EVARKION - GOUNTER AI
   BRAIN.JS
   Cerebro y toma de decisiones
============================================= */

import {
    approachObject,
    eat,
    drink
} from "./actions.js";

/* =============================================
   EJECUTAR DECISIONES
============================================= */

export async function performDecision(decision) {

    console.log("Gounter ha decidido:", decision);

    switch (decision) {

        /* =====================================
           COMER
        ===================================== */

        case "eat":

            console.log("Gounter busca comida");

            await approachObject("food");

            await eat();

            break;

        /* =====================================
           BEBER
        ===================================== */

        case "drink":

            console.log("Gounter busca agua");

            await approachObject("water");

            await drink();

            break;

        /* =====================================
           EXPLORAR
        ===================================== */

        case "explore":

            console.log("Gounter quiere explorar");

            break;

        /* =====================================
           DESCANSAR
        ===================================== */

        case "sleep":

            console.log("Gounter quiere descansar");

            break;

        default:

            console.warn(
                "Gounter no reconoce esta decisión:",
                decision
            );

            break;
    }
}
