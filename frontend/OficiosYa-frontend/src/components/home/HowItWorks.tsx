function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Buscá',
      description:
        'Encontrá trabajadores según el oficio o servicio que necesitás.',
    },
    {
      number: '2',
      title: 'Compará',
      description:
        'Revisá perfiles, experiencia, zonas de cobertura y trabajos realizados.',
    },
    {
      number: '3',
      title: 'Contactá',
      description:
        'Elegí el profesional que mejor se adapte a tu necesidad y zona.',
    },
  ]

  return (
    <section className="home-section home-how-it-works">
      <div className="container">
        <div className="section-heading section-heading-centered">
          <span className="section-eyebrow">Simple y directo</span>
          <h2>¿Cómo funciona OficiosYa?</h2>
        </div>

        <div className="how-it-works-grid">
          {steps.map((step) => (
            <div key={step.number} className="how-it-works-item">
              <div className="how-it-works-number">
                {step.number}
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
