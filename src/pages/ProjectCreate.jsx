import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import * as projectService from '../services/api/projectService'
import * as userService from '../services/api/userService'

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    dueDate: '',
    teamMembers: [],
    budget: '',
    tags: []
  })
  const [errors, setErrors] = useState({})

  // Load users for team member selection
  useState(() => {
    const loadUsers = async () => {
      try {
        const usersData = await userService.getAll()
        setUsers(usersData || [])
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    }
    loadUsers()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleTeamMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    } else {
      const selectedDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    setLoading(true)
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await projectService.create(projectData)
      toast.success('Project created successfully!')
      navigate('/')
    } catch (err) {
      toast.error('Failed to create project. Please try again.')
      console.error('Project creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (Object.values(formData).some(value => 
      Array.isArray(value) ? value.length > 0 : value.trim() !== ''
    )) {
      if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      {/* Header */}
      <motion.header
        className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200/50 dark:border-surface-700/50"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <ApperIcon name="FolderPlus" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-surface-800 dark:text-surface-100">
                Create New Project
              </h1>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <motion.div
            className="bg-white dark:bg-surface-800 rounded-xl shadow-card border border-surface-200 dark:border-surface-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name..."
                    className={`w-full px-4 py-3 bg-surface-100/50 dark:bg-surface-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      errors.name 
                        ? 'border-error focus:border-error' 
                        : 'border-surface-200 dark:border-surface-600 focus:border-primary'
                    }`}
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error">{errors.name}</p>
                  )}
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the project goals, scope, and requirements..."
                    rows={4}
                    className={`w-full px-4 py-3 bg-surface-100/50 dark:bg-surface-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${
                      errors.description 
                        ? 'border-error focus:border-error' 
                        : 'border-surface-200 dark:border-surface-600 focus:border-primary'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-error">{errors.description}</p>
                  )}
                </div>

                {/* Status and Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Due Date and Budget Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 bg-surface-100/50 dark:bg-surface-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        errors.dueDate 
                          ? 'border-error focus:border-error' 
                          : 'border-surface-200 dark:border-surface-600 focus:border-primary'
                      }`}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-error">{errors.dueDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Budget (Optional)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="100"
                      className={`w-full px-4 py-3 bg-surface-100/50 dark:bg-surface-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        errors.budget 
                          ? 'border-error focus:border-error' 
                          : 'border-surface-200 dark:border-surface-600 focus:border-primary'
                      }`}
                    />
                    {errors.budget && (
                      <p className="mt-1 text-sm text-error">{errors.budget}</p>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                    Team Members
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {users.map(user => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-3 p-3 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-200/50 dark:hover:bg-surface-600/50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.teamMembers.includes(user.id)}
                          onChange={() => handleTeamMemberToggle(user.id)}
                          className="w-4 h-4 text-primary bg-surface-100 border-surface-300 rounded focus:ring-primary focus:ring-2"
                        />
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                            {user.name || 'Unknown User'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-surface-200 dark:border-surface-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-3 bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Plus" className="w-4 h-4" />
                        <span>Create Project</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}