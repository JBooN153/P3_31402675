import { useContext } from "react";
import { CategoriesContext } from "../context/Categories";

export const useCategories = () => {
    const context = useContext(CategoriesContext)

    if (!context) {
        throw new Error('useCategories debe usarse dentro de CategoriesProvider')
    }

    return {
        getAllCategories: context.getAllCategories,
        getCategoryById: context.getCategoryById,
        createCategory: context.createCategory,
        updateCategory: context.updateCategory,
        deleteCategory: context.deleteCategory
    }
}
