import * as natives from "natives";

// region disableControlActionBatch

// This is a temporary implementation
// TODO: Implement natively in core

let disabledActionsMoveLook = [];
let disabledActionsFrontend = [];

mp.game.controls.setDisableControlActionBatch = function(isMoveOrLookInputGroup, controlActions) {
    if (isMoveOrLookInputGroup) disabledActionsMoveLook = controlActions;
    else disabledActionsFrontend = controlActions;
};

mp.game.controls.applyDisableControlActionBatch = function() {
    for (const action of disabledActionsMoveLook) natives.disableControlAction(0, action, false);
    for (const action of disabledActionsFrontend) natives.disableControlAction(2, action, false);
};

// endregion
