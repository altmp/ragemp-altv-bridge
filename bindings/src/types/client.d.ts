declare module "alt-client" {
    import type { _Player } from "client/entities/Player.js";
    import type { _Vehicle } from "client/entities/Vehicle.js";
    interface Player {
        mp: _Player
    }
    interface Vehicle {
        mp: _Vehicle
    }
}