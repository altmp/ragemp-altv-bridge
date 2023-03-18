import { Blip, BlipSprite, Colshape, ColshapeSphere, onClient, Player, PointBlip, RadiusBlip, Vector3, Vehicle } from 'alt-server';
import { emit, on, VehicleLockState } from 'alt-shared';

const vdist2 = (v1, v2, useZ = true) => {
    if (!v1 || !v2) {
        return -1;
    }

    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = useZ ? v1.z - v2.z : 0;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// If global.mp exits, then it's not AltV
if (global.mp) {
    throw new Error('This is not AltV');
}

global.mp = {};

class _Vector3 {
    constructor(x, y, z) {
        if (typeof z !== 'undefined') {
            this.x = x || 0.0;
            this.y = y || 0.0;
            this.z = z || 0.0;
        } else if (typeof x === 'object') {
            if (Array.isArray(x)) {
                this.x = x[0];
                this.y = x[1];
                this.z = x[2];
            } else {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
            }
        }
    }

    negative() {
        return new Vector3(-this.x,-this.y,-this.z);
    }
    add(v) {
        if (v instanceof Vector3)
            return new Vector3(this.x + v.x,this.y + v.y,this.z + v.z);
        else
            return new Vector3(this.x + v,this.y + v,this.z + v);
    }
    subtract(v) {
        if (v instanceof Vector3)
            return new Vector3(this.x - v.x,this.y - v.y,this.z - v.z);
        else
            return new Vector3(this.x - v,this.y - v,this.z - v);
    }
    multiply(v) {
        if (v instanceof Vector3)
            return new Vector3(this.x * v.x,this.y * v.y,this.z * v.z);
        else
            return new Vector3(this.x * v,this.y * v,this.z * v);
    }
    divide(v) {
        if (v instanceof Vector3)
            return new Vector3(this.x / v.x,this.y / v.y,this.z / v.z);
        else
            return new Vector3(this.x / v,this.y / v,this.z / v);
    }
    equals(v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new Vector3(this.y * v.z - this.z * v.y,this.z * v.x - this.x * v.z,this.x * v.y - this.y * v.x);
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    unit() {
        return this.divide(this.length());
    }
    min() {
        return Math.min(Math.min(this.x, this.y), this.z);
    }
    max() {
        return Math.max(Math.max(this.x, this.y), this.z);
    }
    toAngles() {
        return [Math.asin(this.y / this.length()), Math.atan2(this.z, this.x)];
    }
    angleTo(a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray(n) {
        return [this.x, this.y, this.z].slice(0, n || 3);
    }
    clone() {
        return new _Vector3(this.x,this.y,this.z);
    }
    init(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    toString() {
        return `{"x":${this.x},"y":${this.y},"z":${this.z}}`;
    }
}

mp.Vector3 = _Vector3;


// Events
mp._events = {};

// Can receive from both client and server
mp._events.add = (eventName, ...args) => {
    // TODO: Try to receive from client and server. If not, notify devs to rewrite their code
    onClient(eventName, ...args);
    on(eventName, ...args);
};

// Can receive only from client. When player sends /command
mp._events.addCommand = (commandName, ...args) => {
    // TODO: When player sends /command, it should be sent to the server
};

// Can receive only from server
mp._events.addLocal = (eventName, ...args) => {
    return on(eventName, ...args);
};

// Call event in server
mp._events.call = (eventName, ...args) => {
    emit(eventName, ...args);
};

// Call's an event only in server
mp._events.callLocal = (eventName, ...args) => {
    emit(eventName, ...args);
}

mp.events = mp._events;


// Players

mp.players = {
    // Get amount of players
    get length() {
        return Player.all.length;
    }
};

// Get player by id
mp.players.at = (index) => {
    return Player.getByID(index);
}

// If player exists
mp.players.exists = (player) => {
    return player.valid;
}

// Players loop
mp.players.forEach = (callback) => {
    // TODO: Optimize this
    return Player.all.forEach(callback);
}

// Players Array
mp.players.toArray = () => {
    return Player.all;
}

// Get players in range
mp.players.forEachInRange = (position, range, callback) => {
    return Player.all.forEach((player) => {
        if (vdist2(player.pos, position, false) <= range) {
            callback(player);
        }
    });
}

// Get players in dimension
mp.players.forEachInDimension = (dimension, callback) => {
    return Player.all.forEach((player) => {
        if (player.dimension === dimension) {
            callback(player);
        }
    });
}

// Get closest player/players in position. Limit is optional, default is 1 (closest player)
mp.players.getClosest = (position, limit = 1) => {
    let players = Player.all;
    let sorted = players.sort((a, b) => {
        return vdist2(a.pos, position, false) - vdist2(b.pos, position, false);
    });
    return sorted.slice(0, limit);
}

// Get closest player/players in dimension. Limit is optional, default is 1 (closest player)
mp.players.getClosestInDimension = (position, dimension, limit = 1) => {
    // TODO: Optimize this
    let players = Player.all.filter( f => f.dimension === dimension );
    let sorted = players.sort((a, b) => {
        return vdist2(a.pos, position, false) - vdist2(b.pos, position, false);
    });
    return sorted.slice(0, limit);
}

// Vehicles


mp.vehicles = {
    // Get amount of vehicles
    get length() {
        return Vehicle.all.length;
    }
};

mp.vehicles.new = (model, position, options = {}) => {
    const vehicle = new Vehicle(model, new Vector3(position.x, position.y, position.z), new Vector3(0, 0, options.heading));

    if (options.dimension) {
        vehicle.dimension = options.dimension;
    }

    if (options.numberPlate) {
        vehicle.numberPlateText = options.numberPlate;
    }

    if (options.color) {
        vehicle.primaryColor = options.color[0];
        vehicle.secondaryColor = options.color[1];
    }

    if (options.locked) {
        vehicle.lockState = VehicleLockState.Locked || VehicleLockState.Unlocked;
    }

    if (options.engine) {
        vehicle.engineOn = options.engine;
    }

    // TODO: Alpha

    return vehicle;
}

// Get vehicle by id
mp.vehicles.at = (index) => {
    return Vehicle.getByID(index);
}

// If vehicle exists
mp.vehicles.exists = (vehicle) => {
    return vehicle.valid;
}

// Vehicles loop
mp.vehicles.forEach = (callback) => {
    // TODO: Optimize this
    return Vehicle.all.forEach(callback);
}

// Vehicles Array
mp.vehicles.toArray = () => {
    return Vehicle.all;
}

// Get vehicles in range
mp.vehicles.forEachInRange = (position, range, callback) => {
    return Vehicle.all.forEach((vehicle) => {
        if (vdist2(vehicle.pos, position, false) <= range*range) {
            callback(vehicle);
        }
    });
}

// Get vehicles in dimension
mp.vehicles.forEachInDimension = (dimension, callback) => {
    return Vehicle.all.forEach((vehicle) => {
        if (vehicle.dimension === dimension) {
            callback(vehicle);
        }
    });
}

// Get closest vehicle/vehicles in position. Limit is optional, default is 1 (closest vehicle)
mp.vehicles.getClosest = (position, limit = 1) => {
    let vehicles = Vehicle.all;
    let sorted = vehicles.sort((a, b) => {
        return vdist2(a.pos, position, false) - vdist2(b.pos, position, false);
    });
    return sorted.slice(0, limit);
}

// Get closest vehicle/vehicles in dimension. Limit is optional, default is 1 (closest vehicle)
mp.vehicles.getClosestInDimension = (position, dimension, limit = 1) => {
    // TODO: Optimize this
    let vehicles = Vehicle.all.filter( f => f.dimension === dimension );
    let sorted = vehicles.sort((a, b) => {
        return vdist2(a.pos, position, false) - vdist2(b.pos, position, false);
    });
    return sorted.slice(0, limit);
}

// Blips


mp.blips = {
    // Get amount of blips
    get length() {
        return Blip.all.length;
    }
};

// Create blip
mp.blips.new = (sprite, position, options = {}) => {
    let blip;
    if (options.radius > 0) {
        blip = new RadiusBlip(new Vector3(position.x, position.y, position.z), options.radius);

        blip.name = options.name || '';
        blip.sprite = sprite;
        blip.scale = options.scale || 1;
        blip.color = options.color || 0;
        blip.alpha = options.alpha || 255;
        blip.shortRange = options.shortRange || false;
        blip.dimension = options.dimension || 0;
    }
    else {
        blip = new PointBlip(new Vector3(position.x, position.y, position.z));

        blip.name = options.name || '';
        blip.sprite = sprite;
        blip.scale = options.scale || 1;
        blip.color = options.color || 0;
        blip.alpha = options.alpha || 255;
        blip.shortRange = options.shortRange || false;
        blip.dimension = options.dimension || 0;
    }

    return blip;
}

// Get blip by id
mp.blips.at = (index) => {
    return Blip.getByID(index);
}

// If blip exists
mp.blips.exists = (blip) => {
    return blip.valid;
}

// Blips loop
mp.blips.forEach = (callback) => {
    // TODO: Optimize this
    return Blip.all.forEach(callback);
}

// Blips Array
mp.blips.toArray = () => {
    return Blip.all;
}

// Get blips in range
mp.blips.forEachInRange = (position, range, callback) => {
    return Blip.all.forEach((blip) => {
        if (vdist2(blip.pos, position, false) <= range) {
            callback(blip);
        }
    });
}

// Get blips in dimension
mp.blips.forEachInDimension = (dimension, callback) => {
    return Blip.all.forEach((blip) => {
        if (blip.dimension === dimension) {
            callback(blip);
        }
    });
}

// Get closest blip/blips in position. Limit is optional, default is 1 (closest blip)
mp.blips.getClosest = (position, limit = 1) => {
    let blips = Blip.all;
    let sorted = blips.sort((a, b) => {
        return vdist2(a.pos, position, false) - vdist2(b.pos, position, false);
    });
    return sorted.slice(0, limit);
}

// Get closest blip/blips in dimension. Limit is optional, default is 1 (closest blip)
mp.blips.getClosestInDimension = (position, dimension, limit = 1) => {
    // TODO: Optimize this
    let blips = Blip.all.filter( f => f.dimension === dimension );
    let sorted = blips.sort((a, b) => {
        return vdist2(a.pos, position, false) - vdist2(b.pos, position, false);
    });
    return sorted.slice(0, limit);
}



// Colshapes


mp.colshapes = {
    // Get amount of colshapes
    get length() {
        // TODO: Colshape.all
        return Colshape.all.length;
    }
};

// Create colshape
mp.colshapes.newSphere = (x, y, z, range, dimension) => {
    let colshape = new ColshapeSphere(x, y, z, range);
    colshape.dimension = dimension || 0;

    return colshape;
}

// Get colshape by id
mp.colshapes.at = (index) => {
    // TODO: Get colshape by id
    return Colshape.getByID(index);
}

// If colshape exists
mp.colshapes.exists = (colshape) => {
    return colshape.valid;
}

// Colshapes loop
mp.colshapes.forEach = (callback) => {
    // TODO: Optimize this + Colshape.all implementation
    return Colshape.all.forEach(callback);
}

// Colshapes Array
mp.colshapes.toArray = () => {
    // TODO: Colshape.all implementation
    return Colshape.all;
}



// Markers
// TODO: Implement Marker class

mp.markers = {
    // Get amount of markers
    get length() {
        // TODO: Marker.all
        // return Marker.all.length;
        return 0;
    }
};

// Create marker
mp.markers.new = (type, position, scale, optional = {}) => {
    // let marker = new Marker(type, position, scale, optional);
    // return marker;
    return {};
}

// Get marker by id
mp.markers.at = (index) => {
    // TODO: Get marker by id
    // return Marker.getByID(index);
    return {};
}

// If marker exists
mp.markers.exists = (marker) => {
    return marker.valid;
}

// Markers loop
mp.markers.forEach = (callback) => {
    // TODO: Optimize this + Marker.all implementation
    // return Marker.all.forEach(callback);
    return {};
}

// Markers Array
mp.markers.toArray = () => {
    // TODO: Marker.all implementation
    // return Marker.all;
    return [];
}
