import defineAction from '../../../../helpers/define-action.js';
import { assertUuid, unwrapData } from '../../common/request.js';

export default defineAction({
  name: 'Get call',
  key: 'getCall',
  description: 'Loads one call with GET /calls/{id}.',
  arguments: [
    {
      label: 'Call ID',
      key: 'callId',
      type: 'string',
      required: true,
      description: 'Call UUID returned when the outbound call was created.',
      variables: true,
    },
  ],

  async run($) {
    const callId = assertUuid($.step.parameters.callId, 'Call ID');
    const response = await $.http.get(`/calls/${callId}`);

    $.setActionItem({
      raw: unwrapData(response.data),
    });
  },
});
