import { App1 } from './App1'
import { App2 } from './App2'
import ReactDOM from 'react-dom/client'

//  because of chrome plugin injects configuration later
const App = () => {
  return (
    <div>
      <App1 />
      {/* <App2 /> */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
