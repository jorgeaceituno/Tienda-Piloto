// Configuración de Servidor PostgreSQL via Supabase API
const supabaseUrl = 'https://qcjzppndhbtseddprvyl.supabase.co';
const supabaseKey = 'sb_publishable_L1yKNMrWaiM-pKCzyUuxyA_9Zbwo4vg';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Data Dinámica
let productos = [];

async function fetchProductsFromDB() {
    const { data, error } = await supabaseClient
        .from('productos')
        .select('*')
        .order('id', { ascending: true });
        
    if (error) {
        console.error("Error crítico leyendo PostgreSQL:", error);
    } else if (data) {
        // Mapeamos description a desc para mantener el resto del código sin romper
        productos = data.map(p => ({
            ...p,
            desc: p.description
        }));
    }
}

// Utility functions
const formatPrice = (price) => `HNL ${price.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

const generateWhatsAppLink = (product) => {
    const phone = "50431838215";
    const message = `Hola, estoy interesado en el producto: ${product.title} que tiene un precio de ${formatPrice(product.price)}. ¿Está disponible?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// Cart State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

const updateCartUI = () => {
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');

    if(!cartCount || !cartItemsContainer || !cartTotalAmount) return;

    // Update count
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Render items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top:2rem;">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const product = productos.find(p => p.id === item.productId);
            if (!product) return;
            
            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${product.img}" alt="${product.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${product.title}</h4>
                        <div class="cart-item-price">${formatPrice(product.price)}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateQuantity(${item.productId}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.productId}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${item.productId})">Eliminar</button>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });
    }

    // Update total
    const totalCost = cart.reduce((acc, item) => {
        const product = productos.find(p => p.id === item.productId);
        return acc + (product.price * item.quantity);
    }, 0);
    cartTotalAmount.textContent = formatPrice(totalCost);
};

// Cart Actions (exposed globally for inline onclick)
window.addToCart = (productId) => {
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    // Open sidebar as visual feedback
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
};

window.removeFromCart = (productId) => {
    cart = cart.filter(i => i.productId !== productId);
    saveCart();
    updateCartUI();
};

window.updateQuantity = (productId, change) => {
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.productId !== productId);
        }
    }
    saveCart();
    updateCartUI();
};

// Render Home Products
const renderProducts = (category = 'all') => {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? productos 
        : productos.filter(p => p.category === category);

    filteredProducts.forEach(product => {
        const productHTML = `
            <div class="product-card">
                <a href="product.html?id=${product.id}" class="product-img-wrapper" style="display:block;">
                    <img src="${product.img}" alt="${product.title}" class="product-img" loading="lazy">
                </a>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <a href="product.html?id=${product.id}" style="text-decoration:none; display:block;">
                        <h3 class="product-title">${product.title}</h3>
                    </a>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <div class="product-actions">
                        <button class="btn btn-outline" onclick="addToCart(${product.id})">
                            <i data-lucide="shopping-cart" style="width: 18px; height: 18px;"></i> Agregar al Carrito
                        </button>
                        <a href="${generateWhatsAppLink(product)}" target="_blank" class="btn btn-whatsapp">
                            <i data-lucide="phone" style="width: 18px; height: 18px;"></i> Comprar por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
    
    // Re-initialize icons for newly added HTML
    if (window.lucide) {
        lucide.createIcons();
    }
};

// Render Product Detail
const renderProductDetail = () => {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = productos.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = '<div style="text-align:center; padding: 4rem; grid-column: 1 / -1;"><h2>Producto no encontrado</h2><a href="index.html" class="btn btn-primary" style="margin-top:1rem;">Volver a la tienda</a></div>';
        return;
    }

    container.innerHTML = `
        <img src="${product.img}" alt="${product.title}" class="detail-img">
        <div class="detail-info">
            <span class="product-category" style="font-size:1rem;">${product.category}</span>
            <h1 class="detail-title">${product.title}</h1>
            <div class="detail-price">${formatPrice(product.price)}</div>
            <p class="detail-desc">${product.desc}</p>
            
            <div style="display: flex; gap: 1rem; flex-direction: column;">
                <button class="btn btn-primary" onclick="addToCart(${product.id})" style="padding: 1rem; font-size: 1.1rem; width: 100%;">
                    <i data-lucide="shopping-cart"></i> Agregar al Carrito
                </button>
                <a href="${generateWhatsAppLink(product)}" target="_blank" class="btn btn-whatsapp" style="padding: 1rem; font-size: 1.1rem; width: 100%;">
                    <i data-lucide="phone"></i> Comprar vía WhatsApp
                </a>
            </div>
        </div>
    `;

    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Update Page Title
    document.title = `${product.title} - Mi Tienda Piloto`;
};

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProductsFromDB();

    // Initial Render
    updateCartUI();
    renderProducts();
    renderProductDetail();

    // Call lucide icons logic initially in case hardcoded icons exist
    if (window.lucide) {
        lucide.createIcons();
    }

    // Setup Modals
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cartToggle && cartClose && cartSidebar && cartOverlay) {
        cartToggle.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        });

        const closeCart = () => {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        };

        cartClose.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Checkout specific logic - simple alert for pure JS
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
            const phone = "50431838215";
            let message = "Hola! Quiero finalizar la compra de mi carrito:\n";
            cart.forEach(item => {
                const product = productos.find(p => p.id === item.productId);
                if (product) {
                    message += `- ${product.title} (x${item.quantity}) - ${formatPrice(product.price * item.quantity)}\n`;
                }
            });
            const totalCost = cart.reduce((acc, item) => {
                const product = productos.find(p => p.id === item.productId);
                return acc + (product.price * item.quantity);
            }, 0);
            message += `\nTotal: ${formatPrice(totalCost)}\n¿Cuáles son los pasos para pagar?`;
            
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
        });
    }

    // Setup Category Filters
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            const filter = target.getAttribute('data-filter');
            renderProducts(filter);
        });
    });
});
