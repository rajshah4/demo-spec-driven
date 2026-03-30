const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const request = require('supertest');

function loadFixture(t) {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'payroll-dashboard-'));
  const dbFilePath = path.join(tempDirectory, 'payroll.sqlite');

  process.env.PAYROLL_DB_PATH = dbFilePath;

  const dbModulePath = require.resolve('../src/db');
  const serverModulePath = require.resolve('../src/server');
  delete require.cache[dbModulePath];
  delete require.cache[serverModulePath];

  const db = require('../src/db');
  const app = require('../src/server');

  t.after(() => {
    db.closeDatabase();
    delete process.env.PAYROLL_DB_PATH;
    delete require.cache[dbModulePath];
    delete require.cache[serverModulePath];
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  return request(app);
}

function countVisibleEmployeeCards(html) {
  return [...html.matchAll(/action="\/employees\/\d+\/update"/g)].length;
}

test('filters employees by matching name search', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?search=sophia');

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 1);
  assert.match(response.text, /<h3>Sophia Carter<\/h3>/);
  assert.match(response.text, /value="sophia"/);
});

test('filters employees by matching title search', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?search=accountant');

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 1);
  assert.match(response.text, /<h3>Priya Patel<\/h3>/);
});

test('applies inclusive salary ranges', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?minSalary=98000&maxSalary=154000');

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 3);
  assert.match(response.text, /Daniel Kim/);
  assert.match(response.text, /Elena Rodriguez/);
  assert.match(response.text, /Priya Patel/);
});

test('shows active filters and clear action', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?search=manager&minSalary=150000');

  assert.equal(response.status, 200);
  assert.match(response.text, /Active filters/);
  assert.match(response.text, /Search/);
  assert.match(response.text, /Min salary/);
  assert.match(response.text, /Clear filters/);
});

test('ignores invalid salary input while preserving the entered value', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?search=payroll&minSalary=abc');

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 1);
  assert.match(response.text, /Salary filters must be whole numbers or left blank\./);
  assert.match(response.text, /name="minSalary" min="0" step="1000" value="abc"/);
});

test('shows guidance when the minimum salary is greater than the maximum salary', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?minSalary=200000&maxSalary=100000');

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 6);
  assert.match(response.text, /Minimum salary cannot be greater than maximum salary\./);
});

test('renders an empty state when filters match no employees', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/?search=nonexistent');

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 0);
  assert.match(response.text, /No employees match these filters\./);
});

test('filters the API employee list while keeping the full summary', async (t) => {
  const agent = loadFixture(t);
  const response = await agent.get('/api/employees?search=manager');

  assert.equal(response.status, 200);
  assert.equal(response.body.employees.length, 1);
  assert.equal(response.body.employees[0].name, 'Elena Rodriguez');
  assert.equal(response.body.summary.headcount, 6);
});

test('create flow preserves the filtered return view', async (t) => {
  const agent = loadFixture(t);
  const response = await agent
    .post('/employees')
    .type('form')
    .send({
      name: 'Jordan Lee',
      title: 'Compensation Analyst',
      salary: '86000',
      managerId: '2',
      homeAddress: '123 Market Street, Chicago, IL 60606',
      returnTo: '/?search=Analyst',
    })
    .redirects(1);

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 1);
  assert.match(response.text, /Jordan Lee added to payroll\./);
  assert.match(response.text, /value="Analyst"/);
  assert.match(response.text, /<h3>Jordan Lee<\/h3>/);
});

test('update flow preserves the filtered return view', async (t) => {
  const agent = loadFixture(t);
  const response = await agent
    .post('/employees/5/update')
    .type('form')
    .send({
      name: 'Daniel Kim',
      title: 'Lead Payroll Specialist',
      salary: '101000',
      managerId: '2',
      homeAddress: '512 Lakeshore Circle, Oak Park, IL 60302',
      returnTo: '/?search=Payroll',
    })
    .redirects(1);

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 1);
  assert.match(response.text, /Daniel Kim&#39;s profile was updated\./);
  assert.match(response.text, /value="Payroll"/);
  assert.match(response.text, /Lead Payroll Specialist/);
});

test('delete flow preserves the filtered return view', async (t) => {
  const agent = loadFixture(t);
  const response = await agent
    .post('/employees/6/delete')
    .type('form')
    .send({
      returnTo: '/?search=Brooks',
    })
    .redirects(1);

  assert.equal(response.status, 200);
  assert.equal(countVisibleEmployeeCards(response.text), 0);
  assert.match(response.text, /Nina Brooks was removed from payroll\./);
  assert.match(response.text, /value="Brooks"/);
  assert.match(response.text, /No employees match these filters\./);
});
