import listPages from '../../common/list-pages.js';

export default {
  name: 'List assistants',
  key: 'listAssistants',

  async run($) {
    const assistants = await listPages($, '/assistants');

    return {
      data: assistants.map((assistant) => {
        const name = assistant.name || assistant.id;

        return {
          value: assistant.id,
          name: assistant.is_active === false ? `${name} (inactive)` : name,
        };
      }),
    };
  },
};
