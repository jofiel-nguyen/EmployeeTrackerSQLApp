const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'company_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// //db.getConnection((err, connection) => {
//   if (err) {
//     console.error('Error connecting to database:', err.stack);
//     return;
//   }

//   console.log('Connected to database as ID', connection.threadId);

//   connection.release();
// });

const mainMenuPrompt = {
  type: 'list',
  name: 'mainMenu',
  message: 'What would you like to do?',
  choices: [
    'View all employees',
    'View all employees by department',
    'View all employees by manager',
    'Add an employee',
    'Remove an employee',
    'Update employee role',
    'Update employee manager',
    'Exit',
  ],
};

async function handleMainMenuChoice() {
  const { mainMenu } = await inquirer.prompt(mainMenuPrompt);

  switch (mainMenu) {
    case 'View all employees':
      await viewAllEmployees();
      break;
    case 'View all employees by department':
      await viewEmployeesByDepartment();
      break;
    case 'View all employees by manager':
      await viewEmployeesByManager();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Remove an employee':
      await removeEmployee();
      break;
    case 'Update employee role':
      await updateEmployeeRole();
      break;
    case 'Update employee manager':
      await updateEmployeeManager();
      break;
    case 'Exit':
      console.log('Goodbye!');
      process.exit();
      break;
    default:
      console.log('Invalid choice.');
  }

  handleMainMenuChoice();
}

async function viewAllEmployees() {
  try {
    const query = `
      SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees e
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
    `;
    const [rows, fields] = await db.promise().query(query);

    console.table(rows);
  } catch (err) {
    console.error('Error retrieving employees:', err.message);
  }
}

async function viewEmployeesByDepartment() {
  try {
    const query = `
      SELECT d.name AS department, GROUP_CONCAT(CONCAT(e.first_name, ' ', e.last_name) SEPARATOR ', ') AS employees
      FROM employees e
      INNER JOIN role r ON e.role_id = r.id
      INNER JOIN department d ON r.department_id = d.id
      GROUP BY d.id
    `;
    const [rows, fields] = await db.promise().query(query);
    console.table(rows);
  } catch (err) {
    console.error('Error retrieving employees by department:', err.message);
  }
}


async function viewEmployeesByManager() {
  try {
    // Get all managers
    const [managers] = await db.promise().query('SELECT * FROM employees WHERE manager_id IS NULL');
    // Prompt user to select a manager
    const { managerId } = await inquirer.prompt({
      type: 'list',
      name: 'managerId',
      message: 'Which manager would you like to view employees for?',
      choices: managers.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }))
    });
    // Get employees for selected manager
    const employees = await db.promise().query(`
      SELECT * FROM employees
      WHERE manager_id = ?
    `, [managerId]);
    // Display employees
    console.table(employees);
  } catch (err) {
    console.error('Error viewing employees by manager:', err.message);
  }
}


async function addEmployee() {
  try { 
    const [role] = await db.promise().query('SELECT * FROM role')
    const [employee] = await db.promise().query('SELECT * FROM employees')
    // Get the necessary information about the new employee
    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'firstName',
      message:'Enter the employee\'s first name:',

    },{
      type: 'input',
      name: 'lastName',
      message:'Enter the employee\'s last name:',
    },{
      type: 'list',
      name: 'roleId',
      message:'Enter the employee\'s role ID:',
      choices: role.map(({title,id}) => ({
        name: title,
        value: id,
      }) )
    },{
      type: 'list',
      name: 'managerId',
      message:'Enter the employee\'s manager ID:',
      choices: employee.map(({first_name,last_name,id}) => ({
        name: first_name +last_name,
        value: id,
      }) )
    }
  ])
    const {firstName,lastName,roleId,managerId} = answer;
    await db.promise().query(`
      INSERT INTO employees (first_name, last_name, role_id, manager_id)
      VALUES ('${firstName}', '${lastName}', '${roleId}', '${managerId || null}')
    `);
    
    console.log(`Added ${firstName} ${lastName} to the database`);
  } catch (err) {
    console.error('Error adding employee:', err.message);
  }
}

async function removeEmployee() {
  try {
    // Get the ID of the employee to remove
    const { employeeId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'employeeId',
        message: 'Enter the ID of the employee to remove:',

      }
    ]);

    // Check if the employee exists
    const employee = await db.promise().query('SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (employee.length === 0) {
      console.log(`Employee with ID ${employeeId} not found`);
      return;
    }

    // Remove the employee from the database
    await db.promise().query('DELETE FROM employees WHERE id = ?', [employeeId]);

    console.log(`Employee with ID ${employeeId} removed successfully`);
  } catch (err) {
    console.error('Error removing employee:', err.message);
  }
}

async function updateEmployeeRole() {
  try {
    // Get a list of employees to choose from
    const [employees] = await db.promise().query('SELECT * FROM employees');
    
    // Prompt the user to choose an employee to update
    const { employeeId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee would you like to update?',
        choices: employees.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }))
      }
    ]);
    
    // Get a list of roles to choose from
    const [roles] = await db.promise().query('SELECT * FROM role');
    
    // Prompt the user to choose a new role for the employee
    const { roleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'What is the employee\'s new role?',
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]);
    
    // Update the employee's role in the database
    await db.promise().query('UPDATE employees SET role_id = ? WHERE id = ?', [roleId, employeeId]);
    
    console.log('Employee role updated successfully');
  } catch (err) {
    console.error('Error updating employee role:', err.message);
  }
}
async function updateEmployeeManager() {
  // Get employee id and new manager id from user input
  const { employeeId, managerId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'employeeId',
      message: 'Enter the ID of the employee whose manager you want to update:',
    },
    {
      type: 'input',
      name: 'managerId',
      message: 'Enter the ID of the new manager:',
    },
  ]);

  try {
    // Check if employee with given id exists
    const [existingEmployee] = await db.promise().query('SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (!existingEmployee) {
      console.log(`Employee with ID ${employeeId} does not exist.`);
      return;
    }

    // Check if manager with given id exists
    const [existingManager] = await db.promise().query('SELECT * FROM employees WHERE id = ?', [managerId]);
    if (!existingManager) {
      console.log(`Manager with ID ${managerId} does not exist.`);
      return;
    }

    // Update employee's manager
    await db.promise().query('UPDATE employees SET manager_id = ? WHERE id = ?', [managerId, employeeId]);

    console.log(`Employee with ID ${employeeId} has been updated with a new manager.`);
  } catch (err) {
    console.error('Error updating employee manager:', err.message);
  }
}

// Start app
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
  handleMainMenuChoice(); // Prompt user to choose an action
});