import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="home-hero">
      <div className="container home-hero-content">
        <div className="home-hero-copy">
          <span className="badge badge-premium">Jáchal, San Juan</span>

          <h1>Encontrá el profesional que necesitás</h1>

          <p>
            OficiosYa conecta personas de Jáchal con trabajadores y
            profesionales de confianza para resolver sus necesidades.
          </p>

          <div className="home-hero-actions">
            <Link to="/buscar" className="button button-primary">
              Buscar un trabajador
            </Link>

            <Link to="/categorias" className="button button-outline">
              Ver categorías
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection