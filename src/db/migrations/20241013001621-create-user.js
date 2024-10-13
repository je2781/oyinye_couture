'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.STRING
      },
      is_admin: {
        type: Sequelize.BOOLEAN
      },
      shipping_info: {
        type: Sequelize.JSONB
      },
      billing_info: {
        type: Sequelize.JSONB
      },
      save_billing_info: {
        type: Sequelize.BOOLEAN
      },
      save_shipping_info: {
        type: Sequelize.BOOLEAN
      },
      buyer_is_verified: {
        type: Sequelize.BOOLEAN
      },
      account_is_verified: {
        type: Sequelize.BOOLEAN
      },
      reviewer_is_verified: {
        type: Sequelize.BOOLEAN
      },
      verify_token: {
        type: Sequelize.STRING
      },
      verify_token_expiry_date: {
        type: Sequelize.DATE
      },
      reset_token: {
        type: Sequelize.STRING
      },
      reset_token_expiry_date: {
        type: Sequelize.DATE
      },
      password: {
        type: Sequelize.STRING
      },
      enable_email_marketing: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('users');
  }
};