const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files (index.html, etc.)

const DATA_FILE = path.join(__dirname, 'products.json');

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET all products
app.get('/api/products', (req, res) => {
    const products = readData();
    res.json(products);
});

// POST new product
app.post('/api/products', (req, res) => {
    const products = readData();
    const newProduct = req.body;
    products.push(newProduct);
    writeData(products);
    res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
    const products = readData();
    const { id } = req.params;
    const updatedProduct = req.body;
    
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = updatedProduct;
        writeData(products);
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
    let products = readData();
    const { id } = req.params;
    
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);
    
    if (products.length < initialLength) {
        writeData(products);
        res.json({ message: 'Product deleted' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
