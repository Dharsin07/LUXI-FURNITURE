// Temporary in-memory orders storage (until database is set up)
const tempOrdersStorage = new Map(); // userId -> orders

const getOrders = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    
    console.log('Getting orders for user:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    // Use temporary in-memory storage
    const orders = tempOrdersStorage.get(userId) || [];
    console.log('Found orders:', orders);

    res.json({ 
      success: true, 
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const { items, totalAmount, shippingAddress } = req.body;

    console.log('Creating order for user:', userId);
    console.log('Order data:', { items, totalAmount, shippingAddress });

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    // Get or create user's orders
    if (!tempOrdersStorage.has(userId)) {
      tempOrdersStorage.set(userId, []);
    }
    
    const orders = tempOrdersStorage.get(userId);
    
    // Create new order
    const order = {
      id: Date.now(),
      userId,
      items,
      totalAmount,
      status: 'pending',
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(order);
    tempOrdersStorage.set(userId, orders);
    
    console.log('Order created successfully:', order);

    res.status(201).json({ 
      success: true, 
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ 
      success: true, 
      data: {
        ...order,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '/placeholder.jpg'
        }))
      }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get order' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      data: {
        ...order,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '/placeholder.jpg'
        }))
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      success: true, 
      data: orders.map(order => ({
        ...order,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '/placeholder.jpg'
        }))
      }))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to get all orders' });
  }
};

module.exports = {
  getOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getAllOrders
};
