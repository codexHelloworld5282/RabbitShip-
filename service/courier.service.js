export function mapToCourierPayload(payload) {
    // Assuming payload is an array with one order object
    const order = Array.isArray(payload) ? payload[0] : payload;

    // Static shipper info (replace with your actual shipper info)
    const shipper = {
        shipper_name: "FAHAD",
        shipper_email: "fahadbashir757@gmail.com",
        shipper_contact: "03062928049",
        shipper_address: "Plot # 5 blueEx Awami Markaz Shahrah-E-Faisal Karachi",
        shipper_city: "LHE",
    };

    // Customer shipping info fallback
    const shipping = order.Customer?.shipping || {};

    // Extract courier remarks from ordersBrandDetails if exists
    const courierRemarksObj = (order.ordersBrandDetails || []).find(
        (item) => item.attribute === "courier_remarks"
    );
    const customer_comment = courierRemarksObj ? courierRemarksObj.value : "";

    // Map products to courier API format
    const products_detail = (order.Products || []).map((product) => {
        // Get weight_per_item from product properties
        let weight = "0";
        if (product.properties && Array.isArray(product.properties)) {
            const weightProp = product.properties.find(
                (p) => p.name === "weight_per_item"
            );
            if (weightProp) weight = weightProp.value;
        }

        return {
            product_code: product.sku || "",
            product_name: product.name || "",
            product_price: product.price?.toString() || "0",
            product_weight: weight,
            product_quantity: product.quantity?.toString() || "1",
            product_variations: "", // You can fill this if data available
            sku_code: product.sku || "",
        };
    });

    // Calculate total weight (sum of weight * quantity)
    let total_order_weight = 0;
    products_detail.forEach((p) => {
        total_order_weight +=
            parseFloat(p.product_weight || "0") * parseInt(p.product_quantity || "1");
    });

    // Map of city names to courier expected city codes
    const cityCodeMap = {
        Karachi: "KHI",
        Lahore: "LHE",
        Islamabad: "ISB",
        Rawalpindi: "RWP",
        Faisalabad: "FSD",
        Multan: "MLT",
        Quetta: "UET",
        Peshawar: "PEW",
        Sialkot: "SKT",

    };

    // Normalize customer city and country
    const rawCity = shipping.city || "";
    const customer_city = cityCodeMap[rawCity] || rawCity;

    // Normalize country to "PK" if Pakistan or variants
    let customer_country = "PK"; // default
    if (shipping.country) {
        const countryLower = shipping.country.toLowerCase();
        if (countryLower !== "pakistan" && countryLower !== "pk") {
            customer_country = shipping.country;
        }
    }

    // Prepare courier payload
    return {
        ...shipper,
        customer_name: `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim(),
        customer_email: order.Customer?.email || "",
        customer_contact: shipping.phone || order.Customer?.phone || "",
        customer_address: shipping.address || "",
        customer_city,
        customer_country,
        customer_comment: customer_comment || "",
        shipping_charges: order.shippingPrice?.toString() || "0",
        payment_type: order.codAmount > 0 ? "COD" : "Prepaid",
        service_code: "BE", // Replace with real service code if needed
        total_order_amount: order.totalAmount?.toString() || "0",
        total_order_weight: total_order_weight.toString(),
        order_refernce_code: order.orderId || "",
        fragile: "N",
        parcel_type: "P",
        insurance_require: "N",
        insurance_value: "0",
        testbit: "Y",
        cn_generate: "Y",
        multi_pickup: "Y",
        products_detail,
    };
}
