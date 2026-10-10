import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import SearchPage from '../pages/SearchPage'
import CategoriesPage from '../pages/CategoriesPage'
import CategoryPage from '../pages/CategoryPage'
import WorkerPage from '../pages/WorkerPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import WorkerRegisterPage from '../pages/WorkerRegisterPage'
import ProfilePage from '../pages/ProfilePage'
import ReviewsPage from '../pages/ReviewsPage'
import AdminPage from '../pages/AdminPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/buscar" element={<SearchPage />} />

        <Route
          path="/categorias"
          element={<CategoriesPage />}
        />

        <Route
          path="/categoria/:id"
          element={<CategoryPage />}
        />

        <Route
          path="/trabajador/:id"
          element={<WorkerPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/registro"
          element={<RegisterPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/registro-trabajador"
            element={<WorkerRegisterPage />}
          />

          <Route
            path="/mi-perfil"
            element={<ProfilePage />}
          />

          <Route
            path="/mis-calificaciones"
            element={<ReviewsPage />}
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={['ADMIN']} />}
        >
          <Route
            path="/admin"
            element={<AdminPage />}
          />
        </Route>

        <Route
          path="/404"
          element={<NotFoundPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/404" replace />}
        />
      </Route>
    </Routes>
  )
}

export default AppRouter