import React from "react";
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiHome,
  FiLayers,
  FiBook,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiActivity,
  FiMapPin,
} from "react-icons/fi";
import { BsBuildings } from "react-icons/bs";
import Badge from "../../ui/badge/Badge";
import { Typography } from "@mui/material";

export default function Dashboard() {
  // Building stats data
  const buildingStats = [
    {
      id: 1,
      title: "Commercial Buildings",
      count: 42,
      change: 12.5,
      icon: <BsBuildings className="text-xl" />,
      color: "text-primary",
      bgColor: "bg-lightBackground",
      revenue: "$1.2M",
      trend: "up",
    },
    {
      id: 2,
      title: "Residential Buildings",
      count: 156,
      change: 8.3,
      icon: <FiHome className="text-xl" />,
      color: "text-success",
      bgColor: "bg-green-50",
      revenue: "$2.8M",
      trend: "up",
    },
    {
      id: 3,
      title: "Commercial + Residential",
      count: 28,
      change: 5.2,
      icon: <FiLayers className="text-xl" />,
      color: "text-pending",
      bgColor: "bg-yellow-50",
      revenue: "$890K",
      trend: "up",
    },
    {
      id: 4,
      title: "Schools",
      count: 18,
      change: -2.1,
      icon: <FiBook className="text-xl" />,
      color: "text-reschedule",
      bgColor: "bg-orange-50",
      revenue: "$450K",
      trend: "down",
    },
  ];

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      title: "Skyline Tower Inspection",
      type: "Commercial",
      status: "completed",
      date: "Today, 10:30 AM",
      statusColor: "success",
    },
    {
      id: 2,
      title: "Garden Residency Maintenance",
      type: "Residential",
      status: "in-progress",
      date: "Today, 09:15 AM",
      statusColor: "pending",
    },
    {
      id: 3,
      title: "City Plaza Construction",
      type: "Commercial + Residential",
      status: "pending",
      date: "Yesterday, 03:45 PM",
      statusColor: "pending",
    },
    {
      id: 4,
      title: "Sunshine School Audit",
      type: "School",
      status: "reschedule",
      date: "Jan 14, 2024",
      statusColor: "reschedule",
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: "Occupancy Rate", value: "94%", change: "+2.3%" },
    { label: "Rental Yield", value: "6.8%", change: "+0.4%" },
    { label: "Maintenance Cost", value: "$45.2K", change: "-1.2%" },
    { label: "New Leases", value: "24", change: "+8.7%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Typography
              variant="h4"
              className="font-roboto font-bold text-primary mb-2"
            >
              Dashboard
            </Typography>
            <Typography className="font-roboto text-gray-600">
              Overview of your portfolio and performance
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium font-roboto text-sm">
              Last 30 Days
            </button>
          </div>
        </div>
      </div>
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-gray-500 text-sm font-roboto mb-1">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 font-roboto">
                {metric.value}
              </p>
              <span
                className={`text-xs font-medium ${
                  metric.change.startsWith("+") ? "text-success" : "text-error"
                }`}
              >
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Building Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {buildingStats.map((building) => (
          <div
            key={building.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 ${building.bgColor} rounded-xl`}
            >
              <div className={building.color}>{building.icon}</div>
            </div>

            <div className="mt-5">
              <span className="text-sm text-gray-500 font-roboto">
                {building.title}
              </span>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <h4 className="font-bold text-gray-800 text-2xl font-roboto">
                    {building.count}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 font-roboto">
                    {building.revenue} revenue
                  </p>
                </div>

                <Badge color={building.trend === "up" ? "success" : "error"}>
                  {building.trend === "up" ? (
                    <FiArrowUpRight className="mr-1" />
                  ) : (
                    <FiArrowDownRight className="mr-1" />
                  )}
                  {building.change}%
                </Badge>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 text-primary hover:bg-lightBackground rounded-lg font-medium text-sm font-roboto transition-colors duration-200 border border-gray-200 hover:border-primary">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Charts and Activities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 font-roboto">
                Revenue Overview
              </h2>
              <p className="text-gray-600 text-sm font-roboto">
                Monthly performance across building types
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-roboto border border-gray-300 rounded-lg">
                Monthly
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-roboto border border-gray-300 rounded-lg">
                Quarterly
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-gray-600 font-roboto">
                    Commercial
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm text-gray-600 font-roboto">
                    Residential
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pending"></div>
                  <span className="text-sm text-gray-600 font-roboto">
                    Mixed
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500 font-roboto">
                Revenue in thousands ($)
              </span>
            </div>

            <div className="h-48 flex items-end justify-between px-4 border-b border-l border-gray-200">
              {[
                { month: "Oct", commercial: 120, residential: 280, mixed: 89 },
                { month: "Nov", commercial: 135, residential: 295, mixed: 92 },
                { month: "Dec", commercial: 142, residential: 310, mixed: 95 },
                { month: "Jan", commercial: 156, residential: 325, mixed: 98 },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-end gap-1 mb-2">
                    <div
                      className="w-8 bg-primary rounded-t"
                      style={{ height: `${item.commercial / 4}px` }}
                      title={`Commercial: $${item.commercial}K`}
                    ></div>
                    <div
                      className="w-8 bg-success rounded-t"
                      style={{ height: `${item.residential / 6}px` }}
                      title={`Residential: $${item.residential}K`}
                    ></div>
                    <div
                      className="w-8 bg-pending rounded-t"
                      style={{ height: `${item.mixed / 2}px` }}
                      title={`Mixed: $${item.mixed}K`}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 font-roboto">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 font-roboto">
                $1.56M
              </p>
              <p className="text-sm text-gray-500 font-roboto">Commercial</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 font-roboto">
                $3.25M
              </p>
              <p className="text-sm text-gray-500 font-roboto">Residential</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 font-roboto">
                $980K
              </p>
              <p className="text-sm text-gray-500 font-roboto">Mixed Use</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-5 md:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 font-roboto">
                  Recent Activities
                </h2>
                <p className="text-gray-600 text-sm font-roboto">
                  Latest updates and inspections
                </p>
              </div>
              <FiCalendar className="text-gray-400 text-xl" />
            </div>
          </div>

          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === "Commercial"
                          ? "bg-lightBackground"
                          : activity.type === "Residential"
                          ? "bg-green-50"
                          : activity.type === "School"
                          ? "bg-orange-50"
                          : "bg-yellow-50"
                      }`}
                    >
                      {activity.type === "Commercial" ? (
                        <BsBuildings className="text-primary" />
                      ) : activity.type === "Residential" ? (
                        <FiHome className="text-success" />
                      ) : activity.type === "School" ? (
                        <FiBook className="text-reschedule" />
                      ) : (
                        <FiLayers className="text-pending" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 font-roboto">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-roboto">
                        {activity.type}
                      </span>
                      <Badge color={activity.statusColor} size="sm">
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 font-roboto">
                      {activity.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button className="w-full py-2.5 text-primary hover:bg-lightBackground rounded-lg font-medium text-sm font-roboto transition-colors duration-200">
              View All Activities
            </button>
          </div>
        </div>
      </div>

      {/* Building Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-roboto mb-6">
            Building Type Distribution
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Pie Chart Visualization */}
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-[32px] border-primary"></div>
              <div className="absolute inset-0 rounded-full border-[32px] border-success clip-path-[0%_69%]"></div>
              <div className="absolute inset-0 rounded-full border-[32px] border-pending clip-path-[69%_19%]"></div>
              <div className="absolute inset-0 rounded-full border-[32px] border-reschedule clip-path-[88%_12%]"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 font-roboto">
                    244
                  </p>
                  <p className="text-gray-600 text-sm font-roboto">
                    Total Properties
                  </p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4 flex-1">
              {[
                {
                  label: "Commercial Buildings",
                  value: "42 (17%)",
                  color: "bg-primary",
                },
                {
                  label: "Residential Buildings",
                  value: "156 (64%)",
                  color: "bg-success",
                },
                {
                  label: "Commercial + Residential",
                  value: "28 (11%)",
                  color: "bg-pending",
                },
                { label: "Schools", value: "18 (8%)", color: "bg-reschedule" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-700 font-roboto">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 font-roboto">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Inspections */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-roboto">
                Upcoming Inspections
              </h3>
              <p className="text-gray-600 text-sm font-roboto">
                Scheduled for next 7 days
              </p>
            </div>
            <FiActivity className="text-primary text-xl" />
          </div>

          <div className="space-y-4">
            {[
              {
                building: "Skyline Tower",
                type: "Commercial",
                date: "Tomorrow, 09:00 AM",
                inspector: "John Smith",
              },
              {
                building: "Garden Residency",
                type: "Residential",
                date: "Jan 18, 02:30 PM",
                inspector: "Sarah Johnson",
              },
              {
                building: "Plaza Complex",
                type: "Mixed Use",
                date: "Jan 19, 11:00 AM",
                inspector: "Mike Chen",
              },
              {
                building: "Sunshine School",
                type: "School",
                date: "Jan 20, 10:00 AM",
                inspector: "Emily Davis",
              },
            ].map((inspection, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 font-roboto">
                      {inspection.building}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 font-roboto">
                        {inspection.type}
                      </span>
                      <span className="text-sm text-gray-500 font-roboto">
                        {inspection.inspector}
                      </span>
                    </div>
                  </div>
                  <Badge color="primary" size="sm">
                    {inspection.date.split(",")[0]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2 font-roboto">
                  <FiMapPin className="inline mr-1" size={14} />
                  {inspection.date}
                </p>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2.5 text-primary hover:bg-lightBackground rounded-lg font-medium text-sm font-roboto transition-colors duration-200 border border-gray-200">
            View All Inspections
          </button>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <FiUsers className="text-primary text-2xl mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 font-roboto">
              1,248
            </p>
            <p className="text-gray-600 text-sm font-roboto">Total Tenants</p>
          </div>
          <div className="text-center p-4 border-x border-gray-200">
            <FiDollarSign className="text-success text-2xl mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 font-roboto">
              $4.94M
            </p>
            <p className="text-gray-600 text-sm font-roboto">Annual Revenue</p>
          </div>
          <div className="text-center p-4">
            <BsBuildings className="text-pending text-2xl mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 font-roboto">
              94.2%
            </p>
            <p className="text-gray-600 text-sm font-roboto">
              Average Occupancy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
