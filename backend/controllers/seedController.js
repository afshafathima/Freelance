import Client from "../models/Client.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import TimeLog from "../models/Timelog.js";
import Invoice from "../models/Invoice.js";

const getUserId = (req) => req.user?._id || req.user?.id;

export const seedSampleData = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: "Not authorized" });

       
        const existingClients = await Client.countDocuments({ userId });
        if (existingClients >= 2) {
            return res.status(400).json({
                message: "You already have clients in your account. Sample data is only loaded into empty accounts to avoid duplicates."
            });
        }

        const now = new Date();
        const daysAgo = (n) => new Date(now - n * 86400000);
        const daysFromNow = (n) => new Date(now.getTime() + n * 86400000);

     
        const [acme, nova] = await Client.insertMany([
            {
                userId,
                name: "Acme Corporation",
                email: "contact@acmecorp.com",
                phone: "+1 415 555 0101",
                hourlyRate: 95
            },
            {
                userId,
                name: "Nova Digital",
                email: "hello@novadigital.io",
                phone: "+1 212 555 0178",
                hourlyRate: 120
            }
        ]);

       
        const [website, mobileApp, brandIdentity] = await Project.insertMany([
            {
                userId,
                clientId: acme._id,
                projectName: "Corporate Website Redesign",
                status: "Active",
                budget: 8500
            },
            {
                userId,
                clientId: nova._id,
                projectName: "Nova Mobile App MVP",
                status: "Active",
                budget: 14000
            },
            {
                userId,
                clientId: acme._id,
                projectName: "Brand Identity Package",
                status: "Completed",
                budget: 3200
            }
        ]);

        /* ------- TASKS ------- */
        await Task.insertMany([
            // Website project
            { userId, projectId: website._id, title: "Wireframes & user flows", dueDate: daysAgo(12), status: "Completed" },
            { userId, projectId: website._id, title: "Homepage design mockup", dueDate: daysAgo(5), status: "Completed" },
            { userId, projectId: website._id, title: "Responsive CSS implementation", dueDate: daysFromNow(3), status: "Pending" },
            { userId, projectId: website._id, title: "CMS integration & content upload", dueDate: daysFromNow(9), status: "Pending" },
            { userId, projectId: website._id, title: "Cross-browser QA testing", dueDate: daysFromNow(14), status: "Pending" },

            // Mobile App project
            { userId, projectId: mobileApp._id, title: "Product requirements document", dueDate: daysAgo(20), status: "Completed" },
            { userId, projectId: mobileApp._id, title: "UI component library setup", dueDate: daysAgo(8), status: "Completed" },
            { userId, projectId: mobileApp._id, title: "User authentication screens", dueDate: daysFromNow(1), status: "Pending" },
            { userId, projectId: mobileApp._id, title: "Dashboard & analytics view", dueDate: daysFromNow(6), status: "Pending" },
            { userId, projectId: mobileApp._id, title: "API integration & testing", dueDate: daysFromNow(18), status: "Pending" },

            // Brand Identity (completed)
            { userId, projectId: brandIdentity._id, title: "Logo concepts & revisions", dueDate: daysAgo(30), status: "Completed" },
            { userId, projectId: brandIdentity._id, title: "Brand guidelines PDF", dueDate: daysAgo(18), status: "Completed" },
            { userId, projectId: brandIdentity._id, title: "Business card design", dueDate: daysAgo(10), status: "Completed" }
        ]);

        /* ------- TIME LOGS ------- */
        // Helper to create a timelog entry with duration
        const makeLog = (projectId, taskOffset, hours, daysBack, billed = false) => ({
            userId,
            projectId,
            taskId: null,
            startTime: daysAgo(daysBack),
            endTime: new Date(daysAgo(daysBack).getTime() + hours * 3600000),
            duration: hours,
            billed
        });

        // Website project logs (spread over 6 weeks)
        const websiteLogs = [
            makeLog(website._id, 0, 4.5, 35, true),
            makeLog(website._id, 0, 3.0, 33, true),
            makeLog(website._id, 0, 5.0, 28, true),
            makeLog(website._id, 0, 2.5, 26, true),
            makeLog(website._id, 0, 6.0, 20, false),
            makeLog(website._id, 0, 4.0, 15, false),
            makeLog(website._id, 0, 3.5, 8, false),
            makeLog(website._id, 0, 2.0, 3, false)
        ];

        // Mobile App logs
        const mobileAppLogs = [
            makeLog(mobileApp._id, 0, 6.0, 25, true),
            makeLog(mobileApp._id, 0, 7.5, 22, true),
            makeLog(mobileApp._id, 0, 5.0, 18, true),
            makeLog(mobileApp._id, 0, 4.5, 14, false),
            makeLog(mobileApp._id, 0, 8.0, 10, false),
            makeLog(mobileApp._id, 0, 6.5, 5, false),
            makeLog(mobileApp._id, 0, 3.0, 2, false)
        ];

        // Brand Identity (all billed/paid)
        const brandLogs = [
            makeLog(brandIdentity._id, 0, 4.0, 40, true),
            makeLog(brandIdentity._id, 0, 3.5, 36, true),
            makeLog(brandIdentity._id, 0, 5.0, 30, true),
            makeLog(brandIdentity._id, 0, 2.0, 25, true)
        ];

        await TimeLog.insertMany([...websiteLogs, ...mobileAppLogs, ...brandLogs]);

        /* ------- INVOICES ------- */
        // Brand Identity — Paid invoice
        await Invoice.create({
            userId,
            clientId: acme._id,
            projectId: brandIdentity._id,
            amount: 14.5 * 95,  // 14.5 hours × $95
            status: "Paid",
            startDate: daysAgo(50),
            endDate: daysAgo(22),
            description: "Brand Identity Package — Final invoice",
            lineItems: [
                { description: "Logo design & revisions", hours: 4, rate: 95, amount: 380 },
                { description: "Brand guidelines document", hours: 5, rate: 95, amount: 475 },
                { description: "Business card & collateral design", hours: 5.5, rate: 95, amount: 522.5 }
            ]
        });

        // Website — Sent invoice (partial, billed time logs)
        const websiteBilledHours = websiteLogs.filter(l => l.billed).reduce((s, l) => s + l.duration, 0);
        await Invoice.create({
            userId,
            clientId: acme._id,
            projectId: website._id,
            amount: websiteBilledHours * 95,
            status: "Sent",
            startDate: daysAgo(40),
            endDate: daysAgo(20),
            description: "Corporate Website Redesign — Phase 1",
            lineItems: [
                { description: "Wireframes & UX research", hours: 7.5, rate: 95, amount: 712.5 },
                { description: "Homepage & inner page design", hours: 7.5, rate: 95, amount: 712.5 }
            ]
        });

        // Mobile App — Sent invoice
        const mobileBilledHours = mobileAppLogs.filter(l => l.billed).reduce((s, l) => s + l.duration, 0);
        await Invoice.create({
            userId,
            clientId: nova._id,
            projectId: mobileApp._id,
            amount: mobileBilledHours * 120,
            status: "Sent",
            startDate: daysAgo(30),
            endDate: daysAgo(12),
            description: "Nova Mobile App — Development Sprint 1",
            lineItems: [
                { description: "Project setup & architecture", hours: 6, rate: 120, amount: 720 },
                { description: "UI component library", hours: 7.5, rate: 120, amount: 900 },
                { description: "Auth screens development", hours: 5, rate: 120, amount: 600 }
            ]
        });

        return res.status(201).json({
            message: "✅ Sample data loaded successfully!",
            summary: {
                clients: 2,
                projects: 3,
                tasks: 13,
                timeLogs: websiteLogs.length + mobileAppLogs.length + brandLogs.length,
                invoices: 3
            }
        });
    } catch (error) {
        console.error("Seed error:", error);
        return res.status(500).json({ message: error.message || "Failed to seed data" });
    }
};

export const clearSampleData = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        await Promise.all([
            Client.deleteMany({ userId }),
            Project.deleteMany({ userId }),
            Task.deleteMany({ userId }),
            TimeLog.deleteMany({ userId }),
            Invoice.deleteMany({ userId })
        ]);

        return res.status(200).json({ message: "✅ All data cleared." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
