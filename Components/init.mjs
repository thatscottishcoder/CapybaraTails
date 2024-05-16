import { Overworld } from "./Overworld.mjs";

(function () {
    const overworld = new Overworld({
        element: document.querySelector(".game-container"),
    });
    overworld.init();
})();
