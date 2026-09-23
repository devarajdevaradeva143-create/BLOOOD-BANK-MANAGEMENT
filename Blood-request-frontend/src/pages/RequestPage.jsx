import { Droplet } from 'lucide-react'
import { useLanguage } from '../context/useLanguage'
import BloodRequestForm from '../components/BloodRequestForm'

import PageHeader from '../components/PageHeader'

export default function RequestPage() {
  const { t } = useLanguage()

  return (
    <div>
      <PageHeader
        icon={Droplet}
        title={t('form.title')}
        description={t('form.description')}
      />
      <BloodRequestForm />
    </div>
  )
}
