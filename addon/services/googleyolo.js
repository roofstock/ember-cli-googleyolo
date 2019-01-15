import Ember from 'ember';
import config from '../config/environment';

// eslint-disable-next-line ember/new-module-imports
const { get, set } = Ember;

// eslint-disable-next-line ember/new-module-imports
export default Ember.Service.extend({

    GOOGLEYOLO_SRC: 'https://smartlock.google.com/client',

    supportedAuthMethods: null,

    googleYoloContext: null,

    onRetrieveSuccess: null,

    onRetrieveError: null,

    onLoginSuccess: null,

    onLoginError: null,

    onAutoSignInDisabled: null,

    onLogoutError: null,

    clientId: null,

    init() {
        this._super(...arguments);
        const { googleYoloClientId } = config;

        set(this, 'clientId', googleYoloClientId);

        set(this, 'supportedAuthMethods',
            [
                'googleyolo://id-and-password',
                'https://accounts.google.com'
            ]
        );

        const el = document.createElement('script');
        el.async = true;
        el.defer = true;
        el.type = 'text/javascript';
        el.src = this.GOOGLEYOLO_SRC;

        document.getElementsByTagName('body')[0].appendChild(el);

        window.onGoogleYoloLoad = this.onGoogleYoloLoad;
    },

    onGoogleYoloLoad(googleyolo) {
        set(this, 'googleYoloContext', googleyolo);

        if (this.shouldRetrieve()) {
            this.retrieve(googleyolo)
        }
    },

    shouldRetrieve() {
        const { clientId, onRetrieveSuccess, onRetrieveError } = this;
        return clientId && !!(onRetrieveSuccess || onRetrieveError)
    },

    retrieve(googleyolo) {
        const { supportedAuthMethods, clientId, onRetrieveSuccess, onRetrieveError } = this;

        return googleyolo
        .retrieve({
          supportedAuthMethods,
          supportedIdTokenProviders: [
            {
              clientId,
              uri: 'https://accounts.google.com',
            },
          ],
        })
        .then(
          credential => {
            onRetrieveSuccess && onRetrieveSuccess(credential)
          },
          err => {
            onRetrieveError && onRetrieveError(err)
          }
        );  
    },

    login() {
        const googleyolo = get(this, 'googleYoloContext');
        const clientId = get(this, 'clientId');
        const supportedAuthMethods = get(this, 'supportedAuthMethods');
  
        return googleyolo
        .hint({
            supportedAuthMethods,
            supportedIdTokenProviders: [
                {
                    clientId,
                    uri: 'https://accounts.google.com',
                }
            ],
        })
        .then(
            (credential) => {
                const { onLoginSuccess } = this;
                onLoginSuccess && onLoginSuccess(credential);
            },
            (err) => {
                const { onLoginError } = this;
                onLoginError && onLoginError(err)
            }
        );

    },

    logout() {
        const { googleyolo, onAutoSignInDisabled } = this;
    
        googleyolo.disableAutoSignIn().then(
          (result) => {
            onAutoSignInDisabled && onAutoSignInDisabled(result)
          },
          (err) => {
            const { onLogoutError } = this;
            onLogoutError && onLogoutError(err)
          }
        )
    }

});