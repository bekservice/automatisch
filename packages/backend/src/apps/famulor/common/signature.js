import { createHmac, timingSafeEqual } from 'node:crypto';

const isValidFamulorSignature = (rawBody, signatureHeader, secret) => {
  if (!secret || signatureHeader == null || rawBody == null) {
    return false;
  }

  const expected =
    'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  const actualBuffer = Buffer.from(String(signatureHeader));
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
};

export default isValidFamulorSignature;
