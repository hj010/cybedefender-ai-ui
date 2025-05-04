import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './Layout';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import NoDashboardState from './NoDashboardState';
import Cookies from 'js-cookie';


const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [monthlyData, setMonthlyData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [anomalies, setAnomalies] = useState(0);
  const [highSeverity, setHighSeverity] = useState(0);
  const [mediumSeverity, setMediumSeverity] = useState(0);
  const [lowSeverity, setLowSeverity] = useState(0);
  const [recentThreats, setRecentThreats] = useState([]);
  const [error, setError] = useState(false);

  // Month order function (April to March fiscal year)
  const getMonthOrder = (month) => {
    const monthOrder = {
      'Apr': 0, 'May': 1, 'Jun': 2, 'Jul': 3, 'Aug': 4, 'Sep': 5,
      'Oct': 6, 'Nov': 7, 'Dec': 8, 'Jan': 9, 'Feb': 10, 'Mar': 11
    };
    return monthOrder[month] !== undefined ? monthOrder[month] : 999; // Default high value for unknown months
  };

  // Combined fetch function in a single useEffect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = Cookies.get('token');
        const userId = Cookies.get('guid');

        if (!token || !userId) {
          console.error("No authentication token or user ID found");
          navigate('/login');
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const payload = JSON.stringify({ userId });
        // Fetch dashboard data
        const dashboardResponse = await fetch(`${process.env.REACT_APP_CYBEDEFENDER_AI_URL}/cybedefender/Dashboard`, {
          method: 'POST',
          headers,
          body: payload
        });
        const dashboardData = await dashboardResponse.json();

        // Extracting month-wise anomalies and sorting them in fiscal year order (Apr-Mar)
        const monthData = Object.keys(dashboardData.monthlyData)
          .map((month) => ({
            name: month,
            value: dashboardData.monthlyData[month],
            order: getMonthOrder(month)
          }))
          .sort((a, b) => a.order - b.order);

        setMonthlyData(monthData);
        setAnomalies(dashboardData.Anomalies);
        setHighSeverity(dashboardData.High);
        setMediumSeverity(dashboardData.Medium);
        setLowSeverity(dashboardData.Low);

        // Calculate percentages
        const totalAnomalies = dashboardData.High + dashboardData.Medium + dashboardData.Low;
        const highPercentage = Math.round((dashboardData.High / totalAnomalies) * 100);
        const mediumPercentage = Math.round((dashboardData.Medium / totalAnomalies) * 100);
        const lowPercentage = Math.round((dashboardData.Low / totalAnomalies) * 100);

        setSeverityData([
          { 
            name: 'Low Severity', 
            value: dashboardData.Low, 
            color: '#4444FF',
            percentage: lowPercentage,
            count: dashboardData.Low
          },
          { 
            name: 'Medium Severity', 
            value: dashboardData.Medium, 
            color: '#FFD700',
            percentage: mediumPercentage,
            count: dashboardData.Medium
          },
          { 
            name: 'High Severity', 
            value: dashboardData.High, 
            color: '#FF4444',
            percentage: highPercentage,
            count: dashboardData.High
          },
        ]);

        // Fetch alerts data
        const alertsResponse = await fetch("${process.env.REACT_APP_CYBEDEFENDER_AI_URL}/cybedefender/alerts", {
          method: 'POST',
          headers,
          body: payload
        });
        const alertsData = await alertsResponse.json();
        
        if (alertsData.alerts) {
          // Get today's date in YYYY-MM-DD format
          const today = new Date().toISOString().split("T")[0];

          // Filter alerts for today & sort by timestamp (latest first)
          const filteredAlerts = alertsData.alerts
            .filter(alert => new Date(alert.date) <= new Date(today)) 
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6); // Take only the top 6 recent alerts
          
          setRecentThreats(filteredAlerts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      }
    };

    fetchAllData();
  }, []);

  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Custom label renderer for pie chart
  const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, index } = props;
    const RADIAN = Math.PI / 180;
    // Calculate the middle position of the segment (between inner and outer radius)
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="18"
      >
        {severityData[index].percentage}%
      </text>
    );
  };

  if (error || (anomalies === 0 && recentThreats.length === 0)) {
    return (
      <AppLayout onLogout={onLogout}>
        <NoDashboardState message="No data found" />
      </AppLayout>
    );
  }

  return (
    <AppLayout onLogout={onLogout}>
      {/* Threat Overview Cards */}
      <h2 className="text-xl font-semibold mb-4">Threat Overview</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="text-sm text-gray-500">Total Anomalies Detected</div>
            <div className="text-2xl font-bold">{anomalies}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-4 pt-6">
            <div className="text-sm text-red-600">High Severity</div>
            <div className="text-2xl font-bold text-red-600">{highSeverity}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4 pt-6">
            <div className="text-sm text-yellow-600">Medium Severity</div>
            <div className="text-2xl font-bold text-yellow-600">{mediumSeverity}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4 pt-6">
            <div className="text-sm text-blue-600">Low Severity</div>
            <div className="text-2xl font-bold text-blue-600">{lowSeverity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Total Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4444FF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Anomalies</CardTitle>
            <div className="text-3xl font-bold">{anomalies}</div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {severityData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm">
                    {entry.name} - {entry.percentage}% ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-2">Type</th>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Severity</th>
              </tr>
            </thead>
            <tbody>
              {recentThreats.length > 0 ? (
                recentThreats.map((threat, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{threat.threatType}</td>
                    <td className="p-2">{threat.date}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${getSeverityClass(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-2 text-center">
                    No recent threats for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Dashboard;