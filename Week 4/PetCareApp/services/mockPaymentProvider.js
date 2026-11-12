 // services/mockPaymentProvider.js
 exports.createPayment = async (request) => {
   return {
     providerPaymentId: 'mock_' + Date.now(),
     merchantReference: request.merchantReference,
     status: request.testStatus || 'PENDING'
   };
 };
