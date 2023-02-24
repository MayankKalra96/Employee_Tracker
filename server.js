const connection = require('./config/connection');
const inquirer = require('inquirer');
const consolelike = require('console.table');
const Line = require('chalk');
const figletPage = require('figlet');
const Value = require('./javascript/validate');

connection.connect((error) => {
  if (error) throw error;
  console.log(``);
  console.log(Line.blueBright.bold(figletPage.textSync('Employee Tracker')));
  console.log(``);
  console.log(`                                                          ` + Line.blueBright.bold('Created By:')+ Line.redBright.bold(' Mayank Kalra'));
  console.log(``);
  PrmptUse();
});

const PrmptUse = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select an option:',
        choices: [
          'View All Employees',
          'View All Roles',
          'View All Departments',
          'View All Employees By Department',
          'View Department Budgets',
          'Update Employee Role',
          'Update Employee Manager',
          'Add Employee',
          'Add Role',
          'Add Department',
          'Remove Employee',
          'Remove Role',
          'Remove Department',
          'Exit'
          ]
      }
    ])
    .then((answers) => {
      const {choices} = answers;

        if (choices === 'View All Employees') {
            viewAllEmployees();
        }

        if (choices === 'View All Departments') {
          showAllDept();
      }

        if (choices === 'View All Employees By Department') {
            EandD();
        }

        if (choices === 'Add Employee') {
            addingemp();
        }

        if (choices === 'Remove Employee') {
            remvEmploy();
        }

        if (choices === 'Update Employee Role') {
            updatedEmpRole();
        }

        if (choices === 'Update Employee Manager') {
            updtEmpMangr();
        }

        if (choices === 'View All Roles') {
            showAllRole();
        }

        if (choices === 'Add Role') {
            role();
        }

        if (choices === 'Remove Role') {
            remvRol();
        }

        if (choices === 'Add Department') {
            addDept();
        }

        if (choices === 'View Department Budgets') {
            showDeptBugdet();
        }

        if (choices === 'Remove Department') {
            remvDept();
        }

        if (choices === 'Exit') {
            connection.end();
        }
  });
};


const viewAllEmployees = () => {
  let sql =       `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
    console.log(`                              ` + Line.green.bold(`Current Employees:`));
    console.table(response);
    PrmptUse();
  });
};

const showAllRole = () => {
  console.log(`                              ` + Line.green.bold(`Current Employee Roles:`));
  const sql =     `SELECT role.id, role.title, department.department_name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
      response.forEach((role) => {console.log(role.title);});
      PrmptUse();
  });
};

const showAllDept = () => {
  const sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
    console.log(`                              ` + Line.green.bold(`All Departments:`));
    console.table(response);
    PrmptUse();
  });
};

const EandD = () => {
  const sql =     `SELECT employee.first_name, 
                  employee.last_name, 
                  department.department_name AS department
                  FROM employee 
                  LEFT JOIN role ON employee.role_id = role.id 
                  LEFT JOIN department ON role.department_id = department.id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.log(`                              ` + Line.green.bold(`Employees by Department:`));
      console.table(response);
      PrmptUse();
    });
};

const Depatment = () => {
  console.log(`                              ` + Line.green.bold(`Budget By Department:`));
  const sql =     `SELECT department_id AS id, 
                  department.department_name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.table(response);
      PrmptUse();
  });
};


const addingemp = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fistName',
      message: "What is the employee's first name?",
      Value: addFirstName => {
        if (addFirstName) {
            return true;
        } else {
            console.log('Please enter a first name');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee's last name?",
      Value: addLastName => {
        if (addLastName) {
            return true;
        } else {
            console.log('Please enter a last name');
            return false;
        }
      }
    }
  ])
    .then(answer => {
    const crit = [answer.fistName, answer.lastName]
    const roleSql = `SELECT role.id, role.title FROM role`;
    connection.promise().query(roleSql, (error, data) => {
      if (error) throw error; 
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));
      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              crit.push(role);
              const managerSql =  `SELECT * FROM employee`;
              connection.promise().query(managerSql, (error, data) => {
                if (error) throw error;
                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                  .then(managerChoice => {
                    const manager = managerChoice.manager;
                    crit.push(manager);
                    const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                    connection.query(sql, crit, (error) => {
                    if (error) throw error;
                    console.log("Employee has been added!")
                    viewAllEmployees();
              });
            });
          });
        });
     });
  });
};

const role = () => {
  const sql = 'SELECT * FROM department'
  connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let deptNamesArray = [];
      response.forEach((department) => {deptNamesArray.push(department.department_name);});
      deptNamesArray.push('Create Department');
      inquirer
        .prompt([
          {
            name: 'departmentName',
            type: 'list',
            message: 'Which department is this new role in?',
            choices: deptNamesArray
          }
        ])
        .then((answer) => {
          if (answer.departmentName === 'Create Department') {
            this.addDept();
          } else {
            roleResume(answer);
          }
        });

      const roleResume = (departmentData) => {
        inquirer
          .prompt([
            {
              name: 'newRole',
              type: 'input',
              message: 'What is the name of your new role?',
              Value: Value.ValueString
            },
            {
              name: 'salary',
              type: 'input',
              message: 'What is the salary of this new role?',
              Value: Value.ValueSalary
            }
          ])
          .then((answer) => {
            let createdRole = answer.newRole;
            let departmentId;

            response.forEach((department) => {
              if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
            });

            let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
            let crit = [createdRole, answer.salary, departmentId];

            connection.promise().query(sql, crit, (error) => {
              if (error) throw error;
              console.log(Line.blueBright(`Role successfully created!`));
              showAllRole();
            });
          });
      };
    });
  };

const addDept = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of your new Department?',
          Value: Value.ValueString
        }
      ])
      .then((answer) => {
        let sql =     `INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log(``);
          console.log(Line.blueBright(answer.newDepartment + ` Department successfully created!`));
          console.log(``);
          showAllDept();
        });
      });
};

const updatedEmpRole = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      let sql =     `SELECT role.id, role.title FROM role`;
      connection.promise().query(sql, (error, response) => {
        if (error) throw error;
        let rolesArray = [];
        response.forEach((role) => {rolesArray.push(role.title);});

        inquirer
          .prompt([
            {
              name: 'chosenEmployee',
              type: 'list',
              message: 'Which employee has a new role?',
              choices: employeeNamesArray
            },
            {
              name: 'chosenRole',
              type: 'list',
              message: 'What is their new role?',
              choices: rolesArray
            }
          ])
          .then((answer) => {
            let newTitleId, employeeId;

            response.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
              }
            });

            response.forEach((employee) => {
              if (
                answer.chosenEmployee ===
                `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
              }
            });

            let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
            connection.query(
              sqls,
              [newTitleId, employeeId],
              (error) => {
                if (error) throw error;
                console.log(Line.blueBright(`Employee Role Updated`));
                PrmptUse();
              }
            );
          });
      });
    });
  };

const updtEmpMangr = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
                    FROM employee`;
     connection.promise().query(sql, (error, response) => {
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new manager?',
            choices: employeeNamesArray
          },
          {
            name: 'newManager',
            type: 'list',
            message: 'Who is their manager?',
            choices: employeeNamesArray
          }
        ])
        .then((answer) => {
          let employeeId, managerId;
          response.forEach((employee) => {
            if (
              answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }

            if (
              answer.newManager === `${employee.first_name} ${employee.last_name}`
            ) {
              managerId = employee.id;
            }
          });

          if (Value.isSame(answer.chosenEmployee, answer.newManager)) {
            console.log(Line.redBright(`Invalid Manager Selection`));
            PrmptUse();
          } else {
            let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

            connection.query(
              sql,
              [managerId, employeeId],
              (error) => {
                if (error) throw error;
                console.log(Line.blueBright(`Employee Manager Updated`));
                PrmptUse();
              }
            );
          }
        });
    });
};


const remvEmploy = () => {
    let sql =     `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: employeeNamesArray
          }
        ])
        .then((answer) => {
          let employeeId;

          response.forEach((employee) => {
            if (
              answer.chosenEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });

          let sql = `DELETE FROM employee WHERE employee.id = ?`;
          connection.query(sql, [employeeId], (error) => {
            if (error) throw error;
            console.log(Line.redBright(`Employee Successfully Removed`));
            viewAllEmployees();
          });
        });
    });
  };

const remvRol = () => {
    let sql = `SELECT role.id, role.title FROM role`;

    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let roleNamesArray = [];
      response.forEach((role) => {roleNamesArray.push(role.title);});

      inquirer
        .prompt([
          {
            name: 'chosenRole',
            type: 'list',
            message: 'Which role would you like to remove?',
            choices: roleNamesArray
          }
        ])
        .then((answer) => {
          let roleId;

          response.forEach((role) => {
            if (answer.chosenRole === role.title) {
              roleId = role.id;
            }
          });

          let sql =   `DELETE FROM role WHERE role.id = ?`;
          connection.promise().query(sql, [roleId], (error) => {
            if (error) throw error;
            console.log(Line.blueBright(`Role Successfully Removed`));
            showAllRole();
          });
        });
    });
  };

const remvDept = () => {
    let sql =   `SELECT department.id, department.department_name FROM department`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let deptNameArr = [];
      response.forEach((department) => {deptNameArr.push(department.department_name);});

      inquirer
        .prompt([
          {
            name: 'chosenDept',
            type: 'list',
            message: 'Which department would you like to remove?',
            choices: deptNameArr
          }
        ])
        .then((answer) => {
          let departmentId;

          response.forEach((department) => {
            if (answer.chosenDept === department.department_name) {
              departmentId = department.id;
            }
          });

          let sql =     `DELETE FROM department WHERE department.id = ?`;
          connection.promise().query(sql, [departmentId], (error) => {
            if (error) throw error;
            console.log(Line.redBright(`Department Successfully Removed`));
            showAllDept();
          });
        });
    });
};