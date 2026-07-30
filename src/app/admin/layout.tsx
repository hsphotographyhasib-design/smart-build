import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarFooter, SidebarGroupContent } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, FileText, Image, FilePenLine, FileInput, Users, BarChart3, Globe, Settings, Paintbrush, DollarSign, HelpCircle, MessageSquareQuote, Handshake, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Page Builder', url: '/admin/builder', icon: Paintbrush },
  { title: 'CMS Content', url: '/admin/cms', icon: FileText },
  { title: 'Media Manager', url: '/admin/media', icon: Image },
  { title: 'FilePenLine', url: '/admin/blog', icon: FilePenLine },
  { title: 'Pricing', url: '/admin/pricing', icon: DollarSign },
  { title: 'Testimonials', url: '/admin/testimonials', icon: MessageSquareQuote },
  { title: 'FAQs', url: '/admin/faqs', icon: HelpCircle },
  { title: 'Partners', url: '/admin/partners', icon: Handshake },
  { title: 'Forms', url: '/admin/forms', icon: FileInput },
  { title: 'Leads', url: '/admin/leads', icon: Users },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'SEO', url: '/admin/seo', icon: Globe },
  { title: 'Translations', url: '/admin/translations', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar className="bg-[#0B2345] text-white border-r border-white/10">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <img src="/brand/smartbuild-primary-logo.svg" alt="SmartBuild" className="h-7 brightness-200" />
            <div>
              <div className="font-semibold text-sm">SmartBuild</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Super Admin</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/40 text-[10px] uppercase tracking-widest">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-[#F5A623]/10 data-[active=true]:text-[#F5A623]">
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex h-14 items-center gap-4 border-b px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
