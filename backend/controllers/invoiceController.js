import Invoice from "../models/Invoice.js";
import TimeLog from "../models/Timelog.js";
import Client from "../models/Client.js";
import Project from "../models/project.js";


const getUserId = (req) => {
    return req.user?._id || req.user?.id;
};

const getLogHours = (log) => {
    return Number(log.duration || 0);
};

const getHourlyRate = (client) => {
    return Number(
        client.hourlyRate ??
        client.defaultHourlyRate ??
        0
    );
};

const createDateRange = (startDate, endDate) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59.999`);

    return { start, end };
};

const filterLogsByDate = (
    projectLogs,
    start,
    end
) => {
    return projectLogs.filter((log) => {
        const logDateValue =
            log.createdAt || log.startTime;

        if (!logDateValue) {
            return false;
        }

        const logDate = new Date(logDateValue);
        const hours = getLogHours(log);

        return (
            !Number.isNaN(logDate.getTime()) &&
            logDate >= start &&
            logDate <= end &&
            hours > 0
        );
    });
};

const findProjectLogs = async ({
    userId,
    projectId,
    start,
    end
}) => {
    /*
     * First get every unbilled log belonging to the
     * selected user and project.
     */
    const unbilledProjectLogs = await TimeLog.find({
        userId,
        projectId,
        billed: {
            $ne: true
        }
    })
        .populate("projectId")
        .sort({ createdAt: 1 });

    /*
     * Filter dates in JavaScript. This avoids problems
     * caused by MongoDB date and timezone comparisons.
     */
    const matchingLogs = filterLogsByDate(
        unbilledProjectLogs,
        start,
        end
    );

    return {
        unbilledProjectLogs,
        matchingLogs
    };
};

const validateInvoiceSelection = async ({
    userId,
    clientId,
    projectId
}) => {
    const client = await Client.findOne({
        _id: clientId,
        userId
    });

    if (!client) {
        return {
            error: {
                status: 404,
                message: "Client not found"
            }
        };
    }

    const project = await Project.findOne({
        _id: projectId,
        clientId,
        userId
    });

    if (!project) {
        return {
            error: {
                status: 404,
                message:
                    "The selected project does not belong to this client"
            }
        };
    }

    return {
        client,
        project
    };
};

export const createInvoice = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const invoice = await Invoice.create({
            userId,
            ...req.body
        });

        return res.status(201).json(invoice);
    } catch (error) {
        console.error(
            "Create invoice error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to create invoice"
        });
    }
};


export const getInvoices = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const invoices = await Invoice.find({
            userId
        })
            .populate("clientId")
            .populate("projectId")
            .sort({ createdAt: -1 });

        return res.status(200).json(invoices);
    } catch (error) {
        console.error(
            "Get invoices error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to load invoices"
        });
    }
};



export const updateInvoice = async (req, res) => {
    try {
        const userId = getUserId(req);

        const invoice =
            await Invoice.findOneAndUpdate(
                {
                    _id: req.params.id,
                    userId
                },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate("clientId")
                .populate("projectId");

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        return res.status(200).json(invoice);
    } catch (error) {
        console.error(
            "Update invoice error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to update invoice"
        });
    }
};



export const deleteInvoice = async (req, res) => {
    try {
        const userId = getUserId(req);

        const invoice =
            await Invoice.findOneAndDelete({
                _id: req.params.id,
                userId
            });

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            message: "Invoice deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete invoice error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to delete invoice"
        });
    }
};



export const previewUnbilledLogs = async (
    req,
    res
) => {
    try {
        const userId = getUserId(req);

        const {
            clientId,
            projectId,
            startDate,
            endDate
        } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        if (
            !clientId ||
            !projectId ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                message:
                    "Client, project, start date and end date are required"
            });
        }

        const { start, end } = createDateRange(
            startDate,
            endDate
        );

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                message: "Invalid date range"
            });
        }

        if (start > end) {
            return res.status(400).json({
                message:
                    "Start date cannot be after end date"
            });
        }

        const validation =
            await validateInvoiceSelection({
                userId,
                clientId,
                projectId
            });

        if (validation.error) {
            return res
                .status(validation.error.status)
                .json({
                    message:
                        validation.error.message
                });
        }

        const { client, project } = validation;

        const {
            unbilledProjectLogs,
            matchingLogs
        } = await findProjectLogs({
            userId,
            projectId,
            start,
            end
        });

        if (unbilledProjectLogs.length === 0) {
            return res.status(404).json({
                message:
                    "This project has no unbilled time logs. Add a new manual time entry for this project first."
            });
        }

        if (matchingLogs.length === 0) {
            return res.status(404).json({
                message:
                    `This project has ${unbilledProjectLogs.length} unbilled time log(s), ` +
                    `but none are between ${startDate} and ${endDate}.`
            });
        }

        const totalHours = matchingLogs.reduce(
            (sum, log) =>
                sum + getLogHours(log),
            0
        );

        const hourlyRate =
            getHourlyRate(client);

        if (hourlyRate <= 0) {
            return res.status(400).json({
                message:
                    "The selected client does not have a valid hourly rate"
            });
        }

        const totalAmount =
            Math.round(
                totalHours * hourlyRate * 100
            ) / 100;

        return res.status(200).json({
            client,
            project,
            logs: matchingLogs,
            totalHours,
            hourlyRate,
            totalAmount,
            startDate,
            endDate
        });
    } catch (error) {
        console.error(
            "Preview invoice error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to preview invoice"
        });
    }
};



export const generateFromTimeLogs = async (
    req,
    res
) => {
    try {
        const userId = getUserId(req);

        const {
            clientId,
            projectId,
            startDate,
            endDate
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        if (
            !clientId ||
            !projectId ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                message:
                    "Client, project, start date and end date are required"
            });
        }

        const { start, end } = createDateRange(
            startDate,
            endDate
        );

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                message: "Invalid date range"
            });
        }

        if (start > end) {
            return res.status(400).json({
                message:
                    "Start date cannot be after end date"
            });
        }

        const validation =
            await validateInvoiceSelection({
                userId,
                clientId,
                projectId
            });

        if (validation.error) {
            return res
                .status(validation.error.status)
                .json({
                    message:
                        validation.error.message
                });
        }

        const { client, project } = validation;

        const {
            unbilledProjectLogs,
            matchingLogs
        } = await findProjectLogs({
            userId,
            projectId,
            start,
            end
        });

        if (unbilledProjectLogs.length === 0) {
            return res.status(404).json({
                message:
                    "This project has no unbilled time logs. Add a new manual time entry first."
            });
        }

        if (matchingLogs.length === 0) {
            return res.status(404).json({
                message:
                    `This project has ${unbilledProjectLogs.length} unbilled time log(s), ` +
                    `but none are between ${startDate} and ${endDate}.`
            });
        }

        const totalHours = matchingLogs.reduce(
            (sum, log) =>
                sum + getLogHours(log),
            0
        );

        const hourlyRate =
            getHourlyRate(client);

        if (hourlyRate <= 0) {
            return res.status(400).json({
                message:
                    "The selected client does not have a valid hourly rate"
            });
        }

        const amount =
            Math.round(
                totalHours * hourlyRate * 100
            ) / 100;

        const lineItems = matchingLogs.map(
            (log) => {
                const hours = getLogHours(log);

                return {
                    description:
                        log.description ||
                        project.projectName ||
                        "Work",

                    hours,

                    rate: hourlyRate,

                    amount:
                        Math.round(
                            hours *
                            hourlyRate *
                            100
                        ) / 100
                };
            }
        );

        
        const invoice = await Invoice.create({
            userId,
            clientId,
            projectId,

            amount,
            totalHours,

            startDate: start,
            endDate: end,

            status: "Draft",

            description:
                `Invoice for ${project.projectName}: ` +
                `${totalHours.toFixed(2)} hours at ` +
                `$${hourlyRate}/hr`,

            dueDate: new Date(
                Date.now() +
                30 *
                24 *
                60 *
                60 *
                1000
            ),

            lineItems
        });

        await TimeLog.updateMany(
            {
                _id: {
                    $in: matchingLogs.map(
                        (log) => log._id
                    )
                }
            },
            {
                $set: {
                    billed: true
                }
            }
        );

        const populatedInvoice =
            await Invoice.findById(invoice._id)
                .populate("clientId")
                .populate("projectId");

        return res.status(201).json({
            message:
                "Invoice generated successfully",
            invoice: populatedInvoice,
            logsCount: matchingLogs.length,
            totalHours,
            hourlyRate,
            amount
        });
    } catch (error) {
        console.error(
            "Generate invoice error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to generate invoice"
        });
    }
};

/* =====================================================
   FINANCIAL STATISTICS
===================================================== */

export const getFinancialStats = async (
    req,
    res
) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const monthlyStats =
            await Invoice.aggregate([
                {
                    $match: {
                        userId
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            },
                            status: "$status"
                        },

                        total: {
                            $sum: "$amount"
                        },

                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]);

        const earnedResults =
            await Invoice.aggregate([
                {
                    $match: {
                        userId,
                        status: "Paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

        const pendingResults =
            await Invoice.aggregate([
                {
                    $match: {
                        userId,
                        status: {
                            $ne: "Paid"
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

        return res.status(200).json({
            monthlyStats,

            totalEarned:
                earnedResults[0]?.total || 0,

            totalPending:
                pendingResults[0]?.total || 0
        });
    } catch (error) {
        console.error(
            "Financial stats error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to load financial statistics"
        });
    }
};