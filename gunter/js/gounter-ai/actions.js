
/* =====================================================
   EVARKION - GOUNTER ACTIONS
   Acciones de la mascota virtual
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
       ACERCARSE A UN OBJETO
    ================================================= */

    async function approachObject(action) {
        const object = getObject(action);

        if (!object) {
            say("No encuentro ese objeto...");
            return false;
        }

        const position = getObjectPosition(object);

        if (!position) return false;

        const approached = await walkTo(
            position.x,
            position.y + 45
        );

        await delay(300);

        return approached !== false;
    }

    /* =================================================
       COMER
    ================================================= */

    async function eat() {
        const approached = await approachObject("food");

        if (!approached) return false;

        setState("sniffing");
        say("Gounter está oliendo su comida...");
        await delay(1200);

        setState("eating");
        say("¡Gounter está comiendo!");
        await delay(4000);

        changeNeed("hunger", 45);
        changeNeed("happiness", 5);

        rememberActivity("eat");

        setState("idle");
        say("¡Qué rico! Gounter está satisfecho.");

        return true;
    }

    /* =================================================
       BEBER
    ================================================= */

    async function drink() {
        const approached = await approachObject("water");

        if (!approached) return false;

        setState("sniffing");
        say("Gounter ha encontrado el agua.");
        await delay(1000);

        setState("drinking");
        say("Gounter está bebiendo...");
        await delay(3500);

        changeNeed("thirst", 50);
        changeNeed("happiness", 3);

        rememberActivity("drink");

        setState("idle");
        say("¡Gounter ya está hidratado!");

        return true;
    }

    /* =================================================
       JUGAR CON EL SACO
    ================================================= */

    async function play() {
        const approached = await approachObject("sack");

        if (!approached) return false;

        setState("curious");
        say("¿Qué será esto?");
        await delay(1000);

        setState("playing");
        say("¡Gounter está jugando!");

        await delay(3500);

        changeNeed("happiness", 20);
        changeNeed("energy", -8);

        rememberActivity("play");

        setState("idle");
        say("Gounter se lo ha pasado genial.");

        return true;
    }

    /* =================================================
       DORMIR EN LA CAJA
    ================================================= */

    async function sleep() {
        const approached = await approachObject("box");

        if (!approached) return false;

        setState("curious");
        say("Gounter está buscando un sitio cómodo...");
        await delay(800);

        setState("sleeping");
        say("Zzz... Gounter está durmiendo.");

        await delay(6000);

        changeNeed("energy", 35);
        changeNeed("happiness", 5);

        rememberActivity("sleep");

        setState("idle");
        say("Gounter se ha despertado descansado.");

        return true;
    }

    return {
        approachObject,
        eat,
        drink,
        play,
        sleep
    };
}
