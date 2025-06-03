import projectsData from '../mockData/projects.json'
import { delay } from '../index'

let projects = [...projectsData]

export const getAll = async () => {
  await delay(280)
  return [...projects]
}

export const getById = async (id) => {
  await delay(200)
  const project = projects.find(p => p.id === id)
  return project ? { ...project } : null
}

export const create = async (projectData) => {
  await delay(450)
  const newProject = {
    ...projectData,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  projects.push(newProject)
  return { ...newProject }
}

export const update = async (id, updates) => {
  await delay(320)
  const index = projects.findIndex(p => p.id === id)
  if (index === -1) throw new Error('Project not found')
  
  projects[index] = { ...projects[index], ...updates }
  return { ...projects[index] }
}

export const delete_ = async (id) => {
  await delay(270)
  const index = projects.findIndex(p => p.id === id)
  if (index === -1) throw new Error('Project not found')
  
  projects.splice(index, 1)
  return true
}

export { delete_ as delete }