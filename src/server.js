const express = require('express');
const path = require('path');
const {
  listEmployees,
  getSummary,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeExists,
} = require('./db');
const {
  appendMessageToReturnTo,
  parseDashboardFilters,
  sanitizeReturnTo,
} = require('./dashboardFilters');
const { renderDashboard } = require('./render');

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);

app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(path.join(__dirname, 'public')));

function redirectWithMessage(res, message, returnTo = '/') {
  res.redirect(appendMessageToReturnTo(returnTo, message));
}

function parseId(value) {
  const id = Number.parseInt(String(value), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseEmployeeInput(body, employeeId = null) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const homeAddress = typeof body.homeAddress === 'string' ? body.homeAddress.trim() : '';
  const salary = Number.parseInt(String(body.salary || ''), 10);
  const managerId = body.managerId ? parseId(body.managerId) : null;

  if (!name) {
    throw new Error('Employee name is required.');
  }

  if (!title) {
    throw new Error('Employee title is required.');
  }

  if (!homeAddress) {
    throw new Error('Home address is required.');
  }

  if (!Number.isInteger(salary) || salary < 0) {
    throw new Error('Salary must be a whole number greater than or equal to 0.');
  }

  if (managerId !== null && !employeeExists(managerId)) {
    throw new Error('Selected manager could not be found.');
  }

  if (employeeId !== null && managerId === employeeId) {
    throw new Error('An employee cannot report to themselves.');
  }

  return {
    name,
    title,
    salary,
    homeAddress,
    managerId,
  };
}

app.get('/', (req, res) => {
  const message = typeof req.query.message === 'string' ? req.query.message : '';
  const filters = parseDashboardFilters(req.query);
  const employees = listEmployees(filters.applied);
  const allEmployees = listEmployees();
  const summary = getSummary();

  res.type('html').send(renderDashboard({ employees, allEmployees, summary, message, filters }));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    employeeCount: listEmployees().length,
  });
});

app.get('/api/employees', (req, res) => {
  const filters = parseDashboardFilters(req.query);

  res.json({
    employees: listEmployees(filters.applied),
    summary: getSummary(),
    filters: {
      search: filters.search,
      minSalary: filters.minSalary,
      maxSalary: filters.maxSalary,
      hasActiveFilters: filters.hasActiveFilters,
      validationMessage: filters.validationMessage,
    },
  });
});

app.post('/employees', (req, res) => {
  const returnTo = sanitizeReturnTo(req.body.returnTo);

  try {
    const employee = parseEmployeeInput(req.body);
    createEmployee(employee);
    redirectWithMessage(res, `${employee.name} added to payroll.`, returnTo);
  } catch (error) {
    redirectWithMessage(res, error.message || 'Unable to add employee.', returnTo);
  }
});

app.post('/employees/:id/update', (req, res) => {
  const employeeId = parseId(req.params.id);
  const returnTo = sanitizeReturnTo(req.body.returnTo);

  if (!employeeId || !employeeExists(employeeId)) {
    return redirectWithMessage(res, 'Employee record could not be found.', returnTo);
  }

  try {
    const employee = parseEmployeeInput(req.body, employeeId);
    updateEmployee(employeeId, employee);
    return redirectWithMessage(res, `${employee.name}'s profile was updated.`, returnTo);
  } catch (error) {
    return redirectWithMessage(res, error.message || 'Unable to update employee.', returnTo);
  }
});

app.post('/employees/:id/delete', (req, res) => {
  const employeeId = parseId(req.params.id);
  const returnTo = sanitizeReturnTo(req.body.returnTo);

  if (!employeeId || !employeeExists(employeeId)) {
    return redirectWithMessage(res, 'Employee record could not be found.', returnTo);
  }

  const removedEmployee = deleteEmployee(employeeId);
  return redirectWithMessage(res, `${removedEmployee.name} was removed from payroll.`, returnTo);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Payroll app running at http://localhost:${port}`);
  });
}

module.exports = app;
