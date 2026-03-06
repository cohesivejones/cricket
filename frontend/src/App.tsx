import { Route, Switch } from 'wouter'
import Landing from './pages/Landing'
import Session from './pages/Session'

function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/session/:id" component={Session} />
      <Route>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1>404 - Not Found</h1>
          <a href="/" style={{ marginTop: '1rem', color: '#007bff' }}>
            Go back to home
          </a>
        </div>
      </Route>
    </Switch>
  )
}

export default App
