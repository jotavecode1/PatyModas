// State
let products = JSON.parse(localStorage.getItem('patyModasProducts')) || [];
let cart = JSON.parse(localStorage.getItem('patyModasCart')) || [];
let isAdmin = false;

// Seed initial data if empty
if (products.length === 0) {
    products = [
        {
            id: '1',
            category: 'novidades',
            name: 'Vestido Floral Primavera',
            description: 'Vestido leve e delicado para a estação.',
            internalId: 'V001',
            price: '129.90',
            image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
            id: '2',
            category: 'blusas',
            name: 'Blusa de Seda Rosa',
            description: 'Elegância e conforto em uma peça única.',
            internalId: 'B001',
            price: '89.90',
            image: 'https://images.unsplash.com/photo-1604176354204-9268737828fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
            id: '3',
            category: 'bolsas',
            name: 'Bolsa de Couro Preta',
            description: 'Perfeita para todas as ocasiões.',
            internalId: 'A001',
            price: '199.90',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
    ];
    localStorage.setItem('patyModasProducts', JSON.stringify(products));
}

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeLoginModal = loginModal.querySelector('.close-modal');
const confirmLoginBtn = document.getElementById('confirm-login-btn');
const passwordInput = document.getElementById('password-input');
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

// Cart Elements
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderAllProducts();
    checkLoginState();
    updateCartUI();
});

// --- Login Logic ---
loginBtn.addEventListener('click', () => {
    if (isAdmin) {
        logout();
    } else {
        loginModal.style.display = 'flex';
    }
});

closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

confirmLoginBtn.addEventListener('click', () => {
    const password = passwordInput.value;
    if (password === '123') {
        login();
        loginModal.style.display = 'none';
        passwordInput.value = '';
    } else {
        alert('Senha incorreta!');
    }
});

function login() {
    isAdmin = true;
    document.body.classList.add('is-admin');
    loginBtn.textContent = 'Sair';
    renderAllProducts(); // Re-render to show admin controls
}

function logout() {
    isAdmin = false;
    document.body.classList.remove('is-admin');
    loginBtn.textContent = 'Entrar';
    renderAllProducts(); // Re-render to hide admin controls
}

function checkLoginState() {
    // Optional: Persist login session if needed
}

// --- Product Management ---

function renderAllProducts() {
    // Clear all grids
    const categories = ['novidades', 'vestidos', 'calcas', 'shorts', 'blusas', 'jaquetas', 'bolsas'];
    categories.forEach(cat => {
        const grid = document.getElementById(`grid-${cat}`);
        if (grid) grid.innerHTML = '';
    });

    // Render products
    products.forEach(product => {
        const grid = document.getElementById(`grid-${product.category}`);
        if (grid) {
            const card = createProductCard(product);
            grid.appendChild(card);
        }
    });
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    // Format price
    const priceFormatted = parseFloat(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}
            <p class="product-price">${priceFormatted}</p>
            <button class="btn-add-cart" onclick="addToCart('${product.id}')">Adicionar ao Carrinho</button>
        </div>
        <div class="admin-info admin-only" style="display: none;">
            <span>ID: ${product.internalId}</span>
            <div class="admin-controls">
                <button class="btn-edit" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
    return div;
}

// --- Cart Logic ---

cartBtn.addEventListener('click', () => {
    renderCart();
    cartModal.style.display = 'flex';
});

window.closeCartModal = function() {
    cartModal.style.display = 'none';
};

window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    alert('Produto adicionado ao carrinho!');
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartUI();
};

window.updateQuantity = function(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
            updateCartUI();
        }
    }
};

function saveCart() {
    localStorage.setItem('patyModasCart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">R$ ${parseFloat(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} x ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty" onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    cartTotalPrice.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    let message = "Olá! Gostaria de finalizar meu pedido na Paty Modas:\n\n";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `*${item.quantity}x ${item.name}* - R$ ${itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    });

    message += `\n*Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
});

// --- Add/Edit Logic ---

function openAddModal(category) {
    document.getElementById('modal-title').textContent = 'Adicionar Produto';
    document.getElementById('product-category').value = category;
    document.getElementById('product-id').value = '';
    productForm.reset();
    productModal.style.display = 'flex';
}

function closeProductModal() {
    productModal.style.display = 'none';
}

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modal-title').textContent = 'Editar Produto';
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-id').value = product.id;
    
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-desc').value = product.description || '';
    document.getElementById('p-internal-id').value = product.internalId;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-image').value = product.image;

    productModal.style.display = 'flex';
};

window.deleteProduct = function(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderAllProducts();
    }
};

productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const isEdit = !!id;

    const productData = {
        id: isEdit ? id : Date.now().toString(), // Simple ID generation
        category: document.getElementById('product-category').value,
        name: document.getElementById('p-name').value,
        description: document.getElementById('p-desc').value,
        internalId: document.getElementById('p-internal-id').value,
        price: document.getElementById('p-price').value,
        image: document.getElementById('p-image').value
    };

    if (isEdit) {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        products.push(productData);
    }

    saveProducts();
    renderAllProducts();
    closeProductModal();
});

function saveProducts() {
    localStorage.setItem('patyModasProducts', JSON.stringify(products));
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == productModal) {
        productModal.style.display = "none";
    }
    if (event.target == cartModal) {
        cartModal.style.display = "none";
    }
}
