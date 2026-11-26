---
favicon: /favicons/famulor.svg
items:
  - name: Make outbound call
    desc: Starts an outbound call with assistant_id and an E.164 to_number. Optional variables are included.
  - name: Get call
    desc: Loads one call by its id, including transcript and summary when they exist.
  - name: Add lead to campaign
    desc: Adds one lead to a campaign. The phone number is sent as phone in E.164.
---

<script setup>
  import CustomListing from '../../components/CustomListing.vue'
</script>

<CustomListing />
