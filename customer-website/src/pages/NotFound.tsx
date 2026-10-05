import { useApp } from '../App'

export default function NotFound() {
  const { navigate } = useApp()

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="text-center max-w-md animate-fade-up">
        <div className="font-display text-[120px] font-bold text-border leading-none mb-4">404</div>
        <div className="section-label mb-4">Page Not Found</div>
        <h2 className="font-display text-3xl font-bold text-charcoal mb-4">
          This Thread<br/><span className="italic font-normal">Doesn't Exist.</span>
        </h2>
        <p className="text-charcoal-muted mb-8">
          The page you're looking for has moved, doesn't exist, or was removed.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('home')} className="btn-primary">Back to Home</button>
          <button onClick={() => navigate('products')} className="btn-secondary">Browse Products</button>
        </div>
      </div>
    </div>
  )
}
