"use strict";

/**
* Seeder for inserting default users into the "Users" table.
*
* This file defines two lifecycle methods:
* - `up`: Runs when seeder is applied, inserting predefined users.
* - `down`: Runs when seeder is reverted, deleting the inserted users.
*
* It uses bcrypt to securely hash user passwords and uuid to generate
* unique IDs for each user record.
*/

const bcrypt = require("bcryptjs"); // Library for hashing passwords securely
const { v4: uuidv4 } = require("uuid"); // Library for generating unique UUID v4 values

module.exports = {
 /**
  * Run the seeder (inserts records).
  * This will insert default users (admin, manager, staff) into the Users table.
  *
  * @param {Object} queryInterface - Sequelize interface for database operations
  */
 async up(queryInterface) {
   // Hash a sample password ("password123") with bcrypt
   // 10 is the "salt rounds" value, which defines hashing complexity
   const hashedPassword = await bcrypt.hash("password123", 10);

  // Insert multiple user records into the "Users" table
   await queryInterface.bulkInsert(
     "Users", // Target table name
     [
      {
        // Admin user
        id: uuidv4(),
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // Manager user
        id: uuidv4(),
        username: "manager",
        email: "manager@example.com",
        password: hashedPassword,
        role: "manager",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // Staff user
        id: uuidv4(),
        username: "staff",
        email: "staff@example.com",
        password: hashedPassword,
        role: "staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
     ],
     {}, // Options object (kept empty here)
   );
 },

 /**
  * Revert the seeder (deletes records).
  * This will delete all users inserted by the `up` method.
  *
  * @param {Object} queryInterface - Sequelize interface for database operations
  */
 async down(queryInterface) {
   // Delete all rows from the "Users" table
   // Passing `null` deletes all records
   await queryInterface.bulkDelete("Users", null, {});
 },
};