import config from '../config/environment';

export function initialize() {
  const application = arguments[1] || arguments[0];
  const { googleyolo = [] } = config;
  const { environment = 'development' } = config;
  const options = { googleyolo, environment };

  application.register('config:googleyolo', options, { instantiate: false });
  application.inject('service:googleyolo', 'options', 'config:googleyolo');
}

export default {
  name: 'googleyolo',
  initialize
};
