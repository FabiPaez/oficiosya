import AppRouter from './routes/AppRouter'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={
          theme === 'light'
            ? 'Activar modo oscuro'
            : 'Activar modo claro'
        }
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <AppRouter />
    </>
  )
}

export default App