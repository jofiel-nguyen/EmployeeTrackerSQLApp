// import required modules and establish database connection
const runInquirer = async () => {
  const inquirer = await import('inquirer');
  const mysql = require('mysql2');
  const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'company_db'
});

// function to add a role
function addRole() {
  // query the database for existing departments
  connection.query('SELECT id, name FROM department', (err, res) => {
    if (err) throw err;

    // prompt user for role information
    inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:'
      },
      {
        name: 'salary',
        type: 'number',
        message: 'Enter the salary for the role:'
      },
      {
        name: 'department',
        type: 'list',
        message: 'Select the department for the role:',
        choices: res.map(department => ({
          name: department.name,
          value: department.id
        }))
      }
    ]).then(answers => {
      // insert the new role into the database
      connection.query(
        'INSERT INTO role SET ?',
        {
          title: answers.title,
          salary: answers.salary,
          department_id: answers.department
        },
        (err, res) => {
          if (err) throw err;
          console.log(`New role "${answers.title}" added to database.`);
          // return to main menu
          mainMenu();
        }
      );
    });
  });
}
};
runInquirer();