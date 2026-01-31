import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/Admin';
import { CategoriesProvider } from './context/Categories';
import { TagsProvider } from './context/Tags';
import { ProductsProvider } from './context/Products';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminTags from './pages/AdminTags';
import AdminProducts from './pages/AdminProducts';
import TermsAndConditions from './pages/TermsAndConditions';
import Privacy from './pages/Privacy';

import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            <CategoriesProvider>
              <TagsProvider>
                <ProductsProvider>
                  <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/terminos" element={<TermsAndConditions />} />
                <Route path="/privacidad" element={<Privacy />} />

                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />

                <Route path="/admin/usuarios" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />

                <Route path="/admin/categorias" element={
                  <AdminRoute>
                    <AdminCategories />
                  </AdminRoute>
                } />

                <Route path="/admin/etiquetas" element={
                  <AdminRoute>
                    <AdminTags />
                  </AdminRoute>
                } />

                <Route path="/admin/juegos" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />

                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/ordenes"
                  element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="*"
                  element={
                    <div className="not-found">
                      <h1>404 - Página No Encontrada</h1>
                      <a href="/">Volver al Inicio</a>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
                  </div>
                </ProductsProvider>
              </TagsProvider>
            </CategoriesProvider>
          </AdminProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
