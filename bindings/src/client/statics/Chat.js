import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { InternalChat } from '../../shared/chat.js';

// TODO default chat bindings

class _Chat {
    #chat;

    activate(toggle) {
        InternalChat.activate(toggle);
    }

    push(msg) {
        InternalChat.push(msg);
    }

    safeMode() {
        return true;
    }
    
    show() {
        
    }

    colors = true;
    safe = true;
}

mp.gui.chat = new _Chat;