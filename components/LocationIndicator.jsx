import { useChat } from '@/context/chat-context'

export default function LocationIndicator() {
  const { locationStatus, gpsLocation, detectLocation } = useChat()

  if (locationStatus === 'idle') {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {locationStatus === 'detecting' && (
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Detecting location...</span>
        </div>
      )}

      {locationStatus === 'detected' && gpsLocation && (
        <div className="flex items-center gap-2 text-green-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Location detected</span>
          <button
            onClick={detectLocation}
            className="text-xs text-blue-600 hover:underline ml-1"
            title="Refresh location"
          >
            (Refresh)
          </button>
        </div>
      )}

      {locationStatus === 'failed' && (
        <div className="flex items-center gap-2 text-amber-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Using default location</span>
          <button
            onClick={detectLocation}
            className="text-xs text-blue-600 hover:underline ml-1"
            title="Try detecting location again"
          >
            (Retry)
          </button>
        </div>
      )}
    </div>
  )
}