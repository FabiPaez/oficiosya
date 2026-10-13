import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'

function CategoryPage() {
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true


    async function loadCategory() {
      if (!id) {
        setError('No se indicó una categoría válida.')
        setLoading(false)
        return
      }

      try {
        const result = await categoryService.getById(id)

        if (active) {
          setCategory(result)
          if (!result) {
            setError('La categoría no existe o no está disponible.')
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la categoría.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCategory()

    return () => {
      active = false
    }


  }, [id])

  return (<main> <p> <Link to="/categorias">← Volver a categorías</Link> </p>


    {loading && <p>Cargando categoría...</p>}

    {error && <p role="alert">{error}</p>}

    {!loading && !error && category && (
      <>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </>
    )}
  </main>

  )
}

export default CategoryPage
