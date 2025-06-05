import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import * as taskService from '../services/api/taskService'
import * as userService from '../services/api/userService'
import * as projectService from '../services/api/projectService'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterDueDate, setFilterDueDate] = useState("all")
  const [filterTag, setFilterTag] = useState("all")
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksResult, usersResult, projectsResult] = await Promise.all([
          taskService.getAll(),
          userService.getAll(),
          projectService.getAll()
        ])
        setTasks(tasksResult || [])
        setUsers(usersResult || [])
        setProjects(projectsResult || [])
      } catch (err) {
        setError(err.message)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData)
      setTasks(prev => [newTask, ...prev])
      setShowTaskModal(false)
      toast.success("Task created successfully!")
    } catch (err) {
      toast.error("Failed to create task")
    }
  }

  const handleUpdateTask = async (id, updates) => {
    try {
      const updatedTask = await taskService.update(id, updates)
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))
      
      if (updates.status === 'done') {
        toast.success("Task completed! 🎉")
      } else {
        toast.success("Task updated successfully!")
      }
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      await taskService.delete(id)
      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success("Task deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete task")
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (!task) return false
    
    const matchesSearch = !searchQuery || 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-surface-600 text-lg">Loading FlowFocus...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ApperIcon name="AlertTriangle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-800 mb-2">Something went wrong</h2>
          <p className="text-surface-600">{error}</p>
        </motion.div>
      </div>
    )
  }

return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      <div className="relative">
        {/* Header */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200/50 dark:border-surface-700/50 h-16"
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon name="Menu" className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <ApperIcon name="Zap" className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-surface-800 dark:text-surface-100 hidden sm:block">
                  FlowFocus
                </h1>
              </div>
</div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* View Toggle Buttons */}
              <div className="hidden lg:flex items-center space-x-1 bg-surface-100/50 dark:bg-surface-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-surface-600 text-primary shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                  }`}
                  title="Kanban View"
                >
                  <ApperIcon name="Columns" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-surface-600 text-primary shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                  }`}
                  title="Calendar View"
                >
                  <ApperIcon name="Calendar" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-surface-600 text-primary shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                  }`}
                  title="Table View"
                >
                  <ApperIcon name="Table" className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Add Button */}
              <motion.button
                onClick={() => setShowTaskModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-soft hover:shadow-card"
                whileHover={{ scale: 1.02 }}
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span className="hidden sm:inline">New Task</span>
              </motion.button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon name={darkMode ? "Sun" : "Moon"} className="w-5 h-5" />
              </button>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
</div>
          </div>
        </motion.header>

        {/* Enhanced Mobile Search */}
        <div className="fixed top-16 left-0 right-0 z-30 p-4 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200/50 dark:border-surface-700/50 md:hidden">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search tasks, try tag:frontend, priority:high..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
                searchQuery 
                  ? 'pr-10 bg-white dark:bg-surface-800 border-primary/50 shadow-card' 
                  : 'pr-4 bg-surface-100/50 dark:bg-surface-700/50 border-surface-200 dark:border-surface-600'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-surface-500">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside
              className="fixed left-0 top-16 md:top-32 lg:top-16 bottom-0 w-64 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-r border-surface-200/50 dark:border-surface-700/50 z-30 lg:z-20"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 space-y-6">
                {/* Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 uppercase tracking-wider">
Filters
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-surface-600 dark:text-surface-400 mb-1">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="all">All Tasks</option>
                        <option value="to-do">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-surface-600 dark:text-surface-400 mb-1">Priority</label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full p-2 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-surface-600 dark:text-surface-400 mb-1">Due Date</label>
                      <select
                        value={filterDueDate}
                        onChange={(e) => setFilterDueDate(e.target.value)}
                        className="w-full p-2 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="all">All Due Dates</option>
                        <option value="today">Due Today</option>
                        <option value="tomorrow">Due Tomorrow</option>
                        <option value="next7days">Next 7 Days</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-surface-600 dark:text-surface-400 mb-1">Tag</label>
                      <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="w-full p-2 bg-surface-100/50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="all">All Tags</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="design">Design</option>
                        <option value="testing">Testing</option>
                        <option value="ux">UX</option>
                        <option value="api">API</option>
                        <option value="security">Security</option>
                        <option value="performance">Performance</option>
                        <option value="mobile">Mobile</option>
                        <option value="documentation">Documentation</option>
                      </select>
                    </div>
                  </div>
                </div>

{/* Projects */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                      Projects
                    </h3>
                    <button
                      onClick={() => window.location.href = '/projects/new'}
                      className="p-1 text-primary hover:text-primary-dark transition-colors"
                      title="Create New Project"
                    >
                      <ApperIcon name="Plus" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {projects?.slice(0, 5).map(project => (
                      <div key={project?.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-100/50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                          {project?.name || 'Unnamed Project'}
                        </span>
                      </div>
                    )) || []}
                  </div>
                </div>
                {/* Stats */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 uppercase tracking-wider">
                    Quick Stats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-surface-600 dark:text-surface-400">Total Tasks</span>
                      <span className="font-medium text-surface-800 dark:text-surface-200">{tasks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-600 dark:text-surface-400">Completed</span>
                      <span className="font-medium text-secondary">{tasks?.filter(t => t?.status === 'done').length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-600 dark:text-surface-400">In Progress</span>
                      <span className="font-medium text-accent">{tasks?.filter(t => t?.status === 'in-progress').length || 0}</span>
                    </div>
                  </div>
                </div>
</div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={`pt-16 md:pt-32 lg:pt-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <MainFeature
              tasks={filteredTasks}
              users={users}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              showTaskModal={showTaskModal}
              setShowTaskModal={setShowTaskModal}
              viewMode={viewMode}
            />
          </div>
        </main>

        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </div>
    </div>
  )
}