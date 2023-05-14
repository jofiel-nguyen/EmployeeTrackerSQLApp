const inquirer = require("inquirer");
const mainMenuPrompt = {
  type: "list",
  name: "mainMenu",
  message: "What would you like to do?",
  choices: [
    "View all departments",
    "View all roles",
    "View all employees",
    "Add a department",
    "Add a role",
    "Add an employee",
    "Update an employee role",
    "Exit",
  ],
};

const addDepartmentPrompt = {
  type: "input",
  name: "departmentName",
  message: "What is the name of the department?",
};

const addRolePrompt = [
  {
    type: "input",
    name: "roleTitle",
    message: "What is the title of the role?",
  },
  {
    type: "input",
    name: "roleSalary",
    message: "What is the salary for the role?",
  },
  {
    type: "list",
    name: "departmentId",
    message: "Which department does the role belong to?",
    choices: async () => {
      const departments = await db.getAllDepartments();
      return departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));
    },
  },
];

const addEmployeePrompt = [
  {
    type: "input",
    name: "firstName",
    message: "What is the employee's first name?",
  },
  {
    type: "input",
    name: "lastName",
    message: "What is the employee's last name?",
  },
  {
    type: "list",
    name: "roleId",
    message: "What is the employee's role?",
    choices: async () => {
      const roles = await db.getAllRoles();
      return roles.map((role) => ({ name: role.title, value: role.id }));
    },
  },
  {
    type: "list",
    name: "managerId",
    message: "Who is the employee's manager?",
    choices: async () => {
      const managers = await db.getAllEmployees();
      return managers.map((manager) => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id,
      }));
    },
  },
];

const updateEmployeePrompt = [
  {
    type: "list",
    name: "employeeId",
    message: "Which employee's role do you want to update?",
    choices: async () => {
      const employees = await db.getAllEmployees();
      return employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      }));
    },
  },
  {
    type: "list",
    name: "roleId",
    message: "What is the employee's new role?",
    choices: async () => {
      const roles = await db.getAllRoles();
      return roles.map((role) => ({ name: role.title, value: role.id }));
    },
  },
];

async function viewAllDepartments() {
  const departments = await db.getAllDepartments();
  printTable(departments);
}

async function viewAllRoles() {
  const roles = await db.getAllRolesWithDepartment();
  printTable(roles);
}

async function viewAllEmployees() {
  const employees = await db.getAllEmployeesWithDetails();
  printTable(employees);
}
async function addDepartment() {
  const { departmentName } = await inquirer.prompt(addDepartmentPrompt);
  await db.createDepartment(departmentName);
  console.log(`Added ${departmentName} to the database.`);
}
