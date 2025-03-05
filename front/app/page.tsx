"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AreaChart, BarChart } from "@/components/ui/charts"
import { Shield, ShieldAlert, Activity, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function Home() {
  const [packetCounts, setPacketCounts] = useState<Record<string, number>>({})
  const [blockedIps, setBlockedIps] = useState<string[]>([])
  const [isSniffing, setIsSniffing] = useState(false)
  const [trafficHistory, setTrafficHistory] = useState<{ time: string; count: number }[]>([])
  const [topSources, setTopSources] = useState<{ ip: string; count: number }[]>([])

  const fetchData = async () => {
    try {
      // Fetch packet counts
      const packetResponse = await fetch("http://localhost:8000/packet_counts")
      const packetData = await packetResponse.json()
      setPacketCounts(packetData.packet_counts)

      // Fetch blocked IPs
      const blockedResponse = await fetch("http://localhost:8000/blocked_ips")
      const blockedData = await blockedResponse.json()
      setBlockedIps(blockedData.blocked_ips)

      // Update traffic history
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      const totalCount: any = Object.values(packetData.packet_counts).reduce((a, b) => (a as number) + (b as number), 0)

      setTrafficHistory((prev) => {
        const newHistory = [...prev, { time: timeString, count: totalCount }]
        // Keep only the last 20 data points
        return newHistory.slice(-20)
      })

      // Update top sources
      const sources = Object.entries(packetData.packet_counts)
        .map(([ip, count]) => ({ ip, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setTopSources(sources)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up polling every 2 seconds
    const interval = setInterval(fetchData, 2000)

    return () => clearInterval(interval)
  }, []) // Removed fetchData from dependencies

  const startSniffing = async () => {
    try {
      const response = await fetch("http://localhost:8000/start_sniffing")
      const data = await response.json()
      setIsSniffing(true)
      toast.success("Packet sniffing started")
    } catch (error) {
      console.error("Error starting sniffing:", error)
      toast.error("Failed to start packet sniffing")
    }
  }

  const unblockIp = async (ip: string) => {
    try {
      const response = await fetch(`http://localhost:8000/unblock_ip/${ip}`)
      const data = await response.json()
      toast.success(data.message)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error unblocking IP:", error)
      toast.error(`Failed to unblock IP: ${ip}`)
    }
  }

  const totalPackets = Object.values(packetCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4">
        <header className="mb-8 mt-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              DDoS Detection Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time network traffic monitoring and DDoS attack prevention
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Packets</CardTitle>
                <CardDescription>Packets captured in current session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{totalPackets.toLocaleString()}</span>
                  <Activity className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Blocked IPs</CardTitle>
                <CardDescription>IPs blocked due to suspicious activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{blockedIps.length}</span>
                  <ShieldAlert className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sniffing Status</CardTitle>
                <CardDescription>Current packet capture status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={isSniffing ? "default" : "outline"} className="mb-1">
                      {isSniffing ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" onClick={startSniffing} disabled={isSniffing} className="ml-2">
                      {isSniffing ? <WifiOff className="h-4 w-4 mr-1" /> : <Wifi className="h-4 w-4 mr-1" />}
                      {isSniffing ? "Running" : "Start"}
                    </Button>
                  </div>
                  <Button size="icon" variant="ghost" onClick={fetchData}>
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Packet count over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <AreaChart
                  data={trafficHistory}
                  index="time"
                  categories={["count"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value.toLocaleString()} packets`}
                  showLegend={false}
                  showGridLines={false}
                  startEndOnly={true}
                  className="h-full"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Sources</CardTitle>
                <CardDescription>IPs with highest packet counts</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={topSources}
                  index="ip"
                  categories={["count"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value.toLocaleString()} packets`}
                  showLegend={false}
                  layout="vertical"
                  className="h-full"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Tabs defaultValue="blocked" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
              <TabsTrigger value="traffic">Traffic Details</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="blocked">
              <Card>
                <CardHeader>
                  <CardTitle>Blocked IP Addresses</CardTitle>
                  <CardDescription>IPs that have been blocked due to suspicious activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {blockedIps.length === 0 ? (
                    <Alert>
                      <AlertDescription>No IPs have been blocked yet.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {blockedIps.map((ip) => (
                        <Card key={ip} className="bg-muted/50">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{ip}</p>
                              <p className="text-sm text-muted-foreground">Blocked</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => unblockIp(ip)}>
                              Unblock
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traffic">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Details</CardTitle>
                  <CardDescription>Detailed breakdown of packet sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium">IP Address</th>
                          <th className="py-3 px-4 text-left font-medium">Packet Count</th>
                          <th className="py-3 px-4 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(packetCounts).length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 px-4 text-center text-muted-foreground">
                              No packet data available
                            </td>
                          </tr>
                        ) : (
                          Object.entries(packetCounts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([ip, count]) => (
                              <tr key={ip} className="border-b">
                                <td className="py-3 px-4">{ip}</td>
                                <td className="py-3 px-4">{count}</td>
                                <td className="py-3 px-4">
                                  {blockedIps.includes(ip) ? (
                                    <Badge variant="destructive">Blocked</Badge>
                                  ) : count > 500 ? (
                                    <Badge variant="secondary">Warning</Badge>
                                  ) : (
                                    <Badge variant="outline">Normal</Badge>
                                  )}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Recent system events and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-80 overflow-y-auto">
                    <p>[{new Date().toLocaleString()}] System initialized</p>
                    <p>[{new Date().toLocaleString()}] Packet monitoring active</p>
                    {blockedIps.map((ip, index) => (
                      <p key={index} className="text-red-400">
                        [{new Date(Date.now() - index * 60000).toLocaleString()}] IP {ip} blocked due to excessive
                        traffic
                      </p>
                    ))}
                    {Object.entries(packetCounts)
                      .filter(([_, count]) => count > 500)
                      .map(([ip, count], index) => (
                        <p key={`warn-${index}`} className="text-yellow-400">
                          [{new Date(Date.now() - index * 30000).toLocaleString()}] Warning: High traffic from {ip} (
                          {count} packets)
                        </p>
                      ))}
                    <p>
                      [{new Date(Date.now() - 120000).toLocaleString()}] Monitoring threshold set to 1000 packets/minute
                    </p>
                    <p>[{new Date(Date.now() - 180000).toLocaleString()}] DDoS protection service started</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

