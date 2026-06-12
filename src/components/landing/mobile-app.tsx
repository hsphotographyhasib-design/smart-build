'use client'

import { motion } from 'framer-motion'
import {
  Bell,
  MapPin,
  Camera,
  FileText,
  Receipt,
  WifiOff,
  Menu,
  Home,
  FolderOpen,
  Users,
  Settings,
  BatteryMedium,
  Signal,
  ChevronRight,
  Apple,
  Smartphone,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const features = [
  { icon: Bell, title: 'Real-time Notifications', description: 'Instant alerts for project updates and approvals' },
  { icon: MapPin, title: 'GPS Attendance Tracking', description: 'Track workforce presence on site automatically' },
  { icon: Camera, title: 'Photo Documentation', description: 'Capture and attach photos to reports' },
  { icon: FileText, title: 'Daily Report Submission', description: 'Submit daily progress reports from the field' },
  { icon: Receipt, title: 'Expense Tracking', description: 'Log expenses and upload receipts on the go' },
  { icon: WifiOff, title: 'Offline Mode Support', description: 'Work without internet, sync when connected' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function IPhoneMockup() {
  return (
    <motion.div
      className="relative mx-auto"
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        {/* Phone frame */}
        <div className="relative w-64 h-[500px] bg-black rounded-[40px] border-[3px] border-gray-800 shadow-2xl shadow-black/30 overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

          {/* Screen */}
          <div className="absolute inset-[3px] bg-white rounded-[37px] overflow-hidden">
            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-semibold text-gray-900">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <div className="w-6 h-2.5 border border-gray-900 rounded-sm relative">
                  <div className="absolute inset-[1px] right-[2px] bg-gray-900 rounded-[1px]" style={{ width: '70%' }} />
                </div>
              </div>
            </div>

            {/* App Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-blue-600">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-white/20 rounded" />
                <span className="text-white text-[11px] font-bold">SmartBuild</span>
              </div>
              <Menu className="w-4 h-4 text-white" />
            </div>

            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 p-3">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-[8px] text-blue-600 font-medium">Active Projects</div>
                <div className="text-[14px] font-bold text-blue-700">12</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-[8px] text-green-600 font-medium">On Schedule</div>
                <div className="text-[14px] font-bold text-green-700">9</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-[8px] text-orange-600 font-medium">Pending Tasks</div>
                <div className="text-[14px] font-bold text-orange-700">34</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-[8px] text-purple-600 font-medium">Team Members</div>
                <div className="text-[14px] font-bold text-purple-700">128</div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="px-3 mt-1">
              <div className="text-[10px] font-semibold text-gray-700 mb-1.5">Recent Projects</div>
              <div className="space-y-1.5">
                {[
                  { name: 'Riverside Tower', progress: 72, color: 'bg-blue-500' },
                  { name: 'Metro Bridge Phase 2', progress: 45, color: 'bg-green-500' },
                  { name: 'Sunrise Mall', progress: 88, color: 'bg-orange-500' },
                ].map((project) => (
                  <div key={project.name} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <div className={`w-1 h-8 ${project.color} rounded-full`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-medium text-gray-800 truncate">{project.name}</div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                        <div
                          className={`h-full ${project.color} rounded-full`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[8px] font-semibold text-gray-500">{project.progress}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-2 bg-white border-t border-gray-100">
              <Home className="w-4 h-4 text-blue-600" />
              <FolderOpen className="w-4 h-4 text-gray-400" />
              <Users className="w-4 h-4 text-gray-400" />
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Side button */}
          <div className="absolute right-[-2px] top-28 w-[3px] h-8 bg-gray-800 rounded-r-sm" />
          <div className="absolute left-[-2px] top-24 w-[3px] h-5 bg-gray-800 rounded-l-sm" />
          <div className="absolute left-[-2px] top-32 w-[3px] h-5 bg-gray-800 rounded-l-sm" />
        </div>
      </motion.div>
    </motion.div>
  )
}

export function MobileApp() {
  return (
    <section className="py-20 md:py-28 bg-gray-50" id="mobile-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Manage Projects From Anywhere
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful mobile apps for iOS and Android
          </p>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Phone Mockup */}
          <div className="flex-shrink-0">
            <IPhoneMockup />
          </div>

          {/* Features */}
          <motion.div
            className="flex-1 w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Platform Badges */}
            <motion.div
              className="flex items-center gap-4 mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Badge className="gap-2 px-4 py-2.5 text-sm font-medium bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                <Apple className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 leading-none">Download on the</div>
                  <div className="font-semibold leading-tight">App Store</div>
                </div>
              </Badge>
              <Badge className="gap-2 px-4 py-2.5 text-sm font-medium bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                <Smartphone className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 leading-none">Get it on</div>
                  <div className="font-semibold leading-tight">Google Play</div>
                </div>
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}