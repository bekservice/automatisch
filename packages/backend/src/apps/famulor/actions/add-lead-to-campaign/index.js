import defineAction from '../../../../helpers/define-action.js';
import { keyValueArgument } from '../../common/fields.js';
import { assertUuid, buildLeadBody, unwrapData } from '../../common/request.js';

export default defineAction({
  name: 'Add lead to campaign',
  key: 'addLeadToCampaign',
  description:
    'Adds one lead with POST /campaigns/{id}/leads. The phone number is sent as phone and normalized to E.164.',
  arguments: [
    {
      label: 'Campaign',
      key: 'campaignId',
      type: 'dropdown',
      required: true,
      description: 'Campaign that receives the lead.',
      variables: true,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listCampaigns',
          },
        ],
      },
    },
    {
      label: 'Phone number',
      key: 'phone',
      type: 'string',
      required: true,
      description: 'Lead phone number in E.164 format, for example +4915123456789.',
      variables: true,
    },
    {
      label: 'Name',
      key: 'name',
      type: 'string',
      required: false,
      description: 'Optional contact name.',
      variables: true,
    },
    {
      label: 'Email',
      key: 'email',
      type: 'string',
      required: false,
      description: 'Optional contact email.',
      variables: true,
    },
    keyValueArgument({
      label: 'Custom fields',
      key: 'customFields',
      description:
        'Optional key/value data available to the assistant. Sent as custom_fields.',
    }),
  ],

  async run($) {
    const campaignId = assertUuid($.step.parameters.campaignId, 'Campaign');
    const response = await $.http.post(
      `/campaigns/${campaignId}/leads`,
      buildLeadBody($.step.parameters)
    );

    $.setActionItem({
      raw: unwrapData(response.data),
    });
  },
});
