const cron = require("node-cron");
const { Op } = require("sequelize");
const User = require("../models/userModal");

// Function to remove unverified accounts
const removeUnverifiedAccounts = async () => {
    try {
        console.log(" Checking for unverified accounts...");

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1); // 24 hours ago

        // Delete unverified users
        const deletedUsers = await User.destroy({
            where: {
                accountVerified: false,
                createdAt: { [Op.lt]: oneDayAgo }  // Fixed Sequelize syntax
            }
        });

        console.log(` Deleted ${deletedUsers} unverified accounts.`);

    } catch (error) {
        console.error(" Error in removeUnverifiedAccounts service:", error);
    }
};

// Schedule Task: Runs Every Day at Midnight
cron.schedule("0 0 * * *", async () => {
    try {
        console.log(" Running removeUnverifiedAccounts service...");
        await removeUnverifiedAccounts();
    } catch (error) {
        console.error(" Cron Job Error:", error);
    }
});

module.exports = removeUnverifiedAccounts;
