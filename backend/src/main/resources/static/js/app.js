const API_BASE_URL = "/api";

const messageElement = document.getElementById("message");
const roleMessageElement = document.getElementById("role-message");
const productsTableBody = document.getElementById("products-table-body");

const currentUserElement = document.getElementById("current-user");
const currentRoleElement = document.getElementById("current-role");

const productFormSection = document.getElementById("product-form-section");
const movementFormSection = document.getElementById("movement-form-section");

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

let currentUser = null;
let products = [];
let categories = [];
let suppliers = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadCurrentUser();
    applyRoleRestrictions();
    await loadInitialData();

    productForm.addEventListener("submit", handleProductSubmit);
    movementForm.addEventListener("submit", handleMovementSubmit);
    cancelEditButton.addEventListener("click", resetProductForm);
});

async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/me`);

        if (!response.ok) {
            window.location.href = "/login.html";
            return;
        }

        currentUser = await response.json();

        currentUserElement.textContent = `Connecté : ${currentUser.email}`;
        currentRoleElement.textContent = `Rôle : ${getMainRoleLabel()}`;
    } catch (error) {
        console.error(error);
        window.location.href = "/login.html";
    }
}

function applyRoleRestrictions() {
    if (canEditProducts()) {
        productFormSection.classList.remove("hidden");
    } else {
        productFormSection.classList.add("hidden");
    }

    if (canCreateMovement()) {
        movementFormSection.classList.remove("hidden");
    } else {
        movementFormSection.classList.add("hidden");
    }

    if (hasRole("LECTEUR")) {
        roleMessageElement.textContent = "Mode lecture seule : vous pouvez consulter les produits, mais pas les modifier.";
    } else if (hasRole("GESTIONNAIRE")) {
        roleMessageElement.textContent = "Mode gestionnaire : vous pouvez créer, modifier et gérer les mouvements de stock.";
    } else if (hasRole("ADMIN")) {
        roleMessageElement.textContent = "Mode administrateur : vous pouvez gérer tous les produits.";
    }
}

async function loadInitialData() {
    try {
        const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/categories`),
            fetch(`${API_BASE_URL}/suppliers`)
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok || !suppliersResponse.ok) {
            showMessage("Erreur lors du chargement des données.", "error");
            return;
        }

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
            <td>${renderActionButtons(product.id)}</td>
        `;

        productsTableBody.appendChild(row);
    });
}

function renderActionButtons(productId) {
    if (!canEditProducts() && !canDeleteProducts()) {
        return '<span class="read-only-label">Lecture seule</span>';
    }

    let buttons = '<div class="actions">';

    if (canEditProducts()) {
        buttons += `<button type="button" onclick="editProduct(${productId})">Modifier</button>`;
    }

    if (canDeleteProducts()) {
        buttons += `<button type="button" class="danger" onclick="deleteProduct(${productId})">Supprimer</button>`;
    }

    buttons += "</div>";
    return buttons;
}

async function handleProductSubmit(event) {
    event.preventDefault();

    if (!canEditProducts()) {
        showMessage("Vous n'avez pas le droit de modifier les produits.", "error");
        return;
    }

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
    if (!canEditProducts()) {
        showMessage("Vous n'avez pas le droit de modifier les produits.", "error");
        return;
    }

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
    if (!canDeleteProducts()) {
        showMessage("Vous n'avez pas le droit de supprimer les produits.", "error");
        return;
    }

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

    if (!canCreateMovement()) {
        showMessage("Vous n'avez pas le droit de créer un mouvement de stock.", "error");
        return;
    }

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
    if (response.status === 401) {
        window.location.href = "/login.html";
        return;
    }

    if (response.status === 403) {
        showMessage("Accès refusé : vous n'avez pas les droits nécessaires.", "error");
        return;
    }

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

function hasRole(role) {
    return currentUser && currentUser.roles.includes(`ROLE_${role}`);
}

function canEditProducts() {
    return hasRole("ADMIN") || hasRole("GESTIONNAIRE");
}

function canDeleteProducts() {
    return hasRole("ADMIN");
}

function canCreateMovement() {
    return hasRole("ADMIN") || hasRole("GESTIONNAIRE");
}

function getMainRoleLabel() {
    if (hasRole("ADMIN")) {
        return "Administrateur";
    }

    if (hasRole("GESTIONNAIRE")) {
        return "Gestionnaire";
    }

    if (hasRole("LECTEUR")) {
        return "Lecteur";
    }

    return "Inconnu";
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