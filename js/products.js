
import { addProduct, removeProductById, fetchProducts } from './api.js';
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[data-form]');
    const nameInput = document.querySelector('[data-name]');
    const priceInput = document.querySelector('[data-price]');
    const imageInput = document.querySelector('[data-image]');
    const nameError = document.querySelector('#name-error');
    const priceError = document.querySelector('#price-error');
    const imageError = document.querySelector('#image-error');
    const productsContainer = document.querySelector('[data-product]');
    const resetButton = document.querySelector('[data-reset]');
    const submitButton = document.querySelector('[data-submit]');
    const avisoNotificacao = document.querySelector('[data-notificacao]');
    const notificacao = avisoNotificacao.querySelector('#notificacao');
    const botaoError = document.querySelector('#botao-error');
    const fileInput = document.querySelector('[data-file]');

    function updateProductsContainer() {
        if (productsContainer.children.length > 0) {
            productsContainer.classList.add('has-products');
        } else {
            productsContainer.classList.remove('has-products');
        }
    }

    function atualizarAviso() {
        if (productsContainer.children.length === 0) {
            notificacao.innerText = 'Nenhum produto encontrado, adicione seus produtos para serem mostrados acima.';
        } else {
            notificacao.innerText = '';
        }
    }
    atualizarAviso();

    function validateAndFormatPrice(price) {
        // Remover espaços extras
        price = price.replace(/\s+/g, ' ').trim();
    
        // Verificar se o preço contém apenas números, vírgula e ponto
        if (!/^[\d.,\sR\$]*$/.test(price)) {
            return false;
        }
    
        // Verificar se o preço contém uma vírgula e dois dígitos decimais
        if (!price.includes(',') || !/,\d{2}$/.test(price)) {
            return false;
        }
    
        // Adicionar "$: " ou "R$: " se o formato estiver incorreto
        if (price.startsWith('$:')) {
            if (!price.startsWith('$: ')) {
                price = price.replace('$:', '$: ');
            }
        } else if (price.startsWith('$ ')) {
            price = price.replace('$ ', '$: ');
        } else if (price.startsWith('$')) {
            if (!price.startsWith('$: ')) {
                price = price.replace('$', '$: ');
            }
        } else if (price.startsWith('R$:')) {
            if (!price.startsWith('R$: ')) {
                price = price.replace('R$:', 'R$: ');
            }
        } else if (price.startsWith('R$ ')) {
            price = price.replace('R$ ', 'R$: ');
        } else if (price.startsWith('R$')) {
            // Adicionar ": " se o tipo de moeda for encontrado
            if (!price.includes(':')) {
                price = price.replace('R$', 'R$: ');
            }
        } else if (/^\d+,\d{2}$/.test(price)) {
            // Caso de apenas números com vírgula e dois decimais
            price = `$: ${price}`;
        } else {
            return false; // Se não começar com $ ou R$ ou formato numérico válido, é inválido
        }
    
        // Dividir o preço em parte inteira e decimal
        const parts = price.split(',');
    
        // Verificar se a parte decimal contém exatamente dois dígitos
        if (parts[1].length !== 2) {
            return false;
        }
    
        // Limitar os dígitos antes da vírgula
        if (parts[0].replace(/[^\d]/g, '').length > 7) {
            return false;
        }
    
        // Adicionar pontos como separadores de milhares
        let integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
        // Formatar o preço final
        let formattedPrice = integerPart + ',' + parts[1];
    
        // Retornar o preço formatado
        return formattedPrice;
    }
    
    function displayProduct(product) {
        const productElement = document.createElement('div');
        productElement.classList.add('product-item');
        productElement.dataset.productId = product.id;
    
        const formattedPrice = validateAndFormatPrice(product.price) || product.price;
        
        productElement.innerHTML = `
            <div class="product-details">
                <img class="img-produto" src="${product.image}" alt="Imagem do Produto">
                <h3>${product.name}</h3>
                <div class="delete-vector">
                    <p>${formattedPrice}</p>
                    <input type="image" class="delete-btn" src="./assets/Vector.png" alt="Delete" data-delete-id="${product.id}">
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productElement);
        
        const deleteButton = productElement.querySelector('.delete-btn');
        deleteButton.addEventListener('click', async () => {
            await removeProduct(product.id);
        });
        
        atualizarAviso();
    }

    
    function isValidURL(url) {
        const pattern = new RegExp('^(https?:\\/\\/)' + // protocolo
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domínio
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // endereço IP (v4)
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // porta e caminho
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // consulta
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragmento
        return !!pattern.test(url);
    }
    
    function checkImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => reject(false);
            img.src = url;
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const price = priceInput.value.trim();
        const imageUrl = imageInput.value.trim();
        const file = fileInput.files[0];
        const formattedPrice = validateAndFormatPrice(price);
    
        let hasError = false;
    
        // Validação do nome
        if (name === '') {
            nameError.textContent = 'Por favor, preencha o campo de nome.';
            nameError.style.display = 'block';
            hasError = true;
        } else if (name.length > 30) {
            nameError.textContent = 'O nome do produto deve ter no máximo 30 caracteres.';
            nameError.style.display = 'block';
            hasError = true;
        } else {
            nameError.textContent = '';
            nameError.style.display = 'none';
        }
    
        // Validação do preço
        if (price === '') {
            priceError.textContent = 'Por favor, preencha o campo de preço.';
            priceError.style.display = 'block';
            hasError = true;
        } else {
            const formattedPrice = validateAndFormatPrice(price);
            if (!formattedPrice) {
                priceError.textContent = 'Por favor, insira um valor válido. Exemplo: R$: 0,00, $: 0,00 ou apenas 0,00.';
                priceError.style.display = 'block';
                hasError = true;
            }
        }
    
        // Validação da URL da imagem
        if (imageUrl !== '') {
            if (!isValidURL(imageUrl)) {
                imageError.textContent = 'Por favor, insira uma URL válida.';
                imageError.style.display = 'block';
                hasError = true;
            } else {
                try {
                    const validImage = await checkImage(imageUrl);
                    if (!validImage) {
                        throw new Error('Invalid image URL');
                    }
                } catch {
                    imageError.textContent = 'Por favor, insira uma URL válida.';
                    imageError.style.display = 'block';
                    hasError = true;
                }
            }
        }
    
        // Validação do arquivo
        if (!file && imageUrl === '') {
            imageError.textContent = 'Por favor, insira uma URL válida ou selecione um arquivo de imagem.';
            imageError.style.display = 'block';
            hasError = true;
        }
    
        if (!hasError) {
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const product = { 
                        name, 
                        price: formattedPrice, 
                        image: event.target.result 
                    };
                    await addProductHandler(product);
                };
                reader.readAsDataURL(file);
            } else {
                const product = { 
                    name, 
                    price: formattedPrice, 
                    image: imageUrl 
                };
                await addProductHandler(product);
            }
        }
    });
    
    async function addProductHandler(product) {
        try {
            //console.log('Tentando adicionar o produto:', product);
            const newProduct = await addProduct(product);
            displayProduct(newProduct);
            nameInput.value = '';
            priceInput.value = '';
            imageInput.value = '';
            fileInput.value = '';
            nameError.textContent = '';
            priceError.textContent = '';
            imageError.textContent = '';
            updateProductsContainer();
            atualizarAviso();
            submitButton.textContent = 'Guardado!';
            setTimeout(() => {
                submitButton.textContent = 'Guardar';
            }, 1000);
    
            // Salvar indicador no localStorage
            localStorage.setItem('hasProducts', 'true');
            botaoError.innerText = 'Produto adicionado com sucesso!';
            botaoError.style.color = 'green';
            botaoError.style.display = 'block';
        } catch (error) {
            //console.error('Erro ao adicionar produto:', error);
            botaoError.innerText = 'Erro ao adicionar produto. Selecione outro arquivo.';
            botaoError.style.color = 'red';
            botaoError.style.display = 'block';
        }
    }    

    resetButton.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const price = priceInput.value.trim();
        const image = imageInput.value.trim();
        const file = fileInput.files[0];
        let hasError = false;
    
        // Limpar mensagens de erro anteriores
        nameError.textContent = '';
        priceError.textContent = '';
        imageError.textContent = '';
        botaoError.style.display = 'none';
    
        // Verificar se a lista de produtos está vazia
        if (productsContainer.children.length === 0) {
            notificacao.style.color = 'red';
            return;
        }
    
        // Se todos os campos estiverem vazios, limpar todos os produtos
        if (name === '' && price === '' && image === '' && !file) {
            await clearProducts();
            resetButton.textContent = 'Limpo!';
            botaoError.innerText = 'Todos os produtos foram limpos com sucesso!';
            botaoError.style.color = 'green';
            botaoError.style.display = 'block';
            setTimeout(() => {
                resetButton.textContent = 'Limpar';
            }, 1000);
            atualizarAviso();
            return;
        }
    
        if (hasError) {
            return;
        }
    });
    async function clearProducts() {
        try {
            const products = await fetchProducts();
            for (const product of products) {
                await removeProductById(product.id);
            }
            //Limpar todos os produtos da interface do usuário
            productsContainer.innerHTML = '';
            updateProductsContainer();
            atualizarAviso();
            console.log('Todos os produtos foram removidos com sucesso');
            localStorage.setItem('hasProducts', 'false');
        } catch (error) {
            //console.error('Erro ao remover todos os produtos:', error);
        }
    }

    async function removeProduct(productId) {
        try {
            await removeProductById(productId);
            const productElement = document.querySelector(`[data-product-id="${productId}"]`);
            if (productElement) {
                productElement.remove();
                updateProductsContainer();
                atualizarAviso();
                botaoError.innerText = 'Produto removido com sucesso!';
                botaoError.style.color = 'green';
                botaoError.style.display = 'block';
            }
            //console.log('Produto removido com sucesso');
        } catch (error) {
            //console.error('Erro ao remover produto:', error);
        }
    }

    // Event listeners para limpar a mensagem de sucesso ao focar nos campos
    function clearSuccessMessage() {
        botaoError.innerText = '';
        botaoError.style.display = 'none';
    }

    nameInput.addEventListener('focus', clearSuccessMessage);
    priceInput.addEventListener('focus', clearSuccessMessage);
    imageInput.addEventListener('focus', clearSuccessMessage);
    resetButton.addEventListener('click', clearSuccessMessage);
    submitButton.addEventListener('click', clearSuccessMessage);

    nameInput.addEventListener('focus', () => {
        nameError.textContent = '';
        nameError.style.display = 'none';
        botaoError.style.display = 'none';
    });
    
    priceInput.addEventListener('focus', () => {
        priceError.textContent = '';
        priceError.style.display = 'none';
        botaoError.style.display = 'none';
    });
    
    imageInput.addEventListener('focus', () => {
        imageError.textContent = '';
        imageError.style.display = 'none';
        botaoError.style.display = 'none';
    });
    
    nameInput.addEventListener('input', () => {
        if (nameInput.value.length > 30) {
            nameError.textContent = 'O nome do produto deve ter no máximo 30 caracteres.';
            nameError.style.display = 'block';
            botaoError.style.display = 'none';
        } else {
            nameError.textContent = '';
            nameError.style.display = 'none';
        }
    });

    // Event listeners para resetar a cor quando houver foco em qualquer um dos campos
    nameInput.addEventListener('focus', () => {
        if (productsContainer.children.length === 0) {
            notificacao.style.color = '#666666';
        }
    });
    
    priceInput.addEventListener('focus', () => {
        if (productsContainer.children.length === 0) {
            notificacao.style.color = '#666666';
        }
    });
    
    imageInput.addEventListener('focus', () => {
        if (productsContainer.children.length === 0) {
            notificacao.style.color = '#666666';
        }
    });

    async function clearProductsOnReload() {
        const hasProducts = localStorage.getItem('hasProducts');
        if (hasProducts === 'true') {
            await clearProducts();
            localStorage.removeItem('hasProducts');
        }
    }
    
    async function initializeProducts() {
        const hasProducts = localStorage.getItem('hasProducts');
        if (hasProducts !== 'true') {
            const products = await fetchProducts();
            products.forEach(product => displayProduct(product));
        }
    }
    
    //Função para limpar produtos no recarregamento
    clearProductsOnReload().then(() => {
        // Função de inicialização após limpar os produtos
        initializeProducts();
    });
});
