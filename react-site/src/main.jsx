import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.documentElement.classList.remove('dark')

// Cross-document View Transitions may intentionally fall back to an instant
// navigation. Consume those expected rejections so the fallback stays quiet.
function settleViewTransition(event) {
  const transition = event.viewTransition

  if (!transition) return

  transition.ready?.catch(() => {})
  transition.finished?.catch(() => {})
  transition.updateCallbackDone?.catch(() => {})
}

window.addEventListener('pageswap', settleViewTransition)
window.addEventListener('pagereveal', settleViewTransition)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
