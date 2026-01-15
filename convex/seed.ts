import { mutation } from "./_generated/server";

// Seed the database with sample data
export const seedDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if data already exists
        const existingCompanies = await ctx.db.query("companies").collect();
        if (existingCompanies.length > 0) {
            return { message: "Database already seeded", skipped: true };
        }

        // Seed Companies
        const companies = [
            { name: "Golden Arrow Bus Services", routes_count: 4 },
            { name: "MyCiTi", routes_count: 4 },
            { name: "Rea Vaya", routes_count: 4 },
            { name: "Putco", routes_count: 3 },
            { name: "Metrobus", routes_count: 3 },
        ];

        const companyIds: Record<string, any> = {};
        for (const company of companies) {
            const id = await ctx.db.insert("companies", {
                name: company.name,
                logo: "",
                rating_avg: 4.0 + Math.random() * 0.9,
                buses_count: 0,
                routes_count: company.routes_count,
            });
            companyIds[company.name] = id;
        }

        // Seed Drivers
        const drivers = [
            { name: "Sipho Mthembu", company: "Golden Arrow Bus Services", routes: ["104", "106"], experience_years: 12 },
            { name: "Nomsa Khumalo", company: "MyCiTi", routes: ["A01", "T01"], experience_years: 8 },
            { name: "Thabo Molefe", company: "Rea Vaya", routes: ["C1", "C2"], experience_years: 15 },
            { name: "Lindiwe Dlamini", company: "Putco", routes: ["Pretoria-Johannesburg"], experience_years: 10 },
            { name: "Johannes van der Merwe", company: "Metrobus", routes: ["Bus Rapid Transit"], experience_years: 20 },
            { name: "Precious Nkosi", company: "Golden Arrow Bus Services", routes: ["N2 Express"], experience_years: 6 },
            { name: "Bongani Zulu", company: "MyCiTi", routes: ["103", "Airport Link"], experience_years: 4 },
            { name: "Mpho Mokoena", company: "Rea Vaya", routes: ["C3", "Soweto Trunk"], experience_years: 9 },
        ];

        for (const driver of drivers) {
            await ctx.db.insert("drivers", {
                name: driver.name,
                company_id: companyIds[driver.company],
                routes: driver.routes,
                experience_years: driver.experience_years,
                rating_avg: 4.0 + Math.random() * 0.9,
            });
        }

        // Seed Buses
        const buses = [
            { fleet_number: "GA001", company: "Golden Arrow Bus Services", route: "104", type: "Volvo B7RLE", year: 2023 },
            { fleet_number: "GA002", company: "Golden Arrow Bus Services", route: "106", type: "Volvo B7RLE", year: 2022 },
            { fleet_number: "GA003", company: "Golden Arrow Bus Services", route: "N2 Express", type: "Mercedes Citaro", year: 2024 },
            { fleet_number: "MC101", company: "MyCiTi", route: "A01", type: "Mercedes Citaro", year: 2023 },
            { fleet_number: "MC102", company: "MyCiTi", route: "T01", type: "Mercedes Citaro", year: 2022 },
            { fleet_number: "MC103", company: "MyCiTi", route: "Airport Link", type: "BYD K9", year: 2024 },
            { fleet_number: "RV001", company: "Rea Vaya", route: "C1", type: "Volvo B7RLE", year: 2021 },
            { fleet_number: "RV002", company: "Rea Vaya", route: "C2", type: "Volvo B7RLE", year: 2020 },
            { fleet_number: "RV003", company: "Rea Vaya", route: "Soweto Trunk", type: "MAN Lion's City", year: 2023 },
            { fleet_number: "PT001", company: "Putco", route: "Pretoria-Johannesburg", type: "Scania Citywide", year: 2022 },
            { fleet_number: "PT002", company: "Putco", route: "East Rand", type: "Scania Citywide", year: 2021 },
            { fleet_number: "MB001", company: "Metrobus", route: "Bus Rapid Transit", type: "Mercedes Citaro", year: 2023 },
            { fleet_number: "MB002", company: "Metrobus", route: "Johannesburg CBD", type: "Volvo B7RLE", year: 2024 },
        ];

        for (const bus of buses) {
            await ctx.db.insert("buses", {
                fleet_number: bus.fleet_number,
                company_id: companyIds[bus.company],
                route: bus.route,
                type: bus.type,
                year: bus.year,
                rating_avg: 4.0 + Math.random() * 0.9,
            });
        }

        // Update company bus counts
        for (const [name, id] of Object.entries(companyIds)) {
            const count = buses.filter(b => b.company === name).length;
            await ctx.db.patch(id, { buses_count: count });
        }

        // Create a demo user for posts
        const userId = await ctx.db.insert("users", {
            username: "bustalk_admin",
            email: "admin@bustalk.co.za",
            profile_pic: "",
            spotter_status: true,
            role: "admin",
            badges: ["founder", "spotter"],
        });

        // Seed Posts
        const posts = [
            {
                type: "sighting" as const,
                title: "Brand new MyCiTi bus spotted!",
                content: "Just saw this beautiful new BYD K9 electric bus on the Airport Link route. Super quiet and smooth ride! 🚌⚡",
            },
            {
                type: "news" as const,
                title: "Golden Arrow celebrates 160 years",
                content: "Golden Arrow Bus Services marks 160 years of serving Cape Town commuters. A true South African institution!",
            },
            {
                type: "sighting" as const,
                title: "Rea Vaya's new Soweto Trunk service",
                content: "The new MAN Lion's City buses on the Soweto Trunk route are impressive. Great air conditioning and comfortable seats.",
            },
            {
                type: "news" as const,
                title: "Metrobus expands BRT network",
                content: "Johannesburg's Metrobus is expanding the Bus Rapid Transit network with new routes planned for 2025.",
            },
            {
                type: "sighting" as const,
                title: "Vintage Putco spotted in East Rand",
                content: "Caught this classic Putco bus still running on the East Rand route. These older models have character!",
            },
        ];

        for (const post of posts) {
            await ctx.db.insert("posts", {
                user_id: userId,
                type: post.type,
                title: post.title,
                content: post.content,
                media: [],
                status: "active",
                likes_count: Math.floor(10 + Math.random() * 50),
                boosts_count: Math.floor(Math.random() * 10),
                comments_count: Math.floor(Math.random() * 20),
                created_at: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
            });
        }

        return {
            message: "Database seeded successfully!",
            companies: companies.length,
            drivers: drivers.length,
            buses: buses.length,
            posts: posts.length,
        };
    },
});
