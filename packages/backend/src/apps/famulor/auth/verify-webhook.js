import appConfig from '../../../config/app.js';
import isValidFamulorSignature from '../common/signature.js';

const verifyWebhook = async ($) => {
  const signature =
    $.request?.headers?.['x-famulor-signature'] ||
    $.request?.headers?.['X-Famulor-Signature'];

  return isValidFamulorSignature(
    $.request?.rawBody,
    signature,
    appConfig.webhookSecretKey
  );
};

export default verifyWebhook;
