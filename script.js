// State
let products = [];
let cart = JSON.parse(localStorage.getItem('patyModasCart')) || [];
let isAdmin = false;
const API_URL = 'http://localhost:3000/api/products';

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
    fetchProducts();
    checkLoginState();
    updateCartUI();
});

// --- API Integration ---

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar produtos');
        products = await response.json();
        renderAllProducts();
    } catch (error) {
        console.error('Erro:', error);
        // Fallback if server is offline, maybe show empty or cached?
        // For now, just log error.
    }
}

async function saveProductAPI(product) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) throw new Error('Erro ao salvar produto');
        await fetchProducts(); // Refresh list
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar produto no servidor. Verifique se o servidor está rodando.');
    }
}

async function updateProductAPI(product) {
    try {
        const response = await fetch(`${API_URL}/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) throw new Error('Erro ao atualizar produto');
        await fetchProducts(); // Refresh list
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar produto no servidor.');
    }
}

async function deleteProductAPI(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir produto');
        await fetchProducts(); // Refresh list
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir produto no servidor.');
    }
}

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
        deleteProductAPI(id);
    }
};

productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const isEdit = !!id;

    const productData = {
        id: isEdit ? id : Date.now().toString(),
        category: document.getElementById('product-category').value,
        name: document.getElementById('p-name').value,
        description: document.getElementById('p-desc').value,
        internalId: document.getElementById('p-internal-id').value,
        price: document.getElementById('p-price').value,
        image: document.getElementById('p-image').value
    };

    if (isEdit) {
        updateProductAPI(productData);
    } else {
        saveProductAPI(productData);
    }

    closeProductModal();
});

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
