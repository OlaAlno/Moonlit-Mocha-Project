function extractPrice(optionText) {
        const priceMatch = optionText.match(/£(\d+\.\d{2})/);
        return priceMatch ? parseFloat(priceMatch[1]) : 0;
    }

    // Calculate total
    function calculateTotal() {
        const drinkSelect = document.getElementById('drinks');
        const foodSelect = document.getElementById('food');
        
        const drinkPrice = extractPrice(drinkSelect.options[drinkSelect.selectedIndex].text);
        const foodPrice = extractPrice(foodSelect.options[foodSelect.selectedIndex].text);
        
        const total = drinkPrice + foodPrice;
        document.getElementById('order-total').textContent = `£${total.toFixed(2)}`;
    }

    // Generate order number
    function generateOrderNumber() {
        return 'MOON-' + Date.now().toString().slice(-6);
    }

    // Order submission
    document.getElementById('order-form').addEventListener('submit', function (event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const drink = document.getElementById('drinks').value;
        const food = document.getElementById('food').value;
        const total = document.getElementById('order-total').textContent;

        if (name && email && drink && food) {
            const orderNumber = generateOrderNumber();
            
            // Store order in localStorage
            const order = {
                number: orderNumber,
                name: name,
                email: email,
                drink: drink,
                food: food,
                total: total,
                status: 'Preparing'
            };
            
            localStorage.setItem(orderNumber, JSON.stringify(order));

            // Show confirmation
            document.getElementById('customer-name-display').textContent = name;
            document.getElementById('order-number-display').textContent = orderNumber;
            document.getElementById('order-total-display').textContent = total;
            document.getElementById('confirmation-message').style.display = 'block';
            
            // Reset form
            this.reset();
            document.getElementById('order-total').textContent = '£0.00';

            // Hide message after 10 seconds
            setTimeout(() => {
                document.getElementById('confirmation-message').style.display = 'none';
            }, 10000);
        }
    });

// Tracking form
// Replace your existing tracking form event listener with this:
document.getElementById('tracking-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const orderNumber = document.getElementById('order-number').value;
    const order = JSON.parse(localStorage.getItem(orderNumber));
    
    if (order) {
        // Display current status immediately
        displayOrderStatus(order);
        
        // Set up interval to check for updates every 2 seconds
        const trackingInterval = setInterval(() => {
            const updatedOrder = JSON.parse(localStorage.getItem(orderNumber));
            if (updatedOrder) {
                displayOrderStatus(updatedOrder);
            }
        }, 2000);
        
        // Store interval ID so we can clear it later
        localStorage.setItem(`tracking-${orderNumber}`, trackingInterval);
    } else {
        const trackingResult = document.getElementById('tracking-result');
        trackingResult.innerHTML = '<p>Order not found</p>';
        trackingResult.style.backgroundColor = '#ff4444';
        trackingResult.style.display = 'block';
    }
});

// Update your simulateOrderProgression function:
function simulateOrderProgression(orderNumber) {
    const statuses = [
        { status: 'Received', time: '1 min' },
        { status: 'Preparing', time: '10-15 mins' },
        { status: 'Ready', time: '5 mins' },
        { status: 'Delivered', time: 'Complete' }
    ];

    let currentStatus = 0;
    
    // Immediately update first status
    updateOrderStatus(orderNumber, statuses[currentStatus]);
    
    // Set up the progression
    const interval = setInterval(() => {
        currentStatus++;
        if (currentStatus < statuses.length) {
            updateOrderStatus(orderNumber, statuses[currentStatus]);
        } else {
            clearInterval(interval);
            localStorage.removeItem(`interval-${orderNumber}`);
        }
    }, 10000); // Change status every 10 seconds
    
    // Store interval ID
    localStorage.setItem(`interval-${orderNumber}`, interval);
}

// Add this helper function:
function updateOrderStatus(orderNumber, status) {
    const order = JSON.parse(localStorage.getItem(orderNumber));
    if (order) {
        order.status = status.status;
        order.timeEstimate = status.time;
        localStorage.setItem(orderNumber, JSON.stringify(order));
    }
}

// Clean up intervals when page closes
window.addEventListener('beforeunload', function() {
    // Clear all tracking intervals
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('tracking-') || key.startsWith('interval-')) {
            clearInterval(parseInt(localStorage.getItem(key)));
            localStorage.removeItem(key);
        }
    }
});