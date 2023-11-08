const { Router } = require('express');
const path = require('path');
const fs = require('fs');

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