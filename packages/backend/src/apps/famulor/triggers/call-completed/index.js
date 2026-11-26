import Crypto from 'node:crypto';
import defineTrigger from '../../../../helpers/define-trigger.js';
import appConfig from '../../../../config/app.js';
import { assertPublicHttpsUrl, assertWebhookSecret } from '../../common/webhook.js';

const SAMPLE_CALL_ID = 'c1b2c3d4-0000-4000-8000-000000000010';

const internalIdFor = (body) => {
  const callId = body?.data?.call_id || body?.data?.id;

  if (callId) {
    return `call.completed:${callId}`;
  }

  return Crypto.randomUUID();
};

const samplePayload = () => ({
  event: 'call.completed',
  timestamp: '2026-08-26T14:32:07.000Z',
  data: {
    call_id: SAMPLE_CALL_ID,
    assistant_id: '1b2c3d4e-0000-4000-8000-000000000030',
    direction: 'outbound',
    status: 'completed',
    duration_sec: 132,
    to_number: '+4915123456789',
    transcript: {
      items: [
        {
          type: 'message',
          role: 'assistant',
          content: ['Hi, this is a sample call.'],
        },
      ],
    },
    variables: { lead_quality: 'high' },
    input_variables: { customer_name: 'Max Mustermann' },
    analysis: {
      summary: 'Sample completed call.',
      success: true,
    },
  },
});

export default defineTrigger({
  name: 'Call completed',
  key: 'callCompleted',
  type: 'webhook',
  description:
    'Triggers when Famulor delivers a signed call.completed webhook for the workspace.',

  async run($) {
    const body = $.request.body || {};

    if (body.event && body.event !== 'call.completed') {
      return;
    }

    $.pushTriggerItem({
      raw: body,
      meta: {
        internalId: internalIdFor(body),
      },
    });
  },

  async testRun($) {
    const lastExecutionStep = await $.getLastExecutionStep();

    if (lastExecutionStep?.dataOut) {
      $.pushTriggerItem({
        raw: lastExecutionStep.dataOut,
        meta: {
          internalId: internalIdFor(lastExecutionStep.dataOut),
        },
      });
      return;
    }

    const payload = samplePayload();

    $.pushTriggerItem({
      raw: payload,
      meta: {
        internalId: internalIdFor(payload),
      },
    });
  },

  async registerHook($) {
    assertPublicHttpsUrl($.webhookUrl);
    assertWebhookSecret(appConfig.webhookSecretKey);

    const payload = {
      id: $.flow.id,
      url: $.webhookUrl,
      events: ['call.completed'],
      secret: appConfig.webhookSecretKey,
    };

    const { data } = await $.http.post('/webhooks', payload);
    const subscriptionId = data?.data?.id;

    if (!subscriptionId) {
      throw new Error('Famulor did not return a webhook subscription id.');
    }

    await $.flow.setRemoteWebhookId(subscriptionId);
  },

  async unregisterHook($) {
    if (!$.flow.remoteWebhookId) {
      return;
    }

    await $.http.delete(`/webhooks/${$.flow.remoteWebhookId}`);
  },
});
