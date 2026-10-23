
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CategoryPreview from '../components/home/CategoryPreview'
import FeaturedWorkers from '../components/home/FeaturedWorkers'
import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'

function HomePage() {
  const location = useLocation()


  useEffect(() => {
    if (location.pathname !== '/') {
      return
    }

    if (location.hash === '#trabajadores-destacados') {
      const frameId = requestAnimationFrame(() => {
        document
          .getElementById('trabajadores-destacados')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
      })

      return () => cancelAnimationFrame(frameId)
    }

    if (!location.hash) {
      window.scrollTo({
        top: 0,
        behavior: 'auto',
      })
    }
  }, [location.pathname, location.hash])


  return (
    <>
      <HeroSection />
      

      <div id="trabajadores-destacados">
        <FeaturedWorkers />
      </div>

      <HowItWorks />
    </>
  )
}

export default HomePage
