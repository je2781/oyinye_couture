'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      is_feature: {
        type: Sequelize.BOOLEAN
      },
      is_hidden: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      title: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      no_of_orders: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      collated_reviews: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      colors: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')

      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')

      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};