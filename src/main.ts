import { mount } from 'svelte';
import './themes/base.css';
import './themes/minecraft.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
