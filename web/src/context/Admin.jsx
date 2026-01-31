import React, { createContext } from 'react';
import adminService from '../services/admin';

export const AdminContext = createContext();

export const AdminProvider = ({children}) => {
  const getUser = async () => {
    return await adminService.getAllUsers()
  }

  const getUserById = async (id) => {
    return await adminService.getUserById(id)
  }

  const updateUser = async (id, userData) => {
    return await adminService.updateUser(id, userData)
  }

  const deleteUser = async (id) => {
    return await adminService.deleteUser(id)
  }

  return(
    <AdminContext.Provider value={{getUser, getUserById, updateUser, deleteUser}}>
        {children}
    </AdminContext.Provider>
  )

};