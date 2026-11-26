const keyValueArgument = ({ label, key, description }) => ({
  label,
  key,
  type: 'dynamic',
  required: false,
  description,
  fields: [
    {
      label: 'Key',
      key: 'key',
      type: 'string',
      required: true,
      description: 'Lowercase key, for example customer_name.',
      variables: true,
    },
    {
      label: 'Value',
      key: 'value',
      type: 'string',
      required: true,
      description: 'Value sent with the key.',
      variables: true,
    },
  ],
});

const assistantDropdown = {
  label: 'Assistant',
  key: 'assistantId',
  type: 'dropdown',
  required: true,
  description: 'Active assistant that places the call.',
  variables: true,
  source: {
    type: 'query',
    name: 'getDynamicData',
    arguments: [
      {
        name: 'key',
        value: 'listAssistants',
      },
    ],
  },
};

export { assistantDropdown, keyValueArgument };
