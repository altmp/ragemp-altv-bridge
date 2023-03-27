import * as alt from "alt-client";
import mp from "../shared/mp.js";
import { argsToMp } from "../shared/utils.js";

alt.onServer("$invoke", (native, ...args) => {
    mp.game.invoke(native, ...argsToMp(args));
});