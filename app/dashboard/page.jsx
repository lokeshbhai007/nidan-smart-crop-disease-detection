// app/dashboard/page.jsx
'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import ProtectedRoute from '@/components/protected-route'

// Mock data for charts
const trendData = [
  { month: 'Jan', detections: 45, accuracy: 85 },
  { month: 'Feb', detections: 52, accuracy: 87 },
  { month: 'Mar', detections: 48, accuracy: 89 },
  { month: 'Apr', detections: 65, accuracy: 86 },
  { month: 'May', detections: 72, accuracy: 88 },
  { month: 'Jun', detections: 68, accuracy: 90 }
]

const diseaseData = [
  { name: 'Tomato Blight', count: 35 },
  { name: 'Powdery Mildew', count: 28 },
  { name: 'Leaf Spot', count: 22 },
  { name: 'Root Rot', count: 15 },
  { name: 'Other', count: 20 }
]

const accuracyData = [
  { name: 'Correct', value: 87 },
  { name: 'Incorrect', value: 13 }
]

const COLORS = ['#16a34a', '#a3e635', '#f59e0b', '#84cc16', '#eab308']

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-green-800 mb-4">Analytics Dashboard</h1>
            <p className="text-xl text-gray-600">Monitor detection trends and system performance</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Total Detections', value: '290', change: '+12%' },
              { label: 'Accuracy Rate', value: '87%', change: '+2%' },
              { label: 'Common Disease', value: 'Tomato Blight', change: '35 cases' },
              { label: 'Avg. Response Time', value: '2.3s', change: '-0.4s' }
            ].map((stat, index) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-green-800 mb-1">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Detection Trends */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4">Detection Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="detections" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      name="Detections"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Common Diseases */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4">Most Common Diseases</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diseaseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Accuracy Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 max-w-md mx-auto"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">Detection Accuracy</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* TODO Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200"
          >
            <h4 className="font-semibold text-amber-800 mb-2">Integration Notes</h4>
            <p className="text-sm text-amber-700">
              TODO: Replace mock data with real analytics from backend. Connect to actual detection 
              history and user data. Implement real-time updates and more detailed metrics.
            </p>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}