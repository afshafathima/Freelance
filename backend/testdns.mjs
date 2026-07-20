import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

dns.resolveSrv("_mongodb._tcp.cluster0.2oiugtr.mongodb.net", (err, addresses) => {
    if (err) {
        console.log("DNS Error:", err);
    } else {
        console.log("MongoDB SRV Records:");
        console.log(addresses);
    }
});