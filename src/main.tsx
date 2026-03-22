import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
// import App from './App.tsx';
import TodoApp from './todo.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>,
)
