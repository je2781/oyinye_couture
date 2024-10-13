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
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      reviews: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      colors: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};