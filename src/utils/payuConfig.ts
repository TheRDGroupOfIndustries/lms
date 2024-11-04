import crypto from 'crypto';

export const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY!,
  merchantSalt: process.env.PAYU_MERCHANT_SALT!,
  payuBaseUrl: process.env.PAYU_BASE_URL || "https://test.payu.in",
};

export const generatePayuHash = (
  txnid: string,
  amount: number,
  productinfo: string,
  firstname: string,
  email: string
) => {
  const { merchantKey, merchantSalt } = PAYU_CONFIG;
  const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
};
