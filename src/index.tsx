/* @refresh reload */
import { render } from 'solid-js/web';

import './assets/styles/styles.css';
import './assets/styles/tailwind.css';

import 'simplebar';
import 'simplebar/dist/simplebar.min.css';

import ResizeObserver from 'resize-observer-polyfill';
window.ResizeObserver = ResizeObserver;

import App from './App';

render(() => <App />, document.getElementById('root')!);
