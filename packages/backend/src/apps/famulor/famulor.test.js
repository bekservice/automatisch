import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import addAuthHeader from './common/add-auth-header.js';
import listPages from './common/list-pages.js';
import { buildOutboundCallBody } from './common/request.js';
import isValidFamulorSignature from './common/signature.js';
import {
  assertPublicHttpsUrl,
  assertWebhookSecret,
} from './common/webhook.js';
import addLeadToCampaign from './actions/add-lead-to-campaign/index.js';
import getCall from './actions/get-call/index.js';
import makeOutboundCall from './actions/make-outbound-call/index.js';
import listAssistants from './dynamic-data/list-assistants/index.js';
import verifyCredentials from './auth/verify-credentials.js';
import callCompleted from './triggers/call-completed/index.js';
import appConfig from '../../config/app.js';

const ASSISTANT_ID = 'a1b2c3d4-0000-4000-8000-000000000001';
const CALL_ID = 'c1b2c3d4-0000-4000-8000-000000000010';
const CAMPAIGN_ID = 'ca1b2c3d-0000-4000-8000-000000000030';
const PHONE_NUMBER_ID = 'b1b2c3d4-0000-4000-8000-000000000020';

describe('Famulor app', () => {
  it('sends the API key as a bearer token', () => {
    const requestConfig = { headers: {} };

    addAuthHeader(
      { auth: { data: { apiKey: 'fam_test_key' } } },
      requestConfig
    );

    expect(requestConfig.headers.Authorization).toBe('Bearer fam_test_key');
  });

  it('verifies the connection by listing assistants', async () => {
    const httpGet = vi.fn().mockResolvedValue({ data: { data: [] } });
    const authSet = vi.fn().mockResolvedValue(null);

    await verifyCredentials({
      http: { get: httpGet },
      auth: {
        data: { screenName: 'Workspace' },
        set: authSet,
      },
    });

    expect(httpGet).toHaveBeenCalledWith('/assistants', {
      params: { limit: 1 },
    });
    expect(authSet).toHaveBeenCalledWith({ screenName: 'Workspace' });
  });

  it('posts assistant_id, to_number and optional variables', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: CALL_ID,
          status: 'queued',
          to_number: '+4915123456789',
        },
      },
    });
    const setActionItem = vi.fn();

    await makeOutboundCall.run({
      http: { post },
      step: {
        parameters: {
          assistantId: ASSISTANT_ID,
          toNumber: '+4915123456789',
          phoneNumberId: PHONE_NUMBER_ID,
          variables: [{ key: 'customer_name', value: 'Max' }],
        },
      },
      setActionItem,
    });

    expect(post).toHaveBeenCalledWith('/calls', {
      assistant_id: ASSISTANT_ID,
      to_number: '+4915123456789',
      phone_number_id: PHONE_NUMBER_ID,
      variables: { customer_name: 'Max' },
    });
    expect(setActionItem).toHaveBeenCalledWith({
      raw: {
        id: CALL_ID,
        status: 'queued',
        to_number: '+4915123456789',
      },
    });
  });

  it('omits empty optional call fields', () => {
    expect(
      buildOutboundCallBody({
        assistantId: ASSISTANT_ID,
        toNumber: ' +4915123456789 ',
        phoneNumberId: '  ',
        variables: [],
      })
    ).toEqual({
      assistant_id: ASSISTANT_ID,
      to_number: '+4915123456789',
    });
  });

  it('rejects a destination that is not E.164', () => {
    expect(() =>
      buildOutboundCallBody({
        assistantId: ASSISTANT_ID,
        toNumber: '015123456789',
      })
    ).toThrow(/E\.164/);
  });

  it('loads a call by id', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { data: { id: CALL_ID, status: 'completed' } },
    });
    const setActionItem = vi.fn();

    await getCall.run({
      http: { get },
      step: { parameters: { callId: CALL_ID } },
      setActionItem,
    });

    expect(get).toHaveBeenCalledWith(`/calls/${CALL_ID}`);
    expect(setActionItem).toHaveBeenCalledWith({
      raw: { id: CALL_ID, status: 'completed' },
    });
  });

  it('adds one lead to a campaign', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'le1b2c3d-0000-4000-8000-000000000040',
          phone: '+4915123456789',
          status: 'pending',
        },
      },
    });
    const setActionItem = vi.fn();

    await addLeadToCampaign.run({
      http: { post },
      step: {
        parameters: {
          campaignId: CAMPAIGN_ID,
          phone: '+4915123456789',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          customFields: [{ key: 'company', value: 'Acme Corp' }],
        },
      },
      setActionItem,
    });

    expect(post).toHaveBeenCalledWith(`/campaigns/${CAMPAIGN_ID}/leads`, {
      phone: '+4915123456789',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      custom_fields: { company: 'Acme Corp' },
    });
    expect(setActionItem).toHaveBeenCalledWith({
      raw: {
        id: 'le1b2c3d-0000-4000-8000-000000000040',
        phone: '+4915123456789',
        status: 'pending',
      },
    });
  });

  it('pages assistant dropdown options', async () => {
    const firstPage = Array.from({ length: 200 }, (_, index) => ({
      id: `aaaaaaaa-0000-4000-8000-${String(index).padStart(12, '0')}`,
      name: `Agent ${index}`,
      is_active: index !== 0,
    }));
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          data: firstPage,
          meta: { pagination: { limit: 200, offset: 0, total: 201 } },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: ASSISTANT_ID,
              name: 'Support Agent',
              is_active: true,
            },
          ],
          meta: { pagination: { limit: 200, offset: 200, total: 201 } },
        },
      });

    const options = await listAssistants.run({ http: { get } });

    expect(get).toHaveBeenNthCalledWith(1, '/assistants', {
      params: { limit: 200, offset: 0 },
    });
    expect(get).toHaveBeenNthCalledWith(2, '/assistants', {
      params: { limit: 200, offset: 200 },
    });
    expect(options.data).toHaveLength(201);
    expect(options.data[0].name).toBe('Agent 0 (inactive)');
    expect(options.data.at(-1)).toEqual({
      value: ASSISTANT_ID,
      name: 'Support Agent',
    });
  });

  it('stops listing when a short page is returned', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { data: [{ id: ASSISTANT_ID }] },
    });

    const items = await listPages({ http: { get } }, '/campaigns');

    expect(items).toEqual([{ id: ASSISTANT_ID }]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('checks the Famulor HMAC signature against the raw body', () => {
    const rawBody = Buffer.from('{"event":"call.completed"}');
    const secret = 'sample_webhook_secret_key';
    const signature =
      'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');

    expect(isValidFamulorSignature(rawBody, signature, secret)).toBe(true);
    expect(isValidFamulorSignature(rawBody, 'sha256=nope', secret)).toBe(
      false
    );
    expect(isValidFamulorSignature(rawBody, signature, 'other-secret-value')).toBe(
      false
    );
  });

  it('registers and removes a call.completed subscription', async () => {
    assertWebhookSecret(appConfig.webhookSecretKey);
    assertPublicHttpsUrl('https://hooks.example.com/webhooks/flow');

    const post = vi.fn().mockResolvedValue({
      data: { data: { id: '11111111-1111-4111-8111-111111111111' } },
    });
    const setRemoteWebhookId = vi.fn().mockResolvedValue(null);
    const flow = {
      id: '22222222-2222-4222-8222-222222222222',
      setRemoteWebhookId,
    };

    await callCompleted.registerHook({
      webhookUrl: 'https://hooks.example.com/webhooks/flow',
      http: { post },
      flow,
    });

    expect(post).toHaveBeenCalledWith('/webhooks', {
      id: flow.id,
      url: 'https://hooks.example.com/webhooks/flow',
      events: ['call.completed'],
      secret: appConfig.webhookSecretKey,
    });
    expect(setRemoteWebhookId).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111'
    );

    const del = vi.fn().mockResolvedValue({ data: { data: { deleted: true } } });

    await callCompleted.unregisterHook({
      http: { delete: del },
      flow: { remoteWebhookId: '11111111-1111-4111-8111-111111111111' },
    });

    expect(del).toHaveBeenCalledWith(
      '/webhooks/11111111-1111-4111-8111-111111111111'
    );
  });

  it('deduplicates call.completed deliveries by call id', () => {
    const pushTriggerItem = vi.fn();

    callCompleted.run({
      request: {
        body: {
          event: 'call.completed',
          data: { call_id: CALL_ID },
        },
      },
      pushTriggerItem,
    });

    expect(pushTriggerItem).toHaveBeenCalledWith({
      raw: {
        event: 'call.completed',
        data: { call_id: CALL_ID },
      },
      meta: { internalId: `call.completed:${CALL_ID}` },
    });

    pushTriggerItem.mockClear();

    callCompleted.run({
      request: { body: { event: 'booking.created', data: { id: 'x' } } },
      pushTriggerItem,
    });

    expect(pushTriggerItem).not.toHaveBeenCalled();
  });

  it('rejects webhook URLs Famulor will not call', () => {
    expect(() => assertPublicHttpsUrl('http://localhost:3000/hook')).toThrow(
      /HTTPS/
    );
  });
});
