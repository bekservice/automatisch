const E164 = /^\+[1-9]\d{1,14}$/;
const CALL_VARIABLE_KEY = /^[a-z][a-z0-9_]{0,63}$/;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const assertE164 = (value, label) => {
  const phone = typeof value === 'string' ? value.trim() : '';

  if (!E164.test(phone)) {
    throw new Error(
      `${label} must be an E.164 number, for example +4915123456789.`
    );
  }

  return phone;
};

const assertUuid = (value, label) => {
  const id = typeof value === 'string' ? value.trim() : '';

  if (!UUID.test(id)) {
    throw new Error(`${label} must be a UUID.`);
  }

  return id;
};

const entriesToObject = (entries, { label, pattern, maxStringLength } = {}) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return undefined;
  }

  const result = {};

  for (const entry of entries) {
    const key = typeof entry?.key === 'string' ? entry.key.trim() : '';
    const value = entry?.value;
    const emptyValue = value === undefined || value === null || value === '';

    if (!key && emptyValue) {
      continue;
    }

    if (!key) {
      throw new Error(`${label} requires a key.`);
    }

    if (pattern && !pattern.test(key)) {
      throw new Error(
        `${label} key "${key}" must start with a lowercase letter and contain only lowercase letters, digits, and underscores (max 64 characters).`
      );
    }

    if (emptyValue) {
      continue;
    }

    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean'
    ) {
      throw new Error(
        `${label} value for "${key}" must be text, a number, or true/false.`
      );
    }

    if (
      typeof value === 'string' &&
      maxStringLength &&
      value.length > maxStringLength
    ) {
      throw new Error(
        `${label} value for "${key}" exceeds ${maxStringLength} characters.`
      );
    }

    result[key] = value;
  }

  return Object.keys(result).length ? result : undefined;
};

const callVariables = (entries) =>
  entriesToObject(entries, {
    label: 'Variable',
    pattern: CALL_VARIABLE_KEY,
    maxStringLength: 2000,
  });

const customFields = (entries) =>
  entriesToObject(entries, {
    label: 'Custom field',
  });

const unwrapData = (body) => {
  if (body && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }

  return body;
};

const buildOutboundCallBody = (parameters) => {
  const body = {
    assistant_id: assertUuid(parameters.assistantId, 'Assistant'),
    to_number: assertE164(parameters.toNumber, 'Phone number'),
  };
  const variables = callVariables(parameters.variables);
  const phoneNumberId =
    typeof parameters.phoneNumberId === 'string'
      ? parameters.phoneNumberId.trim()
      : '';

  if (phoneNumberId) {
    body.phone_number_id = assertUuid(phoneNumberId, 'Caller ID');
  }

  if (variables) {
    body.variables = variables;
  }

  return body;
};

const buildLeadBody = (parameters) => {
  const body = {
    phone: assertE164(parameters.phone, 'Phone number'),
  };
  const fields = customFields(parameters.customFields);
  const name = typeof parameters.name === 'string' ? parameters.name.trim() : '';
  const email =
    typeof parameters.email === 'string' ? parameters.email.trim() : '';

  if (name) {
    body.name = name;
  }

  if (email) {
    body.email = email;
  }

  if (fields) {
    body.custom_fields = fields;
  }

  return body;
};

export {
  assertE164,
  assertUuid,
  buildLeadBody,
  buildOutboundCallBody,
  callVariables,
  customFields,
  unwrapData,
};
