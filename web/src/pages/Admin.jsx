import '../styles/Admin.css'
import { useState, useEffect } from 'react'
import { useAdmin } from '../hooks/admin'

const Admin = () => {
    const { getUser, getUserById, updateUser, deleteUser } = useAdmin()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // Estados para operaciones individuales
    const [searchId, setSearchId] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [editData, setEditData] = useState({ nombre: '', email: '' })
    const [operationLoading, setOperationLoading] = useState(false)

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1)
    const USERS_PER_PAGE = 12

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await getUser()
            setUsers(Array.isArray(data) ? data : [])
            setCurrentPage(1)
        } catch (e) {
            setError(e.message || 'Error al obtener usuarios')
        } finally {
            setLoading(false)
        }
    }

    const handleGetUserById = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            const user = await getUserById(searchId)
            setSelectedUser(user)
            setEditData({ nombre: user.nombre || '', email: user.email || '' })
            setSuccess(`Usuario ${user.nombre} cargado correctamente`)
        } catch (e) {
            setError(e.message || 'Error al obtener usuario')
            setSelectedUser(null)
        } finally {
            setOperationLoading(false)
        }
    }

    const handleUpdateUser = async () => {
        if (!selectedUser || !editData.nombre.trim() || !editData.email.trim()) {
            setError('Completa todos los campos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await updateUser(selectedUser.id, editData)
            setSuccess(`Usuario actualizado exitosamente`)
            setSelectedUser(null)
            setSearchId('')
            fetchUsers()
        } catch (e) {
            setError(e.message || 'Error al actualizar usuario')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${selectedUser?.nombre}?`)) {
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await deleteUser(searchId)
            setSuccess(`Usuario eliminado exitosamente`)
            setSelectedUser(null)
            setSearchId('')
            setEditData({ nombre: '', email: '' })
            fetchUsers()
        } catch (e) {
            setError(e.message || 'Error al eliminar usuario')
        } finally {
            setOperationLoading(false)
        }
    }

    // Lógica de paginación
    const totalPages = Math.ceil(users.length / USERS_PER_PAGE)
    const startIndex = (currentPage - 1) * USERS_PER_PAGE
    const paginatedUsers = users.slice(startIndex, startIndex + USERS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <h1>🛡️ Panel de Administración</h1>
                    <p className="subtitle">Gestión completa de usuarios del sistema</p>
                </div>
            </header>

            {/* Sección de Operaciones */}
            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="operation-section">
                        <h3>🔍 Buscar Usuario</h3>
                        <div className="operation-controls">
                            <input
                                type="number"
                                placeholder="ID del usuario"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="input-field"
                            />
                            <button
                                onClick={handleGetUserById}
                                disabled={operationLoading}
                                className="btn btn-primary"
                            >
                                {operationLoading ? '⏳ Cargando...' : '🔎 Buscar'}
                            </button>
                        </div>
                    </div>

                    {selectedUser && (
                        <div className="operation-section edit-section">
                            <h3>✏️ Editar Usuario</h3>
                            <div className="user-display">
                                <div className="user-badge">
                                    <span className="badge-id">#{selectedUser.id}</span>
                                    <span className="badge-name">{selectedUser.nombre}</span>
                                </div>
                            </div>
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre del usuario"
                                        value={editData.nombre}
                                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email del usuario"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="button-group">
                                    <button
                                        onClick={handleUpdateUser}
                                        disabled={operationLoading}
                                        className="btn btn-success"
                                    >
                                        {operationLoading ? '💾 Guardando...' : '💾 Guardar'}
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        disabled={operationLoading}
                                        className="btn btn-danger"
                                    >
                                        {operationLoading ? '🗑️ Eliminando...' : '🗑️ Eliminar'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null)
                                            setSearchId('')
                                            setEditData({ nombre: '', email: '' })
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensajes de estado */}
                    {error && <div className="message error">⚠️ {error}</div>}
                    {success && <div className="message success">✅ {success}</div>}
                </aside>

                <main className="admin-main">
                    <div className="admin-users">
                        <div className="users-header">
                            <h3>👥 Todos los Usuarios ({users.length})</h3>
                            {users.length > 0 && (
                                <span className="page-info">Página {currentPage} de {totalPages}</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando usuarios...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 No hay usuarios registrados</p>
                            </div>
                        ) : (
                            <>
                                <div className="users-grid">
                                    {paginatedUsers.map((u) => (
                                        <div className="user-card" key={u.id || u._id || u.email}>
                                            <div className="card-header">
                                                <span className="user-id">#{u.id}</span>
                                                <span className="status-badge inactive">Inactivo</span>
                                            </div>
                                            <div className="card-avatar">
                                                <div className="avatar">{(u.nombre && u.nombre[0]) || 'U'}</div>
                                            </div>
                                            <div className="card-content">
                                                <h4 className="user-name">{u.nombre || 'Usuario'}</h4>
                                                <p className="user-email">{u.email || '—'}</p>
                                                <span className="role-badge">Cliente</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Paginación */}
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

export default Admin