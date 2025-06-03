import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

export default function MainFeature({ 
  tasks, 
  users, 
  onCreateTask, 
  onUpdateTask, 
  onDeleteTask, 
  showTaskModal, 
  setShowTaskModal 
}) {
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    assignee: ''
  })
  const [newTag, setNewTag] = useState('')
  const dragCounter = useRef(0)

  const columns = [
    { id: 'to-do', title: 'To Do', icon: 'Circle', color: 'surface' },
    { id: 'in-progress', title: 'In Progress', icon: 'Clock', color: 'accent' },
    { id: 'done', title: 'Done', icon: 'CheckCircle', color: 'secondary' }
  ]

  const priorityConfig = {
    high: { color: 'error', label: 'High', icon: 'ArrowUp' },
    medium: { color: 'accent', label: 'Medium', icon: 'Minus' },
    low: { color: 'secondary', label: 'Low', icon: 'ArrowDown' }
  }

  const getTasksByStatus = (status) => {
    return tasks?.filter(task => task?.status === status) || []
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    
    if (isToday(date)) return { text: 'Today', urgent: true }
    if (isTomorrow(date)) return { text: 'Tomorrow', urgent: false }
    if (isThisWeek(date)) return { text: format(date, 'EEEE'), urgent: false }
    if (isPast(date)) return { text: format(date, 'MMM d'), urgent: true, overdue: true }
    return { text: format(date, 'MMM d'), urgent: false }
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.transform = 'rotate(15deg) scale(1.05)'
    e.target.style.transition = 'transform 0.2s ease'
  }

  const handleDragEnd = (e) => {
    setDraggedTask(null)
    setDragOverColumn(null)
    e.target.style.transform = ''
    e.target.style.transition = ''
    dragCounter.current = 0
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, columnId) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    dragCounter.current = 0
    
    if (draggedTask && draggedTask.status !== newStatus) {
      onUpdateTask(draggedTask.id, { status: newStatus })
    }
    setDraggedTask(null)
  }

  const handleTaskFormSubmit = (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) {
      toast.error("Task title is required")
      return
    }

    const taskData = {
      ...taskForm,
      status: 'to-do',
      createdAt: new Date().toISOString(),
      tags: taskForm.tags.filter(tag => tag.trim())
    }

    onCreateTask(taskData)
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      tags: [],
      assignee: ''
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !taskForm.tags.includes(newTag.trim())) {
      setTaskForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTaskForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setShowDetailPanel(true)
  }

  const handleToggleComplete = (task) => {
    const newStatus = task.status === 'done' ? 'to-do' : 'done'
    onUpdateTask(task.id, { status: newStatus })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div 
        className="bg-gradient-to-r from-primary/5 via-white to-secondary/5 rounded-2xl p-6 md:p-8 border border-surface-200/50 shadow-soft"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-surface-800 mb-2">
              Welcome back to FlowFocus
            </h2>
            <p className="text-surface-600 text-lg">
              You have {tasks?.filter(t => t?.status !== 'done').length || 0} active tasks. 
              Let's get things done! 🚀
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-xl p-4 shadow-card border border-surface-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{tasks?.filter(t => t?.status === 'done').length || 0}</div>
                <div className="text-sm text-surface-600">Completed</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-card border border-surface-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{tasks?.filter(t => t?.status === 'in-progress').length || 0}</div>
                <div className="text-sm text-surface-600">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {columns.map((column, columnIndex) => (
          <motion.div
            key={column.id}
            className={`bg-white rounded-xl border-2 transition-all duration-200 ${
              dragOverColumn === column.id 
                ? 'border-primary bg-primary/5 shadow-task-hover' 
                : 'border-surface-200/50 shadow-soft'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 md:p-6 border-b border-surface-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    column.color === 'surface' ? 'bg-surface-100' :
                    column.color === 'accent' ? 'bg-accent/10' :
                    'bg-secondary/10'
                  }`}>
                    <ApperIcon 
                      name={column.icon} 
                      className={`w-4 h-4 ${
                        column.color === 'surface' ? 'text-surface-600' :
                        column.color === 'accent' ? 'text-accent' :
                        'text-secondary'
                      }`} 
                    />
                  </div>
                  <h3 className="font-semibold text-surface-800">{column.title}</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  column.color === 'surface' ? 'bg-surface-100 text-surface-700' :
                  column.color === 'accent' ? 'bg-accent/10 text-accent' :
                  'bg-secondary/10 text-secondary'
                }`}>
                  {getTasksByStatus(column.id).length}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4 md:p-6 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {getTasksByStatus(column.id).map((task, taskIndex) => {
                  const dueInfo = formatDueDate(task?.dueDate)
                  const priority = priorityConfig[task?.priority || 'medium']
                  const assignedUser = users?.find(u => u?.id === task?.assignee)
                  
                  return (
                    <motion.div
                      key={task?.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: taskIndex * 0.05 }}
                      className={`group bg-white border-l-4 rounded-lg p-4 shadow-task hover:shadow-task-hover transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                        priority.color === 'error' ? 'border-l-error' :
                        priority.color === 'accent' ? 'border-l-accent' :
                        'border-l-secondary'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTaskClick(task)}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleComplete(task)
                            }}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              task?.status === 'done'
                                ? 'bg-secondary border-secondary text-white'
                                : 'border-surface-300 hover:border-primary'
                            }`}
                          >
                            {task?.status === 'done' && (
                              <ApperIcon name="Check" className="w-3 h-3" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-surface-800 truncate ${
                              task?.status === 'done' ? 'line-through opacity-60' : ''
                            }`}>
                              {task?.title || 'Untitled Task'}
                            </h4>
                            {task?.description && (
                              <p className="text-sm text-surface-600 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Priority Indicator */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-2 ${
                          priority.color === 'error' ? 'bg-error/10' :
                          priority.color === 'accent' ? 'bg-accent/10' :
                          'bg-secondary/10'
                        }`}>
                          <ApperIcon 
                            name={priority.icon} 
                            className={`w-3 h-3 ${
                              priority.color === 'error' ? 'text-error' :
                              priority.color === 'accent' ? 'text-accent' :
                              'text-secondary'
                            }`} 
                          />
                        </div>
                      </div>

                      {/* Task Meta */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {/* Due Date */}
                          {dueInfo && (
                            <span className={`px-2 py-1 rounded-full ${
                              dueInfo.overdue ? 'bg-error/10 text-error' :
                              dueInfo.urgent ? 'bg-accent/10 text-accent' :
                              'bg-surface-100 text-surface-600'
                            }`}>
                              {dueInfo.text}
                            </span>
                          )}

                          {/* Tags */}
                          {task?.tags?.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {task?.tags?.length > 2 && (
                            <span className="px-2 py-1 bg-surface-100 text-surface-600 rounded-full">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Assignee */}
                        {assignedUser && (
                          <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {assignedUser.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions (on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskClick(task)
                          }}
                          className="p-1 rounded hover:bg-surface-100 transition-colors"
                        >
                          <ApperIcon name="Edit" className="w-3 h-3 text-surface-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTask(task.id)
                          }}
                          className="p-1 rounded hover:bg-error/10 transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-3 h-3 text-error" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Empty State */}
              {getTasksByStatus(column.id).length === 0 && (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 rounded-full flex items-center justify-center">
                    <ApperIcon name={column.icon} className="w-8 h-8 text-surface-400" />
                  </div>
                  <p className="text-surface-500 text-sm">No tasks in {column.title.toLowerCase()}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTaskModal(false)}
            >
              <motion.div
                className="glass-morphism rounded-2xl border border-surface-200/50 shadow-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleTaskFormSubmit} className="p-6 md:p-8">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-surface-800">Create New Task</h3>
                    <button
                      type="button"
                      onClick={() => setShowTaskModal(false)}
                      className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                      <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-3 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="Enter task title..."
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all h-24 resize-none"
                        placeholder="Describe your task..."
                      />
                    </div>

                    {/* Priority and Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={taskForm.priority}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full p-3 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full p-3 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Assign To
                      </label>
                      <select
                        value={taskForm.assignee}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                        className="w-full p-3 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      >
                        <option value="">Unassigned</option>
                        {users?.map(user => (
                          <option key={user?.id} value={user?.id}>
                            {user?.name || 'Unknown User'}
                          </option>
                        )) || []}
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {taskForm.tags?.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-error transition-colors"
                            >
                              <ApperIcon name="X" className="w-3 h-3" />
                            </button>
                          </span>
                        )) || []}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          className="flex-1 p-3 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          placeholder="Add a tag..."
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-4 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Plus" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowTaskModal(false)}
                      className="px-6 py-3 border border-surface-200 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium shadow-soft hover:shadow-card"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task Detail Panel */}
      <AnimatePresence>
        {showDetailPanel && selectedTask && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailPanel(false)}
            >
              <motion.div
                className="glass-morphism rounded-2xl border border-surface-200/50 shadow-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 md:p-8">
                  {/* Detail Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-surface-800 mb-2">
                        {selectedTask?.title || 'Task Details'}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTask?.status === 'done' ? 'bg-secondary/10 text-secondary' :
                          selectedTask?.status === 'in-progress' ? 'bg-accent/10 text-accent' :
                          'bg-surface-100 text-surface-600'
                        }`}>
                          {selectedTask?.status?.replace('-', ' ') || 'No Status'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTask?.priority === 'high' ? 'bg-error/10 text-error' :
                          selectedTask?.priority === 'medium' ? 'bg-accent/10 text-accent' :
                          'bg-secondary/10 text-secondary'
                        }`}>
                          {selectedTask?.priority || 'Medium'} Priority
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailPanel(false)}
                      className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                      <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                    </button>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-6">
                    {selectedTask?.description && (
                      <div>
                        <h4 className="text-lg font-semibold text-surface-800 mb-2">Description</h4>
                        <p className="text-surface-600 leading-relaxed">{selectedTask.description}</p>
                      </div>
                    )}

                    {selectedTask?.dueDate && (
                      <div>
                        <h4 className="text-lg font-semibold text-surface-800 mb-2">Due Date</h4>
                        <p className="text-surface-600">
                          {format(new Date(selectedTask.dueDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}

                    {selectedTask?.tags?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-surface-800 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTask?.assignee && (
                      <div>
                        <h4 className="text-lg font-semibold text-surface-800 mb-2">Assigned To</h4>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {users?.find(u => u?.id === selectedTask.assignee)?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-surface-700">
                            {users?.find(u => u?.id === selectedTask.assignee)?.name || 'Unknown User'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-lg font-semibold text-surface-800 mb-2">Created</h4>
                      <p className="text-surface-600">
                        {selectedTask?.createdAt ? 
                          format(new Date(selectedTask.createdAt), 'MMMM d, yyyy at h:mm a') :
                          'Unknown'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
                    <button
                      onClick={() => {
                        handleToggleComplete(selectedTask)
                        setShowDetailPanel(false)
                      }}
                      className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                        selectedTask?.status === 'done'
                          ? 'bg-surface-100 hover:bg-surface-200 text-surface-700'
                          : 'bg-secondary hover:bg-secondary-dark text-white'
                      }`}
                    >
                      {selectedTask?.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => {
                        onDeleteTask(selectedTask.id)
                        setShowDetailPanel(false)
                      }}
                      className="px-6 py-3 bg-error hover:bg-error/90 text-white rounded-lg transition-colors font-medium"
                    >
                      Delete Task
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}