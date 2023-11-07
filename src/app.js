const express = require('express');
const path = require('path');
const fs = require('fs');

let ruta = path.join(__dirname, 'archivo', 'products.json');

async function getProducts() {
    if (fs.existsSync(ruta)) {
        let data = await fs.promises.readFile(ruta, 'utf-8');
        return JSON.parse(data);
    } else {
        return [];
    }
}

async function saveProducts(products) {
    try {
        await fs.promises.writeFile(ruta, JSON.stringify(products, null, 5));
        console.log('Productos guardados con éxito en', ruta);
    } catch (error) {
        console.error('Error al guardar los productos:', error);
    }
}

async function getProductById(id) {
    try {
        let productos = await getProducts();
        let product = productos.find(product => product.id === Number(id)); 

        if (product) {
            console.log("El producto encontrado es:", product);
            return product;
        } else {
            console.log("Producto no encontrado");
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain'); 
    res.status(200).send('OK');
});

app.get('/api/products', async (req, res) => {
    try {
        let limit = req.query.limit;
        let products = await getProducts();

        if (limit) {
            let limitedProducts = products.slice(0, parseInt(limit, 10));
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ Products: limitedProducts });
            console.log(limitedProducts)
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ products });
            console.log(products)
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.get('/api/products/:pid', async (req, res) => {
    try {
        let productId = req.params.pid;

        if (isNaN(productId)) {
            res.status(400).json({ error: 'El ID de producto no es un número válido' });
            return;
        }
        let product = await getProductById(productId);
  
        if (product) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ product });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

app.post('./api/products'), async (req, res)=> {
    try {
        let {title, description, code, price, status, stock, thumbnails} = req.body

    }
}


const server = app.listen(PORT, () => {
    console.log(`Server escuchando en puerto ${PORT}`);
});