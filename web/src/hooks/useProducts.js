import { useContext } from "react";
import { ProductsContext } from "../context/Products";

export const useProducts = () => {
    const context = useContext(ProductsContext)

    if (!context) {
        throw new Error('useProducts debe usarse dentro de ProductsProvider')
    }

    return {
        getAllProducts: context.getAllProducts,
        getProductById: context.getProductById,
        createProduct: context.createProduct,
        updateProduct: context.updateProduct,
        deleteProduct: context.deleteProduct
    }
}
