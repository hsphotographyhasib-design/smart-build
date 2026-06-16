'use client'

import React, { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────
// API মেনু ধরন
// ─────────────────────────────────────────────────────────────────────

export interface MenuSubItem {
  id: string
  label: string
  page: string
  icon: string
  sortOrder: number
}

export interface MenuTreeItem {
  id: string
  label: string
  page: string
  icon: string
  sortOrder: number
  isCategory: boolean
  hasChildren: boolean
  children: MenuSubItem[]
}

export interface MenuGroup {
  id: string
  code: string
  label: string
  icon: string
  sortOrder: number
  items: MenuTreeItem[]
}

// ─────────────────────────────────────────────────────────────────────
// আইকন রেজোলিউশন — পূর্বে-নিবন্দাধ আইকন ম্যাপ
// ─────────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<React.ComponentProps<'svg'>>> = {
  LayoutDashboard: Icons.LayoutDashboard, FolderKanban: Icons.FolderKanban, FileText: Icons.FileText,
  Receipt: Icons.Receipt, Calculator: Icons.Calculator, DollarSign: Icons.DollarSign,
  ShoppingCart: Icons.ShoppingCart, ClipboardList: Icons.ClipboardList, Users: Icons.Users,
  Package: Icons.Package, UserCheck: Icons.UserCheck, Clock: Icons.Clock,
  ScrollText: Icons.ScrollText, FileSpreadsheet: Icons.FileSpreadsheet,
  Wrench: Icons.Wrench, Truck: Icons.Truck,
  Activity: Icons.Activity, Gauge: Icons.Gauge, HardHat: Icons.HardHat,
  Hammer: Icons.Hammer, Car: Icons.Car, Ruler: Icons.Ruler,
  UsersRound: Icons.UsersRound, ClipboardCheck: Icons.ClipboardCheck,
  TrendingUp: Icons.TrendingUp, LineChart: Icons.LineChart,
  Wallet: Icons.Wallet, Tags: Icons.Tags, GitBranch: Icons.GitBranch, Target: Icons.Target,
  MessageSquare: Icons.MessageSquare, Megaphone: Icons.Megaphone,
  Shield: Icons.Shield, MapPin: Icons.MapPin, Zap: Icons.Zap, Clock4: Icons.Clock4,
  FileCheck: Icons.FileCheck, Building: Icons.Building, BarChart3: Icons.BarChart3,
  MessageCircle: Icons.MessageCircle, Headphones: Icons.Headphones,
  Store: Icons.Store, ShieldCheck: Icons.ShieldCheck, Bell: Icons.Bell,
  Brain: Icons.Brain, Sparkles: Icons.Sparkles, Eye: Icons.Eye,
  FileBarChart: Icons.FileBarChart, Settings: Icons.Settings, UserCog: Icons.UserCog,
  CalendarRange: Icons.CalendarRange,
  File: Icons.File, Camera: Icons.Camera, CheckSquare: Icons.CheckSquare,
  Flag: Icons.Flag, CalendarDays: Icons.CalendarDays, Mail: Icons.Mail,
  Send: Icons.Send, Trophy: Icons.Trophy, GanttChart: Icons.GanttChart,
  ChartBar: Icons.ChartBar, Binoculars: Icons.Binoculars, Route: Icons.Route,
  GitCompare: Icons.GitCompare,
  Clipboard: Icons.Clipboard, AlertTriangle: Icons.AlertTriangle, Calendar: Icons.Calendar,
  Building2: Icons.Building2, CalendarClock: Icons.CalendarClock, Gavel: Icons.Gavel,
  Smartphone: Icons.Smartphone, QrCode: Icons.QrCode, Bot: Icons.Bot,
  HeadphonesIcon: Icons.Headphones, ZapIcon: Icons.Zap,
  Thermometer: Icons.Thermometer, Droplets: Icons.Droplets, Plug: Icons.Plug,
}

function getIcon(name: string): React.ComponentType<React.ComponentProps<'svg'>> {
  return iconMap[name] || Icons.FileText
}

export function IconByName({ name, className }: { name: string; className?: string }) {
  const Comp = getIcon(name)
  return React.createElement(Comp, { className })
}

// ─────────────────────────────────────────────────────────────────────
// মেনু ডেটা হুক — /api/menus?role=<role> থেকে ক্যাশিং সহ ফেচ করে
// ─────────────────────────────────────────────────────────────────────

const menuCache: Record<string, { data: MenuGroup[]; timestamp: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // ৫ মিনিট

export function useMenuData(role: string) {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchMenus() {
      // প্রথমে ক্যাশে পরীক্ষা করা হচ্ছে
      const cached = menuCache[role]
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (!cancelled) {
          setMenuGroups(cached.data)
          setLoading(false)
        }
        return
      }

      try {
        // Include auth token since /api/menus requires authentication
        const token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`/api/menus?role=${role}`, { headers })
        if (!res.ok) {
          // প্রমাণীকরণ প্রয়োজন — ব্যবহারকারী লগইন না করলে মেনু খালি থাকবে
          return
        }
        const json = await res.json()
        if (!cancelled && json.success) {
          const data = json.data as MenuGroup[]
          menuCache[role] = { data, timestamp: Date.now() }
          setMenuGroups(data)
        }
      } catch (err) {
        console.error('Failed to fetch menus:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMenus()
    return () => { cancelled = true }
  }, [role])

  return { menuGroups, loading }
}

// ─────────────────────────────────────────────────────────────────────
// সক্রিয়া পৃষ্ঠা অনুসন্ধানকারী — কোন গ্রুপ/আইটেম/চাইল্ড পৃষ্ঠাটি ধারণ করছে
// ─────────────────────────────────────────────────────────────────────

export interface ActiveInfo {
  groupId: string | null
  itemId: string | null // সাব-চাইল্ড সক্রিয় হলে এটি প্যারেন্ট আইটির id
}

export function findActiveInfo(groups: MenuGroup[], currentPage: string): ActiveInfo {
  let groupId: string | null = null
  let itemId: string | null = null

  for (const group of groups) {
    for (const item of group.items) {
      if (item.page === currentPage && !item.isCategory) {
        groupId = group.id
        return { groupId, itemId: null }
      }
      // চিলড্রেন পরীক্ষা করা হচ্ছে
      if (item.hasChildren) {
        for (const child of item.children) {
          if (child.page === currentPage) {
            groupId = group.id
            itemId = item.id
            return { groupId, itemId }
          }
        }
      }
    }
  }

  return { groupId, itemId }
}
