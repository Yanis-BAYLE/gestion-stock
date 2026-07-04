const API_BASE_URL = "/api";

const messageElement = document.getElementById("message");
const productsTableBody = document.getElementById("products-table-body");

const productForm = document.getElementById("product-form");
const productFormTitle = document.getElementById("product-form-title");
const cancelEditButton = document.getElementById("cancel-edit-button");

const productIdInput = document.getElementById("product-id");
const referenceInput = document.getElementById("reference");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const quantityInput = document.getElementById("quantity");
const minimumQuantityInput = document.getElementById("minimumQuantity");
const categorySelect = document.getElementById("categoryId");
const supplierSelect = document.getElementById("supplierId");

const movementForm = document.getElementById("movement-form");
const movementProductSelect = document.getElementById("movementProductId");
const movementTypeSelect = document.getElementById("movementType");
const movementQuantityInput = document.getElementById("movementQuantity");
const reasonInput = document.getElementById("reason");

let products = [];
let categories = [];
let suppliers = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadInitialData();

    productForm.addEventListener("submit", handleProductSubmit);
    movementForm.addEventListener("submit", handleMovementSubmit);
    cancelEditButton.addEventListener("click", resetProductForm);
});

async function loadInitialData() {
    try {
        const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/categories`),
            fetch(`${API_BASE_URL}/suppliers`)
        ]);

        products = await productsResponse.json();
        categories = await categoriesResponse.json();
        suppliers = await suppliersResponse.json();

        renderCategoryOptions();
        renderSupplierOptions();
        renderMovementProductOptions();
        renderProductsTable();

        showMessage("Données chargées.", "success");
    } catch (error) {
        showMessage("Erreur lors du chargement des données.", "error");
        console.error(error);
    }
}

function renderCategoryOptions() {
    categorySelect.innerHTML = '<option value="">Aucune catégorie</option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function renderSupplierOptions() {
    supplierSelect.innerHTML = '<option value="">Aucun fournisseur</option>';

    suppliers.forEach(supplier => {
        const option = document.createElement("option");
        option.value = supplier.id;
        option.textContent = supplier.name;
        supplierSelect.appendChild(option);
    });
}

function renderMovementProductOptions() {
    movementProductSelect.innerHTML = '<option value="">Sélectionner un produit</option>';

    products.forEach(product => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = `${product.reference} - ${product.name}`;
        movementProductSelect.appendChild(option);
    });
}

function renderProductsTable() {
    productsTableBody.innerHTML = "";

    products.forEach(product => {
        const row = document.createElement("tr");

        const categoryName = product.category ? product.category.name : "-";
        const supplierName = product.supplier ? product.supplier.name : "-";

        const stockClass = product.quantity <= product.minimumQuantity ? "low-stock" : "";

        row.innerHTML = `
            <td>${escapeHtml(product.reference)}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(categoryName)}</td>
            <td>${escapeHtml(supplierName)}</td>
            <td class="${stockClass}">${product.quantity}</td>
            <td>${product.minimumQuantity}</td>
            <td>
                <div class="actions">
                    <button type="button" onclick="editProduct(${product.id})">Modifier</button>
                    <button type="button" class="danger" onclick="deleteProduct(${product.id})">Supprimer</button>
                </div>
            </td>
        `;

        productsTableBody.appendChild(row);
    });
}

async function handleProductSubmit(event) {
    event.preventDefault();

    const productId = productIdInput.value;

    const productPayload = {
        reference: referenceInput.value,
        name: nameInput.value,
        description: descriptionInput.value,
        quantity: Number(quantityInput.value),
        minimumQuantity: Number(minimumQuantityInput.value),
        categoryId: categorySelect.value ? Number(categorySelect.value) : null,
        supplierId: supplierSelect.value ? Number(supplierSelect.value) : null
    };

    try {
        const url = productId
            ? `${API_BASE_URL}/products/${productId}`
            : `${API_BASE_URL}/products`;

        const method = productId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productPayload)
        });

        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        resetProductForm();
        await loadInitialData();

        showMessage(
            productId ? "Produit modifié avec succès." : "Produit ajouté avec succès.",
            "success"
        );
    } catch (error) {
        showMessage("Erreur lors de l'enregistrement du produit.", "error");
        console.error(error);
    }
}

function editProduct(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        showMessage("Produit introuvable.", "error");
        return;
    }

    productFormTitle.textContent = "Modifier un produit";

    productIdInput.value = product.id;
    referenceInput.value = product.reference;
    nameInput.value = product.name;
    descriptionInput.value = product.description || "";
    quantityInput.value = product.quantity;
    minimumQuantityInput.value = product.minimumQuantity;

    categorySelect.value = product.category ? product.category.id : "";
    supplierSelect.value = product.supplier ? product.supplier.id : "";

    window.scrollTo({ top: productForm.offsetTop, behavior: "smooth" });
}

async function deleteProduct(productId) {
    const confirmed = confirm("Voulez-vous vraiment supprimer ce produit ?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        await loadInitialData();
        showMessage("Produit supprimé avec succès.", "success");
    } catch (error) {
        showMessage("Erreur lors de la suppression du produit.", "error");
        console.error(error);
    }
}

async function handleMovementSubmit(event) {
    event.preventDefault();

    const movementPayload = {
        productId: Number(movementProductSelect.value),
        movementType: movementTypeSelect.value,
        quantity: Number(movementQuantityInput.value),
        reason: reasonInput.value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/stock-movements`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(movementPayload)
        });

        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        movementForm.reset();
        await loadInitialData();

        showMessage("Mouvement de stock enregistré avec succès.", "success");
    } catch (error) {
        showMessage("Erreur lors du mouvement de stock.", "error");
        console.error(error);
    }
}

function resetProductForm() {
    productForm.reset();
    productIdInput.value = "";
    productFormTitle.textContent = "Ajouter un produit";
}

async function handleApiError(response) {
    try {
        const errorBody = await response.json();

        if (errorBody.error) {
            showMessage(errorBody.error, "error");
        } else {
            showMessage("Erreur API.", "error");
        }
    } catch {
        showMessage("Erreur API.", "error");
    }
}

function showMessage(message, type) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}