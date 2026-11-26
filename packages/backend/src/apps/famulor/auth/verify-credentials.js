const verifyCredentials = async ($) => {
  await $.http.get('/assistants', { params: { limit: 1 } });

  await $.auth.set({
    screenName: $.auth.data.screenName,
  });
};

export default verifyCredentials;
