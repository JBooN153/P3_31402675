import React, { createContext } from 'react';
import productsService from '../services/products';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const getAllProducts = async () => {
    return await productsService.getAllProducts()
  }

  const getProductById = async (id) => {
    return await productsService.getProductById(id)
  }

  const createProduct = async (productData) => {
    return await productsService.createProduct(productData)
  }

  const updateProduct = async (id, productData) => {
    return await productsService.updateProduct(id, productData)
  }

  const deleteProduct = async (id) => {
    return await productsService.deleteProduct(id)
  }

  return (
    <ProductsContext.Provider value={{ getAllProducts, getProductById, createProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  )
};
