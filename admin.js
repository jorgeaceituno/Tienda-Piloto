// Check Authentication FIRST
const ADMIN_USER = "admin";
const ADMIN_PASS = "tienda123";

let isLoggedIn = sessionStorage.getItem("adminLogado") === "true";
if (!isLoggedIn) {
    const user = prompt("🔒 Ingrese su usuario (admin):");
    const pass = prompt("🔑 Ingrese su contraseña (tienda123):");
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem("adminLogado", "true");
        alert("✅ Bienvenido al administrador.");
    } else {
        alert("❌ Credenciales incorrectas.");
        window.location.href = "index.html"; // Expulsar
    }
}

// Data Handling
let localProducts = JSON.parse(localStorage.getItem('productos')) || [];

// Fallback to exactly 4 default products if localStorage is totally empty
if (localProducts.length === 0) {
    localProducts = [
        {
            id: 1,
            title: "Smartphone Pro Max 256GB",
            category: "electronica",
            price: 32000,
            desc: "El smartphone más potente de la nueva generación, pantalla OLED de 6.7 pulgadas y batería para todo el día.",
            img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
        },
        {
            id: 2,
            title: "Laptop UltraBook 14\"",
            category: "electronica",
            price: 24500,
            desc: "Rendimiento sin límites en un diseño ultradelgado. Procesador de última generación, 16GB de RAM y 512GB SSD.",
            img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
        },
        {
            id: 5,
            title: "Camiseta Básica de Algodón Premium",
            category: "ropa",
            price: 450,
            desc: "Camiseta 100% algodón orgánico, suave al tacto y de corte moderno. Para cualquier ocasión.",
            img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
        },
        {
            id: 7,
            title: "Sofá de Sala 3 Plazas",
            category: "hogar",
            price: 8500,
            desc: "Sofá moderno y confortable. Fabricado con tela premium resistente a manchas.",
            img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
        }
    ];
    localStorage.setItem('productos', JSON.stringify(localProducts));
}

let base64ImageString = "";

// Image Upload with Canvas compression
function previewImage(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // We draw the image on a canvas to compress it (localStorage size limit precaution)
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Limit image width purely for prototype sizes
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = height * (MAX_WIDTH / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert back to Base64 compressed JPEG
            base64ImageString = canvas.toDataURL('image/jpeg', 0.85); 
            
            const preview = document.getElementById('img-preview');
            preview.src = base64ImageString;
            preview.style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderAdminProducts() {
    const container = document.getElementById('admin-product-list');
    container.innerHTML = '';
    
    document.getElementById('product-count').textContent = `${localProducts.length} productos`;

    [...localProducts].reverse().forEach(prod => { // Mostramos subidos recientes arriba
        container.innerHTML += `
            <div style="display:flex; gap:1rem; align-items:center; padding:1rem; border:1px solid #eee; border-radius:8px; background:#fcfcfc;">
                <img src="${prod.img}" alt="${prod.title}" style="width:70px; height:70px; object-fit:cover; border-radius:6px; background:#e0e0e0;">
                <div style="flex:1;">
                    <h4 style="margin:0 0 0.25rem 0;">${prod.title}</h4>
                    <span style="color:var(--primary-color); font-weight:bold;">HNL ${prod.price.toLocaleString('es-HN', {minimumFractionDigits:2})}</span>
                    <br><small style="color:var(--text-muted); text-transform:capitalize;">${prod.category}</small>
                </div>
                <div style="display:flex; gap:0.5rem; flex-direction:column;">
                    <button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.9rem;" onclick="editProduct(${prod.id})">Editar</button>
                    <button class="btn" style="background:#e53e3e; color:white; border-color:#e53e3e; padding:0.4rem 0.8rem; font-size:0.9rem;" onclick="deleteProduct(${prod.id})">Borrar</button>
                </div>
            </div>
        `;
    });
}

// Form Submission (Add/Edit)
const form = document.getElementById('admin-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const editId = document.getElementById('edit-id').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const desc = document.getElementById('desc').value;
    
    if (editId) {
        // Mode: Edit
        const index = localProducts.findIndex(p => p.id == editId);
        if(index !== -1) {
            localProducts[index].title = title;
            localProducts[index].category = category;
            localProducts[index].price = price;
            localProducts[index].desc = desc;
            // Only update image if a new one was uploaded
            if (base64ImageString !== "") {
                localProducts[index].img = base64ImageString;
            }
        }
    } else {
        // Mode: Add
        const newId = localProducts.length > 0 ? Math.max(...localProducts.map(p => p.id)) + 1 : 1;
        
        let finalImage = base64ImageString;
        if(finalImage === "") {
            // Default placeholder if no image uploaded
            finalImage = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400";
        }

        localProducts.push({
            id: newId,
            title,
            category,
            price,
            desc,
            img: finalImage
        });
    }

    // Persist to localStorage
    localStorage.setItem('productos', JSON.stringify(localProducts));
    
    resetForm();
    renderAdminProducts();
    
    // Smooth scroll down to new item if adding, or simple alert
    alert(editId ? "¡Producto editado correctamente!" : "¡Producto agregado exitosamente!");
});

window.deleteProduct = (id) => {
    if(confirm("🛑 ¿Estás seguro de que deseas borrar este producto?\nNo podrás recuperarlo.")) {
        localProducts = localProducts.filter(p => p.id !== id);
        localStorage.setItem('productos', JSON.stringify(localProducts));
        
        // Remove from cart if someone added it prior to deletion
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(i => i.productId !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        renderAdminProducts();
    }
};

window.editProduct = (id) => {
    const prod = localProducts.find(p => p.id === id);
    if(!prod) return;

    document.getElementById('edit-id').value = prod.id;
    document.getElementById('title').value = prod.title;
    document.getElementById('category').value = prod.category;
    document.getElementById('price').value = prod.price;
    document.getElementById('desc').value = prod.desc;
    
    document.getElementById('form-title').textContent = "Editar Producto";
    document.getElementById('cancel-edit').style.display = 'flex';
    
    const preview = document.getElementById('img-preview');
    preview.src = prod.img;
    preview.style.display = 'block';
    
    // Clear image string so it won't overwrite unless a new file is chosen
    base64ImageString = ""; 
    document.getElementById('image').value = ""; // Clear file input helper

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById('cancel-edit').addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('form-title').textContent = "Agregar Producto";
    document.getElementById('cancel-edit').style.display = 'none';
    document.getElementById('img-preview').style.display = 'none';
    base64ImageString = "";
}

// Kickoff
renderAdminProducts();
