import alt from 'alt-server';
import { ServerPool } from './ServerPool.js';
import { InternalChat } from 'shared/DefaultChat.js';
import {argsToAlt, mpDimensionToAlt} from 'shared/utils';
import {emitAllClients, emitAllClientsUnreliable, emitClient, emitClientUnreliable} from '../serverUtils';

export class PlayerPool extends ServerPool {
    broadcast(text) {
        InternalChat.broadcast(text);
    }

    exists(player) {
        if (player == null) return false;

        if (typeof player === 'object') {
            if (player.alt?.type === alt.BaseObjectType.Player) return player.alt.valid;
            return false;
        }

        return super.exists(player);
    }

    //mp.players.call(String eventName[, Array Arguments]);
    //mp.players.call(Array players, String eventName[, Array Arguments]);
    call(arg1, args1 = [], args2 = []) {
        this.#_callLogic(false, arg1, args1, args2);
    }

    callUnreliable(arg1, args1 = [], args2 = []) {
        this.#_callLogic(true, arg1, args1, args2);
    }

    // todo: callInRange(pos, range, dimension, event, ...args)
    // TODO: callInRange in core
    callInRange(pos, range, event, args) {
        const players = alt.getEntitiesInRange(pos, range, alt.globalDimension, 1);
        if (players.length) emitClient(players, event, ...argsToAlt(args));
    }

    // TODO: callInDimension in core
    callInDimension(dimension, event, args) {
        dimension = mpDimensionToAlt(dimension);
        const players = alt.getEntitiesInDimension(dimension, 1);
        if (players.length) emitClient(players, event, ...argsToAlt(args));
    }
    /*
    broadcastInDimension(dimension, text){}
    broadcastInRange(position, range, [dimension], text){}
    callInDimension(dimension, eventName, [, ...args]){}
    callInRange(position, range, [dimension], eventName, [, ...args]){}
    callUnreliable(eventName, [, ...args]){}
    callInDimensionUnreliable(){}
    callInRangeUnreliable(){}
    reloadResources(){}
    */

    get size() {
        return alt.getServerConfig().players;
    }

    #_callLogic(isUnreliable, arg1, args1, args2) {
        // --- Ветка 1: Вызов для всех игроков ---
        if (typeof arg1 === 'string') {
            const eventName = arg1;
            const eventArgs = argsToAlt(args1); // Используется args1 как аргументы

            if (isUnreliable) {
                emitAllClientsUnreliable(eventName, ...eventArgs);
            } else {
                emitAllClients(eventName, ...eventArgs);
            }
            return;
        }

        // --- Ветка 2: Вызов для конкретных игроков ---
        if (Array.isArray(arg1)) {
            // Оптимизированное создание массива игроков
            const altPlayers = [];
            for (const p of arg1) {
                if (p && p.alt) { // Добавили проверку на p, чтобы избежать ошибок
                    altPlayers.push(p.alt);
                }
            }

            if (altPlayers.length > 0) {
                const eventName = args1; // Используется args1 как имя события
                const eventArgs = argsToAlt(args2); // Используется args2 как аргументы

                if (isUnreliable) {
                    emitClientUnreliable(altPlayers, eventName, ...eventArgs);
                } else {
                    emitClient(altPlayers, eventName, ...eventArgs);
                }
            }
            return;
        }
    }
}
