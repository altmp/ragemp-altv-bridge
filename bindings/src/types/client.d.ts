declare module "alt-client" {
    import type { _Player } from "../client/entities/Player";
    import type { _Vehicle } from "../client/entities/Vehicle";
    interface Player {
        mp: _Player
    }
    interface Vehicle {
        mp: _Vehicle
    }
}