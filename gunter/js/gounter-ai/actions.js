
/* =====================================================
   EVARKION - GOUNTER AI
   ACTIONS.JS
   Movimiento hacia objetos y acciones físicas
===================================================== */

export function createGounterActions({
    getObject,
    walkTo,
    getObjectPosition,
    say,
    setState,
    delay,
    changeNeed,
    rememberActivity
}) {

    /* =================================================
       APPROACH OBJECT
       Acercarse a un objeto de la habitación
    ================================================= */

    async function approachObject(action) {

        const object = getObject(action);

        if (!object) {
            console.warn(
                `Gounter no encuentra el objeto: ${action}`
            );

            return false;
        }

        const position = getObjectPosition(object);

        // Gounter se coloca delante del objeto.
        const success = await walkTo(
            position.x,
            position.y + 45
        );

        if (success === false) return false;

        await delay(300);

        return true;
    }

    /* =================================================
       EAT
       Comer y recuperar hambre
    ================================================= */

    async function eat() {

        setState("sniffing");

        say("Gounter está olfateando la comida...");

        await delay(1200);

        setState("eating");

        say("¡Ñam, ñam! Gounter está comiendo. 🐱");

        await delay(4500);

        changeNeed("hunger", 45);
        changeNeed("happiness", 5);

        rememberActivity("eat");

        setState(null);

        say("Gounter ha terminado de comer.");

        return true;
    }

    /* =================================================
       DRINK
       Beber y recuperar sed
    ================================================= */

    async function drink() {

        setState("sniffing");

        say("Gounter está investigando el cuenco de agua.");

        await delay(1000);

        setState("drinking");

        say("Gounter está bebiendo agua. 💧");

        await delay(3500);

        changeNeed("thirst", 50);
        changeNeed("happiness", 3);

        rememberActivity("drink");

        setState(null);

        say("Gounter ha terminado de beber.");

        return true;
    }

    /* =================================================
       EXPORTAR ACCIONES
    ================================================= */

    return {
        approachObject,
        eat,
        drink
    };
}
