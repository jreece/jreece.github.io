'use strict';

// A deliberately small, inspectable set of business rules and real assertions.
// These demonstrations do not connect to or make claims about production software.
const rules = Object.freeze({
  discount(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return false;
    return value >= 0 && value <= 100;
  },
  normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  },
  shippingEligible(total) {
    return typeof total === 'number' && Number.isFinite(total) && total >= 75;
  }
});

const cases = [
  { id: 'TC-001', name: 'Accept a discount within the valid range', type: 'positive', check: () => rules.discount(25) === true },
  { id: 'TC-002', name: 'Reject a negative discount', type: 'negative', check: () => rules.discount(-1) === false },
  { id: 'TC-003', name: 'Accept the maximum discount boundary (100)', type: 'boundary', check: () => rules.discount(100) === true },
  { id: 'TC-004', name: 'Normalize email whitespace and casing', type: 'positive', check: () => rules.normalizeEmail('  TEST@EXAMPLE.COM  ') === 'test@example.com' },
  { id: 'TC-005', name: 'Apply free shipping at the threshold (75)', type: 'boundary', check: () => rules.shippingEligible(75) === true }
];

const body = document.querySelector('#test-body');
const summary = document.querySelector('#test-summary');
const runButton = document.querySelector('#run-tests');
const filters = [...document.querySelectorAll('[data-filter]')];
let activeFilter = 'all';
let running = false;
const results = new Map();

function render() {
  const visible = cases.filter(item => activeFilter === 'all' || item.type === activeFilter);
  body.replaceChildren();
  for (const item of visible) {
    const row = document.createElement('tr');
    const status = results.get(item.id) || 'ready';
    for (const value of [item.id, item.name, item.type, status]) {
      const cell = document.createElement('td');
      if (value === item.type) {
        const label = document.createElement('span'); label.className = 'type-chip'; label.textContent = value.toUpperCase(); cell.append(label);
      } else if (value === status) {
        const label = document.createElement('span'); label.className = `result ${status}`; label.textContent = status.toUpperCase(); cell.append(label);
      } else cell.textContent = value;
      row.append(cell);
    }
    body.append(row);
  }
  const pass = [...results.values()].filter(value => value === 'pass').length;
  const fail = [...results.values()].filter(value => value === 'fail').length;
  summary.textContent = results.size ? `${pass} passed · ${fail} failed · ${cases.length - results.size} remaining` : `${cases.length} cases ready · No checks executed`;
}

filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filter => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
  render();
}));

runButton.addEventListener('click', async () => {
  if (running) return;
  running = true; runButton.disabled = true; runButton.textContent = 'Running checks…'; results.clear(); render();
  for (const item of cases) {
    results.set(item.id, 'running'); render();
    await new Promise(resolve => setTimeout(resolve, 190));
    try { results.set(item.id, item.check() ? 'pass' : 'fail'); }
    catch { results.set(item.id, 'fail'); }
    render();
  }
  running = false; runButton.disabled = false; runButton.textContent = '▶ Run checks';
});

document.querySelector('#reset-tests').addEventListener('click', () => {
  if (running) return;
  results.clear(); render();
});

document.querySelector('#discount-form').addEventListener('submit', event => {
  event.preventDefault();
  const raw = document.querySelector('#discount-input').value.trim();
  const value = raw === '' ? NaN : Number(raw);
  const valid = rules.discount(value);
  const output = document.querySelector('#validation-result');
  output.className = `validation-result ${valid ? 'good' : 'bad'}`;
  output.textContent = valid ? `PASS — ${value}% is within the accepted range (0–100).` : 'REJECTED — Enter a finite number between 0 and 100.';
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation');
}));
document.querySelector('#year').textContent = new Date().getFullYear();
render();
