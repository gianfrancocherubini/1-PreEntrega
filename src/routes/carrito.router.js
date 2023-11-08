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

