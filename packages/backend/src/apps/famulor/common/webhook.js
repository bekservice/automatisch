const assertWebhookSecret = (secret) => {
  if (typeof secret !== 'string' || secret.length < 16 || secret.length > 256) {
    throw new Error(
      'WEBHOOK_SECRET_KEY must be 16 to 256 characters. Famulor signs call.completed deliveries with this value.'
    );
  }
};

const assertPublicHttpsUrl = (webhookUrl) => {
  let url;

  try {
    url = new URL(webhookUrl);
  } catch {
    throw new Error(
      'Famulor webhook subscriptions require a public HTTPS URL.'
    );
  }

  if (
    url.protocol !== 'https:' ||
    url.port ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error(
      'Famulor webhook subscriptions require a public HTTPS URL without a custom port, credentials, or fragment. Set WEBHOOK_URL accordingly.'
    );
  }
};

export { assertPublicHttpsUrl, assertWebhookSecret };
