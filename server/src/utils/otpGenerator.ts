import crypto from 'crypto';

export const generateNumericOtp = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const verifyOtpHash = (enteredOtp: string, storedHash: string): boolean => {
  const enteredHash = hashOtp(enteredOtp);
  return crypto.timingSafeEqual(Buffer.from(enteredHash), Buffer.from(storedHash));
};
