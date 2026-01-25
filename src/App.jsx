import { useState, useEffect } from 'react'
import { api } from './api'

function App() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('login')
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    name: '',
    surname: '',
    email: '',
    birthDate: ''
  })
  const [message, setMessage] = useState('')


  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setView('shop')
      fetchItems()
      fetchOrders(parsedUser.id)
    }
  }, [])

  const fetchItems = async () => {
    try {
      const data = await api.getItems()
      console.log('Fetched items data:', data)
      const content = data.content || data
      if (content && content.length > 0) {
        setItems(content)
      } else {
        console.warn('Backend returned empty items list')

        setItems([
          { id: 1, name: 'Premium Laptop', price: 1299, description: 'High-performance laptop for professionals.' },
          { id: 2, name: 'Wireless Headphones', price: 199, description: 'Noise-canceling over-ear headphones.' },
          { id: 3, name: 'Smart Watch', price: 299, description: 'Track your health and notifications.' }
        ])
      }
    } catch (err) {
      console.error('Failed to fetch items from backend:', err)
      console.log('Using demo data as fallback.')
      setItems([
        { id: 1, name: 'Premium Laptop', price: 1299, description: 'High-performance laptop for professionals.' },
        { id: 2, name: 'Wireless Headphones', price: 199, description: 'Noise-canceling over-ear headphones.' },
        { id: 3, name: 'Smart Watch', price: 299, description: 'Track your health and notifications.' }
      ])
    }
  }

  const fetchOrders = async (userId) => {
    if (!userId) return
    try {
      const data = await api.getOrders(userId)
      setOrders(data.content || data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      let data;
      if (view === 'login') {
        data = await api.login(credentials.username, credentials.password)
      } else {
        data = await api.register(credentials)
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      setView('shop')
      fetchItems()
      fetchOrders(data.id)
    } catch (err) {
      setMessage(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setView('login')
    setCart([])
    setOrders([])
  }

  const handleAddToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }])
    setMessage(`Added ${item.name} to cart!`)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId))
  }

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) return

    setLoading(true)
    try {
      const orderData = {
        userId: user.id,
        items: cart.map(item => ({ itemId: item.id, quantity: 1 })),
        status: 'PAYMENT_PENDING'
      }
      await api.createOrder(orderData)
      setCart([])
      alert('Order placed successfully!')
      fetchOrders(user.id)
      setView('orders')
    } catch (err) {
      alert(`Failed to place order: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (view === 'login' || view === 'register') {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '450px' }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <form onSubmit={handleAuth}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {view === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={credentials.name}
                      onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Surname</label>
                    <input
                      type="text"
                      value={credentials.surname}
                      onChange={(e) => setCredentials({ ...credentials, surname: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Birth Date</label>
                  <input
                    type="date"
                    value={credentials.birthDate}
                    onChange={(e) => setCredentials({ ...credentials, birthDate: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {message && <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{message}</p>}

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Register')}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {view === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => {
                  setView(view === 'login' ? 'register' : 'login');
                  setMessage('');
                }}
              >
                {view === 'login' ? 'Register' : 'Login'}
              </span>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav>
        <div className="logo">INNO SHOP</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span
            style={{ cursor: 'pointer', fontWeight: view === 'shop' ? 'bold' : 'normal', color: view === 'shop' ? 'var(--primary)' : 'white' }}
            onClick={() => setView('shop')}
          >
            Shop
          </span>
          <span
            style={{ cursor: 'pointer', fontWeight: view === 'orders' ? 'bold' : 'normal', color: view === 'orders' ? 'var(--primary)' : 'white', position: 'relative' }}
            onClick={() => setView('orders')}
          >
            My Orders
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cart.length}
              </span>
            )}
          </span>
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.username}</span>
          <button className="btn" onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 1rem' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {view === 'shop' && (
          <>
            <header style={{ marginBottom: '3rem' }}>
              <h1>Premium Collection</h1>
              <p style={{ color: 'var(--text-muted)' }}>Explore our curated selection of high-quality items.</p>
              {message && <p style={{ color: 'var(--accent)', marginTop: '1rem', fontWeight: 'bold' }} className="animate-fade">{message}</p>}
            </header>

            <div className="grid">
              {items.map(item => (
                <div key={item.id} className="glass-card animate-fade">
                  <div style={{ height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--glass-border)', borderRadius: '50%' }}></div>
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '3rem' }}>
                    {item.description || 'Premium quality item for your daily needs.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>${item.price}</span>
                    <button className="btn btn-primary" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p>No items found in the catalog.</p>}
            </div>
          </>
        )}

        {view === 'orders' && (
          <div className="animate-fade">
            <header style={{ marginBottom: '3rem' }}>
              <h1>My Orders</h1>
              <p style={{ color: 'var(--text-muted)' }}>Manage your cart and view your order history.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div>
                <section className="glass-card" style={{ marginBottom: '2rem' }}>
                  <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Current Cart
                  </h2>
                  {cart.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Your cart is empty. Go to the shop to add some items!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {cart.map(item => (
                        <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '24px', height: '24px', background: 'var(--glass-border)', borderRadius: '4px' }}></div>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>${item.price}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.cartId)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.875rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="glass-card">
                  <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Order History
                  </h2>
                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No previous orders found.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {orders.map(order => (
                        <div key={order.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              background: order.status === 'COMPLETED' ? 'var(--accent)' : 'var(--primary)',
                              color: 'white'
                            }}>
                              {order.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <aside>
                <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Summary</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                      <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--accent)' }}>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={cart.length === 0 || loading}
                    onClick={handlePlaceOrder}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                    By placing an order, you agree to our terms and conditions.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div >
  )
}

export default App
