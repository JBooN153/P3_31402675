import apiClient from "./api";

const productsService = {
    getAllProducts: async () => {
        try {
            const response = await apiClient.get('/v2/games')
            console.log('API Response for games:', response.data)
            
            // Buscar items en diferentes ubicaciones
            if (response.data.data?.items) {
                console.log('Found games in response.data.data.items, count:', response.data.data.items.length)
                return response.data.data.items
            }
            if (Array.isArray(response.data.data)) {
                console.log('Found games as array, count:', response.data.data.length)
                return response.data.data
            }
            if (response.data.data?.games) {
                console.log('Found games in response.data.data.games, count:', response.data.data.games.length)
                return response.data.data.games
            }
            
            console.warn('No games found in response', response.data)
            return []
        } catch (error) {
            console.error('Error fetching games:', error)
            throw error
        }
    },

    getProductById: async (id) => {
        const response = await apiClient.get(`/v2/games/${id}`)
        return response.data.data || {}
    },

    createProduct: async (productData) => {
        const response = await apiClient.post('/v2/games', productData)
        return response.data.data?.game || response.data.data || {}
    },

    updateProduct: async (id, productData) => {
        const response = await apiClient.put(`/v2/games/${id}`, productData)
        return response.data.data?.game || response.data.data || {}
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/v2/games/${id}`)
        return response.data
    }
}

export default productsService
