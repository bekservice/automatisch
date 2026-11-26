import verifyCredentials from './verify-credentials.js';
import isStillVerified from './is-still-verified.js';
import verifyWebhook from './verify-webhook.js';

export default {
  fields: [
    {
      key: 'screenName',
      label: 'Screen Name',
      type: 'string',
      required: true,
      readOnly: false,
      value: null,
      placeholder: null,
      description: 'Screen name of your connection to be shown in the UI.',
      clickToCopy: false,
    },
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'string',
      required: true,
      readOnly: false,
      value: null,
      placeholder: 'fam_...',
      description:
        'Famulor API key from Settings → API Keys. Sent as Authorization: Bearer.',
      docUrl: 'https://docs.famulor.io/api-v1/authentication',
      clickToCopy: false,
    },
  ],

  verifyCredentials,
  isStillVerified,
  verifyWebhook,
};
