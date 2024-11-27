import crypto from 'crypto';

export const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY!,
  merchantSalt: process.env.PAYU_MERCHANT_SALT!,
  payuBaseUrl: process.env.NODE_ENV === 'production' 
    ? "https://secure.payu.in/_payment"
    : process.env.PAYU_BASE_URL,
};

export const generatePayuHash = (
  txnid: string,
  amount: string,
  productinfo: string,
  firstname: string,
  email: string,
  udf1: string = '',
  udf2: string = '',
  udf3: string = '',
  udf4: string = '',
  udf5: string = ''
) => {
  const { merchantKey, merchantSalt } = PAYU_CONFIG;
  const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${merchantSalt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  return hash;
};

export const verifyPayuHash = (
  txnid: string,
  amount: string,
  productinfo: string,
  firstname: string,
  email: string,
  status: string,
  receivedHash: string
) => {
  const { merchantKey, merchantSalt } = PAYU_CONFIG;
  
  // Precise hash verification sequence as per PayU specifications
  const hashSequence = [
    merchantSalt,
    status,
    "",     // udf10
    "",     // udf9
    "",     // udf8
    "",     // udf7
    "",     // udf6
    "",     // udf5
    "",     // udf4
    "",     // udf3
    "",     // udf2
    "",     // udf1
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    merchantKey
  ];
  
  const hashString = hashSequence.join('|');
  
  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  
  console.log('Verification Details:', {
    merchantSalt,
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    merchantKey,
    hashString,
    receivedHash,
    calculatedHash
  });
  
  const isHashMatch = calculatedHash === receivedHash;
  
  console.log('Hash Verification Result:', isHashMatch);
  
  return isHashMatch;
};