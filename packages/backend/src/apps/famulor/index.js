import defineApp from '../../helpers/define-app.js';
import addAuthHeader from './common/add-auth-header.js';
import auth from './auth/index.js';
import actions from './actions/index.js';
import triggers from './triggers/index.js';
import dynamicData from './dynamic-data/index.js';

export default defineApp({
  name: 'Famulor',
  key: 'famulor',
  iconUrl: '{BASE_URL}/apps/famulor/assets/favicon.svg',
  authDocUrl: '{DOCS_URL}/apps/famulor/connection',
  supportsConnections: true,
  baseUrl: 'https://www.famulor.io',
  apiBaseUrl: 'https://app.famulor.io/api/v1',
  primaryColor: '#1FD5FA',
  beforeRequest: [addAuthHeader],
  auth,
  actions,
  triggers,
  dynamicData,
});
