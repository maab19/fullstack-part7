import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = (newToken) => {
  token = newToken
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async (blog) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `bearer ${token}`
  }
  const response = await axios.post(baseUrl, blog, { headers: headers })
  return response.data
}

const update = async (id, blogObject) => {
  const url = `${baseUrl}/${id}`
  const headers = {
    'Content-Type': 'application/json'
  }
  const response = await axios.put(url, blogObject, { headers: headers })
  return response.data
}

const remove = async (id) => {
  const url = `${baseUrl}/${id}`
  const headers = {
    'Authorization': `bearer ${token}`
  }
  const response = await axios.delete(url, { headers: headers })
  return response.data
}

export default {
  getAll,
  create,
  update,
  remove,
  setToken
}