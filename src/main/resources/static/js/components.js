// UI Components Builder for Food Fusion SPA

const Components = {

    // --- Category Scrolling Carousel (20+ Categories using Font Awesome Icons) ---
    homeCuisineChips() {
        const categories = [
            { name: "Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Burger", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "South Indian", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "North Indian", img: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Chinese", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Italian", img: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Arabian", img: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "BBQ & Grill", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Street Food", img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Desserts", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Ice Cream", img: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Beverages", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=120&h=120&q=80" },
            { name: "Healthy Food", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=120&h=120&q=80" }
        ];

        return `
            <div style="margin-bottom: 25px;">
                <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px; color: var(--text-main);">What's on your mind?</h3>
                <div class="categories-circular-row" style="display: flex; gap: 20px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;">
                    ${categories.map(c => `
                        <div class="category-circle-item" onclick="App.navigateTo('category-results', '${c.name}')" style="cursor: pointer; text-align: center; flex-shrink: 0;">
                            <div class="category-circle-img-wrapper" style="width: 75px; height: 75px; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-color); box-shadow: var(--shadow-main); transition: transform 0.2s;">
                                <img src="${c.img}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&h=120&q=80';" alt="${c.name}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <span class="category-circle-label" style="font-size: 11px; font-weight: 700; margin-top: 6px; display: block; color: var(--text-muted);">${c.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // --- Hero Slider Promotion Banners ---
    heroPromoSlider() {
        return `
            <div class="hero-carousel" style="margin-bottom: 30px;">
                <div class="hero-offer-card" onclick="App.applyDirectPromo('WELCOME50')">
                    <div>
                        <span style="font-size: 11px; font-weight: 800; background: rgba(0,0,0,0.15); padding: 3px 8px; border-radius: 20px;"><i class="fa-solid fa-gift me-1"></i>WELCOME OFFER</span>
                        <h2 style="font-size: 22px; font-weight: 800; margin-top: 10px;">Flat ₹50 OFF</h2>
                        <p style="font-size: 12px; opacity: 0.8; margin-top: 4px;">On your very first order</p>
                    </div>
                    <strong style="font-size: 14px; text-transform: uppercase;">Use Code: WELCOME50</strong>
                </div>
                <div class="hero-offer-card blue" onclick="App.applyDirectPromo('FEAST20')">
                    <div>
                        <span style="font-size: 11px; font-weight: 800; background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 20px;"><i class="fa-solid fa-sparkles me-1"></i>SUPER FEASTS</span>
                        <h2 style="font-size: 22px; font-weight: 800; margin-top: 10px;">Save 20% OFF</h2>
                        <p style="font-size: 12px; opacity: 0.8; margin-top: 4px;">On orders above ₹250</p>
                    </div>
                    <strong style="font-size: 14px; text-transform: uppercase;">Use Code: FEAST20</strong>
                </div>
                <div class="hero-offer-card purple" onclick="App.applyDirectPromo('DIWALI200')">
                    <div>
                        <span style="font-size: 11px; font-weight: 800; background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 20px;"><i class="fa-solid fa-fireworks me-1"></i>FESTIVAL VIBES</span>
                        <h2 style="font-size: 22px; font-weight: 800; margin-top: 10px;">Flat ₹200 OFF</h2>
                        <p style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Diwali Family Celebration Deal</p>
                    </div>
                    <strong style="font-size: 14px; text-transform: uppercase;">Use Code: DIWALI200</strong>
                </div>
            </div>
        `;
    },

    // --- Premium Restaurant Card ---
    restaurantCard(r) {
        const offerLabel = r.rating >= 4.5 ? "Buy 1 Get 1 Free" : "Flat 20% OFF (Above ₹149)";
        
        return `
            <div class="card glass-panel" onclick="App.navigateTo('restaurant-details', ${r.id})" style="position:relative;">
                <div class="card-img-wrapper" style="height: 170px; border-radius: 16px 16px 0 0;">
                    <img src="${r.imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';" alt="${r.name}">
                    <span class="card-tag">${r.cuisine || r.cuisineType}</span>
                    <span class="card-rating-tag"><i class="fa-solid fa-star text-warning me-1"></i>${r.rating.toFixed(1)}</span>
                </div>
                <div class="card-body" style="padding: 15px;">
                    <h3 class="card-title" style="font-size: 17px; font-weight: 800; margin-bottom: 4px; color:var(--text-main);">${r.name}</h3>
                    <p class="card-desc" style="font-size: 11px; margin-bottom: 8px;">${r.description || 'Quality meals prepared fresh.'}</p>
                    <div style="font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 8px; display:flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-tag text-warning"></i>${offerLabel}
                    </div>
                    <div class="card-meta" style="font-size: 11px; border-top: 1px solid var(--border-color); padding-top: 8px;">
                        <span><i class="fa-solid fa-location-dot me-1"></i>${r.distance ? r.distance.toFixed(1) : '1.5'} km</span>
                        <span><i class="fa-solid fa-clock me-1"></i>${r.deliveryTimeMin} mins</span>
                        <span>₹${r.minOrderAmount ? r.minOrderAmount.toFixed(0) : '99'} Min</span>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Premium Menu Item Card with Crossed Price & Stats ---
    menuItemCard(item, isOwnerView = false) {
        const vegIcon = item.veg ? '<i class="fa-solid fa-circle-check"></i> VEG' : '<i class="fa-solid fa-circle-xmark"></i> NON-VEG';
        const discountBadge = item.discountPercent && item.discountPercent > 0 
            ? `<span style="font-size:10px; background:rgba(16,185,129,0.1); color:var(--success); font-weight:700; padding:2px 6px; border-radius:4px;">${item.discountPercent}% OFF</span>` 
            : '';
        
        let ribbonHtml = '';
        if (item.isBestSeller || item.bestSeller) {
            ribbonHtml = `<span class="badge-ribbon badge-bestseller"><i class="fa-solid fa-fire me-1"></i>Best Seller</span>`;
        } else if (item.isChefSpecial || item.chefSpecial) {
            ribbonHtml = `<span class="badge-ribbon badge-chefspecial"><i class="fa-solid fa-crown me-1"></i>Chef Special</span>`;
        }

        return `
            <div class="card glass-panel" style="padding:18px; border-radius:16px; display:flex; gap:16px; justify-content:space-between; align-items:center; min-height:165px; position:relative; overflow:hidden;">
                ${ribbonHtml}
                <div style="flex-grow:1; display:flex; flex-direction:column; gap:6px; margin-top: 10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:10px; font-weight:800; color:${item.veg ? '#10b981' : '#ef4444'};">${vegIcon}</span>
                        <span class="loyalty-badge" style="background:var(--border-color); color:var(--text-muted); font-size:9px; padding:2px 6px;">
                            ${item.category}
                        </span>
                    </div>
                    <h4 style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom: 2px;">${item.name}</h4>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="price" style="font-size:15px; font-weight:800;">₹${item.price.toFixed(2)}</span>
                        ${item.originalPrice ? `<span style="font-size:12px; color:var(--text-muted); text-decoration:line-through;">₹${item.originalPrice.toFixed(0)}</span>` : ''}
                        ${discountBadge}
                    </div>
                    
                    <p style="font-size:11px; color:var(--text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-top:2px;">
                        ${item.description || 'Tasty and fresh dish prepared on order.'}
                    </p>
                    
                    <!-- Nutri Stats -->
                    <div style="display:flex; gap:10px; font-size:10px; color:var(--text-muted); margin-top:4px; align-items:center;">
                        <span><i class="fa-solid fa-fire text-danger me-1"></i>${item.calories ? item.calories : '340'} kcal</span>
                        <span><i class="fa-solid fa-dumbbell text-primary me-1"></i>${item.protein ? item.protein : '12g'}</span>
                        <span><i class="fa-solid fa-pepper-hot text-danger me-1"></i>${item.spiceLevel ? item.spiceLevel : 'Medium'}</span>
                    </div>
                </div>
                
                <div style="width:115px; height:115px; flex-shrink:0; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';"
                         style="width:105px; height:105px; object-fit:cover; border-radius:12px; box-shadow:var(--shadow-main);" 
                         alt="${item.name}">
                    <div style="position:absolute; bottom:-8px;">
                        ${isOwnerView ? `
                            <div style="display:flex; gap:4px; background:rgba(15,16,22,0.95); padding:4px; border-radius:8px; border:1px solid var(--border-color);">
                                <button class="btn btn-primary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="event.stopPropagation(); App.showEditMenuItemModal(${item.id})">Edit</button>
                                <button class="btn btn-outline btn-sm" style="padding:2px 6px; font-size:10px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); App.deleteMenuItem(${item.id})">Del</button>
                            </div>
                        ` : `
                            <button class="btn btn-primary btn-sm" style="box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding:5px 16px; border:1px solid rgba(255,255,255,0.15); font-weight:800;" onclick="event.stopPropagation(); App.showCustomizeModal(${item.id})">
                                ADD
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    reviewItem(review) {
        return `
            <div class="glass-panel" style="padding:15px; margin-bottom:12px; border-radius:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
                    <span style="font-weight:700; color:var(--primary);">@${review.user.username}</span>
                    <span style="color:var(--text-muted);">${review.reviewDate.substring(0, 10)}</span>
                </div>
                <div style="color:#fbbf24; font-size:14px; margin-bottom:6px;">${'<i class="fa-solid fa-star"></i>'.repeat(review.rating)}${'<i class="fa-regular fa-star"></i>'.repeat(5 - review.rating)}</div>
                <p style="font-size:13px; line-height:1.4;">${review.reviewText || 'No comments left.'}</p>
                ${review.menuItem ? `<div style="font-size:11px; color:var(--text-muted); margin-top:8px;">Reviewed dish: <strong>${review.menuItem.name}</strong></div>` : ''}
            </div>
        `;
    },

    // --- Shopping Cart Summary ---
    cartSummary(items, subtotal, discount, deliveryFee, platformFee, tax, packagingFee, total, currentTip = 0) {
        return `
            <div class="glass-panel" style="padding:20px; border-radius:16px; position:sticky; top:100px;">
                <h3 style="font-size:20px; font-weight:700; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:10px; color:var(--text-main);"><i class="fa-solid fa-basket-shopping me-2"></i>Order Summary</h3>
                <div style="max-height:220px; overflow-y:auto; margin-bottom:15px; padding-right:5px;">
                    ${items.map(item => `
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px;">
                            <div>
                                <strong style="color:var(--text-main);">${item.menuItem.name}</strong> x ${item.quantity}
                                <div style="font-size:11px; color:var(--text-muted);">${item.customizations || 'Standard'}</div>
                                ${item.memberName ? `<div style="font-size:11px; color:var(--secondary); font-weight:600;">Added by ${item.memberName}</div>` : ''}
                            </div>
                            <div style="text-align:right;">
                                <span>₹${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                                <div style="margin-top:4px;">
                                    <span style="color:var(--primary); cursor:pointer; font-size:11px; font-weight:700;" onclick="App.adjustCartQty(${item.id}, ${item.quantity - 1})"><i class="fa-solid fa-minus"></i></span>
                                    <span style="color:var(--primary); cursor:pointer; font-size:11px; font-weight:700; margin-left:8px;" onclick="App.adjustCartQty(${item.id}, ${item.quantity + 1})"><i class="fa-solid fa-plus"></i></span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Donation Options -->
                <div style="margin-bottom:15px; border-top:1px dashed var(--border-color); padding-top:12px;">
                    <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;">
                        <input type="checkbox" id="donate-checkbox" onchange="App.recalculateCartValues()" style="width:auto;">
                        <span><i class="fa-solid fa-heart text-danger me-1"></i>Donate ₹10 to Feed a Needy Child?</span>
                    </label>
                </div>

                <!-- Delivery Tip Slider -->
                <div style="margin-bottom:15px;">
                    <span style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--text-main);"><i class="fa-solid fa-hand-holding-dollar me-1"></i>Add Tip for Delivery Partner</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn ${currentTip === 0 ? 'btn-primary' : 'btn-outline'} btn-sm" id="tip-0" onclick="App.setDeliveryTip(0)" style="padding:4px 8px; font-size:11px;">No Tip</button>
                        <button class="btn ${currentTip === 20 ? 'btn-primary' : 'btn-outline'} btn-sm" id="tip-20" onclick="App.setDeliveryTip(20)" style="padding:4px 8px; font-size:11px;">₹20</button>
                        <button class="btn ${currentTip === 30 ? 'btn-primary' : 'btn-outline'} btn-sm" id="tip-30" onclick="App.setDeliveryTip(30)" style="padding:4px 8px; font-size:11px;">₹30</button>
                        <button class="btn ${currentTip === 50 ? 'btn-primary' : 'btn-outline'} btn-sm" id="tip-50" onclick="App.setDeliveryTip(50)" style="padding:4px 8px; font-size:11px;">₹50</button>
                    </div>
                </div>

                <div style="border-top:1px dashed var(--border-color); padding-top:15px; font-size:13px; color:var(--text-muted);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>Subtotal:</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#ef4444;">
                        <span>Discount:</span>
                        <span>-₹${discount.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>Delivery Fee:</span>
                        <span>₹${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>Platform Fee:</span>
                        <span>₹${platformFee.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>GST & Govt Taxes (5%):</span>
                        <span>₹${tax.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>Restaurant Packaging:</span>
                        <span>₹${packagingFee.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:15px; font-size:18px; font-weight:800; color:var(--text-main); border-top:1px solid var(--border-color); padding-top:10px;">
                        <span>Total:</span>
                        <span style="color:var(--primary);">₹${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Order Progress Timeline (8 steps, animated) ---
    orderProgressTimeline(track) {
        const statuses = [
            "Order Received", "Restaurant Accepted", "Preparing", "Packed", 
            "Delivery Partner Assigned", "Picked Up", "Near You", "Delivered"
        ];
        
        const timelineList = track.timeline.split(" | ");
        const activeIndex = timelineList.length - 1;

        return `
            <div class="glass-panel" style="padding:24px; border-radius:16px; margin-bottom:30px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div>
                        <h3 style="font-size:20px; font-weight:800; color:var(--text-main);"><i class="fa-solid fa-map-pin text-primary me-2"></i>Live Order Tracking</h3>
                        <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Delivery Agent: <strong>${track.deliveryPartner}</strong></p>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-shield-halved me-1"></i>Share Delivery OTP</span>
                        <div style="font-size:22px; font-weight:800; color:var(--primary);">${track.deliveryOtp || '----'}</div>
                    </div>
                </div>
                
                <ul class="timeline">
                    ${statuses.map((st, idx) => {
                        const isActive = idx <= activeIndex;
                        const timeStr = isActive ? (timelineList[idx] && timelineList[idx].includes("(") ? timelineList[idx].substring(timelineList[idx].indexOf("(") + 1, timelineList[idx].indexOf(")")) : "Active") : '';
                        
                        return `
                            <li class="timeline-item ${isActive ? 'active' : ''}">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size: 13px; font-weight:${isActive ? '700' : '500'};">${st}</span>
                                    ${isActive ? `<span class="timeline-time">${timeStr}</span>` : ''}
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;
    },

    // --- Challenges UI ---
    challengeProgressCard(c) {
        const pct = Math.min(100, Math.round((c.current / c.target) * 100));
        return `
            <div class="badge-item ${c.completed ? 'completed' : ''}">
                <div class="badge-icon"><i class="fa-solid ${c.completed ? 'fa-trophy text-warning' : 'fa-lock text-muted'}"></i></div>
                <div style="flex-grow:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:16px;">${c.name}</strong>
                        <span class="loyalty-badge" style="background:rgba(245,158,11,0.1); color:var(--primary); font-size:11px;">+ ${c.reward}</span>
                    </div>
                    <p style="font-size:12px; color:var(--text-muted); margin:4px 0 10px 0;">${c.description}</p>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="flex-grow:1; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:${c.completed ? 'var(--success)' : 'var(--primary)'}; border-radius:3px;"></div>
                        </div>
                        <span style="font-size:12px; font-weight:700; width:45px; text-align:right;">${c.current}/${c.target}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Build Your Own Combo Builder UI ---
    comboBuilderSection(restaurantMenu) {
        if (!restaurantMenu || restaurantMenu.length === 0) return '';
        
        const starters = restaurantMenu.filter(i => i.category === 'Starters');
        const mains = restaurantMenu.filter(i => i.category === 'Mains');
        const beverages = restaurantMenu.filter(i => i.category === 'Beverages');

        return `
            <div class="glass-panel" style="padding: 24px; border-radius: 16px; margin-bottom: 30px;">
                <h3 style="font-size: 18px; font-weight: 800; color:var(--text-main);"><i class="fa-solid fa-utensils me-2"></i>Build Your Own Combo</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Choose 1 Starter, 1 Main, and 1 Drink to get a flat 15% discount bundle!</p>
                
                <div class="combo-slots-container">
                    <div class="combo-slot">
                        <span style="font-weight:700;">1. Select Starter</span>
                        <select id="combo-starter">
                            <option value="">-- Choose Starter --</option>
                            ${starters.map(s => `<option value="${s.id}">${s.name} (₹${s.price})</option>`).join('')}
                        </select>
                    </div>
                    <div class="combo-slot">
                        <span style="font-weight:700;">2. Select Main Dish</span>
                        <select id="combo-main">
                            <option value="">-- Choose Main --</option>
                            ${mains.map(m => `<option value="${m.id}">${m.name} (₹${m.price})</option>`).join('')}
                        </select>
                    </div>
                    <div class="combo-slot">
                        <span style="font-weight:700;">3. Select Beverage</span>
                        <select id="combo-beverage">
                            <option value="">-- Choose Drink --</option>
                            ${beverages.map(b => `<option value="${b.id}">${b.name} (₹${b.price})</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <button class="btn btn-primary" style="margin-top: 20px; width: 100%;" onclick="App.addCustomComboToCart()">Add Combo Package to Cart <i class="fa-solid fa-cart-shopping ms-1"></i></button>
            </div>
        `;
    },

    // --- Interactive Scratch Card Reward Widget ---
    scratchCardWidget(rewardPoints) {
        return `
            <div class="glass-panel" style="padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 25px;">
                <h3 style="font-size: 16px; font-weight: 800; color:var(--text-main);"><i class="fa-solid fa-ticket me-1"></i>Scratch Card Reward</h3>
                <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 15px 0;">Claim your daily check-in mystery points below.</p>
                
                <div class="scratch-card-container">
                    <div class="scratch-card-box" id="scratch-box" onclick="App.triggerScratchCard(${rewardPoints})">
                        <div class="scratch-card-overlay" id="scratch-overlay">Scratch Here! ✨</div>
                        <span style="font-size: 36px;"><i class="fa-solid fa-trophy text-warning"></i></span>
                        <h4 style="font-size: 18px; font-weight: 800; color: var(--success); margin-top: 6px;">+${rewardPoints} Points</h4>
                        <p style="font-size: 10px; color: var(--text-muted);">Added to Wallet</p>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Dynamic Spending Analytics Dashboard ---
    spendingAnalytics(stats) {
        const total = stats.totalSalesAmount || 2500;
        const pizzaVal = Math.round(total * 0.40);
        const biryaniVal = Math.round(total * 0.35);
        const burgerVal = Math.round(total * 0.15);
        const otherVal = Math.round(total * 0.10);

        return `
            <div class="glass-panel" style="padding: 24px; border-radius: 16px; margin-bottom: 30px;">
                <h3 style="font-size: 18px; font-weight: 800; color:var(--text-main); margin-bottom: 6px;"><i class="fa-solid fa-chart-line me-2"></i>Food Spending Analytics</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">Analyze your monthly dining splits dynamically.</p>
                
                <div class="bar-chart-container">
                    <div class="chart-bar-row">
                        <span class="chart-bar-label"><i class="fa-solid fa-pizza-slice me-1 text-danger"></i>Pizza/Italian</span>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill" style="width: 40%; background: linear-gradient(135deg, #10b981 0%, #059669 100%);"></div>
                        </div>
                        <span class="chart-bar-val">₹${pizzaVal}</span>
                    </div>
                    <div class="chart-bar-row">
                        <span class="chart-bar-label"><i class="fa-solid fa-bowl-food me-1 text-warning"></i>Biryani/Indian</span>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill" style="width: 35%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);"></div>
                        </div>
                        <span class="chart-bar-val">₹${biryaniVal}</span>
                    </div>
                    <div class="chart-bar-row">
                        <span class="chart-bar-label"><i class="fa-solid fa-burger me-1 text-warning"></i>Burgers/Grill</span>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill" style="width: 15%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);"></div>
                        </div>
                        <span class="chart-bar-val">₹${burgerVal}</span>
                    </div>
                    <div class="chart-bar-row">
                        <span class="chart-bar-label"><i class="fa-solid fa-ice-cream me-1 text-info"></i>Desserts/Coffee</span>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill" style="width: 10%; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);"></div>
                        </div>
                        <span class="chart-bar-val">₹${otherVal}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Dashboard: Restaurant Owner Panel ---
    ownerDashboard(report, restaurants, activeOrders, reviewData = null) {
        const reviews = (reviewData && reviewData.reviews) ? reviewData.reviews : [];
        const avgRating = (reviewData && reviewData.averageRating) ? reviewData.averageRating : 0;
        const starCounts = (reviewData && reviewData.starCounts) ? reviewData.starCounts : {};
        const totalReviews = (reviewData && reviewData.totalReviews) ? reviewData.totalReviews : 0;

        return `
            <div class="grid-cols-3" style="margin-bottom:30px;">
                <div class="glass-panel" style="padding:20px; border-radius:12px;">
                    <span style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-wallet me-1 text-success"></i>Total Sales Revenue</span>
                    <h2 style="font-size:28px; font-weight:800; color:var(--success); margin-top:6px;">₹${report.totalSales.toFixed(2)}</h2>
                </div>
                <div class="glass-panel" style="padding:20px; border-radius:12px;">
                    <span style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-truck-ramp-box me-1 text-primary"></i>Completed Deliveries</span>
                    <h2 style="font-size:28px; font-weight:800; color:var(--primary); margin-top:6px;">${report.completedOrders}</h2>
                </div>
                <div class="glass-panel" style="padding:20px; border-radius:12px;">
                    <span style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-receipt me-1 text-warning"></i>Total Orders Logged</span>
                    <h2 style="font-size:28px; font-weight:800; color:var(--secondary); margin-top:6px;">${report.totalOrders}</h2>
                </div>
            </div>

            <div class="grid-cols-2" style="margin-bottom:35px;">
                <div class="glass-panel" style="padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 style="font-size:18px; font-weight:700; color:var(--text-main); margin:0;"><i class="fa-solid fa-store me-2"></i>Your Restaurants</h3>
                        ${restaurants.length > 0 ? `
                            <button class="btn btn-outline btn-sm" style="font-size:11px;" onclick="App.downloadSalesReportPdf(${restaurants[0].id})">
                                <i class="fa-solid fa-file-pdf me-1 text-danger"></i>Download PDF Report
                            </button>
                        ` : ''}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${restaurants.map(rest => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-color); cursor:pointer; transition:all 0.2s;" class="glass-panel" onclick="App.navigateTo('owner-restaurant-details', ${rest.id})">
                                <div>
                                    <strong style="font-size:16px; color:var(--text-main);">${rest.name}</strong>
                                    <div style="font-size:13px; color:var(--text-muted); margin-top:4px;">${rest.cuisineType} | <i class="fa-solid fa-star text-warning me-1"></i>${rest.rating}</div>
                                    <div style="font-size:11px; margin-top:6px;">
                                        <span class="loyalty-badge" style="background:${rest.approvalStatus === 'APPROVED' ? 'var(--success)' : rest.approvalStatus === 'PENDING' ? '#b45309' : 'var(--danger)'}; color:var(--text-main); padding:3px 8px; font-size:10px;">${rest.approvalStatus || 'PENDING'}</span>
                                        <span class="loyalty-badge" style="background:${rest.open ? 'var(--primary)' : 'var(--border-color)'}; color:var(--text-main); padding:3px 8px; font-size:10px; margin-left:6px;">${rest.open ? 'OPEN' : 'CLOSED'}</span>
                                    </div>
                                </div>
                                <div style="color:var(--text-muted);">
                                    <i class="fa-solid fa-chevron-right"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="glass-panel" style="padding:20px;">
                    <h3 style="font-size:18px; font-weight:700; margin-bottom:15px; color:var(--text-main);"><i class="fa-solid fa-award me-2"></i>Best Selling Dishes</h3>
                    <div>
                        ${Object.entries(report.popularItems).length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No sales metrics yet.</p>' : ''}
                        ${Object.entries(report.popularItems).sort((a,b) => b[1] - a[1]).map(([name, count]) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:14px; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                                <span><i class="fa-solid fa-pizza-slice me-2"></i>${name}</span>
                                <strong style="color:var(--primary);">${count} sold</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Reviews Sentiment Audit -->
            <div class="glass-panel" style="padding:20px; margin-bottom:30px; border-radius:16px;">
                <h3 style="font-size:18px; font-weight:700; margin-bottom:20px; color:var(--text-main);"><i class="fa-solid fa-star me-2 text-warning"></i>Customer Reviews Sentiment Audit</h3>
                ${totalReviews === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No customer reviews yet for this restaurant.</p>' : `
                    <div class="grid-cols-2" style="margin-bottom:20px;">
                        <!-- Left: Rating gauge -->
                        <div style="text-align:center; padding:20px;">
                            <div style="font-size:64px; font-weight:900; color:var(--warning, #fbbf24); line-height:1;">${avgRating.toFixed(1)}</div>
                            <div style="color:#fbbf24; font-size:22px; margin:8px 0;">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))}</div>
                            <div style="font-size:13px; color:var(--text-muted);">${totalReviews} total reviews</div>
                        </div>
                        <!-- Right: Star breakdown bars -->
                        <div style="display:flex; flex-direction:column; gap:8px; justify-content:center;">
                            ${[5,4,3,2,1].map(star => {
                                const count = starCounts[star] || 0;
                                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                return `
                                    <div style="display:flex; align-items:center; gap:8px; font-size:12px;">
                                        <span style="min-width:12px; color:var(--text-muted);">${star}</span>
                                        <i class="fa-solid fa-star" style="color:#fbbf24; font-size:11px;"></i>
                                        <div style="flex-grow:1; background:var(--border-color); border-radius:4px; height:8px; overflow:hidden;">
                                            <div style="width:${pct}%; background:var(--primary); height:100%; border-radius:4px; transition:width 0.5s;"></div>
                                        </div>
                                        <span style="min-width:28px; color:var(--text-muted);">${count}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <!-- Review comments list -->
                    <div style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:4px;">
                        ${reviews.slice(0, 20).map(r => `
                            <div style="padding:12px; border-radius:8px; background:var(--bg-card); border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                                    <span style="font-weight:700; color:var(--primary);">@${r.user ? r.user.username : 'Guest'}</span>
                                    <span style="color:#fbbf24;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                                </div>
                                <p style="font-size:13px; color:var(--text-muted); margin:0; line-height:1.5;">${r.reviewText || 'No comment left.'}</p>
                                ${r.menuItem ? `<div style="font-size:11px; color:var(--secondary); margin-top:4px;">Dish: <strong>${r.menuItem.name}</strong></div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            
            <div class="glass-panel" style="padding:20px;">
                <h3 style="font-size:18px; font-weight:700; margin-bottom:15px; color:var(--text-main);"><i class="fa-solid fa-bell me-2"></i>Incoming & Active Orders</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    ${activeOrders.length === 0 ? '<p style="color:var(--text-muted); font-size:13px; padding:10px 0;">No active orders matching this restaurant currently.</p>' : ''}
                    ${activeOrders.map(ord => `
                        <div style="padding:15px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
                                <span>Order <strong>#${ord.id}</strong> by @${ord.user.username}</span>
                                <span class="loyalty-badge" style="background:#b45309; color:var(--text-main);">${ord.status}</span>
                            </div>
                            <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">Address: ${ord.deliveryAddress}</p>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:700; color:var(--primary);">₹${ord.totalAmount.toFixed(2)}</span>
                                <div style="display:flex; gap:10px;">
                                    ${ord.status === 'PLACED' ? `
                                        <button class="btn btn-primary btn-sm" onclick="App.updateOwnerOrderStatus(${ord.id}, 'PREPARING')">Accept & Prepare</button>
                                        <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444;" onclick="App.updateOwnerOrderStatus(${ord.id}, 'CANCELLED')">Reject</button>
                                    ` : ''}
                                    ${ord.status === 'PREPARING' ? `
                                        <button class="btn btn-secondary btn-sm" onclick="App.updateOwnerOrderStatus(${ord.id}, 'PICKED_UP')">Mark Handed to Driver</button>
                                    ` : ''}
                                    <button class="btn btn-outline btn-sm" onclick="App.showChatModal(${ord.id})"><i class="fa-solid fa-comment me-1"></i>Customer Chat</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // --- Dashboard: Delivery Partner Portal ---
    deliveryDashboard(report, availableOrders, myActiveOrders, activeVehicle = 'SCOOTER') {
        const completedRuns = (report.myOrders || []).filter(o => o.status === 'DELIVERED');

        return `
            <div class="delivery-stats-card" style="margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div class="delivery-stat-title"><i class="fa-solid fa-wallet me-2 text-success"></i>Today's Earnings</div>
                        <div class="delivery-stat-value">₹${report.totalEarnings.toFixed(2)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="delivery-stat-title">Status</div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <h2 style="font-size:20px; font-weight:800; color:${report.available ? '#10b981' : '#ef4444'}; margin:0;">
                                ${report.available ? 'Online' : 'Offline'}
                            </h2>
                            <button class="btn btn-${report.available ? 'outline' : 'primary'} btn-sm" onclick="App.toggleDeliveryAvailability()">
                                ${report.available ? 'Go Offline' : 'Go Online'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid-cols-2">
                <!-- Available Orders -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-size:20px; font-weight:800; color:var(--text-main); margin:0;"><i class="fa-solid fa-bolt me-2 text-warning"></i>New Orders</h3>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <select id="vehicle-selector" onchange="App.changeVehicle(this.value)" style="padding:6px 12px; font-size:12px; background:var(--border-color); border-radius:8px; color:var(--text-main); border:1px solid var(--border-color); font-weight:600;">
                                <option value="BICYCLE" ${activeVehicle === 'BICYCLE' ? 'selected' : ''}>Bicycle</option>
                                <option value="SCOOTER" ${activeVehicle === 'SCOOTER' ? 'selected' : ''}>Scooter</option>
                                <option value="MOTORBIKE" ${activeVehicle === 'MOTORBIKE' ? 'selected' : ''}>Motorbike</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display:flex; flex-direction:column;">
                        ${availableOrders.length === 0 ? '<div class="glass-panel" style="padding:40px; text-align:center; color:var(--text-muted);"><i class="fa-solid fa-mug-hot" style="font-size:32px; margin-bottom:16px; opacity:0.5;"></i><br>No new orders nearby. Take a breather.</div>' : ''}
                        ${availableOrders.map(ord => `
                            <div class="delivery-order-card">
                                <div class="delivery-payout-badge">₹${(ord.deliveryFee + (ord.deliveryTip || 0)).toFixed(2)}</div>
                                
                                <div class="delivery-map-placeholder">
                                    <i class="fa-solid fa-map-location-dot"></i>
                                </div>

                                <div class="delivery-address-block">
                                    <div class="delivery-address-icon">
                                        <i class="fa-solid fa-shop" style="color:var(--primary);"></i>
                                        <div class="delivery-address-line"></div>
                                        <i class="fa-solid fa-location-dot" style="color:var(--success);"></i>
                                    </div>
                                    <div style="flex:1;">
                                        <div style="margin-bottom:16px;">
                                            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Pickup (${ord.restaurant.distance} km away)</div>
                                            <div style="font-size:16px; font-weight:700; color:var(--text-main);">${ord.restaurant.name}</div>
                                        </div>
                                        <div>
                                            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Drop-off</div>
                                            <div style="font-size:14px; font-weight:500; color:var(--text-main);">${ord.deliveryAddress}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button class="btn-accept-delivery" onclick="App.acceptDeliveryOrder(${ord.id})">ACCEPT DELIVERY</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Active Runs -->
                <div>
                    <h3 style="font-size:20px; font-weight:800; margin-bottom:16px; color:var(--text-main);"><i class="fa-solid fa-route me-2 text-primary"></i>Active Deliveries</h3>
                    <div style="display:flex; flex-direction:column;">
                        ${myActiveOrders.length === 0 ? '<div class="glass-panel" style="padding:40px; text-align:center; color:var(--text-muted);"><i class="fa-solid fa-check-double" style="font-size:32px; margin-bottom:16px; opacity:0.5;"></i><br>You are all caught up!</div>' : ''}
                        ${myActiveOrders.map(ord => {
                            let s1='active', s2='', s3='';
                            if (ord.status === 'PICKED_UP') { s1='completed'; s2='active'; }
                            if (ord.status === 'ON_THE_WAY') { s1='completed'; s2='completed'; s3='active'; }

                            return `
                                <div class="delivery-order-card" style="border-color:rgba(99,102,241,0.3);">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                                        <div>
                                            <span style="font-size:11px; font-weight:700; color:var(--primary); background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:4px; text-transform:uppercase;">ORDER #${ord.id}</span>
                                        </div>
                                        <button class="btn btn-outline btn-sm" onclick="App.showChatModal(${ord.id})"><i class="fa-solid fa-phone me-1"></i>Contact</button>
                                    </div>
                                    
                                    <div style="font-size:18px; font-weight:800; color:var(--text-main); margin-bottom:4px;">${ord.restaurant.name}</div>
                                    <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;"><i class="fa-solid fa-map-pin me-2"></i>${ord.deliveryAddress}</p>
                                    
                                    <div class="delivery-progress-steps">
                                        <div class="delivery-step ${s1}"><i class="fa-solid fa-fire-burner"></i></div>
                                        <div class="delivery-step ${s2}"><i class="fa-solid fa-box"></i></div>
                                        <div class="delivery-step ${s3}"><i class="fa-solid fa-house"></i></div>
                                    </div>

                                    <div style="margin-top:20px;">
                                        ${ord.status === 'PREPARING' ? `
                                            <button class="btn btn-primary" style="width:100%; padding:12px; font-size:14px;" onclick="App.updateDeliveryOrderStatus(${ord.id}, 'PICKED_UP')">Confirm Pickup at Restaurant</button>
                                        ` : ''}
                                        ${ord.status === 'PICKED_UP' ? `
                                            <button class="btn btn-secondary" style="width:100%; padding:12px; font-size:14px;" onclick="App.updateDeliveryOrderStatus(${ord.id}, 'ON_THE_WAY')">Start Navigation to Customer</button>
                                        ` : ''}
                                        ${ord.status === 'ON_THE_WAY' ? `
                                            <div style="background:rgba(0,0,0,0.2); padding:16px; border-radius:12px; border:1px solid var(--border-color);">
                                                <div style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:8px; text-align:center;">ASK CUSTOMER FOR 4-DIGIT PIN</div>
                                                <div style="display:flex; gap:8px;">
                                                    <input type="text" id="otp-input-${ord.id}" placeholder="Enter PIN..." style="padding:12px; font-size:16px; font-weight:700; text-align:center; background:var(--bg-input); border-radius:8px; color:var(--text-main); border:1px solid var(--border-color); flex-grow:1; letter-spacing:4px;">
                                                    <button class="btn btn-success" style="padding:12px 24px; font-weight:800; background:var(--success); color:var(--text-main); border:none; border-radius:8px;" onclick="App.completeDeliveryWithOtp(${ord.id})"><i class="fa-solid fa-check"></i></button>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Earnings Breakdown History log -->
            <div class="glass-panel" style="padding:24px; margin-top:16px; border-radius:16px;">
                <h3 style="font-size:18px; font-weight:800; color:var(--text-main); margin-bottom:16px;"><i class="fa-solid fa-receipt me-2 text-muted"></i>Payout History</h3>
                <div style="max-height:250px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; padding-right:8px;">
                    ${completedRuns.length === 0 ? '<div style="text-align:center; color:var(--text-muted); font-size:13px; padding:20px;">No completed shipments logged.</div>' : ''}
                    ${completedRuns.map(run => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-color);">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <div style="width:40px; height:40px; border-radius:50%; background:rgba(16,185,129,0.1); display:flex; align-items:center; justify-content:center; color:var(--success);"><i class="fa-solid fa-check"></i></div>
                                <div>
                                    <div style="font-weight:700; font-size:14px; color:var(--text-main);">${run.restaurant.name}</div>
                                    <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Order #${run.id}</div>
                                </div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:18px; font-weight:800; color:var(--success);">₹${(run.deliveryFee + (run.deliveryTip || 0)).toFixed(2)}</div>
                                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Fee: ₹${run.deliveryFee.toFixed(2)} <span style="margin:0 4px;">•</span> Tip: ₹${(run.deliveryTip || 0).toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // --- Dashboard: Admin Panel ---
    adminDashboard(stats, users = [], restaurants = [], coupons = [], orders = []) {
        const dishSales = stats.dishSales || {};
        const dishEntries = Object.entries(dishSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

        let dishRows = '';
        if (dishEntries.length === 0) {
            dishRows = '<div style="text-align:center; color:var(--text-muted); padding:40px;"><i class="fa-solid fa-utensils" style="font-size:32px; opacity:0.5; margin-bottom:16px;"></i><br>No sales metrics available yet.</div>';
        } else {
            dishRows = dishEntries.map(([dish, quantity], index) => {
                let badge = '';
                if (index === 0) badge = '<span style="background:#fbbf24; color:#000; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:800; margin-right:12px;"><i class="fa-solid fa-medal"></i> 1ST</span>';
                else if (index === 1) badge = '<span style="background:#94a3b8; color:#000; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:800; margin-right:12px;"><i class="fa-solid fa-medal"></i> 2ND</span>';
                else if (index === 2) badge = '<span style="background:#b45309; color:#fff; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:800; margin-right:12px;"><i class="fa-solid fa-medal"></i> 3RD</span>';
                else badge = `<span style="color:var(--text-muted); font-size:12px; font-weight:800; margin-right:16px; min-width:40px; display:inline-block; text-align:center;">#${index+1}</span>`;

                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-radius:12px; background:var(--bg-input); margin-bottom:12px; border:1px solid var(--border-color);">
                        <div style="display:flex; align-items:center;">
                            ${badge}
                            <span style="font-size:15px; font-weight:700; color:var(--text-main);">${dish}</span>
                        </div>
                        <span style="font-size:14px; font-weight:800; color:var(--primary);">${quantity} Sold</span>
                    </div>
                `;
            }).join('');
        }

        return `
            <!-- Top KPIs -->
            <div class="grid-cols-4" style="margin-bottom:32px;">
                <div class="admin-metric-card">
                    <i class="fa-solid fa-chart-line admin-metric-icon"></i>
                    <div class="admin-metric-title">Total Platform Sales</div>
                    <div class="admin-metric-value" style="color:#10b981;">₹${stats.totalSalesAmount.toFixed(2)}</div>
                </div>
                <div class="admin-metric-card">
                    <i class="fa-solid fa-wallet admin-metric-icon"></i>
                    <div class="admin-metric-title">Platform Revenue</div>
                    <div class="admin-metric-value" style="color:#f59e0b;">₹${stats.totalPlatformRevenue.toFixed(2)}</div>
                </div>
                <div class="admin-metric-card">
                    <i class="fa-solid fa-users admin-metric-icon"></i>
                    <div class="admin-metric-title">Active Users</div>
                    <div class="admin-metric-value" style="color:#3b82f6;">${stats.totalUsers}</div>
                </div>
                <div class="admin-metric-card">
                    <i class="fa-solid fa-store admin-metric-icon"></i>
                    <div class="admin-metric-title">Partner Restaurants</div>
                    <div class="admin-metric-value" style="color:#ec4899;">${stats.totalRestaurants}</div>
                </div>
            </div>

            <div class="grid-cols-2" style="margin-bottom:32px;">
                <!-- Top 5 Dishes Leaderboard -->
                <div class="glass-panel" style="padding:24px;">
                    <div class="admin-card-header">
                        <h3><i class="fa-solid fa-crown me-2 text-warning"></i>Top 5 Trending Dishes</h3>
                    </div>
                    <div>${dishRows}</div>
                </div>

                <!-- Restaurant Onboarding CRM -->
                <div class="glass-panel" style="padding:24px;">
                    <div class="admin-card-header">
                        <h3><i class="fa-solid fa-handshake me-2 text-success"></i>Partner Approvals</h3>
                        <span class="admin-status-badge badge-pending">${restaurants.filter(r => r.approvalStatus === 'PENDING').length} Pending</span>
                    </div>
                    <div style="max-height:300px; overflow-y:auto; padding-right:8px;">
                        ${restaurants.filter(r => r.approvalStatus === 'PENDING').length === 0 ? '<div style="text-align:center; color:var(--text-muted); padding:40px;"><i class="fa-solid fa-check-double" style="font-size:32px; opacity:0.5; margin-bottom:16px;"></i><br>All caught up! No pending approvals.</div>' : ''}
                        
                        <table class="admin-table">
                            ${restaurants.filter(r => r.approvalStatus === 'PENDING').map(r => `
                                <tr>
                                    <td>
                                        <div style="font-size:14px; font-weight:800; color:var(--text-main); margin-bottom:4px;">${r.name}</div>
                                        <div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-utensils me-1"></i>${r.cuisineType}</div>
                                    </td>
                                    <td>
                                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Owner</div>
                                        <div style="font-size:13px; color:var(--text-main);">@${r.owner.username}</div>
                                    </td>
                                    <td style="text-align:right;">
                                        <button class="btn btn-success btn-sm" style="margin-bottom:4px; width:100%;" onclick="App.approveRestaurant(${r.id}, 'APPROVED')"><i class="fa-solid fa-check me-1"></i>Approve</button>
                                        <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444; width:100%;" onclick="App.approveRestaurant(${r.id}, 'REJECTED')"><i class="fa-solid fa-xmark me-1"></i>Reject</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            </div>

            <!-- Live Order Control Tower -->
            <div class="glass-panel" style="padding:24px; margin-bottom:32px;">
                <div class="admin-card-header">
                    <h3><i class="fa-solid fa-satellite-dish me-2 text-danger"></i>Operations Control Tower</h3>
                    <span class="admin-status-badge badge-info">Live Tracker</span>
                </div>
                <div style="overflow-x:auto;">
                    <table class="admin-table" style="min-width:800px;">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Restaurant</th>
                                <th>Delivery Address</th>
                                <th>Status</th>
                                <th>Assign Fleet</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length === 0 ? '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">No active orders on the platform.</td></tr>' : ''}
                            ${orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').map(o => {
                                const drivers = users.filter(u => u.role === 'DELIVERY');
                                let statusBadgeClass = 'badge-info';
                                if(o.status === 'PREPARING') statusBadgeClass = 'badge-pending';
                                if(o.status === 'ON_THE_WAY') statusBadgeClass = 'badge-success';
                                
                                return `
                                    <tr>
                                        <td>
                                            <div style="font-size:14px; font-weight:800; color:var(--primary);">#${o.id}</div>
                                        </td>
                                        <td>
                                            <div style="font-size:13px; font-weight:700; color:var(--text-main);">${o.restaurant.name}</div>
                                        </td>
                                        <td>
                                            <div style="font-size:12px; color:var(--text-muted); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${o.deliveryAddress}"><i class="fa-solid fa-map-pin me-1"></i>${o.deliveryAddress}</div>
                                        </td>
                                        <td>
                                            <span class="admin-status-badge ${statusBadgeClass}">${o.status}</span>
                                        </td>
                                        <td>
                                            <select id="dispatch-driver-${o.id}" style="width:100%; padding:8px; font-size:12px; background:var(--bg-input); border-radius:8px; color:var(--text-main); border:1px solid var(--border-color); font-weight:600;">
                                                <option value="">Auto-Assign / Select Driver</option>
                                                ${drivers.map(d => `<option value="${d.id}" ${o.deliveryPartner && o.deliveryPartner.id === d.id ? 'selected' : ''}>@${d.username} (Fleet)</option>`).join('')}
                                            </select>
                                        </td>
                                        <td style="text-align:right;">
                                            <button class="btn btn-primary" style="padding:8px 16px; font-size:12px;" onclick="App.dispatchOrder(${o.id})"><i class="fa-solid fa-paper-plane me-1"></i>Dispatch</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bottom Sections -->
            <div class="grid-cols-2" style="margin-bottom:32px;">
                <!-- Promo Coupons -->
                <div class="glass-panel" style="padding:24px;">
                    <div class="admin-card-header">
                        <h3><i class="fa-solid fa-tags me-2 text-warning"></i>Promo Campaigns</h3>
                        <button class="btn btn-primary btn-sm" onclick="App.showCreateCouponModal()">+ Create Code</button>
                    </div>
                    <div style="max-height:300px; overflow-y:auto; padding-right:8px;">
                        <table class="admin-table">
                            ${coupons.map(c => `
                                <tr>
                                    <td>
                                        <div style="font-size:16px; font-weight:800; color:var(--primary); letter-spacing:1px; margin-bottom:4px;">${c.code}</div>
                                        <div style="font-size:11px; color:var(--text-muted);">${c.description}</div>
                                    </td>
                                    <td>
                                        <span class="admin-status-badge ${c.active ? 'badge-success' : 'badge-pending'}">
                                            ${c.active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td style="text-align:right;">
                                        <button class="btn btn-${c.active ? 'secondary' : 'primary'} btn-sm" style="margin-bottom:4px; width:80px;" onclick="App.toggleCouponStatus(${c.id})">${c.active ? 'Disable' : 'Enable'}</button>
                                        <br>
                                        <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444; width:80px;" onclick="App.deleteCoupon(${c.id})"><i class="fa-solid fa-trash-can"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>

                <!-- Account Management -->
                <div class="glass-panel" style="padding:24px;">
                    <div class="admin-card-header">
                        <h3><i class="fa-solid fa-users-gear me-2 text-info"></i>Account Management</h3>
                    </div>
                    <div style="max-height:300px; overflow-y:auto; padding-right:8px;">
                        <table class="admin-table">
                            ${users.map(u => `
                                <tr>
                                    <td>
                                        <div style="font-size:14px; font-weight:700; color:var(--text-main); margin-bottom:2px;">@${u.username}</div>
                                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px;">${u.email}</div>
                                        <span class="admin-status-badge badge-info" style="background:var(--border-color); color:#9ca3af; border:none;">${u.role}</span>
                                        <span class="admin-status-badge ${u.active ? 'badge-success' : 'badge-pending'}" style="border:none; margin-left:4px;">${u.active ? 'Active' : 'Banned'}</span>
                                    </td>
                                    <td style="text-align:right;">
                                        <select onchange="App.changeUserRole(${u.id}, this.value)" style="padding:6px; font-size:11px; background:var(--bg-input); border-radius:6px; color:var(--text-main); border:1px solid var(--border-color); margin-bottom:8px; width:100%;">
                                            <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>Customer</option>
                                            <option value="OWNER" ${u.role === 'OWNER' ? 'selected' : ''}>Owner</option>
                                            <option value="DELIVERY" ${u.role === 'DELIVERY' ? 'selected' : ''}>Delivery</option>
                                            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                                        </select>
                                        <button class="btn btn-${u.active ? 'secondary' : 'primary'} btn-sm" style="width:100%;" onclick="App.toggleUserStatus(${u.id})">
                                            ${u.active ? '<i class="fa-solid fa-ban me-1"></i>Ban User' : '<i class="fa-solid fa-check me-1"></i>Unban'}
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Owner Restaurant Management ---
    ownerRestaurantManagement(restaurant, menuItems) {
        return `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:25px;">
                <div>
                    <button class="btn btn-secondary btn-sm" style="margin-bottom:12px;" onclick="App.navigateTo('dashboard')"><i class="fa-solid fa-arrow-left me-1"></i>Back to Dashboard</button>
                    <h2><i class="fa-solid fa-store me-2 text-primary"></i>${restaurant.name}</h2>
                    <div style="color:var(--text-muted); font-size:14px; margin-top:5px;">
                        ${restaurant.cuisineType} | <i class="fa-solid fa-star text-warning me-1"></i>${restaurant.rating} | 
                        <span class="loyalty-badge" style="background:${restaurant.approvalStatus === 'APPROVED' ? 'var(--success)' : restaurant.approvalStatus === 'PENDING' ? '#b45309' : 'var(--danger)'}; color:var(--text-main); padding:2px 8px; font-size:11px; margin-left:6px;">${restaurant.approvalStatus || 'PENDING'}</span>
                        <span class="loyalty-badge" style="background:${restaurant.open ? 'var(--primary)' : 'var(--border-color)'}; color:var(--text-main); padding:2px 8px; font-size:11px; margin-left:6px;">${restaurant.open ? 'OPEN' : 'CLOSED'}</span>
                    </div>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                    <button class="btn btn-${restaurant.open ? 'secondary' : 'success'} btn-sm" onclick="App.toggleRestaurantStatus(${restaurant.id})">
                        <i class="fa-solid fa-power-off me-1"></i>${restaurant.open ? 'Close Restaurant' : 'Open Restaurant'}
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="App.downloadSalesReportPdf(${restaurant.id})">
                        <i class="fa-solid fa-file-pdf me-1 text-danger"></i>PDF Report
                    </button>
                    <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444;" onclick="App.deleteRestaurant(${restaurant.id})">
                        <i class="fa-solid fa-trash-can me-1"></i>Delete Restaurant
                    </button>
                </div>
            </div>

            <div class="glass-panel" style="padding:20px; margin-bottom:30px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0; font-size:20px;"><i class="fa-solid fa-utensils me-2 text-warning"></i>Menu Management</h3>
                    <button class="btn btn-primary" onclick="App.showAddMenuItemModal(${restaurant.id})">
                        <i class="fa-solid fa-plus me-1"></i>Add New Dish
                    </button>
                </div>

                ${menuItems.length === 0 ? '<p style="color:var(--text-muted); font-size:14px; text-align:center; padding:40px 0;">No dishes added to this menu yet.</p>' : ''}
                
                <div class="grid-cols-2" style="gap:20px;">
                    ${menuItems.map(item => `
                        <div class="menu-item-card" style="padding:15px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-color); display:flex; gap:15px;">
                            <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="${item.name}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;">
                            <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                                <div>
                                    <div style="display:flex; justify-content:space-between;">
                                        <h4 style="margin:0; font-size:16px; color:var(--text-main); font-weight:700;">
                                            ${item.isVeg ? '<i class="fa-solid fa-leaf text-success me-1" title="Vegetarian"></i>' : '<i class="fa-solid fa-drumstick-bite text-danger me-1" title="Non-Vegetarian"></i>'}
                                            ${item.name}
                                        </h4>
                                        <div style="font-weight:800; color:var(--primary); font-size:16px;">₹${item.price.toFixed(2)}</div>
                                    </div>
                                    <div style="font-size:12px; color:var(--text-muted); margin:4px 0;">${item.category}</div>
                                    <p style="font-size:13px; color:var(--text-muted); margin:6px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.description || 'No description provided.'}</p>
                                </div>
                                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
                                    <!-- Edit disabled for now, but UI ready for future extension -->
                                    <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444;" onclick="App.deleteMenuItem(${item.id})">
                                        <i class="fa-solid fa-trash-can me-1"></i>Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

