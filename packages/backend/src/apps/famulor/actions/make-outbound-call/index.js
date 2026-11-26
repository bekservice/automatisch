import defineAction from '../../../../helpers/define-action.js';
import { assistantDropdown, keyValueArgument } from '../../common/fields.js';
import { buildOutboundCallBody, unwrapData } from '../../common/request.js';

export default defineAction({
  name: 'Make outbound call',
  key: 'makeOutboundCall',
  description:
    'Starts an outbound call with POST /calls. Required fields are assistant_id and to_number (E.164). Optional variables are sent as the variables object.',
  arguments: [
    assistantDropdown,
    {
      label: 'Phone number',
      key: 'toNumber',
      type: 'string',
      required: true,
      description:
        'Destination in E.164 format. Sent as to_number, for example +4915123456789.',
      variables: true,
    },
    {
      label: 'Caller ID',
      key: 'phoneNumberId',
      type: 'string',
      required: false,
      description:
        'Optional phone number id. Sent as phone_number_id. Leave empty to use the assistant default.',
      variables: true,
    },
    keyValueArgument({
      label: 'Variables',
      key: 'variables',
      description:
        'Optional per-call variables. Keys must match ^[a-z][a-z0-9_]{0,63}$. Sent as variables.',
    }),
  ],

  async run($) {
    const response = await $.http.post(
      '/calls',
      buildOutboundCallBody($.step.parameters)
    );

    $.setActionItem({
      raw: unwrapData(response.data),
    });
  },
});
