'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      sales: {
        type: Sequelize.DOUBLE
      },
      payment_status: {
        type: Sequelize.STRING
      },
      items: Sequelize.JSONB,
      payment_type: {
        type: Sequelize.STRING
      },
      shipping_method: {
        type: Sequelize.STRING
      },
      payment_info: {
        type: Sequelize.JSONB
      },
      status: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('orders');
  }
};