import '../styles/Admin.css'
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useTags } from '../hooks/useTags'

const AdminProducts = () => {
    const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = useProducts()
    const { getAllCategories } = useCategories()
    const { getAllTags } = useTags()
    
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [searchId, setSearchId] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        developer: '',
        publisher: '',
        releaseDate: '',
        price: '',
        stock: '',
        genre: '',
        platform: '',
        esrb: '',
        sku: '',
        description: '',
        categoryId: '',
        tags: [],
        imageUrl: ''
    })
    const [operationLoading, setOperationLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [productsData, categoriesData, tagsData] = await Promise.all([
                getAllProducts(),
                getAllCategories(),
                getAllTags()
            ])
            console.log('Products data received:', productsData)
            setProducts(Array.isArray(productsData) ? productsData : [])
            setCategories(Array.isArray(categoriesData) ? categoriesData : [])
            setTags(Array.isArray(tagsData) ? tagsData : [])
            setCurrentPage(1)
        } catch (e) {
            setError(e.message || 'Error al obtener datos')
        } finally {
            setLoading(false)
        }
    }

    const handleGetById = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            const product = await getProductById(searchId)
            if (!product || !product.id) {
                setError('Juego no encontrado')
                setSelectedProduct(null)
                return
            }
            setSelectedProduct(product)
            setFormData({
                name: product.name || '',
                developer: product.developer || '',
                publisher: product.publisher || '',
                releaseDate: product.releaseDate || '',
                price: product.price || '',
                stock: product.stock || '',
                genre: product.genre || '',
                platform: product.platform || 'PS4',
                esrb: product.esrb || '',
                sku: product.sku || '',
                description: product.description || '',
                categoryId: product.category?.id || product.categoryId || '',
                tags: Array.isArray(product.tags) ? product.tags.map(t => t.id || t) : [],
                imageUrl: product.imageUrl || ''
            })
            setSuccess(`Juego ${product.name} cargado correctamente`)
        } catch (e) {
            setError(e.response?.status === 404 ? 'Juego no encontrado' : (e.message || 'Error al obtener juego'))
            setSelectedProduct(null)
        } finally {
            setOperationLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.price || !formData.categoryId) {
            setError('Nombre, precio y categoría son requeridos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                categoryId: parseInt(formData.categoryId),
                tags: Array.isArray(formData.tags) ? formData.tags.map(t => parseInt(t)) : []
            }
            await createProduct(dataToSend)
            setSuccess('Juego creado exitosamente')
            resetForm()
            fetchData()
        } catch (e) {
            setError(e.message || 'Error al crear juego')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedProduct || !formData.name.trim() || !formData.price || !formData.categoryId) {
            setError('Completa todos los campos requeridos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                categoryId: parseInt(formData.categoryId),
                tags: Array.isArray(formData.tags) ? formData.tags.map(t => parseInt(t)) : []
            }
            await updateProduct(selectedProduct.id, dataToSend)
            setSuccess('Juego actualizado exitosamente')
            setSelectedProduct(null)
            setSearchId('')
            fetchData()
        } catch (e) {
            setError(e.message || 'Error al actualizar juego')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedProduct?.name}?`)) {
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await deleteProduct(searchId)
            setSuccess('Juego eliminado exitosamente')
            resetForm()
            fetchData()
        } catch (e) {
            setError(e.message || 'Error al eliminar juego')
        } finally {
            setOperationLoading(false)
        }
    }

    const resetForm = () => {
        setSelectedProduct(null)
        setSearchId('')
        setFormData({
            name: '',
            developer: '',
            publisher: '',
            releaseDate: '',
            price: '',
            stock: '',
            genre: '',
            platform: '',
            esrb: '',
            sku: '',
            description: '',
            categoryId: '',
            tags: [],
            imageUrl: ''
        })
    }

    const toggleTag = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter(t => t !== tagId)
                : [...prev.tags, tagId]
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setError('Por favor selecciona una imagen válida')
            return
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen debe ser menor a 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            setFormData(prev => ({
                ...prev,
                imageUrl: event.target.result
            }))
            setError(null)
        }
        reader.onerror = () => {
            setError('Error al leer la imagen')
        }
        reader.readAsDataURL(file)
    }

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <h1>🎮 Gestión de Juegos</h1>
                    <p className="subtitle">Crear, editar y eliminar juegos PS4 del catálogo</p>
                </div>
            </header>

            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="operation-section">
                        <h3>🔍 Buscar Juego</h3>
                        <div className="operation-controls">
                            <input
                                type="number"
                                placeholder="ID de juego"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="input-field"
                            />
                            <button
                                onClick={handleGetById}
                                disabled={operationLoading}
                                className="btn btn-primary"
                            >
                                {operationLoading ? '⏳ Cargando...' : '🔎 Buscar'}
                            </button>
                        </div>
                    </div>

                    <div className="operation-section">
                        <h3>➕ {selectedProduct ? '✏️ Editar' : '➕ Crear'} Juego</h3>
                        {selectedProduct && (
                            <div className="user-badge">
                                <span className="badge-id">#{selectedProduct.id}</span>
                                <span className="badge-name">{selectedProduct.name}</span>
                            </div>
                        )}
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del juego"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Desarrollador</label>
                                <input
                                    type="text"
                                    placeholder="Desarrollador"
                                    value={formData.developer}
                                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Editor</label>
                                <input
                                    type="text"
                                    placeholder="Editor"
                                    value={formData.publisher}
                                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha de Lanzamiento</label>
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Género</label>
                                <input
                                    type="text"
                                    placeholder="Género (ej: Action-Adventure)"
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Plataforma</label>
                                <input
                                    type="text"
                                    placeholder="PS4"
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>ESRB</label>
                                <input
                                    type="text"
                                    placeholder="Clasificación ESRB (ej: M)"
                                    value={formData.esrb}
                                    onChange={(e) => setFormData({ ...formData, esrb: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>SKU</label>
                                <input
                                    type="text"
                                    placeholder="SKU del producto"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Imagen del Producto</label>
                                <div className="image-upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="input-field"
                                        id="image-input"
                                    />
                                    {formData.imageUrl && (
                                        <div className="image-preview">
                                            <img 
                                                src={formData.imageUrl} 
                                                alt="Vista previa" 
                                                className="preview-img"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                className="btn btn-small btn-danger"
                                            >
                                                ✕ Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input
                                    type="text"
                                    placeholder="Descripción del juego"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Precio"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    placeholder="Stock disponible"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoría *</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Etiquetas</label>
                                <div className="tags-selector">
                                    {tags.map(tag => (
                                        <label key={tag.id} className="tag-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.tags.includes(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            {tag.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="button-group">
                                {selectedProduct ? (
                                    <>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={operationLoading}
                                            className="btn btn-success"
                                        >
                                            {operationLoading ? '💾 Guardando...' : '💾 Guardar'}
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={operationLoading}
                                            className="btn btn-danger"
                                        >
                                            {operationLoading ? '🗑️ Eliminando...' : '🗑️ Eliminar'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleCreate}
                                        disabled={operationLoading}
                                        className="btn btn-success"
                                    >
                                        {operationLoading ? '⏳ Creando...' : '➕ Crear'}
                                    </button>
                                )}
                                {selectedProduct && (
                                    <button
                                        onClick={resetForm}
                                        className="btn btn-secondary"
                                    >
                                        ❌ Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && <div className="message error">⚠️ {error}</div>}
                    {success && <div className="message success">✅ {success}</div>}
                </aside>

                <main className="admin-main">
                    <div className="admin-users">
                        <div className="users-header">
                            <h3>🎮 Todos los Juegos ({products.length})</h3>
                            {products.length > 0 && (
                                <span className="page-info">Página {currentPage} de {totalPages}</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando juegos...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 No hay juegos registrados</p>
                            </div>
                        ) : (
                            <>
                                <div className="items-list">
                                    {paginatedProducts.map((product) => (
                                        <div className="item-card" key={product.id}>
                                            <div className="item-header">
                                                <span className="item-id">#{product.id}</span>
                                                <span className="item-badge">Juego</span>
                                            </div>
                                            <div className="item-content">
                                                <h4 className="item-title">{product.name}</h4>
                                                {product.developer && <p className="item-author">👨‍💻 {product.developer}</p>}
                                                {product.platform && <p className="item-series">🎮 {product.platform}</p>}
                                                <div className="item-details">
                                                    <span className="detail-badge">💰 ${product.price}</span>
                                                    <span className="detail-badge">📦 Stock: {product.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="btn-pagination"
                                        >
                                            ← Anterior
                                        </button>
                                        <div className="page-numbers">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="btn-pagination"
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminProducts
