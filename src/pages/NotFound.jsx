import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ApperIcon name="AlertTriangle" className="w-16 h-16 text-primary" />
        </motion.div>
        
        <motion.h1 
          className="text-6xl md:text-7xl font-bold text-surface-800 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          404
        </motion.h1>
        
        <motion.h2 
          className="text-2xl md:text-3xl font-semibold text-surface-700 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          className="text-surface-600 mb-8 text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Looks like this task got lost in the workflow! Let's get you back to your productivity dashboard.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-soft hover:shadow-card transform hover:scale-105"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            <span>Back to FlowFocus</span>
          </Link>
        </motion.div>
        
        <motion.div 
          className="mt-12 flex justify-center space-x-8 text-surface-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center space-x-2">
            <ApperIcon name="CheckCircle" className="w-5 h-5" />
            <span className="text-sm">Organize Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <ApperIcon name="Zap" className="w-5 h-5" />
            <span className="text-sm">Stay Productive</span>
          </div>
          <div className="flex items-center space-x-2">
            <ApperIcon name="Target" className="w-5 h-5" />
            <span className="text-sm">Achieve Goals</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}