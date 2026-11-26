const PAGE_SIZE = 200;
const MAX_PAGES = 25;

const listPages = async ($, path, params = {}) => {
  const items = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data } = await $.http.get(path, {
      params: {
        ...params,
        limit: PAGE_SIZE,
        offset,
      },
    });
    const batch = Array.isArray(data?.data) ? data.data : [];

    items.push(...batch);

    const total = data?.meta?.pagination?.total;
    offset += batch.length;

    if (!batch.length || batch.length < PAGE_SIZE) {
      break;
    }

    if (typeof total === 'number' && offset >= total) {
      break;
    }
  }

  return items;
};

export default listPages;
