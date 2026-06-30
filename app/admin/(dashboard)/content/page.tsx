import Link from 'next/link'
import { getContent } from '@/lib/data'
import ContentEditor from './ContentEditor'

export default async function ContentPage() {
  const content = await getContent()
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Page Content</h1>
          <p className="admin-page-subtitle">Edit banner text, titles, and descriptions for each page</p>
        </div>
        <Link href="/" target="_blank" className="btn-admin-secondary">
          ↗ Preview Website
        </Link>
      </div>
      <ContentEditor initialContent={content} />
    </>
  )
}
