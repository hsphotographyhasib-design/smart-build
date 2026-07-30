'use client'
import { GenericCrud } from '@/components/admin/generic-crud'

export default function PartnersPage() {
  return (
    <GenericCrud
      title="Partners"
      description="Manage partner and client logos displayed on the landing page."
      apiPath="/api/cms/partners"
      itemName="Partner"
      statusField="status"
      publishedStatus="active"
      fields={[
        { key: 'name', label: 'Partner Name', type: 'text' },
        { key: 'logo', label: 'Logo URL', type: 'text' },
        { key: 'url', label: 'Website URL', type: 'text' },
        { key: 'category', label: 'Category (client/technology)', type: 'text' },
        { key: 'order', label: 'Display Order', type: 'number' },
      ]}
    />
  )
}