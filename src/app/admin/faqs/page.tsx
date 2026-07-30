'use client'
import { GenericCrud } from '@/components/admin/generic-crud'

export default function FaqsPage() {
  return (
    <GenericCrud
      title="FAQs"
      description="Manage frequently asked questions for the landing page."
      apiPath="/api/cms/faqs"
      itemName="FAQ"
      fields={[
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status (published/draft)', type: 'text' },
        { key: 'order', label: 'Display Order', type: 'number' },
      ]}
    />
  )
}