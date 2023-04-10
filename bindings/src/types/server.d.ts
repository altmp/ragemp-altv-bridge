declare module "alt-server" {
    import type { _Player } from "server/entities/Player.js";
    import type { _Vehicle } from "server/entities/Vehicle.js";
    interface Player {
        mp: _Player
    }
    interface Vehicle {
        mp: _Vehicle
    }
}