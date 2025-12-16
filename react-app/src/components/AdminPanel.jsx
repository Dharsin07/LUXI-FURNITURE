import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/helpers';
import { getAllProfiles, createProfile, updateProfile, deleteProfile } from '../lib/supabase';

const AdminPanel = ({ isOpen, onClose, products, orders, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  // use react-toastify for notifications
  const [activeTab, setActiveTab] = useState('products');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'living-room',
    price: '',
    description: '',
    images: [''],
    inStock: true
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: '',
    category: 'living-room',
    price: '',
    description: '',
    images: [''],
    inStock: true
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Load users from Supabase on mount and when tab switches to users
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'addUser' || activeTab === 'editUser') {
      setUsersLoading(true);
      getAllProfiles()
        .then(setUsers)
        .catch(err => {
          console.error('Failed to load users:', err);
          toast.error('Failed to load users');
        })
        .finally(() => setUsersLoading(false));
    }
  }, [activeTab]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    const images = (newProduct.images || []).map(v => String(v || '').trim()).filter(Boolean);
    const product = {
      ...newProduct,
      images,
      price: parseFloat(newProduct.price),
      featured: false
    };
    onAddProduct(product);
    setNewProduct({
      name: '', category: 'living-room', price: '',
      description: '', images: [''], inStock: true
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      images: (Array.isArray(product.images) && product.images.length > 0) ? product.images : [''],
      inStock: product.inStock
    });
    setActiveTab('edit');
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const images = (editProduct.images || []).map(v => String(v || '').trim()).filter(Boolean);
    const updatedProduct = {
      name: editProduct.name,
      category: editProduct.category,
      price: parseFloat(editProduct.price),
      description: editProduct.description,
      images,
      inStock: editProduct.inStock
    };
    onUpdateProduct(editingProduct.id, updatedProduct);
    setEditingProduct(null);
    setEditProduct({
      name: '',
      category: 'living-room',
      price: '',
      description: '',
      images: [''],
      inStock: true
    });
    setActiveTab('products');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({
      name: '',
      category: 'living-room',
      price: '',
      description: '',
      images: [''],
      inStock: true
    });
    setActiveTab('products');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    // Check if user already exists locally
    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      toast.error('User with this email already exists');
      return;
    }

    try {
      await createProfile(newUser.email, newUser.name, newUser.role);
      const created = { ...newUser, id: `admin-${Date.now()}` };
      setUsers(prev => [...prev, created]);
      toast.success('User added successfully!');
      setNewUser({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      console.error('Failed to add user:', err);
      toast.error('Failed to add user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role
    });
    setActiveTab('editUser');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    // Check if email already exists for another user locally
    const existingUser = users.find(u => u.email === editUser.email && u.id !== editingUser.id);
    if (existingUser) {
      toast.error('Email already exists for another user');
      return;
    }

    try {
      const updated = await updateProfile(editingUser.id, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role
      });
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updated } : u));
      toast.success('User updated successfully!');
      setEditingUser(null);
      setEditUser({ name: '', email: '', password: '', role: 'user' });
      setActiveTab('users');
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteProfile(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('User deleted successfully!');
      } catch (err) {
        console.error('Failed to delete user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
    setEditUser({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setActiveTab('users');
  };

  if (!isOpen) return null;

  return (
    <div className="modal active admin-modal">
      <div className="modal-content admin-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close admin">✕</button>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="brand">Admin</div>
            <nav>
              <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products <span className="count">{products.length}</span></button>
              <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders <span className="count">{orders.length}</span></button>
              <button className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users <span className="count">{users.length}</span></button>
              <button className={`sidebar-link ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>Add Product</button>
              <button className={`sidebar-link ${activeTab === 'addUser' ? 'active' : ''}`} onClick={() => setActiveTab('addUser')}>Add User</button>
            </nav>
            <div className="sidebar-footer">Luxe Dashboard</div>
          </aside>

          <main className="admin-main">
            <header className="admin-main-header">
              <h2>Admin Panel</h2>
              <div className="admin-actions">
                <button className="btn btn-primary" onClick={() => toast.success('Saved')}>Save</button>
                <button className="btn btn-secondary" onClick={onClose}>Close</button>
              </div>
            </header>

            <section className="admin-content-area">
              {activeTab === 'products' && (
                <div>
                  <div className="dashboard-cards">
                    <div className="card stat-card">
                      <div className="stat-value">{products.length}</div>
                      <div className="stat-label">Products</div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-value">{orders.length}</div>
                      <div className="stat-label">Orders</div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-value">{products.filter(p=>p.inStock).length}</div>
                      <div className="stat-label">In Stock</div>
                    </div>
                  </div>

                  <div className="card table-card">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{formatPrice(product.price)}</td>
                            <td>{product.inStock ? 'In Stock' : 'Out'}</td>
                            <td className="actions-cell">
                              <button className="btn-sm btn-edit" onClick={() => handleEditProduct(product)}>Edit</button>
                              <button className="btn-sm btn-danger" onClick={() => { onDeleteProduct(product.id); }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="card table-card">
                    {orders.length === 0 ? <p className="muted">No orders yet</p> : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr key={o.id}>
                              <td>#{o.id}</td>
                              <td>{o.customerName}</td>
                              <td>{o.items.length}</td>
                              <td>{formatPrice(o.total)}</td>
                              <td>{new Date(o.date).toLocaleDateString()}</td>
                              <td><span className="status-badge">{o.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="dashboard-cards">
                    <div className="card stat-card">
                      <div className="stat-value">{users.length}</div>
                      <div className="stat-label">Total Users</div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
                      <div className="stat-label">Admins</div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
                      <div className="stat-label">Regular Users</div>
                    </div>
                  </div>

                  <div className="card table-card">
                    {usersLoading ? (
                      <p>Loading users...</p>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                              <td className="actions-cell">
                                <button className="btn-sm btn-edit" onClick={() => handleEditUser(user)}>Edit</button>
                                <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'add' && (
                <div className="card form-card">
                  <form onSubmit={handleAddProduct} className="admin-add-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                          <option value="living-room">Living Room</option>
                          <option value="dining">Dining</option>
                          <option value="bedroom">Bedroom</option>
                          <option value="office">Office</option>
                          <option value="entryway">Entryway</option>
                          <option value="decor">Decor</option>
                          <option value="lighting">Lighting</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Price</label>
                        <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} min="0" step="0.01" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows={4} />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Image URL</label>
                        <input type="url" value={newProduct.images[0]} onChange={(e) => setNewProduct({...newProduct, images: [e.target.value]})} />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label"><input type="checkbox" checked={newProduct.inStock} onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})} /> In Stock</label>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <button className="btn btn-primary" type="submit">Add Product</button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'edit' && editingProduct && (
                <div className="card form-card">
                  <h3>Edit Product</h3>
                  <form onSubmit={handleUpdateProduct} className="admin-add-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select value={editProduct.category} onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}>
                          <option value="living-room">Living Room</option>
                          <option value="dining">Dining</option>
                          <option value="bedroom">Bedroom</option>
                          <option value="office">Office</option>
                          <option value="entryway">Entryway</option>
                          <option value="decor">Decor</option>
                          <option value="lighting">Lighting</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Price</label>
                        <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({...editProduct, price: e.target.value})} min="0" step="0.01" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea value={editProduct.description} onChange={(e) => setEditProduct({...editProduct, description: e.target.value})} rows={4} />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Image URL</label>
                        <input type="url" value={editProduct.images[0]} onChange={(e) => setEditProduct({...editProduct, images: [e.target.value]})} />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label"><input type="checkbox" checked={editProduct.inStock} onChange={(e) => setEditProduct({...editProduct, inStock: e.target.checked})} /> In Stock</label>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <button className="btn btn-primary" type="submit">Update Product</button>
                      <button className="btn btn-secondary" type="button" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'addUser' && (
                <div className="card form-card">
                  <form onSubmit={handleAddUser} className="admin-add-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Role</label>
                        <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <button className="btn btn-primary" type="submit">Add User</button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'editUser' && editingUser && (
                <div className="card form-card">
                  <h3>Edit User</h3>
                  <form onSubmit={handleUpdateUser} className="admin-add-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input type="text" value={editUser.name} onChange={(e) => setEditUser({...editUser, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={editUser.email} onChange={(e) => setEditUser({...editUser, email: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Role</label>
                        <select value={editUser.role} onChange={(e) => setEditUser({...editUser, role: e.target.value})}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <button className="btn btn-primary" type="submit">Update User</button>
                      <button className="btn btn-secondary" type="button" onClick={handleCancelEditUser}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;