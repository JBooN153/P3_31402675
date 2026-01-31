import apiClient from "./api";

const categoriesService = {
    getAllCategories: async () => {
        try {
            const response = await apiClient.get('/v2/categories')
            console.log('API Response for categories:', response.data)
            
            // Buscar items en diferentes ubicaciones
            if (response.data.data?.items) {
                console.log('Found categories in response.data.data.items')
                return response.data.data.items
            }
            if (Array.isArray(response.data.data)) {
                console.log('Found categories as array, count:', response.data.data.length)
                return response.data.data
            }
            if (response.data.data?.categories) {
                console.log('Found categories in response.data.data.categories')
                return response.data.data.categories
            }
            
            console.warn('No categories found in response', response.data)
            return []
        } catch (error) {
            console.error('Error fetching categories:', error)
            throw error
        }
    },

    getCategoryById: async (id) => {
        const response = await apiClient.get(`/v2/categories/${id}`)
        return response.data.data || {}
    },

    createCategory: async (categoryData) => {
        const response = await apiClient.post('/v2/categories', categoryData)
        return response.data.data?.category || response.data.data || {}
    },

    updateCategory: async (id, categoryData) => {
        const response = await apiClient.put(`/v2/categories/${id}`, categoryData)
        return response.data.data?.category || response.data.data || {}
    },

    deleteCategory: async (id) => {
        const response = await apiClient.delete(`/v2/categories/${id}`)
        return response.data
    }
}

export default categoriesService
