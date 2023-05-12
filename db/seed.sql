INSERT INTO department (id, name) VALUES
  (1, 'Sales'),
  (2, 'Engineering'),
  (3, 'Finance');
INSERT INTO role (id, title, salary, department_id) VALUES
  (1, 'Sales Manager', 100000, 1),
  (2, 'Sales Representative', 60000, 1),
  (3, 'Software Engineer', 90000, 2),
  (4, 'Accountant', 70000, 3);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
  (1, 'John', 'Doe', 1, NULL),
  (2, 'Jane', 'Smith', 2, 1),
  (3, 'Bob', 'Johnson', 2, 1),
  (4, 'Sarah', 'Lee', 3, NULL),
  (5, 'Tom', 'Wilson', 4, NULL);