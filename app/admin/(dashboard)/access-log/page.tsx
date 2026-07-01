import { getAccessLog } from '@/lib/access-log'
import AccessLogClient from './AccessLogClient'

export default async function AccessLogPage() {
  const logs = await getAccessLog(1000)
  return <AccessLogClient logs={logs} />
}
