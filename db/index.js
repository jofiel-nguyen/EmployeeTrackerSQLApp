const mysql = require("mysql2/promise");
const connection = require('../db/connection');

// Define functions that interact with the database
async function getAllDepartments() {
  const [rows] = await connection.query("SELECT * FROM departments");
  return rows;
}

async function createDepartment(name) {
  await connection.query("INSERT INTO departments (name) VALUES (?)", [name]);
}

// Export functions
module.exports = {
  getAllDepartments,
  createDepartment,
};
