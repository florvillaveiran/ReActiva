import UserDashboard from "./pages/UserDashboard"

function App() {
  return (
    <div style={{padding: "40px"}}>
      <UserDashboard />
    </div>
  )
}

export default App
export default function UserDashboard() {
  return (
    <div>
      <h2>Mi Pausa Activa</h2>
      <p>Si ves esto, ya está funcionando.</p>
    </div>
  )
}