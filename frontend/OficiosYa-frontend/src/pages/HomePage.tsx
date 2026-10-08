import CategoryPreview from '../components/home/CategoryPreview'
import FeaturedWorkers from '../components/home/FeaturedWorkers'
import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'

function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryPreview />
      <FeaturedWorkers />
      <HowItWorks />
    </>
  )
}

export default HomePage