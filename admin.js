document.addEventListener(“DOMContentLoaded”, () => {
const ordersTable = document.getElementById(“ordersTable”);
const refreshButton = document.getElementById(“refreshButton”);

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const processingOrders = document.getElementById("processingOrders");
const completedOrders = document.getElementById("completedOrders");
const modal = document.getElementById("orderDetailsModal");
const detailsContent = document.getElementById("orderDetailsContent");
const closeButton = document.getElementById("closeDetailsButton");
const closeFooter = document.getElementById("closeDetailsFooter");
let orders = [];
const STATUS_OPTIONS = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
function getOrderId(order) {
    return order.id ?? order.orderId ?? order.reference;
}
function getStatus(order) {
    return String(order.status || "pending").toLowerCase();
}
function updateSummary() {
    totalOrders.textContent = orders.length;
    pendingOrders.textContent = orders.filter(
        order => getStatus(order) === "pending"
    ).length;
    processingOrders.textContent = orders.filter(
        order => getStatus(order) === "processing"
    ).length;
    completedOrders.textContent = orders.filter(
        order => getStatus(order) === "delivered"
    ).length;
}
function showDetails(order) {
    const fields = [
        ["Order Reference", getOrderId(order)],
        ["Customer", order.customerName ?? order.name],
        ["Email", order.email],
        ["Phone", order.phone],
        ["Platform", order.platform],
        ["Service", order.service],
        ["Customer Link / Username", order.link ?? order.username],
        ["Quantity", order.quantity],
        ["Price", order.price ?? order.total],
        ["Status", getStatus(order)],
        ["Date", order.createdAt ?? order.date],
        ["Additional Details", order.details]
    ];
    detailsContent.innerHTML = fields
        .filter(([, value]) =>
            value !== undefined && value !== null && value !== ""
        )
        .map(([label, value]) => `
            <div class="detail-row">
                <span class="detail-label">${escapeHTML(label)}</span>
                <span class="detail-value">${escapeHTML(value)}</span>
            </div>
        `)
        .join("");
    modal.style.display = "block";
}
function closeDetails() {
    modal.style.display = "none";
}
if (closeButton) {
    closeButton.addEventListener("click", closeDetails);
}
if (closeFooter) {
    closeFooter.addEventListener("click", closeDetails);
}
if (modal) {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeDetails();
        }
    });
}
async function loadOrders() {
    refreshButton.disabled = true;
    ordersTable.innerHTML = `
        <tr>
            <td colspan="8" class="empty-message">Loading orders...</td>
        </tr>
    `;
    try {
        const response = await fetch("/api/orders", {
            headers: {
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }
        const data = await response.json();
        orders = Array.isArray(data)
            ? data
            : Array.isArray(data.orders)
                ? data.orders
                : [];
        renderOrders();
    } catch (error) {
        console.error("Could not load orders:", error);
        orders = [];
        updateSummary();
        ordersTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    Could not load orders. Check that the server is running
                    and try again.
                </td>
            </tr>
        `;
    } finally {
        refreshButton.disabled = false;
    }
}
function renderOrders() {
    updateSummary();
    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    No customer orders found.
                </td>
            </tr>
        `;
        return;
    }
    ordersTable.innerHTML = orders.map((order, index) => {
        const reference = getOrderId(order) ?? index + 1;
        const status = getStatus(order);
        const statusOptions = STATUS_OPTIONS.map(option => `
            <option value="${option}"
                ${status === option ? "selected" : ""}>
                ${option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
        `).join("");
        const service = order.service ??
            (Array.isArray(order.items)
                ? order.items.map(item => item.name).join(", ")
                : "");
        return `
            <tr>
                <td>${escapeHTML(reference)}</td>
                <td>${escapeHTML(order.platform)}</td>
                <td>${escapeHTML(service)}</td>
                <td>${escapeHTML(order.link ?? order.username)}</td>
                <td>${escapeHTML(order.quantity)}</td>
                <td>${escapeHTML(order.price ?? order.total ?? "")}</td>
                <td>
                    <select
                        data-status-order="${escapeHTML(reference)}"
                        aria-label="Status for order ${escapeHTML(reference)}">
                        ${statusOptions}
                    </select>
                </td>
                <td>
                    <button
                        type="button"
                        class="details-button"
                        data-details-index="${index}">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join("");
    ordersTable.querySelectorAll("[data-status-order]").forEach(select => {
        select.addEventListener("change", async () => {
            await updateOrderStatus(
                select.dataset.statusOrder,
                select.value,
                select
            );
        });
    });
    ordersTable.querySelectorAll("[data-details-index]").forEach(button => {
        button.addEventListener("click", () => {
            const order = orders[Number(button.dataset.detailsIndex)];
            if (order) {
                showDetails(order);
            }
        });
    });
}
async function updateOrderStatus(orderId, status, select) {
    const order = orders.find(item =>
        String(getOrderId(item)) === String(orderId)
    );
    if (!order) {
        alert("Could not find this order. Refresh the dashboard.");
        return;
    }
    const oldStatus = getStatus(order);
    select.disabled = true;
    try {
        const response = await fetch(
            `/api/orders/${encodeURIComponent(orderId)}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    status: status.toLowerCase()
                })
            }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(
                result.message || `Server returned HTTP ${response.status}`
            );
        }
        if (result.order) {
            order.status = result.order.status;
        } else {
            order.status = status.toLowerCase();
        }
        renderOrders();
    } catch (error) {
        console.error("Could not save order status:", error);
        alert(
            `Could not save the status: ${error.message}\n\n` +
            "The previous status will be restored."
        );
        order.status = oldStatus;
        renderOrders();
    }
}
refreshButton.addEventListener("click", loadOrders);
loadOrders();

});