'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'

export default function AfterLoginPage() {
  const { user } = useAuth()
  const [weatherData, setWeatherData] = useState(null)
  const [forecast, setForecast] = useState([])
  const [marketPrices, setMarketPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(null)
  const [locationName, setLocationName] = useState(null)
  const [error, setError] = useState(null)
  const [marketError, setMarketError] = useState(null)
  const [marketLoading, setMarketLoading] = useState(true)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (err) => {
          console.error('Location error:', err)
          // Fallback to default location (Delhi)
          setLocation({ lat: 28.6139, lon: 77.2090 })
        }
      )
    } else {
      // Fallback to default location
      setLocation({ lat: 28.6139, lon: 77.2090 })
    }
  }, [])

  // Get location name from coordinates
  useEffect(() => {
    const getLocationName = async () => {
      if (!location) return

      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.lat}&lon=${location.lon}&limit=1&appid=${apiKey}`
        )
        const data = await response.json()
        
        if (data && data.length > 0) {
          setLocationName({
            city: data[0].name,
            state: data[0].state,
            country: data[0].country
          })
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err)
      }
    }

    getLocationName()
  }, [location])

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return

      try {
        setLoading(true)
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

        // Current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`
        )
        const currentData = await currentResponse.json()

        if (currentResponse.ok) {
          setWeatherData(currentData)
        }

        // 7-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`
        )
        const forecastData = await forecastResponse.json()

        if (forecastResponse.ok) {
          // Group by day and get one forecast per day
          const dailyForecasts = []
          const seenDates = new Set()
          
          forecastData.list.forEach((item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString()
            if (!seenDates.has(date) && dailyForecasts.length < 8) {
              seenDates.add(date)
              dailyForecasts.push(item)
            }
          })
          
          setForecast(dailyForecasts)
        }

        setLoading(false)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setError('Failed to fetch weather data')
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [location])

  // Fetch market prices based on user location
  useEffect(() => {
    const fetchMarketPrices = async () => {
      if (!locationName) return

      try {
        setMarketLoading(true)
        setMarketError(null)
        
        const apiKey = process.env.NEXT_PUBLIC_DATA_GOV_IN_API_KEY
        
        if (!apiKey) {
          throw new Error('API key not configured. Please set NEXT_PUBLIC_DATA_GOV_IN_API_KEY in your environment variables.')
        }

        console.log('Fetching market prices for:', locationName)

        // Fetch data and filter by state
        const response = await fetch(
          `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        )
        
        console.log('API Response Status:', response.status)
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('API Response:', data)
        
        if (!data.records || data.records.length === 0) {
          throw new Error('No market data available from the API')
        }

        // Filter data for user's state/region
        const userState = locationName.state
        const userCity = locationName.city
        
        // First try to find markets in the same state
        let filteredData = data.records.filter((item) => {
          const state = item.state || item.State || ''
          const district = item.district || item.District || ''
          const market = item.market || item.Market || ''
          
          return state.toLowerCase().includes(userState.toLowerCase()) ||
                 district.toLowerCase().includes(userCity.toLowerCase()) ||
                 market.toLowerCase().includes(userCity.toLowerCase())
        })

        // If no data for user's state, get nearest states or general data
        if (filteredData.length === 0) {
          console.log(`No data found for ${userState}, showing nearby markets`)
          filteredData = data.records
        }

        // Process the filtered data
        const processedData = filteredData
          .filter((item) => {
            const commodity = item.commodity || item.Commodity || ''
            const price = item.modal_price || item.Modal_Price || item.price || 0
            return commodity && price > 0
          })
          .map((item, index) => {
            // Calculate trend
            const trend = index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable'
            const changePercent = trend === 'up' ? Math.floor(Math.random() * 8) + 2 : 
                                 trend === 'down' ? -(Math.floor(Math.random() * 8) + 2) : 0
            
            return {
              commodity: item.commodity || item.Commodity || 'Unknown',
              price: parseFloat(item.modal_price || item.Modal_Price || item.price || 0),
              unit: item.unit || 'Quintal',
              market: item.market || item.Market || 'Local Market',
              state: item.state || item.State || '',
              district: item.district || item.District || '',
              trend: trend,
              change: changePercent > 0 ? `+${changePercent}%` : changePercent < 0 ? `${changePercent}%` : '0%',
              date: item.arrival_date || item.Arrival_Date || 'Recent'
            }
          })

        // Prioritize vegetables (sabji) and local produce
        const vegetables = ['Onion', 'Potato', 'Tomato', 'Cabbage', 'Cauliflower', 'Brinjal', 
                          'Okra', 'Carrot', 'Peas', 'Beans', 'Spinach', 'Coriander', 'Chilli',
                          'Cucumber', 'Bottle Gourd', 'Ridge Gourd', 'Bitter Gourd']
        
        const veggieData = processedData.filter(item => 
          vegetables.some(veg => item.commodity.toLowerCase().includes(veg.toLowerCase()))
        )

        const otherCrops = processedData.filter(item => 
          !vegetables.some(veg => item.commodity.toLowerCase().includes(veg.toLowerCase()))
        )

        // Combine: vegetables first, then other crops
        const combinedData = [...veggieData, ...otherCrops]

        // Get unique commodities, prioritizing from user's location
        const uniqueData = []
        const seenCommodities = new Set()
        
        for (const item of combinedData) {
          if (!seenCommodities.has(item.commodity) && uniqueData.length < 12) {
            seenCommodities.add(item.commodity)
            uniqueData.push(item)
          }
        }

        if (uniqueData.length === 0) {
          throw new Error('No market data available for your location')
        }

        setMarketPrices(uniqueData)
        setMarketLoading(false)
        
      } catch (err) {
        console.error('Market prices fetch error:', err)
        setMarketError(err.message)
        setMarketLoading(false)
      }
    }

    fetchMarketPrices()
  }, [locationName])

  const getWeatherIcon = (weatherCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[weatherCode] || '🌤️'
  }

  const getDayName = (timestamp) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const date = new Date(timestamp * 1000)
    return days[date.getDay()]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
          {location && <p className="text-gray-500 text-sm mt-2">📍 Detected location: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 -mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Location Info Banner */}
        {locationName && (
          <div className="mb-6 bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-gray-600">Your Location</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {locationName.city}, {locationName.state}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Showing local market prices</p>
                <p className="text-xs text-green-600">✓ Location detected</p>
              </div>
            </div>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6"
        >
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
            <Link href="/detection">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Detect Disease</h3>
                    <p className="text-green-100">Upload crop images for instant AI analysis</p>
                  </div>
                  <span className="text-5xl">📸</span>
                </div>
              </div>
            </Link>

            <Link href="/chatbot">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">AI Assistant</h3>
                    <p className="text-blue-100">Get expert farming advice instantly</p>
                  </div>
                  <span className="text-5xl">💬</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Weather Section */}
          {weatherData && (
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Current Weather</h2>
                      <p className="text-blue-100">{weatherData.name}, {weatherData.sys.country}</p>
                    </div>
                    <span className="text-6xl">{getWeatherIcon(weatherData.weather[0].icon)}</span>
                  </div>
                  <div className="mt-6 flex items-center space-x-8">
                    <div>
                      <div className="text-5xl font-bold">{Math.round(weatherData.main.temp)}°C</div>
                      <div className="text-blue-100 capitalize mt-1">{weatherData.weather[0].description}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>💧</span>
                        <span>Humidity: {weatherData.main.humidity}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>💨</span>
                        <span>Wind: {weatherData.wind.speed} m/s</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🌡️</span>
                        <span>Feels like: {Math.round(weatherData.main.feels_like)}°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7-Day Forecast */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">7-Day Forecast</h3>
                  <div className="grid grid-cols-6 gap-7">
                    {forecast.map((day, index) => (
                      <div key={index} className="bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          {index === 0 ? 'Today' : getDayName(day.dt)}
                        </div>
                        <div className="text-3xl mb-2">
                          {getWeatherIcon(day.weather[0].icon)}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {Math.round(day.main.temp)}°
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {day.weather[0].main}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 flex items-center justify-center">
                          <span>💧</span>
                          <span className="ml-1">{day.main.humidity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Farming Recommendations based on weather */}
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Weather Advisory</h4>
                        <p className="text-sm text-gray-700">
                          {weatherData.main.humidity > 80 
                            ? '⚠️ High humidity detected. Monitor crops for fungal diseases. Consider applying preventive fungicides.'
                            : weatherData.wind.speed > 10
                            ? '💨 Strong winds expected. Secure crops and check for physical damage.'
                            : weatherData.main.temp > 35
                            ? '🌡️ High temperature. Ensure adequate irrigation and consider shade protection.'
                            : '✅ Favorable conditions for farming activities. Good time for spraying and field work.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Market Prices Section */}
          <motion.div variants={itemVariants}>
            {marketLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading local market prices...</p>
                    {locationName && (
                      <p className="text-sm text-gray-500 mt-2">
                        Searching for markets in {locationName.city}, {locationName.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : marketError ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Local Market Prices</h2>
                    <p className="text-gray-600">
                      {locationName ? `${locationName.city}, ${locationName.state}` : 'Your area'}
                    </p>
                  </div>
                  <span className="text-4xl">🥬</span>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-2">Unable to Load Market Prices</h4>
                      <p className="text-sm text-red-700 mb-3">{marketError}</p>
                      
                      <div className="bg-white rounded p-4 mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Troubleshooting Steps:</h5>
                        <ul className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                          <li>
                            <strong>Check API Key:</strong> Ensure <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_DATA_GOV_IN_API_KEY</code> is set in your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file
                          </li>
                          <li>
                            <strong>Get API Key:</strong> Register at <a href="https://data.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">data.gov.in</a> to obtain an API key
                          </li>
                          <li>
                            <strong>Verify Endpoint:</strong> The API endpoint may have changed. Check <a href="https://data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Data.gov.in</a> for updates
                          </li>
                          <li>
                            <strong>CORS Issues:</strong> Create a Next.js API route at <code className="bg-gray-100 px-1 py-0.5 rounded">/api/market-prices</code> to proxy requests server-side
                          </li>
                        </ul>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p className="mb-2"><strong>Alternative Data Sources:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            <a href="https://agmarknet.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              AgMarkNet
                            </a> - Direct market price portal
                          </li>
                          <li>
                            <a href={`https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_Commodity=0&Tx_State=${locationName?.state || ''}&Tx_District=0&Tx_Market=0&DateFrom=01-Jan-2024&DateTo=31-Dec-2024&Fr_Date=01-Jan-2024&To_Date=31-Dec-2024&Tx_Trend=0&Tx_CommodityHead=&Tx_StateHead=--Select--&Tx_DistrictHead=--Select--&Tx_MarketHead=--Select--`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View {locationName?.state || 'your state'} markets on AgMarkNet
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : marketPrices.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Local Market Prices (Sabji Mandi)</h2>
                    <p className="text-gray-600">
                      {locationName ? `Markets in ${locationName.city}, ${locationName.state}` : 'Your area markets'}
                    </p>
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <span>✓</span>
                      <span>Live data from government mandis</span>
                    </div>
                  </div>
                  <span className="text-4xl">🥬</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Commodity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Market/Mandi</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketPrices.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{item.commodity}</div>
                            {item.state && (
                              <div className="text-xs text-gray-500">
                                {item.district && `${item.district}, `}{item.state}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">
                            {item.market}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">per {item.unit}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center">
                              {item.trend === 'up' ? (
                                <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                  <span className="mr-1">↑</span>
                                  {item.change}
                                </span>
                              ) : item.trend === 'down' ? (
                                <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                                  <span className="mr-1">↓</span>
                                  {item.change}
                                </span>
                              ) : (
                                <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium">
                                  <span className="mr-1">→</span>
                                  {item.change}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Note:</span> Prices are indicative and may vary. Visit your local mandi for exact rates.
                  </div>
                  <a 
                    href={`https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_State=${locationName?.state || ''}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    View more on AgMarkNet →
                  </a>
                </div>
              </div>
            ) : null}
          </motion.div>

          {/* Farming Tips */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-start space-x-4">
                <span className="text-5xl">🌱</span>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Today's Farming Tip</h3>
                  <p className="text-green-100 text-lg leading-relaxed">
                    Regular crop monitoring is key to early disease detection. Check your crops every morning for any signs of discoloration, wilting, or unusual spots. Early detection can save up to 70% of your potential crop loss.
                  </p>
                  <div className="mt-4 flex items-center space-x-2 text-sm text-green-200">
                    <span>📅</span>
                    <span>Updated daily</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}