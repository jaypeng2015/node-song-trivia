const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const logger = require('../lib/logger');

// Get postgres configuration, create auth string if user specified, connect to database
const config = require('../config').get('postgres');
const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  pool: config.pool,
  logging: logger.debug,
  dialect: 'postgres',
});

// Define object to attach models to, plus the sequelize instance and class
const models = {};
// Get this file's name to exclude it from the files loaded as models
const basename = path.basename(module.filename);

// For each .js file in the models directory, import as a sequalize model, attach to models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    const modelName = _.upperFirst(_.camelCase(model.name));
    models[modelName] = model;
  });

// Execute associate function if defined so models can establish relationships to each other
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Attach instance of sequelize connected to database
models.sequelize = sequelize;
// Attach class for usage within application
models.Sequelize = Sequelize;

module.exports = models;
