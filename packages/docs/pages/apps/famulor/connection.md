# Famulor

1. Open [Famulor](https://app.famulor.io) and go to **Settings → API Keys**.
2. Create an API key. Keys start with `fam_`.
3. In Automatisch, enter any screen name and paste the key into **API Key**.
4. Click **Submit**. Automatisch checks the key with `GET /api/v1/assistants` and sends it as `Authorization: Bearer` on later requests.
5. Start using the Famulor connection in your flows.

The API base URL is `https://app.famulor.io/api/v1`.
