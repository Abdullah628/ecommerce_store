import User from "../models/user.model.js";
import Product from "../models/product.modal.js";
import Order from "../models/order.model.js";

export const getAnalyticsData = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, //it groups all the documents together,
                totalSales: {$sum: 1},
                totalRevenue: {$sum: "$totalAmount"}
            }
        }
    ]);

    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    }
}

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    sales: {$sum: 1},
                    revenue: {$sum: "$totalAmount"}
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);
        
        //example of dailySalesData
        // [{
        //         _id: "2024-09-18",
        //         sales: 12,
        //         revenue: 1450.75
        //     },]
    
        const dateArray = getDatesInRange(startDate, endDate);
    
        return dateArray.map(date => {
            const foundData = dailySalesData.find(item => item._id === date);
    
            return{
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0
            }
        });
    } catch (error) {
        throw error;
    }
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);
    while (currentDate <= stopDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}