const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const { getProducts } = require('./products.router');


const ruta = path.join(__dirname, '..', 'archivo', 'carrito.json');

async function getCart() {
    if (fs.existsSync(ruta)) {
        let data = await fs.promises.readFile(ruta, 'utf-8');
        return JSON.parse(data);
    } else {
        return [];
    }
}



async function saveCart(cart) {
    await fs.promises.writeFile(ruta, JSON.stringify(cart, null, 2));
}

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { id } = req.body;
        if (isNaN(id)) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El ID del carrito debe ser un número' });
            return;
        }

        const carts = await getCart();
        const existingCart = carts.find(cart => cart.id === id);

        if (existingCart) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El carrito con el mismo ID ya existe' });
            return;
        }

        const newCart = {
            id,
            products: []
        };

        carts.push(newCart);
        await saveCart(carts);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear el carrito: ", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        if (isNaN(cartId)) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El ID del carrito debe ser un número' });
            return;
        }

        const carts = await getCart();
        const cart = carts.find(cart => cart.id === Number(cartId));

        if (cart) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(cart.products);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error("Error al obtener productos del carrito: ", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al obtener productos del carrito' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = 1; 

        if (isNaN(cartId) || isNaN(productId)) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'Los IDs del carrito y del producto deben ser números' });
            return;
        }

        const carts = await getCart();
        const cart = carts.find(cart => cart.id === Number(cartId));

        if (!cart) {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }

        const products = await getProducts();
        const product = products.find(product => product.id === Number(productId));

        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }

        const existingProductInCart = cart.products.find(item => item.product.id === Number(productId));
        if (existingProductInCart) {
            existingProductInCart.quantity += quantity;
        } else {
            cart.products.push({ product, quantity });
        }

        await saveCart(carts);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(cart);
    } catch (error) {
        console.error("Error al agregar un producto al carrito: ", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al agregar un producto al carrito' });
    }
});

module.exports = router;