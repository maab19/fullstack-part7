import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: null,
  reducers: {
    changeNotification(state, action) {
      return action.payload
    },
    resetNotification(state, action) {
      return null
    }
  },
})

export const { changeNotification, resetNotification } = notificationSlice.actions

export const setNotification = (notification, time) => {
  return async dispatch => {
    time *= 1000
    dispatch(changeNotification(notification))
    setTimeout(() => {
      dispatch(resetNotification())
    }, time)
  }
}

export default notificationSlice.reducer
