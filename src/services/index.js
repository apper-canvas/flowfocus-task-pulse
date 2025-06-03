// Utility function to simulate API delay
export const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Re-export all services
export * as taskService from './api/taskService'
export * as userService from './api/userService'
export * as projectService from './api/projectService'