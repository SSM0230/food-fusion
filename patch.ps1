$content = Get-Content -Raw "C:\full stack\front-end\Food-Fusion\src\main\java\com\foodfusion\app\config\DataSeeder.java"
$startString = "    private String getRestaurantLogo"
$parts = $content -split $startString, 2
$newMethods = @"
    private String getRestaurantLogo(String restName) {
        String name = restName.toLowerCase();
        int hash = Math.abs(name.hashCode());
        String baseUrl = `"https://images.unsplash.com/photo-1546069901-ba9599a7e63c`";
        
        if (name.contains(`"behrouz`") || name.contains(`"paradise`") || name.contains(`"meghana`") || name.contains(`"biryani blues`") || name.contains(`"ss hyderabad`")) {
            baseUrl = `"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8`";
        } else if (name.contains(`"domino`") || name.contains(`"pizza hut`") || name.contains(`"pino`") || name.contains(`"mojo`") || name.contains(`"oven story`")) {
            baseUrl = `"https://images.unsplash.com/photo-1513104890138-7c749659a591`";
        } else if (name.contains(`"mcdonald`") || name.contains(`"burger king`") || name.contains(`"burger singh`") || name.contains(`"wendy`") || name.contains(`"louis`")) {
            baseUrl = `"https://images.unsplash.com/photo-1568901346375-23c9450c58cd`";
        } else if (name.contains(`"saravana`") || name.contains(`"murugan`") || name.contains(`"sangeetha`") || name.contains(`"a2b`") || name.contains(`"kuppanna`")) {
            baseUrl = `"https://images.unsplash.com/photo-1668236543090-82eba5ee5976`";
        } else if (name.contains(`"punjab grill`") || name.contains(`"barbeque nation`") || name.contains(`"bikanervala`") || name.contains(`"curry house`") || name.contains(`"delhi darbar`")) {
            baseUrl = `"https://images.unsplash.com/photo-1601050690597-df056fb4ce78`";
        } else if (name.contains(`"chinese wok`") || name.contains(`"wow china`") || name.contains(`"mainland china`") || name.contains(`"beijing bites`") || name.contains(`"noodle bar`")) {
            baseUrl = `"https://images.unsplash.com/photo-1585032226651-759b368d7246`";
        } else if (name.contains(`"toscano`") || name.contains(`"little italy`") || name.contains(`"pasta street`") || name.contains(`"pizza palace`") || name.contains(`"cafe italia`")) {
            baseUrl = `"https://images.unsplash.com/photo-1546549032-9571cd6b27df`";
        } else if (name.contains(`"al taza`") || name.contains(`"mandi house`") || name.contains(`"zam zam`") || name.contains(`"arabian hut`") || name.contains(`"grill palace`")) {
            baseUrl = `"https://images.unsplash.com/photo-1541518763669-27fef04b14ea`";
        } else if (name.contains(`"absolute bbq`") || name.contains(`"grill box`") || name.contains(`"smoke house`") || name.contains(`"bbq pride`")) {
            baseUrl = `"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd`";
        } else if (name.contains(`"chaat corner`") || name.contains(`"bombay street`") || name.contains(`"delhi chaat`") || name.contains(`"food street`") || name.contains(`"chatpata`")) {
            baseUrl = `"https://images.unsplash.com/photo-1606491956689-2ea866880c84`";
        } else if (name.contains(`"sweet truth`") || name.contains(`"belgian waffle`") || name.contains(`"cakezone`") || name.contains(`"frozen bottle`") || name.contains(`"dessert heaven`")) {
            baseUrl = `"https://images.unsplash.com/photo-1578985545062-69928b1d9587`";
        } else if (name.contains(`"baskin robbins`") || name.contains(`"ibaco`") || name.contains(`"naturals`") || name.contains(`"cream stone`") || name.contains(`"polar bear`")) {
            baseUrl = `"https://images.unsplash.com/photo-1576506295286-5cda18df43e7`";
        } else if (name.contains(`"starbucks`") || name.contains(`"chaayos`") || name.contains(`"tea time`") || name.contains(`"coffee day`") || name.contains(`"kumbakonam`")) {
            baseUrl = `"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd`";
        } else if (name.contains(`"ovenfresh`") || name.contains(`"bakers hub`") || name.contains(`"french loaf`") || name.contains(`"baking room`")) {
            baseUrl = `"https://images.unsplash.com/photo-1509440159596-0249088772ff`";
        } else if (name.contains(`"freshmenu`") || name.contains(`"salad days`") || name.contains(`"eatfit`") || name.contains(`"health bowl`") || name.contains(`"green kitchen`")) {
            baseUrl = `"https://images.unsplash.com/photo-1512621776951-a57141f2eefd`";
        }
        
        return baseUrl + "?auto=format&fit=crop&w=150&h=150&q=80&sig=" + hash;
    }

    private String getRestaurantCover(String restName) {
        return getRestaurantLogo(restName).replace("w=150&h=150", "w=800&h=400");
    }

    private String getFoodImage(String name) {
        String n = name.toLowerCase();
        
        // Biryani
        if (n.contains("chicken biryani")) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80";
        if (n.contains("mutton biryani")) return "https://images.unsplash.com/photo-1631515243349-e0cb75bfced1?auto=format&fit=crop&w=400&q=80";
        if (n.contains("veg biryani") || n.contains("paneer biryani")) return "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=400&q=80";
        
        // Pizza
        if (n.contains("margherita")) return "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80";
        if (n.contains("farmhouse") || n.contains("veg extravaganza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80";
        if (n.contains("pepperoni") || n.contains("dominator")) return "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80";
        
        // Burgers
        if (n.contains("chicken burger") || n.contains("mcspicy chicken") || n.contains("maharaja")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80";
        if (n.contains("veg burger") || n.contains("mcveggie") || n.contains("mcaloo")) return "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80";
        if (n.contains("paneer burger") || n.contains("mcspicy paneer")) return "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80";
        
        // Sides
        if (n.contains("fries") || n.contains("french fries")) return "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=80";
        
        // South Indian
        if (n.contains("masala dosa")) return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80";
        if (n.contains("plain dosa") || n.contains("roast") || n.contains("dosa")) return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80";
        if (n.contains("idli")) return "https://images.unsplash.com/photo-1589301773112-00716c6ba8b9?auto=format&fit=crop&w=400&q=80";
        if (n.contains("vada")) return "https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=400&q=80";
        
        // North Indian
        if (n.contains("paneer butter masala")) return "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&w=400&q=80";
        if (n.contains("butter chicken")) return "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=400&q=80";
        if (n.contains("naan")) return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80";
        
        // Chinese
        if (n.contains("fried rice")) return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80";
        if (n.contains("noodles") || n.contains("hakka")) return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80";
        if (n.contains("momos") || n.contains("dimsum")) return "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80";
        
        // Arabian
        if (n.contains("shawarma")) return "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80";
        
        // Italian
        if (n.contains("pasta")) return "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=400&q=80";
        
        // Desserts
        if (n.contains("ice cream") || n.contains("sundae") || n.contains("scoop")) return "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=400&q=80";
        if (n.contains("brownie")) return "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80";
        if (n.contains("cheesecake") || n.contains("cake")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
        
        // Beverages
        if (n.contains("coffee") || n.contains("cold coffee")) return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";
        if (n.contains("latte")) return "https://images.unsplash.com/photo-1495474472201-098547408a06?auto=format&fit=crop&w=400&q=80";
        if (n.contains("cappuccino")) return "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80";
        if (n.contains("mojito")) return "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=400&q=80";
        if (n.contains("oreo shake") || n.contains("shake")) return "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80";
        
        // Fallbacks based on category/general keywords
        if (n.contains("biryani")) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80";
        if (n.contains("pizza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80";
        if (n.contains("burger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80";
        if (n.contains("chicken")) return "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80";
        if (n.contains("paneer")) return "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&w=400&q=80";
        
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
    }
}
"@
Set-Content -Path "C:\full stack\front-end\Food-Fusion\src\main\java\com\foodfusion\app\config\DataSeeder.java" -Value ($parts[0] + $startString + $newMethods)
