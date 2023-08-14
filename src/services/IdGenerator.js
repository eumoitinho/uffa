
const { v4: uuidv4 } = require('uuid');
export const generateTransactionId = () => {
  const transactionId = uuidv4();
  return transactionId;
};


export default generateTransactionId;