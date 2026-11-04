const services = require('../data/mockServices');

function preparePayment(req, res) {
  const service = services.find(
    (item) => String(item.id) === req.params.serviceId
  );

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.status(200).json({
    serviceId: service.id,
    serviceName: service.name,
    amount: service.price,
    currency: 'sgd',
    status: 'READY_FOR_PAYMENT'
  });
}

module.exports = { preparePayment };