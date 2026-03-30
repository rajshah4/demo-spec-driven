const DASHBOARD_PATH = '/';
const BASE_URL = 'http://dashboard.local';

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return normalizeValue(value[0]);
  }

  return typeof value === 'string' ? value.trim() : '';
}

function parseSalaryInput(value) {
  const raw = normalizeValue(value);

  if (!raw) {
    return { raw: '', value: null, invalid: false };
  }

  if (!/^\d+$/.test(raw)) {
    return { raw, value: null, invalid: true };
  }

  return { raw, value: Number.parseInt(raw, 10), invalid: false };
}

function buildDashboardPath({ search = '', minSalary = '', maxSalary = '', message = '' } = {}) {
  const url = new URL(DASHBOARD_PATH, BASE_URL);

  if (search) {
    url.searchParams.set('search', search);
  }

  if (minSalary) {
    url.searchParams.set('minSalary', minSalary);
  }

  if (maxSalary) {
    url.searchParams.set('maxSalary', maxSalary);
  }

  if (message) {
    url.searchParams.set('message', message);
  }

  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

function parseDashboardFilters(query = {}) {
  const search = normalizeValue(query.search);
  const minSalary = parseSalaryInput(query.minSalary);
  const maxSalary = parseSalaryInput(query.maxSalary);

  let validationMessage = '';
  let appliedMinSalary = minSalary.value;
  let appliedMaxSalary = maxSalary.value;

  if (minSalary.invalid || maxSalary.invalid) {
    validationMessage = 'Salary filters must be whole numbers or left blank.';

    if (minSalary.invalid) {
      appliedMinSalary = null;
    }

    if (maxSalary.invalid) {
      appliedMaxSalary = null;
    }
  }

  if (!validationMessage && appliedMinSalary !== null && appliedMaxSalary !== null && appliedMinSalary > appliedMaxSalary) {
    validationMessage = 'Minimum salary cannot be greater than maximum salary.';
    appliedMinSalary = null;
    appliedMaxSalary = null;
  }

  const appliedSearch = search || null;
  const hasSubmittedValues = Boolean(search || minSalary.raw || maxSalary.raw);
  const hasActiveFilters = Boolean(appliedSearch || appliedMinSalary !== null || appliedMaxSalary !== null);

  return {
    search,
    minSalary: minSalary.raw,
    maxSalary: maxSalary.raw,
    applied: {
      search: appliedSearch,
      minSalary: appliedMinSalary,
      maxSalary: appliedMaxSalary,
    },
    hasSubmittedValues,
    hasActiveFilters,
    validationMessage,
    returnTo: buildDashboardPath({ search, minSalary: minSalary.raw, maxSalary: maxSalary.raw }),
  };
}

function sanitizeReturnTo(value) {
  const raw = normalizeValue(value);

  if (!raw) {
    return DASHBOARD_PATH;
  }

  try {
    const url = new URL(raw, BASE_URL);

    if (url.origin !== BASE_URL || url.pathname !== DASHBOARD_PATH) {
      return DASHBOARD_PATH;
    }

    return buildDashboardPath({
      search: normalizeValue(url.searchParams.get('search')),
      minSalary: normalizeValue(url.searchParams.get('minSalary')),
      maxSalary: normalizeValue(url.searchParams.get('maxSalary')),
    });
  } catch {
    return DASHBOARD_PATH;
  }
}

function appendMessageToReturnTo(returnTo, message) {
  const safeReturnTo = sanitizeReturnTo(returnTo);
  const url = new URL(safeReturnTo, BASE_URL);

  if (message) {
    url.searchParams.set('message', message);
  }

  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

module.exports = {
  appendMessageToReturnTo,
  buildDashboardPath,
  parseDashboardFilters,
  sanitizeReturnTo,
};
