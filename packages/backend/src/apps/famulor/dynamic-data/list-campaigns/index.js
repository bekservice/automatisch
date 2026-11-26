import listPages from '../../common/list-pages.js';

export default {
  name: 'List campaigns',
  key: 'listCampaigns',

  async run($) {
    const campaigns = await listPages($, '/campaigns');

    return {
      data: campaigns.map((campaign) => ({
        value: campaign.id,
        name: campaign.status
          ? `${campaign.name || campaign.id} (${campaign.status})`
          : campaign.name || campaign.id,
      })),
    };
  },
};
