import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryService } from '../../services/categoryService'
import type { Category } from '../../types/category'
import Card from '../ui/Card'

function CategoryPreview() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await categoryService.getAll()
        setCategories(result.slice(0, 6))
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    void loadCategories()
  }, [])

  if (loading) {
    return (
      <section className="home-section">
        <div className="container">
          <div className="state state-loading">
            Cargando categorías...
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="home-section">
        <div className="container">
          <div className="state state-error">
            No pudimos cargar las categorías.
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="home-section">
        <div className="container">
          <div className="state state-empty">
            No hay categorías disponibles.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="home-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Servicios</span>
            <h2>Explorá por categoría</h2>
          </div>

          <Link to="/categorias" className="section-link">
            Ver todas
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.id}`}
              className="category-link"
            >
              <Card className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryPreview