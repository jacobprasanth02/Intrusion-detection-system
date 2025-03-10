"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AreaChart, BarChart } from "@/components/ui/charts"
import {
  Shield,
  ShieldAlert,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Server,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useTheme } from "./theme-provider"

export default function Home() {
  const [packetCounts, setPacketCounts] = useState<Record<string, number>>({})
  const [blockedIps, setBlockedIps] = useState<string[]>([])
  const [isSniffing, setIsSniffing] = useState(false)
  const [trafficHistory, setTrafficHistory] = useState<{ time: string; count: number }[]>([])
  const [topSources, setTopSources] = useState<{ ip: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const packetResponse = await fetch("http://localhost:8000/packet_counts")
      const packetData = await packetResponse.json()
      setPacketCounts(packetData.packet_counts)

      const blockedResponse = await fetch("http://localhost:8000/blocked_ips")
      const blockedData = await blockedResponse.json()
      setBlockedIps(blockedData.blocked_ips)

      const now = new Date()
      const timeString = now.toLocaleTimeString()
      const totalCount: any = Object.values(packetData.packet_counts).reduce((a, b) => (a as number) + (b as number), 0)

      setTrafficHistory((prev) => {
        const newHistory = [...prev, { time: timeString, count: totalCount }]
        return newHistory.slice(-20)
      })

      const sources = Object.entries(packetData.packet_counts)
        .map(([ip, count]) => ({ ip, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setTopSources(sources)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
      toast.error("Failed to fetch data. Is the server running?")
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  const startSniffing = async () => {
    try {
      const response = await fetch("http://localhost:8000/start_sniffing")
      const data = await response.json()
      setIsSniffing(true)
      toast.success("Packet sniffing started", {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
      })
    } catch (error) {
      console.error("Error starting sniffing:", error)
      toast.error("Failed to start packet sniffing", {
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      })
    }
  }

  const unblockIp = async (ip: string) => {
    try {
      const response = await fetch(`http://localhost:8000/unblock_ip/${ip}`)
      const data = await response.json()
      toast.success(data.message, {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      })
      fetchData() 
    } catch (error) {
      console.error("Error unblocking IP:", error)
      toast.error(`Failed to unblock IP: ${ip}`, {
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      })
    }
  }

  const totalPackets = Object.values(packetCounts).reduce((a, b) => a + b, 0)

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    console.log("Theme toggled to:", newTheme) 
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="container mx-auto p-4">
        <header className="mb-8 mt-4 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold flex items-center gap-2 dark:neon-glow">
              <Shield className="h-8 w-8 text-primary" />
              Instrusion Detection System
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time network traffic monitoring and attack prevention
            </p>
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-10 w-10 transition-all duration-300 hover:scale-110 bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </header>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <Card className="border-t-4 border-t-blue-500 dark:border-t-blue-400 shadow-md hover:shadow-lg transition-shadow dark:neon-box">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  Total Packets
                </CardTitle>
                <CardDescription>Packets captured in current session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={totalPackets}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-3xl font-bold"
                    >
                      {totalPackets.toLocaleString()}
                    </motion.span>
                  </AnimatePresence>
                  <Activity className="h-8 w-8 text-blue-600 dark:text-blue-300 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-t-4 border-t-red-600 dark:border-t-red-300 shadow-md hover:shadow-lg transition-shadow dark:neon-box">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-300" />
                  Blocked IPs
                </CardTitle>
                <CardDescription>IPs blocked due to suspicious activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={blockedIps.length}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-3xl font-bold"
                    >
                      {blockedIps.length}
                    </motion.span>
                  </AnimatePresence>
                  <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-t-4 border-t-green-600 dark:border-t-green-300 shadow-md hover:shadow-lg transition-shadow dark:neon-box">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {isSniffing ? (
                    <Wifi className="h-5 w-5 text-green-600 dark:text-green-300" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  )}
                  Sniffing Status
                </CardTitle>
                <CardDescription>Current packet capture status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      variant={isSniffing ? "default" : "outline"}
                      className={`mb-1 ${isSniffing ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" : ""}`}
                    >
                      {isSniffing ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={startSniffing}
                      disabled={isSniffing}
                      className="ml-2"
                      variant={isSniffing ? "outline" : "default"}
                    >
                      {isSniffing ? <WifiOff className="h-4 w-4 mr-1" /> : <Wifi className="h-4 w-4 mr-1" />}
                      {isSniffing ? "Running" : "Start"}
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={fetchData}
                    className="hover:rotate-180 transition-transform duration-500"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-shadow dark:glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Network Traffic
                </CardTitle>
                <CardDescription>Packet count over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 mt-7">
                <AreaChart
                  data={trafficHistory}
                  index="time"
                  categories={["count"]}
                  colors={["chart-1"]}
                  valueFormatter={(value) => `${value.toLocaleString()} packets`}
                  showLegend={false}
                  showGridLines={true}
                  startEndOnly={true}
                  className={`h-full ${theme === "dark" ? "text-white" : ""}`}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-shadow dark:glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Top Sources
                </CardTitle>
                <CardDescription>IPs with highest packet counts</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={topSources}
                  index="ip"
                  categories={["count"]}
                  colors={["chart-2"]}
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
            <TabsList className="mb-4 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              <TabsTrigger
                value="blocked"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:neon-glow"
              >
                Blocked IPs
              </TabsTrigger>
              <TabsTrigger
                value="traffic"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:neon-glow"
              >
                Traffic Details
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:neon-glow"
              >
                System Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blocked">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500 dark:text-red-400" />
                    Blocked IP Addresses
                  </CardTitle>
                  <CardDescription>IPs that have been blocked due to suspicious activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {blockedIps.length === 0 ? (
                    <Alert className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <AlertDescription className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        No IPs have been blocked yet.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {blockedIps.map((ip) => (
                        <motion.div key={ip} variants={cardVariants}>
                          <Card className="bg-slate-100/50 dark:bg-slate-800/50 hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-medium">{ip}</p>
                                <p className="text-sm text-muted-foreground">Blocked</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unblockIp(ip)}
                                className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                              >
                                Unblock
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traffic">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Traffic Details
                  </CardTitle>
                  <CardDescription>Detailed breakdown of packet sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-100 dark:bg-slate-800 dark:border-slate-700">
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
                            .map(([ip, count], index) => (
                              <motion.tr
                                key={ip}
                                className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  transition: { delay: index * 0.05 },
                                }}
                              >
                                <td className="py-3 px-4 font-mono">{ip}</td>
                                <td className="py-3 px-4">
                                  <AnimatePresence mode="wait">
                                    <motion.span
                                      key={count}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                    >
                                      {count.toLocaleString()}
                                    </motion.span>
                                  </AnimatePresence>
                                </td>
                                <td className="py-3 px-4">
                                  {blockedIps.includes(ip) ? (
                                    <Badge
                                      variant="destructive"
                                      className="animate-pulse bg-red-600 dark:bg-red-500 text-white"
                                    >
                                      Blocked
                                    </Badge>
                                  ) : count > 500 ? (
                                    <Badge
                                      variant="secondary"
                                      className="bg-amber-200 hover:bg-amber-300 text-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-amber-50"
                                    >
                                      Warning
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700"
                                    >
                                      Normal
                                    </Badge>
                                  )}
                                </td>
                              </motion.tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    System Logs
                  </CardTitle>
                  <CardDescription>Recent system events and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-md h-80 overflow-y-auto border border-slate-800 shadow-inner">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                    >
                      <motion.p variants={cardVariants} className="mb-1 system-log">
                        [{new Date().toLocaleString()}] System initialized
                      </motion.p>
                      <motion.p variants={cardVariants} className="mb-1 system-log">
                        [{new Date().toLocaleString()}] Packet monitoring active
                      </motion.p>
                      {blockedIps.map((ip, index) => (
                        <motion.p key={index} className="system-log-error mb-1" variants={cardVariants}>
                          [{new Date(Date.now() - index * 60000).toLocaleString()}] IP {ip} blocked due to excessive
                          traffic
                        </motion.p>
                      ))}
                      {Object.entries(packetCounts)
                        .filter(([_, count]) => count > 500)
                        .map(([ip, count], index) => (
                          <motion.p key={`warn-${index}`} className="system-log-warning mb-1" variants={cardVariants}>
                            [{new Date(Date.now() - index * 30000).toLocaleString()}] Warning: High traffic from {ip} (
                            {count} packets)
                          </motion.p>
                        ))}
                      <motion.p variants={cardVariants} className="mb-1 system-log">
                        [{new Date(Date.now() - 120000).toLocaleString()}] Monitoring threshold set to 1000
                        packets/minute
                      </motion.p>
                      <motion.p variants={cardVariants} className="mb-1 system-log">
                        [{new Date(Date.now() - 180000).toLocaleString()}] Instrusion protection service started
                      </motion.p>
                    </motion.div>
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

