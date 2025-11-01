//export-hub/page.jsx

'use client'

import { useState } from 'react'
import { Search, Users, MessageCircle, Award, TrendingUp, Filter, Star, Clock, CheckCircle, ArrowRight, User, Send } from 'lucide-react'

export default function ExpertHub() {
  const [activeTab, setActiveTab] = useState('questions')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', count: 1247 },
    { id: 'diagnosis', name: 'Disease Diagnosis', count: 342 },
    { id: 'treatment', name: 'Treatment Plans', count: 289 },
    { id: 'prevention', name: 'Prevention Tips', count: 198 },
    { id: 'organic', name: 'Organic Solutions', count: 156 },
    { id: 'equipment', name: 'Equipment & Tools', count: 142 },
  ]

  const experts = [
    { 
      id: 1, 
      name: 'Dr. Priya Sharma', 
      title: 'Plant Pathologist',
      expertise: 'Fungal Diseases',
      avatar: 'PS',
      rating: 4.9,
      answers: 342,
      verified: true,
      online: true
    },
    { 
      id: 2, 
      name: 'Rajesh Kumar', 
      title: 'Agricultural Scientist',
      expertise: 'Pest Management',
      avatar: 'RK',
      rating: 4.8,
      answers: 289,
      verified: true,
      online: false
    },
    { 
      id: 3, 
      name: 'Dr. Anita Desai', 
      title: 'Crop Specialist',
      expertise: 'Nutrient Deficiency',
      avatar: 'AD',
      rating: 4.9,
      answers: 401,
      verified: true,
      online: true
    },
  ]

  const questions = [
    {
      id: 1,
      title: 'Brown spots appearing on tomato leaves - urgent help needed',
      description: 'My tomato plants have developed brown spots with yellow halos. The spots started small but are now spreading rapidly...',
      author: 'Farmer_Raj',
      category: 'diagnosis',
      votes: 23,
      answers: 5,
      views: 342,
      timeAgo: '2 hours ago',
      tags: ['tomato', 'fungal', 'urgent'],
      solved: true
    },
    {
      id: 2,
      title: 'Best organic pesticide for aphid control on roses?',
      description: 'Looking for effective organic solutions to control aphids that have infested my rose garden...',
      author: 'GreenThumb_Maya',
      category: 'organic',
      votes: 18,
      answers: 8,
      views: 256,
      timeAgo: '5 hours ago',
      tags: ['organic', 'aphids', 'roses'],
      solved: false
    },
    {
      id: 3,
      title: 'White powdery substance on cucumber leaves',
      description: 'I noticed a white powdery coating on my cucumber plants. Is this powdery mildew? What should I do?',
      author: 'VeggieGrower_Sam',
      category: 'diagnosis',
      votes: 31,
      answers: 12,
      views: 489,
      timeAgo: '1 day ago',
      tags: ['cucumber', 'powdery-mildew', 'fungal'],
      solved: true
    },
  ]

  const trendingTopics = [
    { name: 'Late Blight Prevention', posts: 45, trend: '+12%' },
    { name: 'Organic Pest Control', posts: 38, trend: '+8%' },
    { name: 'Soil pH Management', posts: 29, trend: '+15%' },
    { name: 'Drought Stress', posts: 24, trend: '+5%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Connect with 5,000+ Agricultural Experts</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Expert Community Hub
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Get answers from verified agricultural experts and share your knowledge with the farming community
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions, topics, or experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-lg"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Categories</h3>
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{cat.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{cat.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Trending Topics</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{topic.name}</p>
                      <p className="text-xs text-gray-500">{topic.posts} posts</p>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {topic.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ask Question CTA */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">Have a Question?</h3>
              <p className="text-sm text-green-100 mb-4">
                Get expert answers within 24 hours
              </p>
              <button className="w-full bg-white text-green-600 hover:bg-green-50 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Ask Question
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-2 flex gap-2">
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'questions'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Questions
              </button>
              <button
                onClick={() => setActiveTab('experts')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'experts'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Award className="w-4 h-4" />
                Top Experts
              </button>
            </div>

            {/* Questions List */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-1">
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                          <ArrowRight className="w-5 h-5 text-gray-400 -rotate-90" />
                        </button>
                        <span className="font-semibold text-gray-700">{question.votes}</span>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                        </button>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors">
                            {question.title}
                          </h3>
                          {question.solved && (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Solved
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {question.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {question.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {question.timeAgo}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-green-600">
                              {question.answers} answers
                            </span>
                            <span>{question.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Experts List */}
            {activeTab === 'experts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experts.map((expert) => (
                  <div
                    key={expert.id}
                    className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                          {expert.avatar}
                        </div>
                        {expert.online && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800">{expert.name}</h4>
                              {expert.verified && (
                                <CheckCircle className="w-4 h-4 text-green-600 fill-current" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{expert.title}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700">{expert.rating}</span>
                          </div>
                        </div>
                        
                        <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full mb-3">
                          <Award className="w-3 h-3" />
                          {expert.expertise}
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">{expert.answers}</span> answers
                          </span>
                          <button className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                            View Profile →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}