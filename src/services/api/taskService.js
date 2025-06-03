import tasksData from '../mockData/tasks.json'
import { delay } from '../index'

let tasks = [...tasksData]

export const getAll = async () => {
  await delay(300)
  return [...tasks]
}

export const getById = async (id) => {
  await delay(200)
  const task = tasks.find(t => t.id === id)
  return task ? { ...task } : null
}

export const create = async (taskData) => {
  await delay(400)
  const newTask = {
    ...taskData,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  tasks.unshift(newTask)
  return { ...newTask }
}

export const update = async (id, updates) => {
  await delay(300)
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) throw new Error('Task not found')
  
  tasks[index] = { ...tasks[index], ...updates }
  return { ...tasks[index] }
}

export const delete_ = async (id) => {
  await delay(250)
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) throw new Error('Task not found')
  
  tasks.splice(index, 1)
  return true
}

// Using delete_ to avoid reserved keyword, but export as delete
export { delete_ as delete }