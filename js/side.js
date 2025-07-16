// Format ke Rupiah
function toRupiah(num) {
    return "Rp" + num.toLocaleString("id-ID");
}

// Tambah item ke keranjang
function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Hitung diskon
    let discount = 0;
    const lowerName = name.toLowerCase();

    if (lowerName.includes("pizza")) {
        discount = 0.15;
    } else if (lowerName.includes("tasty burger")) {
        discount = 0.20;
    }

    const finalPrice = Math.round(price * (1 - discount));
    const existing = cart.find((item) => item.name === name);

    if (existing) {
        existing.qty += 1;
        existing.discount = discount;
        existing.finalPrice = finalPrice;
    } else {
        cart.push({
            name,
            price,
            finalPrice,
            discount,
            image,
            qty: 1,
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Tampilkan isi keranjang
function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItems = document.getElementById("cartItems");
    const cartSubtotal = document.getElementById("cartSubtotal");
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";

        const priceDisplay = item.discount > 0
            ? `<del>${toRupiah(item.price)}</del><br/><strong style="color:red">${toRupiah(item.finalPrice)}</strong>`
            : `<span>${toRupiah(item.price)}</span>`;

        itemEl.innerHTML = `
            <button class="remove-item" onclick="removeItem(${index})">&times;</button>
            <img src="${item.image}" class="item-img" />
            <div class="item-details">
              <p class="item-name">${item.name}</p>
              <div class="item-info">
                <span>${item.qty} × ${priceDisplay}</span>
                <div class="qty-buttons">
                  <button onclick="updateQty(${index}, -1)">-</button>
                  <span>${item.qty}</span>
                  <button onclick="updateQty(${index}, 1)">+</button>
                </div>
              </div>
            </div>
        `;
        total += item.finalPrice * item.qty;
        cartItems.appendChild(itemEl);
    });

    cartSubtotal.innerText = toRupiah(total);
}

// Update jumlah
function updateQty(index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart[index]) return;

    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Hapus item
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Buka/Tutup Sidebar
function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("open");
    document.getElementById("cartOverlay").classList.toggle("show");
    updateCartUI();
}

// Checkout
function sendOrderToWhatsApp() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        Swal.fire({
            title: "Keranjang Kosong!",
            text: "Silakan tambahkan item terlebih dahulu sebelum checkout.",
            icon: "warning",
            confirmButtonText: "Oke Siap!",
            confirmButtonColor: "#1f9d3f", // warna merah lembut
        });
        return;
    }

    let message = "*Pesanan Baru:*\n\n";
    let total = 0;
    const invoiceData = [];

    cart.forEach((item, index) => {
        const subtotal = item.qty * item.finalPrice;
        message += `${index + 1}. ${item.name}\n   Qty: ${item.qty} × ${toRupiah(item.finalPrice)} = ${toRupiah(subtotal)}\n`;
        total += subtotal;

        invoiceData.push({
            name: item.name,
            qty: item.qty,
            price: item.finalPrice,
            subtotal: subtotal,
            image: item.image,
        });
    });

    message += `\n*Total: ${toRupiah(total)}*`;
    message += `\n\nSilakan konfirmasi pesanan ini.`;

    // Simpan invoice ke localStorage
    const invoice = {
        items: invoiceData,
        total: total,
        waktu: new Date().toLocaleString("id-ID"),
    };
    localStorage.setItem("invoice", JSON.stringify(invoice));

    // Buka halaman QR
    window.location.href = "qr.html";

    // Kirim WA
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "6285777938815";
    const waLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(waLink, "_blank");
}


// Jalankan saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();

    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", sendOrderToWhatsApp);
    }
});
