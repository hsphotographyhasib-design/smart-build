'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; content: string;
  status: string; featured: boolean; authorName: string; readingTime: number;
  publishedAt: string | null; createdAt: string;
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

  const loadPosts = async () => {
    const res = await fetch('/api/cms/blog')
    if (res.ok) setPosts(await res.json())
  }

  useEffect(() => { loadPosts() }, [])

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditing(post)
      setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, authorName: post.authorName || '', readingTime: post.readingTime || 5, status: post.status, featured: post.featured })
    } else {
      setEditing(null)
      setForm({ title: '', slug: '', excerpt: '', content: '', authorName: 'SmartBuild Team', readingTime: 5, status: 'draft', featured: false })
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const url = editing ? `/api/cms/blog/${editing.id}` : '/api/cms/blog'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success(editing ? 'Post updated' : 'Post created'); setEditing(null); loadPosts() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/cms/blog/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); loadPosts() } else toast.error('Failed to delete')
  }

  const togglePublish = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/cms/blog/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, publishedAt: newStatus === 'published' ? new Date().toISOString() : null }) })
    if (res.ok) { toast.success(`Post ${newStatus}`); loadPosts() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Blog Manager</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and publish blog posts.</p>
        </div>
        <Dialog open={editing !== null && !editing?.id} onOpenChange={(open) => { if (!open) setEditing(null); else openEditor() }}>
          <DialogTrigger asChild>
            <Button className="bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2"><Label>Title</Label><Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))} /></div>
                <div className="space-y-1.5"><Label>Author</Label><Input value={form.authorName || ''} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Reading Time (min)</Label><Input type="number" value={form.readingTime || 5} onChange={e => setForm(f => ({ ...f, readingTime: parseInt(e.target.value) || 5 }))} /></div>
              </div>
              <div className="space-y-1.5"><Label>Excerpt</Label><Textarea value={form.excerpt || ''} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} /></div>
              <div className="space-y-1.5"><Label>Content (Markdown)</Label><Textarea value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-sm" /></div>
              <Button onClick={save} disabled={saving} className="w-full bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]">{saving ? 'Creating...' : 'Create Post'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {posts.map(post => (
          <Card key={post.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{post.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{post.authorName} · {post.readingTime}min · {post.status}</div>
              </div>
              {post.featured && <Badge variant="outline" className="text-[#F5A623] border-[#F5A623]/30">Featured</Badge>}
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status}</Badge>
              <Button variant="ghost" size="sm" onClick={() => togglePublish(post)}>{post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
              <Button variant="ghost" size="sm" onClick={() => openEditor(post)}><Edit className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePost(post.id)}><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing?.id} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Blog Post</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2"><Label>Title</Label><Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Author</Label><Input value={form.authorName || ''} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Reading Time</Label><Input type="number" value={form.readingTime || 5} onChange={e => setForm(f => ({ ...f, readingTime: parseInt(e.target.value) || 5 }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Excerpt</Label><Textarea value={form.excerpt || ''} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} /></div>
            <div className="space-y-1.5"><Label>Content (Markdown)</Label><Textarea value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-sm" /></div>
            <Button onClick={save} disabled={saving} className="w-full bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
