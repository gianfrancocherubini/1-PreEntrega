const {Router}=require('express')
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

const router=Router()
 
router.get('/', async (req, res) => {
    try {
        let limit = req.query.limit;
        let products = await getProducts();

        if (limit) {
            let limitedProducts = products.slice(0, parseInt(limit, 10));
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ Products: limitedProducts });
            console.log(limitedProducts);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ products });
            console.log(products);
        }
    } catch (error) {
        console.error(error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        let productId = req.params.pid;

        if (isNaN(productId)) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El ID de producto no es un número válido' });
            return;
        }
        let product = await getProductById(productId);

        if (product) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ product });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, price, thumbnails, code, stock, status, category } = req.body;

        if (!title || !description || !price || !thumbnails || !code || !stock || !status || !category) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'Todos los campos son obligatorios' });
            return;
        }

        if (typeof title !== 'string' || typeof description !== 'string' || typeof code !== 'string' || typeof category !== 'string') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'Los campos title, description, code y category deben ser cadenas de texto' });
            return;
        }

        if (typeof price !== 'number' || typeof stock !== 'number') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'Los campos price y stock deben ser números' });
            return;
        }

        if (typeof status !== 'boolean') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo status debe ser un valor booleano' });
            return;
        }

        if (!Array.isArray(thumbnails) || !thumbnails.every(url => typeof url === 'string')) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo thumbnails debe ser un array de cadenas de texto que contienen las rutas de las imágenes' });
            return;
        }

        let productos = await getProducts();

        let productWithSameCode = productos.find(product => product.code === code);

        if (productWithSameCode) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El producto ya está ingresado' });
            return;
        }

        let id = 1;
        if (productos.length > 0) {
            id = productos[productos.length - 1].id + 1;
        }

        let newProduct = {
            id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        productos.push(newProduct);

        await fs.promises.writeFile(ruta, JSON.stringify(productos, null, 2));
        console.log("Producto agregado correctamente.");
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error al agregar el producto: ", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});
router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const {
            title,
            description,
            price, 
            thumbnails,
            code,
            stock,
            status,
            category
        } = req.body;

        if (!productId || isNaN(productId)) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El ID de producto no es un número válido' });
            return;
        }

        const productos = await getProducts();
        const productIndex = productos.findIndex(product => product.id === parseInt(productId, 10));

        if (productIndex === -1) {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }

        let propiedadesPermitidas=["title","description","price","thumbnails","code","stock","status","category"];
        let propiedadesQueLlegan=Object.keys(req.body);
        let valido=propiedadesQueLlegan.every(propiedad=>propiedadesPermitidas.includes(propiedad))
        if(!valido){
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).json({error:`No se aceptan algunas propiedades`, propiedadesPermitidas })

        }

        // Validación de campos
        if (title && typeof title !== 'string') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo title debe ser una cadena de texto' });
            return;
        }

        if (description && typeof description !== 'string') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo description debe ser una cadena de texto' });
            return;
        }

        if (code && typeof code !== 'string') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo code debe ser una cadena de texto' });
            return;
        }

        if (category && typeof category !== 'string') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo category debe ser una cadena de texto' });
            return;
        }

        if (price && typeof price !== 'number') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo price debe ser un número' });
            return;
        }

        if (stock && typeof stock !== 'number') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo stock debe ser un número' });
            return;
        }

        if (status && typeof status !== 'boolean') {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El campo stock debe ser un valor booleano' });
            return;
        }

        if (thumbnails) {
            if (!Array.isArray(thumbnails) || !thumbnails.every(url => typeof url === 'string')) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ error: 'El campo thumbnails debe ser un array de cadenas de texto que contienen las rutas de las imágenes' });
                return;
            }
        }

        // Actualización de campos
        if (title) {
            productos[productIndex].title = title;
        }

        if (description) {
            productos[productIndex].description = description;
        }

        if (price) {
            productos[productIndex].price = price;
        }

        if (thumbnails) {
            productos[productIndex].thumbnails = thumbnails;
        }

        if (code) {
            productos[productIndex].code = code;
        }

        if (stock) {
            productos[productIndex].stock = stock;
        }

        if (status) {
            productos[productIndex].status = status;
        }

        if (category) {
            productos[productIndex].category = category;
        }

        await fs.promises.writeFile(ruta, JSON.stringify(productos, null, 2));
        console.log("Producto actualizado correctamente.");
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ product: productos[productIndex] });
    } catch (error) {
        console.error("Error al actualizar el producto: ", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;

        if (isNaN(productId)) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ error: 'El ID de producto no es un número válido' });
            return;
        }

        const productos = await getProducts();
        const productIndex = productos.findIndex(product => product.id === parseInt(productId, 10));

        if (productIndex === -1) {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }

        productos.splice(productIndex, 1);

        await fs.promises.writeFile(ruta, JSON.stringify(productos, null, 2));
        console.log("Producto eliminado correctamente.");
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar el producto: ", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports=router 