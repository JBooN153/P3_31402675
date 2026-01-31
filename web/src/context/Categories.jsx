import React, { createContext } from 'react';
import categoriesService from '../services/categories';

export const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const getAllCategories = async () => {
    return await categoriesService.getAllCategories()
  }

  const getCategoryById = async (id) => {
    return await categoriesService.getCategoryById(id)
  }

  const createCategory = async (categoryData) => {
    return await categoriesService.createCategory(categoryData)
  }

  const updateCategory = async (id, categoryData) => {
    return await categoriesService.updateCategory(id, categoryData)
  }

  const deleteCategory = async (id) => {
    return await categoriesService.deleteCategory(id)
  }

  return (
    <CategoriesContext.Provider value={{ getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoriesContext.Provider>
  )
};
