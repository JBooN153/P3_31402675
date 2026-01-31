import '../styles/Admin.css'
import { useState, useEffect } from 'react'
import { useTags } from '../hooks/useTags'

const AdminTags = () => {
    const { getAllTags, getTagById, createTag, updateTag, deleteTag } = useTags()
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [searchId, setSearchId] = useState('')
    const [selectedTag, setSelectedTag] = useState(null)
    const [formData, setFormData] = useState({ name: '' })
    const [operationLoading, setOperationLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            setLoading(true)
            const data = await getAllTags()
            setTags(Array.isArray(data) ? data : [])
            setCurrentPage(1)
        } catch (e) {
            setError(e.message || 'Error al obtener etiquetas')
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
            const tag = await getTagById(searchId)
            if (!tag || !tag.id) {
                setError('Etiqueta no encontrada')
                setSelectedTag(null)
                return
            }
            setSelectedTag(tag)
            setFormData({ name: tag.name || '' })
            setSuccess(`Etiqueta ${tag.name} cargada correctamente`)
        } catch (e) {
            setError(e.response?.status === 404 ? 'Etiqueta no encontrada' : (e.message || 'Error al obtener etiqueta'))
            setSelectedTag(null)
        } finally {
            setOperationLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            setError('El nombre de la etiqueta es requerido')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await createTag(formData)
            setSuccess('Etiqueta creada exitosamente')
            setFormData({ name: '' })
            fetchTags()
        } catch (e) {
            setError(e.message || 'Error al crear etiqueta')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedTag || !formData.name.trim()) {
            setError('Completa todos los campos requeridos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await updateTag(selectedTag.id, formData)
            setSuccess('Etiqueta actualizada exitosamente')
            setSelectedTag(null)
            setSearchId('')
            fetchTags()
        } catch (e) {
            setError(e.message || 'Error al actualizar etiqueta')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedTag?.name}?`)) {
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await deleteTag(searchId)
            setSuccess('Etiqueta eliminada exitosamente')
            setSelectedTag(null)
            setSearchId('')
            setFormData({ name: '' })
            fetchTags()
        } catch (e) {
            setError(e.message || 'Error al eliminar etiqueta')
        } finally {
            setOperationLoading(false)
        }
    }

    const totalPages = Math.ceil(tags.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedTags = tags.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <h1>🏷️ Gestión de Etiquetas</h1>
                    <p className="subtitle">Crear, editar y eliminar etiquetas para categorizar juegos</p>
                </div>
            </header>

            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="operation-section">
                        <h3>🔍 Buscar Etiqueta</h3>
                        <div className="operation-controls">
                            <input
                                type="number"
                                placeholder="ID de etiqueta"
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
                        <h3>➕ {selectedTag ? '✏️ Editar' : '➕ Crear'} Etiqueta</h3>
                        {selectedTag && (
                            <div className="user-badge">
                                <span className="badge-id">#{selectedTag.id}</span>
                                <span className="badge-name">{selectedTag.name}</span>
                            </div>
                        )}
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre de la etiqueta"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="button-group">
                                {selectedTag ? (
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
                                {selectedTag && (
                                    <button
                                        onClick={() => {
                                            setSelectedTag(null)
                                            setSearchId('')
                                            setFormData({ name: '' })
                                        }}
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
                            <h3>🏷️ Todas las Etiquetas ({tags.length})</h3>
                            {tags.length > 0 && (
                                <span className="page-info">Página {currentPage} de {totalPages}</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando etiquetas...</p>
                            </div>
                        ) : tags.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 No hay etiquetas registradas</p>
                            </div>
                        ) : (
                            <>
                                <div className="items-list">
                                    {paginatedTags.map((tag) => (
                                        <div className="item-card" key={tag.id}>
                                            <div className="item-header">
                                                <span className="item-id">#{tag.id}</span>
                                                <span className="item-badge">Etiqueta</span>
                                            </div>
                                            <div className="item-content">
                                                <h4 className="item-title">{tag.name}</h4>
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

export default AdminTags
