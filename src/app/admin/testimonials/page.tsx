'use client'
import { GenericCrud } from '@/components/admin/generic-crud'

export default function TestimonialsPage() {
  return (
    <GenericCrud
      title="Testimonials"
      description="Manage customer testimonials displayed on the landing page."
      apiPath="/api/cms/testimonials"
      itemName="Testimonial"
      featuredField="featured"
      fields={[
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'position', label: 'Position', type: 'text' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'content', label: 'Review Content', type: 'textarea' },
        { key: 'rating', label: 'Rating (1-5)', type: 'rating' },
        { key: 'featured', label: 'Featured', type: 'text' },
        { key: 'status', label: 'Status (published/draft)', type: 'text' },
        { key: 'order', label: 'Display Order', type: 'number' },
      ]}
    />
  )
}
