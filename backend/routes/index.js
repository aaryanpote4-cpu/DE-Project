const express = require('express');

const authRouter = require('./auth');
const warehousesRouter = require('./warehouses');
const locationsRouter = require('./locations');
const edgesRouter = require('./edges');
const ordersRouter = require('./orders');
const routingRouter = require('./routing');
const inventoryRouter = require('./inventory');
const analyticsRouter = require('./analytics');

const router = express.Router();

// Register modular route handlers
router.use('/auth', authRouter);
router.use('/warehouses', warehousesRouter);
router.use('/locations', locationsRouter);
router.use('/edges', edgesRouter);
router.use('/inventory', inventoryRouter);
router.use('/', ordersRouter);
router.use('/', routingRouter);
router.use('/', analyticsRouter);

module.exports = router;
