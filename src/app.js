const express = require('express');
const routerProducts = require('./routes/products.router');
const routerCarrito = require('./routes/carrito.router');

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', routerProducts)
app.use('/api/carts', routerCarrito)

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
});

const server = app.listen(PORT, () => {
    console.log(`Server escuchando en puerto ${PORT}`);
});