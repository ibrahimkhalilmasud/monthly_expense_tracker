const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><body><div id="root"></div></body>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
Object.assign(global, {
  SVGElement: dom.window.SVGElement,
  Element: dom.window.Element,
  HTMLElement: dom.window.HTMLElement,
});
global.window.matchMedia = (q) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false });

const React = require('./node_modules/react/index.js');
const ReactDOMClient = require('./node_modules/react-dom/client.js');
const recharts = require('./node_modules/recharts/lib/index.js');

const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } = recharts;
const data = [{ name: 'Test', amount: 100, color: '#ff0000' }];

const errors = [];
console.error = (...args) => errors.push(args.join(' '));

const el = React.createElement(
  BarChart, { width: 400, height: 300, data },
  React.createElement(CartesianGrid, null),
  React.createElement(XAxis, { dataKey: 'name' }),
  React.createElement(YAxis, null),
  React.createElement(Bar, { dataKey: 'amount' })
);

const root = ReactDOMClient.createRoot(document.getElementById('root'));
root.render(el);

setTimeout(() => {
  if (errors.length > 0) {
    console.log('Errors:'); errors.forEach(e => console.log(e.substring(0, 300)));
  } else {
    console.log('No errors!');
  }
}, 500);
