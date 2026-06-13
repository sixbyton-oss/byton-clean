import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

class ErrorBoundary extends React.Component<any, any> {
  state = {hasError: false, error: ''}
  static getDerivedStateFromError(error: any) {
    return {hasError: true, error: error.toString()}
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding:30,color:'white',background:'black',fontFamily:'monospace'}}>
        <h2>App Crashed Here:</h2>
        <pre>{this.state.error}</pre>
      </div>
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </React.StrictMode>
)
0
