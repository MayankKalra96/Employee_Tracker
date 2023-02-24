INSERT INTO department(department_name)
VALUES("Engineering"), ("Sales"), ("Finance"), ("Legal"), ("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 85000, 1), ("Senior Engineer", 125000, 1), ("CFO", 350000, 3), ("Chief Counsel", 300000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Mayank', 'Kalra', 1, 2), ('Harry', 'potter', 1, null), ('Super', 'Man', 1, 2), ('Johnny', 'Walker', 2, 2), ('Justin', 'Berry', 4, null);

