import apiClient from "./api";

const tagsService = {
    getAllTags: async () => {
        try {
            const response = await apiClient.get('/v2/tags')
            console.log('API Response for tags:', response.data)
            
            // Buscar items en diferentes ubicaciones
            if (response.data.data?.items) {
                console.log('Found tags in response.data.data.items')
                return response.data.data.items
            }
            if (Array.isArray(response.data.data)) {
                console.log('Found tags as array, count:', response.data.data.length)
                return response.data.data
            }
            if (response.data.data?.tags) {
                console.log('Found tags in response.data.data.tags')
                return response.data.data.tags
            }
            
            console.warn('No tags found in response', response.data)
            return []
        } catch (error) {
            console.error('Error fetching tags:', error)
            throw error
        }
    },

    getTagById: async (id) => {
        const response = await apiClient.get(`/v2/tags/${id}`)
        return response.data.data || {}
    },

    createTag: async (tagData) => {
        const response = await apiClient.post('/v2/tags', tagData)
        return response.data.data?.tag || response.data.data || {}
    },

    updateTag: async (id, tagData) => {
        const response = await apiClient.put(`/v2/tags/${id}`, tagData)
        return response.data.data?.tag || response.data.data || {}
    },

    deleteTag: async (id) => {
        const response = await apiClient.delete(`/v2/tags/${id}`)
        return response.data
    }
}

export default tagsService
