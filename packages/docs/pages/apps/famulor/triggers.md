---
favicon: /favicons/famulor.svg
items:
  - name: Call completed
    desc: Triggers when Famulor sends a signed call.completed webhook.
---

<script setup>
  import CustomListing from '../../components/CustomListing.vue'
</script>

<CustomListing />

Activating a flow registers `POST /api/v1/webhooks` for the `call.completed` event and removes that subscription when the flow is turned off.

Famulor only delivers these subscriptions to a public HTTPS URL without a custom port. Set `WEBHOOK_URL` to that address. `WEBHOOK_SECRET_KEY` must be 16 to 256 characters. Famulor signs the raw body with HMAC-SHA256 and sends it in `X-Famulor-Signature` as `sha256=<hex>`. The API key needs workspace owner or admin access, `settings:write`, and `calls:read`.

Assistant-level post-call URLs are a separate, unsigned channel and are not registered by this trigger.
