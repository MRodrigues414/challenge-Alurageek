export async function fetchProducts() {
    const response = await fetch('https://6776e77680a79bf919008a60.mockapi.io/api/v1/products');
    if (!response.ok) {
        throw new Error('Erro ao buscar produtos!');
    }
    return await response.json();
}

export async function addProduct(product) {
    const response = await fetch('https://6776e77680a79bf919008a60.mockapi.io/api/v1/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar produto!');
    }
    return await response.json();
}

export async function removeProductById(productId) {
    const response = await fetch(`https://6776e77680a79bf919008a60.mockapi.io/api/v1/products/${productId}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Erro ao remover produto!');
    }
    return response;
}
