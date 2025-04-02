exports.exportRevenueReportCSV = async (req, res) => {
    try {
      const report = await Order.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalRevenue: { $sum: "$amount" }
          }
        }
      ]);
  
      const fields = [
        { label: 'Month', key: '_id' },
        { label: 'Total Revenue', key: 'totalRevenue' }
      ];
  
      require('../utils/generateCSV').generateCSV(report, fields, 'revenue_report', res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  