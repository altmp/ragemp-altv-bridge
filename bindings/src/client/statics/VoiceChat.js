import mp from '../../shared/mp.js'

export class _VoiceChat {
    isAllowed = true;
    lastVad = 0;
    minVad = 0;
    cleanupAndReload() {}
    setExperimentalOption() {}
    setPreprocessingParam() {}
    getPreprocessingParam() {
        return 0;
    }
}

mp.voiceChat = new _VoiceChat;
