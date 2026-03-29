
import { createRoot } from 'react-dom/client'
import './app/index.css'
import App from './app/App.jsx'
import { store } from './app/appStore.js'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(

    <Provider store={store}>
    <App />
    </Provider>
  
)
