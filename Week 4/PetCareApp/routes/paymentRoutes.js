 // routes/paymentRoutes.js
 const express = require('express');
 const router = express.Router();
//  const { isLoggedIn } = require('../middleware/auth');
 const paymentController = require('../controllers/paymentController');
 
 // routes/paymentRoutes.js
router.get('/payments/prepare/:serviceId', paymentController.preparePayment);

// routes/paymentRoutes.js
 router.post(
   '/payments/mock/:serviceId',
   paymentController.createMockPayment
 );

module.exports = router;