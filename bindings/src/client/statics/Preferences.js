import * as alt from 'alt-client';
import mp from '../../shared/mp';

class _Preferences {
    get language() {
        return alt.getLocale();
    }

    get lowQualityAssets() {
        return false;
    }
}

if (!mp.user) mp.user = {};
mp.user.preferences = new _Preferences;